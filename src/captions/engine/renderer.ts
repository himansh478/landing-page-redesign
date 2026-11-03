import type { CanvasKit, Canvas, Paragraph, TypefaceFontProvider } from 'canvaskit-wasm';
import { FALLBACK_FAMILIES, isScriptFont } from './fonts';
import { templates } from './templates';
import { captionEnd, captionStart, type Caption, type Rows, type RowStyle, type Style, type Word, type WordStyle } from './types';

// Draws captions for an exact time. Everything is a pure function of `t`, so the
// preview and the export produce the same picture for the same frame. Text is
// shaped by Skia + HarfBuzz at output resolution, which keeps Devanagari
// conjuncts and matras correct and edges sharp.

const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const ENTRANCE = 0.14;
const CACHE_LIMIT = 900;
const FRAME_MARGIN = 0.03;
const WATERMARK_TEXT = 'Made with Cwaya';
const WATERMARK_MARGIN = 36;
const SHINE_SECONDS = 1.4;
/** Rows may fill this much of the frame width. */
const ROW_WIDTH = 0.92;
const WORD_GAP = 0.28;
/** How far a short row may grow to match a long one. */
const MOST_GROWTH = 2.2;
const ROUNDING_ROOM = 1.01;
/** Devanagari's marks stand tall, so rows overlap less than Latin text can. */
const DEVANAGARI_OVERLAP = 0.5;
const DEVANAGARI = /[\u0900-\u097f]/;
/** Share of the font size. */
const ENTRANCE_BLUR = 0.1;
const ENTRANCE_SLIDE = 0.5;
const BLEND_MODES = { overlay: 'Overlay', screen: 'Screen', 'soft-light': 'SoftLight' } as const;

// The spoken word grows to activeScale with a small overshoot, then eases back
// after it ends so the size never snaps between two frames.
const wordScale = (w: Word, t: Style, time: number) => {
  if (time < w.start || t.activeScale === 1) return 1;
  const peak = t.activeScale - 1;
  const pop = (age: number) => peak * easeOutBack(clamp01(age / t.popDuration));
  if (time < w.end) return 1 + pop(time - w.start);
  return 1 + pop(w.end - w.start) * (1 - easeOutCubic(clamp01((time - w.end) / t.popDuration)));
};

const hash = (text: string) => [...text].reduce((sum, letter) => (sum * 31 + letter.charCodeAt(0)) >>> 0, 7);

const cased = (text: string, look: Style) => {
  if (look.textCase === 'lower') return text.toLowerCase();
  if (look.textCase === 'upper') return text.toUpperCase();
  if (look.textCase === 'title') return text.charAt(0).toUpperCase() + text.slice(1);
  return look.uppercase && !isScriptFont(look.fontFamily) ? text.toUpperCase() : text;
};

const longestWord = (words: Word[]) => words.reduce((best, w, i) => (w.text.length > words[best].text.length ? i : best), 0);

/** Which words sit on which row of the template. One word alone takes the stronger row. */
function shareWords(words: Word[], { split, rows }: Rows) {
  const all = words.map((_, i) => i);
  const sides = (cut: number) => [
    { row: 0, indexes: all.slice(0, cut) },
    { row: 1, indexes: all.slice(cut) },
  ];
  if (split === 'each') return all.map((index) => ({ row: index % rows.length, indexes: [index] }));
  if (split === 'longest') {
    const longest = longestWord(words);
    return [
      { row: 0, indexes: all.slice(0, longest) },
      { row: 1, indexes: [longest] },
      { row: 2, indexes: all.slice(longest + 1) },
    ].filter((share) => share.indexes.length > 0);
  }
  if (split === 'lastTwo') return sides(Math.max(1, words.length - 2)).filter((share) => share.indexes.length > 0);
  if (words.length === 1) return [{ row: 1, indexes: all }];
  return sides(split === 'first' ? 1 : Math.ceil(words.length / 2));
}

