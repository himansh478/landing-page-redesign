import { ALL_FORMATS, BufferSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } from 'mediabunny';
import { fetchWithRetry, inOrder } from './limits';
import { coverage, findThinStretches } from './speech-gaps';

/** unsure: the other readings of this moment heard something else. */
export type RawWord = { word: string; start: number; end: number; unsure?: boolean };

// Whisper can silently drop speech: it lost 8 of 21 seconds on our first test clip
// and up to a third of the words on a looped one, with no error. So audio goes in
// short overlapping pieces, and each piece is checked against the audio itself. If
// its words miss too much of the loud audio, it is read again from a shifted start.
const WINDOW = 12;
const OVERLAP = 2;
const PARALLEL = 3;
const ENOUGH_COVERAGE = 0.85;
const RETRY_SHIFTS = [-3.5, 3.5];
const WORDS_TO_TRUST_LANGUAGE = 5;

// The same audio can read perfectly from one starting point and as nonsense from another,
// and Whisper knows when it happens: on the looped clip, misread passages scored about
// -0.7 and good ones -0.05 to -0.17, with nothing between. So a passage it doubted, or one
// with too few words for its sound, gets a second look from somewhere new.
const LEAST_SURE = -0.3;
const CLEARLY_SURER = 0.1;
const SECOND_LOOK_MARGIN = 2;
const STARTS_TO_TRY = 2;
const LONGEST_STRETCH = 8;
/** Second looks stay few even on a video that is mostly music. */
const SECONDS_PER_SECOND_LOOK = 20;
/** Two readings join at a word they share, this near the stretch and this close in time. */
const JOIN_SEARCH = 1.5;
const JOIN_REACH = 0.5;

type Piece = { start: number; end: number };
type Passage = Piece & { sure: number };

async function cut(audio: ArrayBuffer, start: number, end: number) {
  const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(audio) });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const conversion = await Conversion.init({ input, output, trim: { start, end } });
  await conversion.execute();
  return output.target.buffer as ArrayBuffer;
}

/** Whisper reads this as earlier text, which steers it towards these spellings. */
const LONGEST_PROMPT = 400;

type WhisperResult = { language?: string; words?: RawWord[]; segments?: (Piece & { avg_logprob: number })[] };

async function whisper(buffer: ArrayBuffer, language: string | undefined, vocabulary: string[]): Promise<WhisperResult> {
  const res = await fetchWithRetry('https://api.groq.com/openai/v1/audio/transcriptions', () => {
    const form = new FormData();
    form.set('file', new Blob([buffer], { type: 'audio/mp4' }), 'audio.m4a');
    form.set('model', 'whisper-large-v3');
    form.set('response_format', 'verbose_json');
    form.set('temperature', '0');
    form.append('timestamp_granularities[]', 'word');
    form.append('timestamp_granularities[]', 'segment');
    if (language) form.set('language', language);
    if (vocabulary.length) form.set('prompt', vocabulary.join(', ').slice(0, LONGEST_PROMPT));
    return { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form };
  });
  if (!res.ok) throw new Error(`Speech-to-text failed (${res.status})`);
  return res.json();
}

const middle = (w: RawWord) => (w.start + w.end) / 2;

const overlaps = (a: Piece, b: Piece) => a.start < b.end && a.end > b.start;

/** How sure Whisper was of a stretch: its least sure passage there. */
const sureness = (passages: Passage[], stretch: Piece) => Math.min(0, ...passages.filter((p) => overlaps(p, stretch)).map((p) => p.sure));

function doubtfulStretches(passages: Passage[]) {
  const stretches: Piece[] = [];
  for (const { start, end } of passages.filter((p) => p.sure < LEAST_SURE).sort((a, b) => a.start - b.start)) {
    const last = stretches.at(-1);
    if (last && start <= last.end) last.end = Math.max(last.end, end);
    else stretches.push({ start, end });
  }
  return stretches.flatMap(({ start, end }) => {
    const parts = Math.ceil((end - start) / LONGEST_STRETCH);
    const size = (end - start) / parts;
    return Array.from({ length: parts }, (_, i) => ({ start: start + i * size, end: start + (i + 1) * size }));
  });
}

/** Starts that keep a stretch well inside the reading, as far as possible from the pieces'. */
function startsFor({ start, end }: Piece) {
  const stride = WINDOW - OVERLAP;
  const distanceFromPieces = (time: number) => {
    const into = time % stride;
    return Math.min(into, stride - into);
  };
  const choices = [start - SECOND_LOOK_MARGIN, (start + end - WINDOW) / 2, end + SECOND_LOOK_MARGIN - WINDOW].map((time) => Math.max(0, time));
  return [...new Set(choices)].sort((a, b) => distanceFromPieces(b) - distanceFromPieces(a)).slice(0, STARTS_TO_TRY);
}

const bare = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, '');
const sameWord = (a: RawWord, b: RawWord) => bare(a.word) === bare(b.word) && Math.abs(a.start - b.start) <= JOIN_REACH;

