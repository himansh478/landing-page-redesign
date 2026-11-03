import type { TextureSource } from 'canvaskit-wasm';
import { ALL_FORMATS, BlobSource, Conversion, Input, Mp4OutputFormat, Output, StreamTarget } from 'mediabunny';
import { drawCutout, type PersonMask } from './segment';
import type { Studio } from './studio';
import type { Caption, Style } from './types';

const BITRATE_1080 = 12_000_000;
const HIGHEST_BITRATE = 60_000_000;
const SHORT_SIDE = 1080;
const SHORT_SIDE_4K = 2160;

export type ExportSettings = { quality: '1080' | '4k'; fps: 'source' | 60 };

/** A moving 9:16 window over a wide video. */
export type Crop = { share: number; leftAt: (time: number) => number };

type Media = { width: number; height: number };

/** Export size, kept even for the encoder. 1080p never upscales; 4K re-renders the text sharp. */
export function outputSize({ width, height }: Media, reframe: boolean, quality: ExportSettings['quality'] = '1080') {
  const shortSide = quality === '4k' ? SHORT_SIDE_4K : SHORT_SIDE;
  if (reframe) return { width: shortSide, height: Math.round((shortSide * 16) / 9) };

  const short = Math.min(width, height);
  const scale = quality === '4k' ? shortSide / short : Math.min(1, shortSide / short);
  const even = (n: number) => Math.round((n * scale) / 2) * 2;
  return { width: even(width), height: even(height) };
}

const bitrateFor = (width: number, height: number, fps: ExportSettings['fps']) =>
  Math.min(HIGHEST_BITRATE, Math.round(((BITRATE_1080 * width * height) / (1920 * 1080)) * (fps === 60 ? 1.4 : 1)));

type ExportJob = {
  video: Blob;
  captions: Caption[];
  styleAt: (caption: Caption, time: number) => Style;
  writable: FileSystemWritableFileStream;
  settings: ExportSettings;
  person: PersonMask | null;
  watermark: boolean;
  crop: Crop | null;
  onProgress: (fraction: number) => void;
};

/** Burns captions into the video. The audio track is copied through untouched. */
export async function exportVideo({ ck, surface, renderer }: Studio, canvasEl: HTMLCanvasElement, job: ExportJob) {
  const { video, captions, styleAt, writable, settings, person, watermark, crop, onProgress } = job;
  const { width, height } = canvasEl;
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(video) });
  const stream = new StreamTarget(writable, { chunked: true });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: false }), target: stream });
  const target = ck.LTRBRect(0, 0, width, height);
  const share = crop?.share ?? 1;
  let frames = 0;

  const conversion = await Conversion.init({
    input,
    output,
    video: {
      codec: 'avc',
      bitrate: bitrateFor(width, height, settings.fps),
      ...(settings.fps === 60 ? { frameRate: 60 } : {}),
      forceTranscode: true,
      processedWidth: width,
      processedHeight: height,
      process: (sample) => {
        const frame = sample.toVideoFrame();
        const source = { width: frame.displayWidth, height: frame.displayHeight };
        const image = surface.makeImageFromTextureSource(frame as unknown as TextureSource, {
          ...source,
          alphaType: ck.AlphaType.Premul,
          colorType: ck.ColorType.RGBA_8888,
          colorSpace: ck.ColorSpace.SRGB,
        });
        if (!image) throw new Error('Could not read a video frame');

        const time = sample.timestamp;
        const left = crop ? crop.leftAt(time) : 0;
        const canvas = surface.getCanvas();
        const from = ck.LTRBRect(left * source.width, 0, (left + share) * source.width, source.height);
        if (crop) canvas.drawImageRectCubic(image, from, target, 1 / 3, 1 / 3, null);
        else canvas.drawImageRectOptions(image, from, target, ck.FilterMode.Linear, ck.MipmapMode.None, null);

        renderer.draw(canvas, captions, time, (caption) => styleAt(caption, time));
        if (person) {
          const mask = person.read(ck, frame);
          if (mask) {
            drawCutout(ck, canvas, image, mask, { left, share }, target);
            mask.delete();
          }
        }
        if (watermark) renderer.drawWatermark(canvas);
        surface.flush();
        image.delete();
        frame.close();
        frames++;
        return canvasEl;
      },
    },
  });
  if (!conversion.isValid) throw new Error('This video cannot be converted: ' + JSON.stringify(conversion.discardedTracks));

  conversion.onProgress = onProgress;
  const started = performance.now();
  await conversion.execute();
  return { seconds: (performance.now() - started) / 1000, frames };
}