/** The template, plus anything this word overrides. */
const lookOf = (t: Style, style: WordStyle | undefined, isAccent: boolean): Style => {
  let look = t;
  if (isAccent && t.accent) {
    const { fontFamily, fontWeight, scale, color } = t.accent;
    look = { ...look, fontFamily, fontWeight, fontSize: look.fontSize * scale, color, activeColor: color, gradient: null };
  }
  if (style) {
    const { scale, color, ...rest } = style;
    look = { ...look, ...rest, fontSize: look.fontSize * (scale ?? 1) };
    if (color) look = { ...look, color, activeColor: color, gradient: null };
  }
  return look;
};

type WordBox = { text: string; width: number; height: number; x: number; y: number; index: number; row: number; look: Style; stretch?: number };

export class CaptionRenderer {
  private cache = new Map<string, Paragraph>();
  private unit: number;

  constructor(
    private ck: CanvasKit,
    private fonts: TypefaceFontProvider,
    private width: number,
    private height: number
  ) {
    this.unit = Math.min(width, height) / 1080;
  }

  /** A shaped word. Each word is its own paragraph so it can animate on its own. */
  private word(text: string, t: Style, color: string, outline: boolean): Paragraph {
    const shadowKey = outline || !t.stroke ? JSON.stringify([t.shadow, t.glow, t.shadows]) : '';
    const strokeKey = outline ? JSON.stringify(t.stroke) : '';
    const gradient = !outline && t.gradient ? t.gradient.join() : '';
    const key = [t.fontFamily, t.fontWeight, t.fontSize, t.letterSpacing, text, color, shadowKey, strokeKey, gradient].join('|');
    const hit = this.cache.get(key);
    if (hit) return hit;

    const ck = this.ck;
    const unit = this.unit;
    const shadows = [];
    if (shadowKey) {
      if (t.glow) shadows.push({ color: ck.parseColorString(t.glow.color), offset: [0, 0], blurRadius: t.glow.blur * unit });
      if (t.shadow) shadows.push({ color: ck.parseColorString(t.shadow.color), offset: [0, t.shadow.offsetY * unit], blurRadius: t.shadow.blur * unit });
      const size = t.fontSize * unit;
      // Skia takes the sigma of a blur, which is half the radius CSS would use.
      for (const s of t.shadows ?? []) shadows.push({ color: ck.parseColorString(s.color), offset: [0, s.y * size], blurRadius: (s.blur * size) / 2 });
    }

    const textStyle = new ck.TextStyle({
      color: ck.parseColorString(color),
      fontFamilies: [t.fontFamily, ...FALLBACK_FAMILIES],
      fontSize: t.fontSize * unit,
      fontStyle: { weight: ck.FontWeight[t.fontWeight] },
      letterSpacing: t.letterSpacing * unit,
      shadows,
    });
    const builder = ck.ParagraphBuilder.MakeFromFontProvider(
      new ck.ParagraphStyle({ textStyle, textAlign: ck.TextAlign.Left, maxLines: 1 }),
      this.fonts
    );

    if (outline && t.stroke) {
      const fg = new ck.Paint();
      fg.setColor(ck.parseColorString(t.stroke.color));
      fg.setStyle(ck.PaintStyle.Stroke);
      fg.setStrokeWidth(t.stroke.width * unit);
      fg.setStrokeJoin(ck.StrokeJoin.Round);
      fg.setStrokeCap(ck.StrokeCap.Round);
      fg.setAntiAlias(true);
      const bg = new ck.Paint();
      bg.setColor(ck.TRANSPARENT);
      builder.pushPaintStyle(textStyle, fg, bg);
      builder.addText(text);
      builder.pop();
      fg.delete();
      bg.delete();
    } else if (gradient && t.gradient) {
      const height = t.fontSize * unit * 1.5;
      const shader = ck.Shader.MakeLinearGradient([0, 0], [0, height], t.gradient.map((c) => ck.parseColorString(c)), null, ck.TileMode.Clamp);
      const fg = new ck.Paint();
      fg.setShader(shader);
      fg.setAntiAlias(true);
      const bg = new ck.Paint();
      bg.setColor(ck.TRANSPARENT);
      builder.pushPaintStyle(textStyle, fg, bg);
      builder.addText(text);
      builder.pop();
      fg.delete();
      bg.delete();
      shader.delete();
    } else {
      builder.addText(text);
    }

    const p = builder.build();
    p.layout(this.width * 3);
    builder.delete();
    this.cache.set(key, p);
    return p;
  }

