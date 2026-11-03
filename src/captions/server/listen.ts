import { askGemini } from './gemini';
import type { Language } from './align';
import type { RawWord } from './transcribe';

// Gemini hears the words better than Whisper: 1 to 3% errors on most 40 to 60 second
// runs against 8 to 17%. Whisper still gives the times, which alignment then makes exact.
// Gemini can lose its place, so it listens twice and Whisper's reading picks the better
// one. If it fails or disagrees too much, Whisper's words simply stand. A word neither of
// the other two readings shares is marked for a person to check.
const LISTENS = 2;
/** Whisper's words can stand in, so a hung listen is dropped rather than waited for. */
const LONGEST_LISTEN = 60000;
const LEAST_AGREEMENT = 0.5;
/** Past this share the other readings are off, not the word. */
const MOST_DOUBTS = 0.15;

const prompt = (language: Language, vocabulary: string[]) => `You are a professional transcriber of ${language === 'hi' ? 'Hindi and Hinglish' : 'English'} speech. Listen to this audio and write exactly the words that are spoken, word for word, in spoken order, from the first word to the last.
Rules:
${language === 'hi' ? '- Write every word in Devanagari letters. English words are written as they sound (CapCut as कैपकट, timeline as टाइमलाइन).\n' : ''}- Do not translate, summarise, fix grammar or add anything that is not said. Keep colloquial forms exactly as said.
- Never skip small words.
- Write years and numbers as digits.
- If a sentence is repeated, write it every time it is said.
- Use normal punctuation at the end of phrases and sentences.
- Return only the transcript, with no notes.
${vocabulary.length ? `These names must be spelt exactly like this: ${vocabulary.join(', ')}.\n` : ''}`;

async function listen(audio: ArrayBuffer, language: Language, vocabulary: string[]) {
  const data = Buffer.from(audio).toString('base64');
  const res = await askGemini([{ text: prompt(language, vocabulary) }, { inline_data: { mime_type: 'audio/mp4', data } }], { temperature: 0 });
  if (!res.ok) throw new Error(`Listening failed (${res.status})`);
  const json = await res.json();
  const text: string = json.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join('') ?? '';
  return text.trim().split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
}

const bare = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, '');

/** The words two readings share, in order: pairs of positions in each. */
function sharedWords(text: string[], other: string[]) {
  const a = text.map(bare);
  const b = other.map(bare);
  const best = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      best[i][j] = a[i] === b[j] ? best[i + 1][j + 1] + 1 : Math.max(best[i + 1][j], best[i][j + 1]);
    }
  }

  const pairs: [number, number][] = [];
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) pairs.push([i++, j++]);
    else if (best[i + 1][j] >= best[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/** Each word takes Whisper's time where they share it, and a fair share of the gap otherwise. */
function placeWords(text: string[], heard: RawWord[], pairs: [number, number][]) {
  const words: RawWord[] = text.map((word) => ({ word, start: 0, end: 0 }));
  for (const [i, j] of pairs) Object.assign(words[i], { start: heard[j].start, end: heard[j].end });

  const fill = (from: number, to: number, start: number, end: number) => {
    const share = Math.max(0, end - start) / (to - from);
    for (let i = from; i < to; i++) Object.assign(words[i], { start: start + (i - from) * share, end: start + (i - from + 1) * share });
  };

  const edges = [[-1, 0], ...pairs, [text.length, 0]];
  edges.slice(1).forEach(([next], k) => {
    const [last] = edges[k];
    if (next === last + 1) return;
    const start = last < 0 ? heard[0].start : words[last].end;
    const end = next === text.length ? heard[heard.length - 1].end : words[next].start;
    fill(last + 1, next, start, end);
  });
  return words;
}

/** Gemini's readings, started as soon as the language is known. */
export function listenTwice(audio: ArrayBuffer, language: Language, vocabulary: string[]) {
  const tooLong = new Promise<string[]>((resolve) => setTimeout(resolve, LONGEST_LISTEN, []));
  return Promise.all(Array.from({ length: LISTENS }, () => Promise.race([listen(audio, language, vocabulary).catch((): string[] => []), tooLong])));
}

/** Whisper's times with the words Gemini heard, or Whisper's own words if that isn't safe. */
export function chooseWords(listens: string[][], heard: RawWord[]) {
  if (heard.length === 0 || listens.length === 0) return heard;

  const whisper = heard.map((w) => w.word);
  const readings = listens.map((text) => ({ text, pairs: sharedWords(text, whisper) }));
  const best = readings.reduce((a, b) => (b.pairs.length > a.pairs.length ? b : a));
  if (best.pairs.length < heard.length * LEAST_AGREEMENT) return heard;

  const words = placeWords(best.text, heard, best.pairs);
  const other = readings.find((reading) => reading !== best)?.text ?? [];
  if (other.length === 0) return words;

  const backed = new Set([...best.pairs, ...sharedWords(best.text, other)].map(([i]) => i));
  const doubts = words.length - backed.size;
  return words.map((word, i) => ({ ...word, unsure: doubts <= words.length * MOST_DOUBTS && !backed.has(i) }));
}
