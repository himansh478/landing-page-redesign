'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { SOUNDS, soundEvents, soundLength, soundShape, soundVolume, type SoundEvent } from '@/captions/engine/sounds';
import { captionEnd, captionStart, type Caption, type SoundKind } from '@/captions/engine/types';
import type { Token } from '@/captions/lib/project';
import { findDoubts } from '@/captions/lib/review';
import { playSound } from '@/captions/lib/sound-player';
import { useEditor } from '@/captions/state/editor';
import { playhead } from '@/captions/state/playhead';

const MIN_ZOOM = 8;
const MAX_ZOOM = 400;
const ZOOM_STEP = 1.25;
const MIN_LENGTH = 0.1;
/** How near, in pixels, a dragged edge must come to the playhead or a neighbour to catch on it. */
const SNAP_PX = 8;
/** Room after the last second, so the end of the video isn't pressed against the edge. */
const TAIL = 32;
/** Labelled ticks are at least this far apart, in pixels. */
const LABEL_GAP = 64;
const TICK_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60];
const AUDIO_HEIGHT = 50;
/** Below this width, in pixels, a clip shows no text: a letter and a dot only clutter it. */
const NARROW_CLIP = 40;
/** A caption's sounds can move this far, in seconds, either way from their caption. */
const MOST_SOUND_SHIFT = 1;
const SOUND_NAMES = Object.fromEntries(SOUNDS.map((s) => [s.id, s.name])) as Record<SoundKind, string>;
/** Widest canvas browsers draw reliably. */
const LARGEST_CANVAS = 32000;

const SHORTCUTS = 'Space plays and pauses · S splits at the playhead · Delete removes the selected caption · ← → step one frame · Ctrl + scroll zooms';

type Drag = { id: string; mode: 'move' | 'left' | 'right'; x: number; start: number; end: number; min: number; max: number };
type Span = { id: string; start: number; end: number };
/** A caption's sounds being dragged: where the grabbed one sits with no shift of its own, and the shift it started with. */
type SoundDrag = { captionId: string; x: number; base: number; spoken: number; shift: number };

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const clock = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
const label = (t: number, fine: boolean) => {
  const minutes = Math.floor(t / 60);
  const rest = t - minutes * 60;
  return `${minutes}:${fine ? rest.toFixed(1).padStart(4, '0') : String(Math.round(rest)).padStart(2, '0')}`;
};

/** Labelled ticks far enough apart to read, and smaller ones between them while they stay distinct. */
function ticks(zoom: number) {
  const major = TICK_STEPS.find((step) => step * zoom >= LABEL_GAP) ?? 60;
  const minor = [5, 2, 1].map((parts) => major / parts).find((step) => step * zoom >= 8) ?? major;
  return { major, minor };
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  split: 'M6 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM6 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12',
  merge: 'M3 7h6v10H3zM15 7h6v10h-6zM9 12h6',
  remove: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  snap: 'M6 3v8a6 6 0 0 0 12 0V3h-4v8a2 2 0 0 1-4 0V3z',
  out: 'M5 12h14',
  in: 'M12 5v14M5 12h14',
  fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  text: 'M4 7V5h16v2M9 19h6M12 5v14',
  wave: 'M3 12h1M7 8v8M11 4v16M15 7v10M19 10v4',
  note: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
};

