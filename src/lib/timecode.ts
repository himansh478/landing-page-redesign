// SMPTE-style timecode (HH:MM:SS:FF) — the site's visual language borrows
// from an editing timeline, so scroll position and durations read as timecode.
export const FPS = 25;

// The whole page is treated as one 3-minute reel for the scroll timecode.
export const REEL_SECONDS = 180;

const pad = (n: number) => String(n).padStart(2, '0');

export function toTimecode(totalSeconds: number, fps = FPS): string {
  const totalFrames = Math.floor(Math.max(0, totalSeconds) * fps);
  const frames = totalFrames % fps;
  const secs = Math.floor(totalFrames / fps);
  return `${pad(Math.floor(secs / 3600))}:${pad(Math.floor(secs / 60) % 60)}:${pad(secs % 60)}:${pad(frames)}`;
}

// Short form for lesson durations: 4:05, 1:02:10
export function toDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s / 60) % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
