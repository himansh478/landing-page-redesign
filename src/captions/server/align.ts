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

async function worker(method = 'align') {
  const modal = new ModalClient({ tokenId: process.env.MODAL_TOKEN_ID, tokenSecret: process.env.MODAL_TOKEN_SECRET });
  const cls = await modal.cls.fromName('cwaya-align', 'Aligner');
  return (await cls.instance()).method(method);
}

/** A worker can fail as it starts or stops, and that mustn't end a job at its last step. */
const twice = <T,>(call: () => Promise<T>) => call().catch(() => call());

/** Loudness in dB every 10 ms. */
export async function loudness(audio: ArrayBuffer): Promise<number[]> {
  const read = await worker('loudness');
  return twice(() => read.remote([new Uint8Array(audio)]));
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

  const align = await worker();
  const result: AlignResult = await twice(() => align.remote([new Uint8Array(audio), segments, language]));

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
  const burn = await worker('burn');
  return burn.remote([new Uint8Array(video), new Uint8Array(overlay), options]);
}

/** Aligns one short phrase, for word fixes. `audio` holds only that phrase. */
export async function realign(audio: ArrayBuffer, spoken: string[], language: Language) {
  const align = await worker();
  const result: AlignResult = await align.remote([new Uint8Array(audio), [{ start: 0, end: 1e9, words: spoken }], language]);
  return result.segments[0].map((timing) => corrected(timing, language));
}