  /** A template built from rows, each with its own font, size and alignment. */
  private rowLayout(caption: Caption, t: Style): WordBox[] {
    const plan = t.rows as Rows;
    const words = caption.words;
    const unit = this.unit;
    const variant = plan.variants?.[hash(caption.id) % plan.variants.length];
    const glowing = plan.glowColors ? longestWord(words) : -1;
    const glowColor = plan.glowColors?.[hash(caption.id) % plan.glowColors.length] ?? '';

    const measureRow = ({ row, indexes }: { row: number; indexes: number[] }, grow = 1) => {
      const style: RowStyle = { ...plan.rows[row], ...variant?.[row] };
      const fontSize = t.fontSize * style.size * grow;
      const color = style.accent ? t.activeColor : t.color;
      const look: Style = {
        ...t,
        fontSize,
        fontFamily: style.fontFamily ?? t.fontFamily,
        fontWeight: style.fontWeight ?? t.fontWeight,
        color,
        activeColor: color,
        letterSpacing: (style.letterSpacing ?? 0) * fontSize,
        stroke: style.stroke ?? null,
        gradient: style.gradient ?? null,
        textCase: style.textCase ?? t.textCase,
        shadows: style.shadows ?? t.shadows,
      };
      const placed = indexes.map((index) => {
        const lit: Style = index === glowing ? { ...look, color: glowColor, activeColor: glowColor, shadows: [{ color: glowColor, blur: 0.5, y: 0 }, { color: `${glowColor}80`, blur: 0.18, y: 0 }] } : look;
        const wordLook = lookOf(lit, words[index].style, false);
        const text = cased(words[index].text, wordLook);
        const paragraph = this.word(text, wordLook, wordLook.color, false);
        return { text, index, look: wordLook, width: paragraph.getMaxIntrinsicWidth(), height: paragraph.getHeight() };
      });
      const size = fontSize * unit;
      const gap = size * (plan.wordGap ?? WORD_GAP);
      const width = placed.reduce((sum, w) => sum + w.width, 0) + gap * (placed.length - 1);
      return { style, placed, gap, size, width, height: Math.max(...placed.map((w) => w.height)) };
    };

    const shares = shareWords(words, plan);
    let rows = shares.map((share) => measureRow(share));
    if (plan.evenWidths) {
      const widest = Math.max(...rows.map((row) => row.width));
      rows = shares.map((share, i) => measureRow(share, Math.min(MOST_GROWTH, widest / rows[i].width)));
    }

    const reach = (row: (typeof rows)[number]) => row.width + (row.style.shift ?? 0) * row.size;
    const blockWidth = Math.max(...rows.map(reach));
    const room = this.width * ROW_WIDTH;
    if (blockWidth > room * ROUNDING_ROOM) return this.rowLayout(caption, { ...t, fontSize: (t.fontSize * room) / blockWidth });

    const overlap = words.some((w) => DEVANAGARI.test(w.text)) ? DEVANAGARI_OVERLAP : 1;
    const tops: number[] = [];
    let total = 0;
    rows.forEach((row, i) => {
      if (i > 0) total -= (row.style.pull ?? 0) * row.size * overlap;
      tops.push(total);
      total += row.height * (row.style.stretch ?? 1);
    });

    const margin = this.height * FRAME_MARGIN;
    const blockTop = Math.max(margin, Math.min(this.height * t.anchorY - total / 2, this.height - margin - total));
    const blockLeft = Math.max(margin, Math.min(this.width * t.anchorX - blockWidth / 2, this.width - margin - blockWidth));

    return rows.flatMap((row, i) => {
      const spare = blockWidth - reach(row);
      const start = row.style.align === 'left' ? 0 : row.style.align === 'right' ? spare : spare / 2;
      const stretch = row.style.stretch ?? 1;
      const y = blockTop + tops[i] + (row.height * (stretch - 1)) / 2;
      let x = blockLeft + start + (row.style.shift ?? 0) * row.size;
      return row.placed.map((w) => {
        const box: WordBox = { text: w.text, width: w.width, height: w.height, look: w.look, index: w.index, x, y, row: i, stretch };
        x += w.width + row.gap;
        return box;
      });
    });
  }

