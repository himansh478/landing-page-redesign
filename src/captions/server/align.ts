import { ModalClient } from 'modal';

export type Language = 'hi' | 'en';
export type WordTiming = { start: number; end: number; score: number };
type Segment = { start: number; end: number; words: string[] };
type AlignResult = { duration: number; segments: (WordTiming | null)[][]; envelope: number[] };

// Aligned in overlapping blocks. Words at the edge of a block get forced into
// the wrong place, so each word is taken from the block where it sits inside.
const BLOCK = 30;
const OVERLAP = 6;
const PAD = 0.25;
// The English model marks each word about 38 ms after it starts, measured against
// known word times on passages 0-1 of scripts/benchmark.mjs and confirmed on 2-3.
// The Hindi model showed no such delay on real speech.
const LEAD: Record<Language, number> = { en: 0.038, hi: 0 };

const corrected = (timing: WordTiming | null, language: Language): WordTiming | null =>
  timing && { ...timing, start: Math.max(0, timing.start - LEAD[language]), end: Math.max(0, timing.end - LEAD[language]) };

// The worker runs on a Hugging Face Space (hf-worker/) when its address is set, and on Modal
// (captions-worker/) otherwise. Both do the same work with the same models.
const SPACE = process.env.CAPTIONS_WORKER_URL?.replace(/\/$/, '');
const SPACE_TOKEN = process.env.CAPTIONS_WORKER_TOKEN;
/** A minute of audio aligns in well under this on the Space's free CPU. */
const SPACE_TIMEOUT = 150000;

async function worker(method = 'align') {
  const modal = new ModalClient({ tokenId: process.env.MODAL_TOKEN_ID, tokenSecret: process.env.MODAL_TOKEN_SECRET });
  const cls = await modal.cls.fromName('cwaya-align', 'Aligner');
  return (await cls.instance()).method(method);
}

async function onSpace<T>(path: string, body: BodyInit, json = true): Promise<T> {
  const res = await fetch(`${SPACE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SPACE_TOKEN}`, ...(json ? { 'Content-Type': 'application/json' } : {}) },
    body,
    signal: AbortSignal.timeout(SPACE_TIMEOUT),
  });
  if (!res.ok) throw new Error(`Timing worker said ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (json ? res.json() : res.arrayBuffer()) as Promise<T>;
}

const encoded = (audio: ArrayBuffer) => Buffer.from(audio).toString('base64');

/** A worker can fail as it starts or stops, and that mustn't end a job at its last step. */
const twice = <T,>(call: () => Promise<T>) => call().catch(() => call());

/** Loudness in dB every 10 ms. */
export async function loudness(audio: ArrayBuffer): Promise<number[]> {
  if (SPACE) return twice(() => onSpace<number[]>('/loudness', JSON.stringify({ audio: encoded(audio) })));
  const read = await worker('loudness');
  return twice(() => read.remote([new Uint8Array(audio)]));
}

/** Runs segments through the aligner, wherever it lives. */
async function alignSegments(audio: ArrayBuffer, segments: Segment[], language: Language): Promise<AlignResult> {
  if (SPACE) return twice(() => onSpace<AlignResult>('/align', JSON.stringify({ audio: encoded(audio), segments, language })));
  const align = await worker();
  return twice(() => align.remote([new Uint8Array(audio), segments, language]));
}

/** Wakes the Space, or says it is awake. A sleeping Space starts on its first request. */
export async function wakeWorker() {
  if (!SPACE) return { worker: 'modal' };
  const res = await fetch(`${SPACE}/health`, { signal: AbortSignal.timeout(SPACE_TIMEOUT) });
  return { worker: 'space', status: res.status, ...(res.ok ? await res.json() : {}) };
}

export async function align(audio: ArrayBuffer, spoken: string[], rough: { start: number; end: number }[], language: Language) {
  const blocks: { first: number; last: number }[] = [];
  for (let first = 0; ; first += BLOCK - OVERLAP) {
    const last = Math.min(first + BLOCK, spoken.length);
    blocks.push({ first, last });
    if (last >= spoken.length) break;
  }

  const segments: Segment[] = blocks.map(({ first, last }) => ({
    start: rough[first].start - PAD,
    end: rough[last - 1].end + PAD,
    words: spoken.slice(first, last),
  }));

  const result = await alignSegments(audio, segments, language);

  const timed = new Array<WordTiming | null>(spoken.length).fill(null);
  blocks.forEach(({ first, last }, b) => {
    const from = b === 0 ? first : first + OVERLAP / 2;
    const to = b === blocks.length - 1 ? last : last - OVERLAP / 2;
    for (let i = from; i < to; i++) timed[i] = corrected(result.segments[b][i - first], language);
  });

  return { timed, envelope: result.envelope };
}

export type BurnOptions = {
  width: number;
  height: number;
  /** For a vertical crop: its share of the source width, and where its left edge goes. */
  crop?: { share: number; path: { time: number; left: number }[] };
};

/** Lays a transparent caption layer over the video on the server. */
export async function burnIn(video: ArrayBuffer, overlay: ArrayBuffer, options: BurnOptions): Promise<Uint8Array<ArrayBuffer>> {
  if (SPACE) {
    const form = new FormData();
    form.set('video', new Blob([video]), 'source');
    form.set('overlay', new Blob([overlay]), 'captions.mov');
    form.set('width', String(options.width));
    form.set('height', String(options.height));
    if (options.crop) form.set('crop', JSON.stringify(options.crop));
    return new Uint8Array(await onSpace<ArrayBuffer>('/burn', form, false));
  }
  const burn = await worker('burn');
  return burn.remote([new Uint8Array(video), new Uint8Array(overlay), options]);
}

/** Aligns one short phrase, for word fixes. `audio` holds only that phrase. */
export async function realign(audio: ArrayBuffer, spoken: string[], language: Language) {
  const result = await alignSegments(audio, [{ start: 0, end: 1e9, words: spoken }], language);
  return result.segments[0].map((timing) => corrected(timing, language));
}
