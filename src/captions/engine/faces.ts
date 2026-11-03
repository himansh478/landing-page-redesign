import { ALL_FORMATS, BlobSource, CanvasSink, Input } from 'mediabunny';
import type { FaceSample } from '@/captions/lib/project';

// Runs in the browser, so the picture never leaves this device.
const SAMPLES_PER_SECOND = 5;
const SCAN_SIDE = 1280;
const TILE_PIXELS = 256;
/** Each tile covers this share of the frame's short side. */
const TILE_SHARE = 0.6;
const TILE_OVERLAP = 0.3;
const SAME_FACE = 0.3;
const CONFIDENCE = 0.75;
/** A track continues if the face reappears this soon, this close to where it was. */
const TRACK_GAP = 0.6;
const TRACK_REACH = 0.1;
/** Seen for less than this: a hand or a shadow, not a face. */
const SHORTEST_FACE = 1;
/** Moved less than this over the shortest still time: a picture on the wall. */
const STILL_SPREAD = 0.015;
const STILL_TIME = 2;
const WASM = '/mediapipe/wasm';
const MODEL = '/models/blaze_face_short_range.tflite';

type Box = { x: number; y: number; width: number; height: number; score: number };

// The detector shrinks its input to 128 pixels and expects a selfie-sized face, so
// in a wide shot it misses the person. Checking zoomed-in tiles as well as the
// whole frame finds faces at every size.
function tilesFor(width: number, height: number) {
  const side = Math.round(Math.min(width, height) * TILE_SHARE);
  const step = side * (1 - TILE_OVERLAP);
  const tiles = [];
  for (let y = 0; ; y += step) {
    const top = Math.min(y, height - side);
    for (let x = 0; ; x += step) {
      tiles.push({ x: Math.min(x, width - side), y: top, side });
      if (x + side >= width) break;
    }
    if (y + side >= height) break;
  }
  return tiles;
}

const overlap = (a: Box, b: Box) => {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (width <= 0 || height <= 0) return 0;
  const shared = width * height;
  return shared / Math.min(a.width * a.height, b.width * b.height);
};

/** A face seen in two tiles counts once: the most confident view wins. */
function distinct(boxes: Box[]) {
  const kept: Box[] = [];
  for (const box of [...boxes].sort((a, b) => b.score - a.score)) {
    if (kept.every((other) => overlap(box, other) < SAME_FACE)) kept.push(box);
  }
  return kept;
}

/**
 * The detector also fires on drawings, posters and hands. Following each box through
 * time separates them from people: drawings never move, and hands come and go.
 */
function keepPeople(samples: FaceSample[]): FaceSample[] {
  type Seen = { sample: number; box: FaceSample['boxes'][number]; cx: number; cy: number; time: number };
  const tracks: Seen[][] = [];

  samples.forEach((sample, index) => {
    for (const box of sample.boxes) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      let best: Seen[] | null = null;
      let bestDistance = TRACK_REACH;
      for (const track of tracks) {
        const last = track[track.length - 1];
        const distance = Math.hypot(last.cx - cx, last.cy - cy);
        if (last.sample !== index && sample.time - last.time <= TRACK_GAP && distance < bestDistance) {
          best = track;
          bestDistance = distance;
        }
      }
      const seen = { sample: index, box, cx, cy, time: sample.time };
      if (best) best.push(seen);
      else tracks.push([seen]);
    }
  });

  const people = tracks.filter((track) => {
    const lasted = track[track.length - 1].time - track[0].time;
    const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
    const moved = Math.max(spread(track.map((s) => s.cx)), spread(track.map((s) => s.cy)));
    return lasted >= SHORTEST_FACE && !(lasted >= STILL_TIME && moved < STILL_SPREAD);
  });

  const kept: FaceSample[] = samples.map(({ time }) => ({ time, boxes: [] }));
  for (const track of people) for (const seen of track) kept[seen.sample].boxes.push(seen.box);
  return kept;
}

export async function scanFaces(video: Blob, onProgress: (fraction: number) => void) {
  const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
  const vision = await FilesetResolver.forVisionTasks(WASM);
  const detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
    runningMode: 'IMAGE',
    minDetectionConfidence: CONFIDENCE,
  });

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(video) });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error('No video track found.');

  const duration = await input.computeDuration();
  const scale = Math.min(1, SCAN_SIDE / Math.max(track.displayWidth, track.displayHeight));
  const width = Math.round(track.displayWidth * scale);
  const height = Math.round(track.displayHeight * scale);
  const sink = new CanvasSink(track, { width, height, fit: 'fill', poolSize: 1 });

  const tiles = tilesFor(width, height);
  const tile = document.createElement('canvas');
  tile.width = TILE_PIXELS;
  tile.height = TILE_PIXELS;
  const ctx = tile.getContext('2d');
  if (!ctx) throw new Error('Could not prepare the face scan.');

  const times: number[] = [];
  for (let t = 0; t < duration; t += 1 / SAMPLES_PER_SECOND) times.push(t);

  const samples: FaceSample[] = [];
  let index = 0;
  for await (const frame of sink.canvasesAtTimestamps(times)) {
    const time = times[index];
    index++;
    if (!frame) continue;
    const picture = frame.canvas as HTMLCanvasElement;

    const boxes: Box[] = [];
    for (const { boundingBox: b, categories } of detector.detect(picture).detections) {
      if (b) boxes.push({ x: b.originX, y: b.originY, width: b.width, height: b.height, score: categories[0]?.score ?? 0 });
    }
    for (const { x, y, side } of tiles) {
      ctx.drawImage(picture, x, y, side, side, 0, 0, TILE_PIXELS, TILE_PIXELS);
      const zoom = side / TILE_PIXELS;
      for (const { boundingBox: b, categories } of detector.detect(tile).detections) {
        if (b) boxes.push({ x: x + b.originX * zoom, y: y + b.originY * zoom, width: b.width * zoom, height: b.height * zoom, score: categories[0]?.score ?? 0 });
      }
    }

    samples.push({
      time,
      boxes: distinct(boxes).map((b) => ({ x: b.x / width, y: b.y / height, width: b.width / width, height: b.height / height })),
    });
    onProgress(index / times.length);
    await new Promise((resolve) => setTimeout(resolve));
  }

  detector.close();
  return keepPeople(samples);
}