  private layout(caption: Caption, t: Style, only?: number): WordBox[] {
    if (t.rows) return this.rowLayout(caption, t);
    const maxWidth = this.width * 0.86;
    const size = t.fontSize * this.unit;
    const gap = size * 0.3;

    const longest = t.accent ? caption.words.reduce((best, w, i, all) => (w.text.length > all[best].text.length ? i : best), 0) : -1;

    const words = caption.words
      .map((w, index) => {
        const look = lookOf(t, w.style, index === longest);
        const text = cased(w.text, look);
        const paragraph = this.word(text, look, look.color, false);
        return { text, index, look, width: paragraph.getMaxIntrinsicWidth(), height: paragraph.getHeight(), baseline: paragraph.getAlphabeticBaseline() };
      })
      .filter((w) => only === undefined || w.index === only);

    // Auto-fit: a word too wide for the frame shrinks the whole caption to fit.
    const widest = Math.max(...words.map((w) => w.width));
    if (widest > maxWidth) return this.layout(caption, { ...t, fontSize: (t.fontSize * maxWidth) / widest }, only);

    const lines: (typeof words)[] = [[]];
    let used = 0;
    for (const w of words) {
      const next = used === 0 ? w.width : used + gap + w.width;
      const newLine = t.arrangement !== 'line' || next > maxWidth;
      if (newLine && used > 0) {
        lines.push([w]);
        used = w.width;
      } else {
        lines[lines.length - 1].push(w);
        used = next;
      }
    }

    const rowHeights = lines.map((line) => Math.max(...line.map((w) => w.look.fontSize * this.unit)) * t.lineHeight);
    const total = rowHeights.reduce((sum, h) => sum + h, 0);
    const tallest = this.height * (1 - FRAME_MARGIN * 2);
    if (total > tallest) return this.layout(caption, { ...t, fontSize: (t.fontSize * tallest) / total }, only);
    // Tall stacks stay inside the frame wherever the caption is placed.
    const margin = this.height * FRAME_MARGIN;
    let rowTop = Math.max(margin, Math.min(this.height * t.anchorY - total / 2, this.height - margin - total));

    const boxes: WordBox[] = [];
    lines.forEach((line, row) => {
      const lineWidth = line.reduce((sum, w) => sum + w.width, 0) + gap * (line.length - 1);
      // Different fonts and sizes on one line sit on the same baseline.
      const baseline = Math.max(...line.map((w) => w.baseline));
      let x = this.width * t.anchorX - lineWidth / 2;
      for (const w of line) {
        boxes.push({ text: w.text, width: w.width, height: w.height, look: w.look, index: w.index, x, y: rowTop + baseline - w.baseline, row });
        x += w.width + gap;
      }
      rowTop += rowHeights[row];
    });
    return boxes;
  }

  /** The free-plan mark. On vertical video it sits at the top, clear of the app buttons. */
  drawWatermark(canvas: Canvas) {
    const look: Style = { ...templates['minimal-lower'], fontSize: 30, color: '#FFFFFFCC' };
    const mark = this.word(WATERMARK_TEXT, look, look.color, false);
    const margin = WATERMARK_MARGIN * this.unit;
    const x = this.width - mark.getMaxIntrinsicWidth() - margin;
    const y = this.height > this.width ? this.height * 0.06 : this.height - mark.getHeight() - margin;
    canvas.drawParagraph(mark, x, y);
  }

