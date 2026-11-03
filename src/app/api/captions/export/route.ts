import { burnIn, type BurnOptions } from '@/captions/server/align';
import { signInRequired, viewerOf } from '@/captions/server/auth';

// Server export, for browsers that can't encode video themselves. The browser renders
// the captions as a transparent layer with the same engine as always; the server only
// lays that layer over the video. The video is used for this job and not kept.
const LARGEST_FILE = 500 * 1024 * 1024;
const LARGEST_SIDE = 7680;
const LONGEST_PATH = 100000;

const isSide = (value: unknown) => Number.isInteger(value) && (value as number) >= 2 && (value as number) <= LARGEST_SIDE;
const isShare = (value: unknown) => typeof value === 'number' && value >= 0 && value <= 1;
const isTime = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** These values end up in an ffmpeg command, so only plain numbers get through. */
function readOptions(text: unknown): BurnOptions | null {
  try {
    const { width, height, crop } = JSON.parse(String(text));
    if (!isSide(width) || !isSide(height)) return null;
    if (!crop) return { width, height };

    const { share, path } = crop;
    if (!isShare(share) || share === 0 || !Array.isArray(path) || path.length > LONGEST_PATH) return null;
    if (!path.every((point) => isTime(point?.time) && isShare(point?.left))) return null;
    return { width, height, crop: { share, path: path.map(({ time, left }) => ({ time, left })) } };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const viewer = await viewerOf(request);
  if (!viewer) return signInRequired(request);

  const form = await request.formData().catch(() => null);
  const video = form?.get('video');
  const overlay = form?.get('overlay');
  const options = readOptions(form?.get('options'));
  if (!(video instanceof Blob) || !(overlay instanceof Blob) || !options) return Response.json({ error: 'Bad request.' }, { status: 400 });
  if (video.size > LARGEST_FILE || overlay.size > LARGEST_FILE) {
    return Response.json({ error: 'This video is too large for server export. Use Chrome or Edge on a computer.' }, { status: 413 });
  }

  try {
    const result = await burnIn(await video.arrayBuffer(), await overlay.arrayBuffer(), options);
    return new Response(result, { headers: { 'Content-Type': 'video/mp4' } });
  } catch (e) {
    console.error('Server export failed:', e);
    return Response.json({ error: 'The server could not make this video.' }, { status: 502 });
  }
}
