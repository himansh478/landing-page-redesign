import type { TextureSource } from 'canvaskit-wasm';
import { ALL_FORMATS, AudioSample, BlobSource, canEncodeVideo, Conversion, getFirstEncodableAudioCodec, Input, Mp4OutputFormat, Output, StreamTarget, type ConversionAudioOptions } from 'mediabunny';
import { drawCutout, type PersonMask } from './segment';
import { LONGEST_SOUND, mixInto, type SoundEvent } from './sounds';
import type { Studio } from './studio';
import type { Caption, Style } from './types';

const BITRATE_1080 = 12_000_000;
const AUDIO_BITRATE = 192_000;
const HIGHEST_BITRATE = 60_000_000;
const SHORT_SIDES = { '720': 720, '1080': 1080, '4k': 2160 } as const;

export type ExportSettings = { quality: keyof typeof SHORT_SIDES; fps: 'source' | 60 };

/** A moving 9:16 window over a wide video. */
export type Crop = { share: number; leftAt: (time: number) => number };

type Media = { width: number; height: number };

/** Export size, kept even for the encoder. 1080p never upscales; 4K re-renders the text sharp. */
export function outputSize({ width, height }: Media, reframe: boolean, quality: ExportSettings['quality'] = '1080') {
  const shortSide = SHORT_SIDES[quality];
  if (reframe) return { width: shortSide, height: Math.round((shortSide * 16) / 9) };

  const short = Math.min(width, height);
  const scale = quality === '4k' ? shortSide / short : Math.min(1, shortSide / short);
  const even = (n: number) => Math.round((n * scale) / 2) * 2;
  return { width: even(width), height: even(height) };
}

const bitrateFor = (width: number, height: number, fps: ExportSettings['fps']) =>
  Math.min(HIGHEST_BITRATE, Math.round(((BITRATE_1080 * width * height) / (1920 * 1080)) * (fps === 60 ? 1.4 : 1)));

/**
 * The sharpest size this browser can encode by itself: 1080p, or 720p on phones whose encoder
 * refuses 1080p. Null when it can encode neither. The check builds the same H.264 settings
 * the export will ask for, so a yes here means the export won't be refused.
 */
export async function encodableQuality(media: Media, reframe: boolean): Promise<ExportSettings['quality'] | null> {
  if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') return null;
  for (const quality of ['1080', '720'] as const) {
    const { width, height } = outputSize(media, reframe, quality);
    const able = await canEncodeVideo('avc', { width, height, bitrate: bitrateFor(width, height, 'source') }).catch(() => false);
    if (able) return quality;
  }
  return null;
}

type ExportJob = {
  video: Blob;
  captions: Caption[];
  styleAt: (caption: Caption, time: number) => Style;
  /** Whether the person is drawn over the caption showing at a time */
  behindAt: (time: number) => boolean;
  /** Caption sounds to mix into the audio, or null to copy the audio as it is */
  sounds: { events: SoundEvent[]; volume: number } | null;
  writable: FileSystemWritableFileStream;
  settings: ExportSettings;
  person: PersonMask | null;
  watermark: boolean;
  crop: Crop | null;
  onProgress: (fraction: number) => void;
};

/**
 * Re-encodes the audio with the caption sounds mixed in. Without sounds, or on a browser
 * that can't encode audio, the track is copied untouched instead.
 */
async function mixedAudio({ events, volume }: { events: SoundEvent[]; volume: number }): Promise<ConversionAudioOptions | null> {
  const codec = await getFirstEncodableAudioCodec(['aac', 'opus'], { numberOfChannels: 2, sampleRate: 48000, bitrate: AUDIO_BITRATE }).catch(() => null);
  if (!codec) return null;
  return {
    codec,
    bitrate: AUDIO_BITRATE,
    forceTranscode: true,
    process: (sample) => {
      const frames = sample.numberOfFrames;
      const end = sample.timestamp + frames / sample.sampleRate;
      if (!events.some((e) => e.time < end && e.time + LONGEST_SOUND > sample.timestamp)) return sample;
      const planes = Array.from({ length: sample.numberOfChannels }, (_, planeIndex) => {
        const plane = new Float32Array(frames);
        sample.copyTo(plane, { planeIndex, format: 'f32-planar' });
        return plane;
      });
      mixInto(planes, sample.timestamp, sample.sampleRate, events, volume);
      const data = new Float32Array(frames * planes.length);
      planes.forEach((plane, i) => data.set(plane, i * frames));
      const mixed = new AudioSample({ data, format: 'f32-planar', numberOfChannels: planes.length, sampleRate: sample.sampleRate, timestamp: sample.timestamp });
      sample.close();
      return mixed;
    },
  };
}

/** Burns captions into the video. The audio is copied untouched, unless caption sounds are mixed in. */
export async function exportVideo({ ck, surface, renderer }: Studio, canvasEl: HTMLCanvasElement, job: ExportJob) {
  const { video, captions, styleAt, behindAt, sounds, writable, settings, person, watermark, crop, onProgress } = job;
  const { width, height } = canvasEl;
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(video) });
  const stream = new StreamTarget(writable, { chunked: true });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: false }), target: stream });
  const target = ck.LTRBRect(0, 0, width, height);
  const share = crop?.share ?? 1;
  let frames = 0;
  const audio = sounds ? await mixedAudio(sounds) : null;

  const conversion = await Conversion.init({
    input,
    output,
    ...(audio ? { audio } : {}),
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
        if (person && behindAt(time)) {
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
