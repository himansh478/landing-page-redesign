import type { FaceSample } from '@/captions/lib/project';
import { captionEnd, captionStart, type Caption, type Style } from './types';

// Keeps captions off faces. Each caption gets one height for its whole time on
// screen, so it never slides around while being read, and glides from the previous
// caption's height when it arrives. Like the renderer, this depends only on time.

/** Look this far around a caption, so a face missed for a moment still counts. */
const WINDOW = 0.4;
const FACE_MARGIN = 0.02;
const GLIDE = 0.18;
/** Glide only between captions this close together; otherwise it just appears. */
const CONNECTED = 0.3;

type Measure = (caption: Caption, style: Style) => { left: number; right: number; height: number };

type Limits = { top: number; bottom: number };

/** Keeps text out of the areas Instagram and YouTube cover with their buttons. */
export const frameLimits = (portrait: boolean): Limits => (portrait ? { top: 0.13, bottom: 0.8 } : { top: 0.05, bottom: 0.95 });

function bestHeight(wanted: number, height: number, blocked: [number, number][], limits: Limits) {
  const lowest = limits.top + height / 2;
  const highest = limits.bottom - height / 2;
  const free = (y: number) => y >= lowest && y <= highest && blocked.every(([from, to]) => y <= from || y >= to);

  if (free(wanted)) return wanted;
  const options = blocked.flat().filter(free);
  if (options.length === 0) return wanted;
  return options.reduce((best, y) => (Math.abs(y - wanted) < Math.abs(best - wanted) ? y : best));
}

export function planPositions(captions: Caption[], style: Style, faces: FaceSample[], measure: Measure, portrait: boolean) {
  const limits = frameLimits(portrait);
  const heights = new Map<string, number>();

  for (const caption of captions) {
    const size = measure(caption, style);
    const start = captionStart(caption) - WINDOW;
    const end = captionEnd(caption) + WINDOW;
    const blocked: [number, number][] = [];

    for (const sample of faces) {
      if (sample.time < start || sample.time > end) continue;
      for (const face of sample.boxes) {
        if (face.x > size.right || face.x + face.width < size.left) continue;
        blocked.push([face.y - size.height / 2 - FACE_MARGIN, face.y + face.height + size.height / 2 + FACE_MARGIN]);
      }
    }
    heights.set(caption.id, bestHeight(style.anchorY, size.height, blocked, limits));
  }

  return (caption: Caption, time: number) => {
    const target = heights.get(caption.id) ?? style.anchorY;
    const index = captions.indexOf(caption);
    const previous = captions[index - 1];
    if (!previous || captionStart(caption) - captionEnd(previous) > CONNECTED) return target;

    const from = heights.get(previous.id) ?? style.anchorY;
    const progress = Math.min(1, Math.max(0, (time - captionStart(caption)) / GLIDE));
    const eased = 1 - Math.pow(1 - progress, 3);
    return from + (target - from) * eased;
  };
}
