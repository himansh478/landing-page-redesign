import { CaptionRenderer } from './renderer';
import { loadCanvasKit, loadFonts } from './studio';
import { familiesOf, templateList } from './templates';
import type { Caption, Style } from './types';

const WIDTH = 480;
const HEIGHT = 270;
/** Thumbnails are small, so the text is enlarged to stay readable. */
const ENLARGE = 1.55;

const sample = (script: 'latin' | 'devanagari'): Caption => ({
  id: 'sample',
  words:
    script === 'devanagari'
      ? [
          { text: 'कैप्शन', start: 0, end: 1 },
          { text: 'स्टाइल', start: 1, end: 2 },
        ]
      : [
          { text: 'Trending', start: 0, end: 1 },
          { text: 'style', start: 1, end: 2 },
        ],
});

/** Real engine output for each template, so the gallery can't disagree with the export. */
export async function renderThumbnails(script: 'latin' | 'devanagari') {
  const ck = await loadCanvasKit();
  const fonts = await loadFonts();
  await Promise.all(templateList.flatMap((t) => familiesOf(t).map((family) => fonts.ensure(family))));

  const surface = ck.MakeSurface(WIDTH, HEIGHT);
  if (!surface) throw new Error('Could not create a thumbnail surface');
  const renderer = new CaptionRenderer(ck, fonts.provider, WIDTH, HEIGHT);
  const canvas = surface.getCanvas();
  const caption = sample(script);

  const thumbnails: Record<string, string> = {};
  for (const template of templateList) {
    const style: Style = { ...template, fontSize: template.fontSize * ENLARGE, anchorX: 0.5, anchorY: 0.5 };
    canvas.clear(ck.parseColorString('#26282D'));
    // A template that builds word by word shows all its words at once here.
    const words = template.preview && script === 'latin' ? template.preview.map((text) => ({ text, start: 0, end: 2 })) : caption.words.map((w) => (template.rows ? { ...w, start: 0, end: 2 } : w));
    renderer.draw(canvas, [{ ...caption, words }], template.rows ? 1 : 0.5, () => ({ ...style, blend: 'normal' }));
    surface.flush();
    const image = surface.makeImageSnapshot();
    const bytes = image.encodeToBytes();
    image.delete();
    if (!bytes) continue;
    thumbnails[template.id] = URL.createObjectURL(new Blob([bytes.slice()], { type: 'image/png' }));
  }

  renderer.dispose();
  surface.delete();
  return thumbnails;
}