  /** Which word is at a point on the frame, if any. */
  locate(captions: Caption[], time: number, styleOf: (caption: Caption) => Style, x: number, y: number) {
    const caption = captions.find((c) => time >= captionStart(c) && time < captionEnd(c));
    if (!caption) return null;
    const t = styleOf(caption);
    const slack = t.fontSize * this.unit * 0.15;
    const hit = this.boxesAt(caption, t, time).find((b) => x >= b.x - slack && x <= b.x + b.width + slack && y >= b.y - slack && y <= b.y + b.height + slack);
    return hit ? { caption, index: hit.index } : null;
  }

  /** Where a caption would sit, as shares of the frame. */
  measure(caption: Caption, t: Style) {
    const boxes = this.layout(caption, t);
    const left = Math.min(...boxes.map((b) => b.x));
    const right = Math.max(...boxes.map((b) => b.x + b.width));
    const top = Math.min(...boxes.map((b) => b.y));
    const bottom = Math.max(...boxes.map((b) => b.y + b.height));
    return { left: left / this.width, right: right / this.width, height: (bottom - top) / this.height };
  }

  private boxesAt(caption: Caption, t: Style, time: number) {
    let spoken = -1;
    caption.words.forEach((w, i) => {
      if (time >= w.start) spoken = i;
    });
    return this.layout(caption, t, t.reveal === 'single' ? Math.max(spoken, 0) : undefined);
  }

  /** Draws whichever caption is on screen at time `time`. */
  draw(canvas: Canvas, captions: Caption[], time: number, styleOf: (caption: Caption) => Style) {
    if (this.cache.size > CACHE_LIMIT) this.dispose();

    const caption = captions.find((c) => time >= captionStart(c) && time < captionEnd(c));
    if (!caption) return;
    const t = styleOf(caption);
    const ck = this.ck;

    const boxes = this.boxesAt(caption, t, time);
    const scales = boxes.map((box) => wordScale(caption.words[box.index], t, time));
    const growth = boxes.map((box, i) => box.width * (scales[i] - 1));

    if (t.blend !== 'normal') {
      const paint = new ck.Paint();
      paint.setBlendMode(ck.BlendMode[BLEND_MODES[t.blend]]);
      canvas.saveLayer(paint);
      paint.delete();
    }

    const age = clamp01((time - captionStart(caption)) / ENTRANCE);
    const arriving = t.entrance !== 'none' && age < 1;
    if (arriving) {
      const paint = new ck.Paint();
      paint.setAlphaf(easeOutCubic(age));
      canvas.saveLayer(paint);
      paint.delete();
      if (t.entrance === 'rise') canvas.translate(0, (1 - easeOutCubic(age)) * t.fontSize * this.unit * 0.3);
      if (t.entrance === 'pop') {
        const scale = 0.82 + 0.18 * easeOutBack(age);
        const cx = this.width * t.anchorX;
        const cy = this.height * t.anchorY;
        canvas.translate(cx, cy);
        canvas.scale(scale, scale);
        canvas.translate(-cx, -cy);
      }
    }

    boxes.forEach((box, i) => {
      const w = caption.words[box.index];
      if ((t.reveal === 'word' || t.reveal === 'wipe') && time < w.start) return;

      const look = box.look;
      const active = time >= w.start && time < w.end;
      const lit = t.highlight === 'karaoke' ? time >= w.start : active && t.highlight !== 'none' && t.highlight !== 'underline';
      const color = lit ? look.activeColor : look.color;

      // A growing word pushes the others on its line aside instead of covering them.
      let x = box.x;
      boxes.forEach((other, j) => {
        if (other.row === box.row && j !== i) x += ((j < i ? 1 : -1) * growth[j]) / 2;
      });

      const fill = this.word(box.text, look, color, false);
      const cx = x + box.width / 2;
      const cy = box.y + box.height / 2;
      const progress = clamp01((time - w.start) / Math.max(w.end - w.start, 0.001));

      const entrance = t.wordEntrance;
      const arrival = entrance ? clamp01((time - w.start) / entrance.seconds) : 1;
      const eased = easeOutCubic(arrival);
      const size = look.fontSize * this.unit;

      canvas.save();
      if (entrance && arrival < 1) {
        const paint = new ck.Paint();
        paint.setAlphaf(eased);
        if (entrance.kind === 'blur') {
          const sigma = (1 - eased) * ENTRANCE_BLUR * size;
          const filter = ck.ImageFilter.MakeBlur(sigma, sigma, ck.TileMode.Decal, null);
          paint.setImageFilter(filter);
          filter.delete();
        }
        canvas.saveLayer(paint);
        paint.delete();
        if (entrance.kind === 'slide') canvas.translate((1 - eased) * ENTRANCE_SLIDE * size, 0);
      }
      canvas.translate(cx, cy);
      canvas.scale(scales[i], scales[i] * (box.stretch ?? 1));
      canvas.translate(-cx, -cy);
      if (t.reveal === 'wipe' && active) {
        const reach = (look.stroke?.width ?? 0) * this.unit;
        canvas.clipRect(ck.LTRBRect(x - reach, box.y - box.height, x + box.width * progress, box.y + box.height * 2), ck.ClipOp.Intersect, true);
      }
      if (t.highlight === 'pill' && active) this.pill(canvas, x, box.y, box.width, box.height, t);
      if (look.stroke) canvas.drawParagraph(this.word(box.text, look, color, true), x, box.y);
      if (t.shine) this.shiny(canvas, fill, x, box.y, box.width, box.height, ((time - captionStart(caption)) / SHINE_SECONDS) % 1);
      else canvas.drawParagraph(fill, x, box.y);
      if (t.highlight === 'underline' && active) this.underline(canvas, x, box.y + box.height * 0.96, box.width * progress, t);
      if (entrance && arrival < 1) canvas.restore();
      canvas.restore();
    });

    if (arriving) canvas.restore();
    if (t.blend !== 'normal') canvas.restore();
  }

