import type { FaceSample } from '@/captions/lib/project';

// Auto-reframe: a 9:16 window slides across a wide video to keep the speaker in shot.
// It works on the finished video, so it can look ahead: each point averages the speaker's
// position before and after it, and the frame glides instead of chasing every head turn.
const SMOOTH_SECONDS = 1.5;

/** Share of the source width that a 9:16 window covers. */
export const cropShare = (width: number, height: number) => Math.min(1, ((height * 9) / 16) / width);

export function cameraPath(faces: FaceSample[] | undefined, share: number) {
  const seen = (faces ?? []).flatMap((sample) => {
    if (sample.boxes.length === 0) return [];
    const box = sample.boxes.reduce((big, b) => (b.width * b.height > big.width * big.height ? b : big));
    return [{ time: sample.time, center: box.x + box.width / 2 }];
  });

  const clamp = (center: number) => Math.min(1 - share, Math.max(0, center - share / 2));
  if (seen.length === 0) return () => clamp(0.5);

  const path = seen.map(({ time }) => {
    const near = seen.filter((p) => Math.abs(p.time - time) <= SMOOTH_SECONDS);
    return { time, left: clamp(near.reduce((sum, p) => sum + p.center, 0) / near.length) };
  });

  return (time: number) => {
    let after = path.findIndex((p) => p.time >= time);
    if (after < 0) return path[path.length - 1].left;
    if (after === 0) return path[0].left;
    const a = path[after - 1];
    const b = path[after];
    return a.left + ((b.left - a.left) * (time - a.time)) / (b.time - a.time);
  };
}

/** Face positions as they appear inside the moving window. */
export const framedFaces = (faces: FaceSample[], leftAt: (time: number) => number, share: number): FaceSample[] =>
  faces.map(({ time, boxes }) => {
    const left = leftAt(time);
    return { time, boxes: boxes.map((box) => ({ ...box, x: (box.x - left) / share, width: box.width / share })) };
  });