// Laid out like a video editor's: tools and the clock on top, named tracks on the left, and a
// ruler, the captions and the sound in one scrolling strip that the playhead crosses.
export function Timeline({ captions, seek }: { captions: Caption[]; seek: (t: number) => void }) {
  const project = useEditor((s) => s.project);
  const tokens = useEditor((s) => s.doc?.tokens) as Token[] | undefined;
  const script = useEditor((s) => s.doc?.script);
  const offset = useEditor((s) => s.doc?.offset ?? 0);
  const sound = useEditor((s) => s.doc?.sound);
  const { retimeCaption, splitCaption, mergeWithNext, deleteCaption, setCaptionLook } = useEditor.getState();
  // Shared with the caption list and the style panel, so a caption chosen here can be restyled there.
  const selectedId = useEditor((s) => s.selectedCaption);
  const setSelectedId = useEditor((s) => s.selectCaption);

  /** Pixels per second. Unset until the strip has been measured and the whole video fitted. */
  const [zoom, setZoom] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [canSplit, setCanSplit] = useState(false);
  const [snapping, setSnapping] = useState(true);
  const [snapAt, setSnapAt] = useState<number | null>(null);
  const [preview, setPreview] = useState<Span | null>(null);
  /** A caption's sounds being moved, before the move is kept. */
  const [soundPreview, setSoundPreview] = useState<{ captionId: string; shift: number } | null>(null);
  /** The selection came from the sounds track, so Delete takes out the sound, not the caption. */
  const [soundChosen, setSoundChosen] = useState(false);
  // Refs, because a quick drag can move before React has re-rendered with the new state.
  const dragRef = useRef<Drag | null>(null);
  const movedRef = useRef<Span | null>(null);
  const soundDragRef = useRef<SoundDrag | null>(null);
  const soundMovedRef = useRef<number | null>(null);
  const scrubbingRef = useRef(false);
  const anchorRef = useRef<{ time: number; x: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);

  const duration = project?.media.duration ?? 0;
  const z = zoom ?? 50;
  const width = Math.max(1, duration * z);
  const doubts = useMemo(() => (tokens && script ? findDoubts(captions, tokens, script) : new Map<string, Token[]>()), [captions, tokens, script]);
  const events = useMemo(() => soundEvents(captions, sound), [captions, sound]);
  const shapes = useMemo(() => Object.fromEntries(SOUNDS.map(({ id }) => [id, soundShape(id)])) as Record<SoundKind, string>, []);
  const shiftOf = (captionId: string) => captions.find((c) => c.id === captionId)?.look?.soundOffset ?? 0;
  const selectedIndex = captions.findIndex((c) => c.id === selectedId);
  const selected = selectedIndex >= 0 ? captions[selectedIndex] : null;
  // English captions of a Hindi video aren't tied to spoken words, so they can't be cut or joined.
  const editable = !!selected?.words[0].tokenId;

  const fitZoom = () => {
    const scroller = scrollRef.current;
    return scroller && duration ? clamp((scroller.clientWidth - TAIL) / duration, MIN_ZOOM, MAX_ZOOM) : z;
  };

  // The first measurement fits the whole video; later resizes leave the chosen zoom alone.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !duration) return;
    const watcher = new ResizeObserver(() => setZoom((current) => current ?? clamp((scroller.clientWidth - TAIL) / duration, MIN_ZOOM, MAX_ZOOM)));
    watcher.observe(scroller);
    return () => watcher.disconnect();
  }, [duration]);

  /** Zooms while keeping the moment under `x` (pixels from the strip's left) where it was. */
  const zoomTo = (next: number, x?: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const head = playhead.get() * z - scroller.scrollLeft;
    const at = x ?? (head >= 0 && head <= scroller.clientWidth ? head : scroller.clientWidth / 2);
    anchorRef.current = { time: (scroller.scrollLeft + at) / z, x: at };
    setZoom(clamp(next, MIN_ZOOM, MAX_ZOOM));
  };

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const scroller = scrollRef.current;
    if (!anchor || !scroller) return;
    scroller.scrollLeft = anchor.time * z - anchor.x;
    anchorRef.current = null;
  }, [z]);

  // Ctrl or ⌘ with the wheel zooms around the pointer; the plain wheel scrolls along the strip.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomTo(z * Math.exp(-e.deltaY * 0.002), e.clientX - scroller.getBoundingClientRect().left);
      } else if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
      }
    };
    scroller.addEventListener('wheel', wheel, { passive: false });
    return () => scroller.removeEventListener('wheel', wheel);
    // zoomTo reads the current zoom, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [z]);

  useEffect(() => {
    const update = (time: number) => {
      if (headRef.current) headRef.current.style.left = `${time * z}px`;
      if (clockRef.current) clockRef.current.textContent = clock(time);
      const scroller = scrollRef.current;
      if (scroller && !scrubbingRef.current) {
        const x = time * z;
        if (x < scroller.scrollLeft || x > scroller.scrollLeft + scroller.clientWidth - 40) scroller.scrollLeft = x - 40;
      }
      const current = captions.find((c) => time >= captionStart(c) && time < captionEnd(c));
      setActiveId(current?.id ?? null);
      setCanSplit(!!current?.words[0].tokenId && current.words.findIndex((w) => w.start >= time) > 0);
    };
    update(playhead.get());
    return playhead.subscribe(update);
  }, [z, captions]);

  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas || !project) return;
    const cssWidth = Math.max(1, Math.round(width));
    const scale = Math.min(window.devicePixelRatio || 1, LARGEST_CANVAS / cssWidth);
    canvas.width = Math.round(cssWidth * scale);
    canvas.height = Math.round(AUDIO_HEIGHT * scale);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${AUDIO_HEIGHT}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#5c616d';
    const { envelope } = project;
    const perPixel = envelope.length / cssWidth;
    for (let x = 0; x < cssWidth; x++) {
      const from = Math.floor(x * perPixel);
      const to = Math.max(from + 1, Math.floor((x + 1) * perPixel));
      let peak = -60;
      for (let i = from; i < to; i++) peak = Math.max(peak, envelope[i] ?? -60);
      const height = Math.max(1, ((peak + 60) / 60) * (AUDIO_HEIGHT - 8));
      ctx.fillRect(x, (AUDIO_HEIGHT - height) / 2, 1, height);
    }
  }, [project, width]);

  // Delete takes out the selected caption, or only its sound when the sound was picked; Escape
  // lets go of it. Typing in a field is left alone.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (/^(TEXTAREA|INPUT|SELECT)$/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === 'Escape') setSelectedId(null);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        if (soundChosen) {
          e.preventDefault();
          setCaptionLook(selected.id, { sound: 'none' });
        } else if (editable) {
          e.preventDefault();
          deleteCaption(selected.id);
          setSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [selected, editable, soundChosen, deleteCaption, setCaptionLook, setSelectedId]);

  const timeAt = (clientX: number) => {
    const box = innerRef.current?.getBoundingClientRect();
    return box ? clamp((clientX - box.left) / z, 0, duration) : 0;
  };

  const scrub = (e: PointerEvent<HTMLElement>) => {
    e.preventDefault();
    scrubbingRef.current = true;
    innerRef.current?.setPointerCapture(e.pointerId);
    seek(timeAt(e.clientX));
  };

  const begin = (e: PointerEvent<HTMLElement>, caption: Caption, index: number, mode: Drag['mode']) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(caption.id);
    setSoundChosen(false);
    dragRef.current = {
      id: caption.id,
      mode,
      x: e.clientX,
      start: captionStart(caption),
      end: captionEnd(caption),
      min: index > 0 ? captionEnd(captions[index - 1]) : 0,
      max: index < captions.length - 1 ? captionStart(captions[index + 1]) : duration,
    };
    innerRef.current?.setPointerCapture(e.pointerId);
  };

  /** Picks up a sound, and with it every sound of its caption, which move together. */
  const beginSound = (e: PointerEvent<HTMLElement>, event: SoundEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(event.captionId);
    setSoundChosen(true);
    const caption = captions.find((c) => c.id === event.captionId);
    const shift = shiftOf(event.captionId);
    const base = event.time - shift;
    // Where the sound would be with no timing at all: on the word or caption it belongs to.
    const spoken = base - (sound?.offset ?? 0);
    soundDragRef.current = { captionId: event.captionId, x: e.clientX, base, spoken: caption ? Math.max(0, spoken) : base, shift };
    innerRef.current?.setPointerCapture(e.pointerId);
  };

  /** The playhead or a neighbouring edge within reach of `time`, if snapping is on. */
  const catchAt = (time: number, drag: Drag) => {
    if (!snapping) return null;
    return [playhead.get(), drag.min, drag.max].find((target) => Math.abs(time - target) * z <= SNAP_PX) ?? null;
  };

  const move = (e: PointerEvent<HTMLElement>) => {
    if (scrubbingRef.current) {
      seek(timeAt(e.clientX));
      return;
    }
    const soundDrag = soundDragRef.current;
    if (soundDrag) {
      let shift = clamp(soundDrag.shift + (e.clientX - soundDrag.x) / z, -MOST_SOUND_SHIFT, MOST_SOUND_SHIFT);
      // A sound catches on the moment its word is spoken, and on the playhead.
      const at = soundDrag.base + shift;
      const target = snapping ? [soundDrag.spoken, playhead.get()].find((t) => Math.abs(at - t) * z <= SNAP_PX) : undefined;
      if (target !== undefined) shift = clamp(target - soundDrag.base, -MOST_SOUND_SHIFT, MOST_SOUND_SHIFT);
      setSnapAt(target ?? null);
      soundMovedRef.current = shift;
      setSoundPreview({ captionId: soundDrag.captionId, shift });
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const delta = (e.clientX - drag.x) / z;
    let { start, end } = drag;
    let caught: number | null = null;
    if (drag.mode === 'move') {
      const length = end - start;
      start = clamp(start + delta, drag.min, drag.max - length);
      const byStart = catchAt(start, drag);
      const byEnd = byStart === null ? catchAt(start + length, drag) : null;
      if (byStart !== null) start = clamp(byStart, drag.min, drag.max - length);
      else if (byEnd !== null) start = clamp(byEnd - length, drag.min, drag.max - length);
      caught = byStart ?? byEnd;
      end = start + length;
    } else if (drag.mode === 'left') {
      start = clamp(start + delta, drag.min, end - MIN_LENGTH);
      caught = catchAt(start, drag);
      if (caught !== null && caught < end - MIN_LENGTH && caught >= drag.min) start = caught;
      else caught = null;
    } else {
      end = clamp(end + delta, start + MIN_LENGTH, drag.max);
      caught = catchAt(end, drag);
      if (caught !== null && caught > start + MIN_LENGTH && caught <= drag.max) end = caught;
      else caught = null;
    }
    setSnapAt(caught);
    movedRef.current = { id: drag.id, start, end };
    setPreview(movedRef.current);
  };

  const finish = () => {
    scrubbingRef.current = false;
    const soundDrag = soundDragRef.current;
    const shift = soundMovedRef.current;
    if (soundDrag && shift !== null) {
      const kept = Math.round(shift * 1000) / 1000;
      setCaptionLook(soundDrag.captionId, { soundOffset: kept === 0 ? undefined : kept }, 'sound-shift');
    }
    soundDragRef.current = null;
    soundMovedRef.current = null;
    setSoundPreview(null);
    const drag = dragRef.current;
    const moved = movedRef.current;
    if (drag && moved) retimeCaption(moved.id, drag.start - offset, drag.end - offset, moved.start - offset, moved.end - offset);
    dragRef.current = null;
    movedRef.current = null;
    setPreview(null);
    setSnapAt(null);
  };

  const splitHere = () => {
    const time = playhead.get();
    const caption = captions.find((c) => time >= captionStart(c) && time < captionEnd(c));
    const index = caption?.words.findIndex((w) => w.start >= time) ?? -1;
    if (caption && index > 0) splitCaption(caption.id, index);
  };

  const fit = () => {
    anchorRef.current = { time: 0, x: 0 };
    setZoom(fitZoom());
  };

  const { major, minor } = ticks(z);
  const labels: number[] = [];
  for (let i = 0; i * major <= duration + 1e-6; i++) labels.push(Math.round(i * major * 1000) / 1000);

  return (
    <section className="timeline">
      <div className="tl-bar">
        <button className="tl-btn" id="tl-split" onClick={splitHere} disabled={!canSplit} title="Split the caption at the playhead (S)">
          <Icon d={ICONS.split} /> Split
        </button>
        <button className="tl-btn" onClick={() => selected && mergeWithNext(selected.id)} disabled={!editable || selectedIndex >= captions.length - 1} title="Join the selected caption with the next one">
          <Icon d={ICONS.merge} /> Merge
        </button>
        <button
          className="tl-btn"
          onClick={() => {
            if (!selected) return;
            if (soundChosen) {
              setCaptionLook(selected.id, { sound: 'none' });
              return;
            }
            deleteCaption(selected.id);
            setSelectedId(null);
          }}
          disabled={soundChosen ? !selected : !editable}
          title={soundChosen ? "Take out the selected caption's sound (Delete)" : 'Delete the selected caption (Delete)'}
        >
          <Icon d={ICONS.remove} /> {soundChosen && selected ? 'Delete sound' : 'Delete'}
        </button>
        <i className="tl-sep" aria-hidden />
        <button className={`tl-btn ${snapping ? 'on' : ''}`} aria-pressed={snapping} onClick={() => setSnapping(!snapping)} title="Edges catch on the playhead and on the captions beside them">
          <Icon d={ICONS.snap} /> Snap
        </button>

        <div className="tl-clock">
          <span ref={clockRef}>0:00.00</span> <small>/ {clock(duration)}</small>
        </div>

        <button className="tl-btn icon" onClick={() => zoomTo(z / ZOOM_STEP)} disabled={z <= MIN_ZOOM} aria-label="Zoom out" title="Zoom out">
          <Icon d={ICONS.out} />
        </button>
        <input
          className="tl-zoom"
          type="range"
          aria-label="Zoom"
          min={Math.log(MIN_ZOOM)}
          max={Math.log(MAX_ZOOM)}
          step={0.01}
          value={Math.log(z)}
          onChange={(e) => zoomTo(Math.exp(Number(e.target.value)))}
        />
        <button className="tl-btn icon" onClick={() => zoomTo(z * ZOOM_STEP)} disabled={z >= MAX_ZOOM} aria-label="Zoom in" title="Zoom in">
          <Icon d={ICONS.in} />
        </button>
        <button className="tl-btn" id="tl-fit" onClick={fit} title="Show the whole video">
          <Icon d={ICONS.fit} /> Fit
        </button>
        <button className="tl-btn icon" title={SHORTCUTS} aria-label={`Shortcuts: ${SHORTCUTS}`}>
          ?
        </button>
      </div>

      <div className="tl-body">
        <div className="tl-heads">
          <div className="tl-corner" />
          <div className="tl-head">
            <Icon d={ICONS.text} />
            <span>
              Captions <small>{captions.length}</small>
            </span>
            {doubts.size > 0 && <em title="Captions with words to check">{doubts.size} to check</em>}
          </div>
          <div className="tl-head audio">
            <Icon d={ICONS.wave} />
            <span>Audio</span>
          </div>
          <div className="tl-head sounds">
            <Icon d={ICONS.note} />
            <span>
              Sounds <small>{events.length}</small>
            </span>
            <em className="tl-sound-name">{sound && sound.kind !== 'none' ? SOUND_NAMES[sound.kind] : 'Off'}</em>
          </div>
        </div>

        <div className="tl-scroll" ref={scrollRef}>
          <div className="tl-inner" ref={innerRef} style={{ width: width + TAIL }} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}>
            <div className="tl-ruler" style={{ width, backgroundSize: `${major * z}px 9px, ${minor * z}px 5px` }} onPointerDown={scrub}>
              {labels.map((t) => (
                <span key={t} style={{ left: t * z }}>
                  {label(t, major < 1)}
                </span>
              ))}
            </div>

            <div className="tl-lane captions" style={{ width }} onPointerDown={() => setSelectedId(null)}>
              {captions.map((caption, index) => {
                const shown = preview?.id === caption.id ? preview : { start: captionStart(caption), end: captionEnd(caption) };
                const doubt = doubts.get(caption.id);
                const text = caption.words.map((w) => w.text).join(' ');
                const px = (shown.end - shown.start) * z;
                const classes = ['clip', caption.id === activeId && 'active', caption.id === selectedId && 'selected', doubt && 'doubt', caption.look && 'own', px < NARROW_CLIP && 'narrow'].filter(Boolean).join(' ');
                return (
                  <div
                    key={caption.id}
                    className={classes}
                    style={{ left: shown.start * z, width: Math.max(4, px) }}
                    title={`${text}\n${clock(shown.start)} – ${clock(shown.end)}${caption.look ? '\nHas its own look' : ''}${doubt ? `\nCheck: ${doubt.map((t) => t.hinglish || t.source).join(', ')}` : ''}`}
                    onPointerDown={(e) => begin(e, caption, index, 'move')}
                    onDoubleClick={() => seek(captionStart(caption) + 0.001)}
                  >
                    <i className="grip left" onPointerDown={(e) => begin(e, caption, index, 'left')} />
                    {px >= NARROW_CLIP && <span>{text}</span>}
                    <i className="grip right" onPointerDown={(e) => begin(e, caption, index, 'right')} />
                  </div>
                );
              })}
            </div>

            <div className="tl-lane audio" style={{ width }} onPointerDown={scrub}>
              <canvas ref={waveRef} />
              {project?.speechGaps.map((gap) => (
                <i key={gap.start} className="tl-gap" style={{ left: gap.start * z, width: (gap.end - gap.start) * z }} title="Speech may be missing here" />
              ))}
            </div>

            {/* Every caption sound as its own clip, under the speech it should land on. */}
            <div className="tl-lane sounds" style={{ width }} onPointerDown={() => setSelectedId(null)}>
              {events.length === 0 && <span className="tl-empty">No caption sounds yet. Pick one in the Sound tab.</span>}
              {events.map((event, i) => {
                const moving = soundPreview && soundPreview.captionId === event.captionId ? soundPreview : null;
                const time = moving ? event.time - shiftOf(event.captionId) + moving.shift : event.time;
                const px = Math.max(8, soundLength(event.kind) * z);
                const shift = moving ? moving.shift : shiftOf(event.captionId);
                return (
                  <div
                    key={`${event.captionId}-${i}`}
                    className={`sfx ${event.kind} ${event.captionId === selectedId ? 'selected' : ''} ${shift ? 'shifted' : ''}`}
                    style={{ left: time * z, width: px }}
                    title={`${SOUND_NAMES[event.kind]} at ${clock(time)}${shift ? ` (moved ${Math.round(shift * 1000)} ms)` : ''}\nDrag to line it up · Double-click to hear it · Delete takes it out`}
                    onPointerDown={(e) => beginSound(e, event)}
                    onDoubleClick={() => playSound(event.kind, soundVolume(sound))}
                  >
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden>
                      <path d={shapes[event.kind]} />
                    </svg>
                    {px >= 46 && <span>{SOUND_NAMES[event.kind]}</span>}
                  </div>
                );
              })}
            </div>

            {snapAt !== null && <i className="tl-snap" style={{ left: snapAt * z }} aria-hidden />}
            <div className="tl-playhead" ref={headRef}>
              <i onPointerDown={scrub} title="Drag to scrub" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