  /** The word with a soft band of light crossing it, kept inside the letters. */
  private shiny(canvas: Canvas, fill: Paragraph, x: number, y: number, width: number, height: number, phase: number) {
    const ck = this.ck;
    const band = Math.max(width * 0.4, height);
    const left = x - band + (width + band * 2) * phase;
    canvas.saveLayer();
    canvas.drawParagraph(fill, x, y);
    const shader = ck.Shader.MakeLinearGradient([left, y], [left + band, y + height], [ck.Color(255, 255, 255, 0), ck.Color(255, 255, 255, 0.95), ck.Color(255, 255, 255, 0)], [0, 0.5, 1], ck.TileMode.Clamp);
    const paint = new ck.Paint();
    paint.setShader(shader);
    paint.setBlendMode(ck.BlendMode.SrcATop);
    canvas.drawRect(ck.LTRBRect(x, y, x + width, y + height), paint);
    paint.delete();
    shader.delete();
    canvas.restore();
  }

  private underline(canvas: Canvas, x: number, y: number, width: number, t: Style) {
    const ck = this.ck;
    const paint = new ck.Paint();
    paint.setColor(ck.parseColorString(t.activeColor));
    paint.setStyle(ck.PaintStyle.Stroke);
    paint.setStrokeWidth(t.fontSize * this.unit * 0.09);
    paint.setStrokeCap(ck.StrokeCap.Round);
    paint.setAntiAlias(true);
    canvas.drawLine(x, y, x + width, y, paint);
    paint.delete();
  }

  private pill(canvas: Canvas, x: number, y: number, width: number, height: number, t: Style) {
    const ck = this.ck;
    const padX = t.fontSize * this.unit * 0.2;
    const radius = t.fontSize * this.unit * 0.2;
    const paint = new ck.Paint();
    paint.setColor(ck.parseColorString(t.pillColor));
    paint.setAntiAlias(true);
    canvas.drawRRect(ck.RRectXY(ck.LTRBRect(x - padX, y, x + width + padX, y + height), radius, radius), paint);
    paint.delete();
  }

  dispose() {
    for (const p of this.cache.values()) p.delete();
    this.cache.clear();
  }
}
