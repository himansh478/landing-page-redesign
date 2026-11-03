import { ALL_FORMATS, BlobSource, Input } from 'mediabunny';
import { AnimationWriter } from './mov';
import { CaptionRenderer } from './renderer';
import { loadCanvasKit, loadFonts } from './studio';
import { captionEnd, captionStart, type Caption, type Style } from './types';

const PROGRESS_EVERY = 12;
const SAMPLED_PACKETS = 120;

export async function sourceFrameRate(video: Blob) {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(video) });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error('No video track found.');
  return (await track.computePacketStats(SAMPLED_PACKETS)).averagePacketRate;
}

type OverlayJob = {
  width: number;
  height: number;
  fps: number;
  duration: number;
  captions: Caption[];
  styleAt: (caption: Caption, time: number) => Style;
  watermark: boolean;
  writable: FileSystemWritableFileStream;
  onProgress: (fraction: number) => void;
};

/** The captions alone on transparency, from the same renderer as every other export. */
export async function exportOverlay({ width, height, fps, duration, captions, styleAt, watermark, writable, onProgress }: OverlayJob) {
  const ck = await loadCanvasKit();
  const { provider } = await loadFonts();
  const surface = ck.MakeSurface(width, height);
  if (!surface) throw new Error('Could not create a drawing surface');

  const renderer = new CaptionRenderer(ck, provider, width, height);
  const canvas = surface.getCanvas();
  const info = { width, height, alphaType: ck.AlphaType.Unpremul, colorType: ck.ColorType.RGBA_8888, colorSpace: ck.ColorSpace.SRGB };

  const writer = new AnimationWriter(writable, width, height, fps);
  await writer.start();

  const started = performance.now();
  const frames = Math.ceil(duration / writer.frameSeconds);
  let wasEmpty = false;

  for (let n = 0; n < frames; n++) {
    const time = n * writer.frameSeconds;
    const empty = !captions.some((c) => time >= captionStart(c) && time < captionEnd(c));

    if (empty && wasEmpty) {
      await writer.add(null);
    } else {
      canvas.clear(ck.TRANSPARENT);
      renderer.draw(canvas, captions, time, (caption) => styleAt(caption, time));
      if (watermark) renderer.drawWatermark(canvas);
      surface.flush();
      const pixels = canvas.readPixels(0, 0, info);
      if (!pixels) throw new Error('Could not read a frame');
      await writer.add(pixels as Uint8Array);
    }
    wasEmpty = empty;

    if (n % PROGRESS_EVERY === 0) {
      onProgress(n / frames);
      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  await writer.finish();
  renderer.dispose();
  surface.delete();
  onProgress(1);
  return { seconds: (performance.now() - started) / 1000, frames };
}
