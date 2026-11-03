import type { Canvas, CanvasKit } from 'canvaskit-wasm';
import {
  ALL_FORMATS,
  BufferSource,
  BufferTarget,
  CanvasSink,
  CanvasSource,
  Input,
  Mp4OutputFormat,
  Output,
  getFirstEncodableVideoCodec,
} from 'mediabunny';
import { type Studio } from './studio';
import { templates } from './templates';
import { captionEnd, captionStart, type Caption } from './types';

// Rendering regression test, served at /dev/render-test: animated Hinglish + Hindi captions exported at
// 1080p60, then decoded back to prove every caption lands on the exact frame.

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 60;
export const DURATION = 6;

// Times deliberately don't sit on frame boundaries; the Hindi words are the
// hard shaping cases (conjuncts, reph, matras). Gaps between captions let the
// verifier see the exact first and last frame of each one.
export const sampleCaptions: Caption[] = [
  {
    id: 'hinglish-0',
    words: [
      { text: 'Kam', start: 0.31, end: 0.58 },
      { text: 'umr', start: 0.58, end: 0.83 },
      { text: 'mein', start: 0.83, end: 1.12 },
    ],
  },
  {
    id: 'hinglish-1',
    words: [
      { text: 'safed', start: 1.407, end: 1.74 },
      { text: 'baal', start: 1.74, end: 2.05 },
      { text: 'video', start: 2.05, end: 2.46 },
    ],
  },
  {
    id: 'hindi-0',
    words: [
      { text: 'क्षमता', start: 2.783, end: 3.12 },
      { text: 'और', start: 3.12, end: 3.34 },
      { text: 'ज्ञान', start: 3.34, end: 3.71 },
    ],
  },
  {
    id: 'hindi-1',
    words: [
      { text: 'प्रतिक्रिया', start: 4.016, end: 4.52 },
      { text: 'कृष्ण', start: 4.52, end: 4.88 },
      { text: 'हिंदी', start: 4.88, end: 5.33 },
    ],
  },
];

// Stand-in for video: a slow gradient, plus 16 blocks that encode the frame
// number so the verifier can spot dropped or repeated frames.
const BLOCKS = 16;
const BLOCK = 40;

function drawBackground(ck: CanvasKit, canvas: Canvas, frame: number) {
  const shift = (frame % 240) / 240;
  const shader = ck.Shader.MakeLinearGradient(
    [0, 0],
    [WIDTH, HEIGHT],
    [ck.Color(16, 44 + 30 * shift, 78, 1), ck.Color(10, 18, 34 + 30 * shift, 1)],
    null,
    ck.TileMode.Clamp
  );
  const paint = new ck.Paint();
  paint.setShader(shader);
  canvas.drawRect(ck.LTRBRect(0, 0, WIDTH, HEIGHT), paint);
  paint.setShader(null);
  shader.delete();

  for (let i = 0; i < BLOCKS; i++) {
    paint.setColor((frame >> i) & 1 ? ck.WHITE : ck.BLACK);
    canvas.drawRect(ck.LTRBRect(i * BLOCK, 0, (i + 1) * BLOCK, BLOCK), paint);
  }
  paint.delete();
}

export function renderFrame({ ck, surface, renderer }: Studio, frame: number) {
  const canvas = surface.getCanvas();
  drawBackground(ck, canvas, frame);
  renderer.draw(canvas, sampleCaptions, frame / FPS, (c) => templates[c.id.startsWith('hindi') ? 'hindi-bold' : 'pop-viral']);
  surface.flush();
}

export async function exportMp4(studio: Studio, canvasEl: HTMLCanvasElement, onProgress: (done: number, total: number) => void) {
  const codec = await getFirstEncodableVideoCodec(['avc', 'vp9', 'av1'], { width: WIDTH, height: HEIGHT, bitrate: 12_000_000 });
  if (!codec) throw new Error('This browser cannot encode video');

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const source = new CanvasSource(canvasEl, { codec, bitrate: 12_000_000, keyFrameInterval: 1 });
  output.addVideoTrack(source, { frameRate: FPS });
  await output.start();

  const total = Math.round(DURATION * FPS);
  const started = performance.now();
  for (let n = 0; n < total; n++) {
    renderFrame(studio, n);
    await source.add(n / FPS, 1 / FPS);
    if (n % 30 === 0) {
      onProgress(n, total);
      await new Promise((r) => setTimeout(r));
    }
  }
  source.close();
  await output.finalize();
  onProgress(total, total);

  const seconds = (performance.now() - started) / 1000;
  return { codec, buffer: output.target.buffer as ArrayBuffer, seconds, speed: DURATION / seconds, totalFrames: total };
}

// First and last frame each caption must be visible on.
export function expectedFrames() {
  return sampleCaptions.map((c) => ({
    first: Math.ceil(captionStart(c) * FPS - 1e-9),
    last: Math.ceil(captionEnd(c) * FPS - 1e-9) - 1,
  }));
}

type Verdict = {
  decodedFrames: number;
  frameNumbersOk: boolean;
  badFrameNumbers: number[];
  captions: { expected: { first: number; last: number }; found: { first: number; last: number } | null; ok: boolean }[];
  allOk: boolean;
};

/** Decodes the exported file and checks each frame against what must be on it. */
export async function verifyExport(buffer: ArrayBuffer): Promise<Verdict> {
  const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(buffer) });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error('No video track in the export');
  const sink = new CanvasSink(track, { poolSize: 2 });

  const expected = expectedFrames();
  const seen: number[][] = expected.map(() => []);
  const badFrameNumbers: number[] = [];
  let index = 0;

  for await (const { canvas } of sink.canvases()) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

    let encoded = 0;
    const blocks = ctx.getImageData(0, BLOCK / 2, BLOCKS * BLOCK, 1).data;
    for (let i = 0; i < BLOCKS; i++) {
      if (blocks[(i * BLOCK + BLOCK / 2) * 4] > 127) encoded |= 1 << i;
    }
    if (encoded !== index) badFrameNumbers.push(index);

    // Bright yellow only exists in the spoken word.
    const band = ctx.getImageData(0, Math.round(HEIGHT * 0.5), WIDTH, Math.round(HEIGHT * 0.24)).data;
    let yellow = 0;
    for (let i = 0; i < band.length; i += 16) {
      if (band[i] > 215 && band[i + 1] > 195 && band[i + 2] < 100) yellow++;
    }
    if (yellow > 40) {
      const which = expected.findIndex((e) => index >= e.first - 3 && index <= e.last + 3);
      if (which >= 0) seen[which].push(index);
    }
    index++;
  }

  const captions = expected.map((e, i) => {
    const found = seen[i].length ? { first: seen[i][0], last: seen[i][seen[i].length - 1] } : null;
    return { expected: e, found, ok: !!found && found.first === e.first && found.last === e.last };
  });
  return {
    decodedFrames: index,
    frameNumbersOk: badFrameNumbers.length === 0,
    badFrameNumbers: badFrameNumbers.slice(0, 10),
    captions,
    allOk: badFrameNumbers.length === 0 && captions.every((c) => c.ok),
  };
}