/** Puts a new reading of a stretch in place, joining it at words both readings share. */
function splice(words: RawWord[], fresh: RawWord[], { start, end }: Piece) {
  const after = (time: number, list: RawWord[]) => {
    const index = list.findIndex((w) => middle(w) >= time);
    return index < 0 ? list.length : index;
  };
  let keepUntil = after(start, words);
  let keepFrom = after(end, words);
  let from = after(start, fresh);
  let to = after(end, fresh);

  for (let i = keepUntil - 1; i >= 0 && words[i].start > start - JOIN_SEARCH; i--) {
    const shared = fresh.findLastIndex((w) => sameWord(w, words[i]));
    if (shared >= 0) {
      keepUntil = i + 1;
      from = shared + 1;
      break;
    }
  }
  for (let i = keepFrom; i < words.length && words[i].start < end + JOIN_SEARCH; i++) {
    const shared = fresh.findIndex((w, index) => index >= from && sameWord(w, words[i]));
    if (shared >= 0) {
      keepFrom = i;
      to = shared;
      break;
    }
  }
  return [...words.slice(0, keepUntil), ...fresh.slice(from, to), ...words.slice(keepFrom)];
}

/** The loudness can still be arriving, so a slow start on it holds up no first reading. */
export async function transcribe(
  audio: ArrayBuffer,
  loudness: Promise<number[]>,
  vocabulary: string[],
  onProgress: (fraction: number) => void,
  onLanguage?: (language: 'hi' | 'en') => void
) {
  const duration = await new Input({ formats: ALL_FORMATS, source: new BufferSource(audio) }).computeDuration();

  const pieces: Piece[] = [];
  for (let start = 0; ; start += WINDOW - OVERLAP) {
    const end = Math.min(start + WINDOW, duration);
    pieces.push({ start, end });
    if (end >= duration) break;
  }

  const read = async ({ start, end }: Piece, language?: string) => {
    const result = await whisper(await cut(audio, start, end), language, vocabulary);
    const words = (result.words ?? []).map((w) => ({ word: w.word.trim(), start: w.start + start, end: Math.min(w.end + start, duration) }));
    const passages = (result.segments ?? []).map((s) => ({ start: s.start + start, end: Math.min(s.end + start, duration), sure: s.avg_logprob }));
    return { language: result.language, words, passages };
  };

  // The language is settled once, so every piece is written the same way.
  let detected = 'Hindi';
  for (const piece of pieces) {
    const result = await read(piece);
    if (result.words.length >= WORDS_TO_TRUST_LANGUAGE) {
      detected = result.language ?? detected;
      break;
    }
  }
  const language = /english/i.test(detected) ? ('en' as const) : ('hi' as const);
  onLanguage?.(language);

  let done = 0;
  let reread = 0;
  const results = await inOrder(pieces, PARALLEL, async (piece) => {
    let best = await read(piece, language);
    const envelope = await loudness;
    let score = coverage(envelope, best.words, piece.start, piece.end);

    for (const shift of RETRY_SHIFTS) {
      if (score >= ENOUGH_COVERAGE) break;
      reread++;
      const start = Math.max(0, piece.start + shift);
      const again = await read({ start, end: Math.min(duration, start + WINDOW) }, language);
      const againScore = coverage(envelope, again.words, piece.start, piece.end);
      if (againScore > score) {
        best = again;
        score = againScore;
      }
    }

    onProgress(++done / pieces.length);
    return best;
  });

  let words: RawWord[] = [];
  const passages: Passage[] = [];
  results.forEach((result, i) => {
    const { start, end } = pieces[i];
    const kept = { start: i === 0 ? 0 : start + OVERLAP / 2, end: i === pieces.length - 1 ? Infinity : end - OVERLAP / 2 };
    words.push(...result.words.filter((w) => middle(w) >= kept.start && middle(w) < kept.end));
    passages.push(...result.passages.filter((p) => overlaps(p, kept)));
  });

  const doubtful = doubtfulStretches(passages);
  const thin = findThinStretches(await loudness, words).filter((stretch) => !doubtful.some((other) => overlaps(other, stretch)));
  const stretches = [...doubtful, ...thin].slice(0, Math.ceil(duration / SECONDS_PER_SECOND_LOOK));

  const readings = await inOrder(stretches, PARALLEL, async (stretch) => {
    const inside = (w: RawWord) => middle(w) >= stretch.start && middle(w) < stretch.end;
    const first = sureness(passages, stretch);
    const heard = words.filter(inside).length;

    for (const start of startsFor(stretch)) {
      // A failed second look costs nothing: the first reading stands.
      const again = await read({ start, end: Math.min(duration, start + WINDOW) }, language).catch(() => null);
      if (!again) continue;
      const now = sureness(again.passages, stretch);
      const found = again.words.filter(inside).length;
      const better = first < LEAST_SURE ? now > first + CLEARLY_SURER && found > 0 : now >= LEAST_SURE && found > heard;
      if (better) return again.words;
    }
    return null;
  });

  let improved = 0;
  stretches.forEach((stretch, i) => {
    const fresh = readings[i];
    if (!fresh) return;
    words = splice(words, fresh, stretch);
    improved++;
  });

  return { language, duration, words, reread, secondLooks: stretches.length, improved };
}
