import type { FaceSample } from '@/captions/lib/project';

// Makes captions follow a face. Face boxes jump a little between frames, so the path
// goes through a One-Euro filter: heavy smoothing while the face is still, light
// while it moves, which removes jitter without adding lag.
const MIN_CUTOFF = 0.6;
const SPEED_RESPONSE = 0.8;
const SPEED_CUTOFF = 1;

const blend = (cutoff: number, dt: number) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

function oneEuro() {
  let last: number | null = null;
  let speed = 0;
  return (value: number, dt: number) => {
    if (last === null) {
      last = value;
      return value;
    }
    const rawSpeed = (value - last) / dt;
    speed += blend(SPEED_CUTOFF, dt) * (rawSpeed - speed);
    const a = blend(MIN_CUTOFF + SPEED_RESPONSE * Math.abs(speed), dt);
    last += a * (value - last);
    return last;
  };
}

const median = (values: number[]) => [...values].sort((a, b) => a - b)[values.length >> 1];

/** How far the main face is from its usual spot at any time, as shares of the frame. */
export function faceTrack(faces: FaceSample[]) {
  const points: { time: number; x: number; y: number }[] = [];
  const smoothX = oneEuro();
  const smoothY = oneEuro();
  let previous = 0;

  for (const sample of faces) {
    if (sample.boxes.length === 0) continue;
    const box = sample.boxes.reduce((big, b) => (b.width * b.height > big.width * big.height ? b : big));
    const dt = Math.max(sample.time - previous, 0.001);
    previous = sample.time;
    points.push({ time: sample.time, x: smoothX(box.x + box.width / 2, dt), y: smoothY(box.y + box.height / 2, dt) });
  }
  if (points.length === 0) return () => ({ dx: 0, dy: 0 });

  const homeX = median(points.map((p) => p.x));
  const homeY = median(points.map((p) => p.y));

  return (time: number) => {
    let after = points.findIndex((p) => p.time >= time);
    if (after < 0) after = points.length - 1;
    const b = points[after];
    const a = points[Math.max(0, after - 1)];
    const span = b.time - a.time;
    const mix = span > 0 ? Math.min(1, Math.max(0, (time - a.time) / span)) : 1;
    return { dx: a.x + (b.x - a.x) * mix - homeX, dy: a.y + (b.y - a.y) * mix - homeY };
  };
}
