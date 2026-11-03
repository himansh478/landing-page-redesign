import { tokenText, type Doc, type Token } from '@/captions/lib/project';
import type { Caption, Word } from './types';

const PAUSE = 0.35;
const LINGER = 0.2;
const SENTENCE_GAP = 0.7;
const SHORTEST_SENTENCE = 5;
const LONGEST_SENTENCE = 24;

/** Sets where captions start: at pauses, at phrase ends, and every `maxWords` words. */
export function autoBreak(tokens: Token[], maxWords: number): Token[] {
  let count = 0;
  return tokens.map((token, i) => {
    const prev = tokens[i - 1];
    const fresh = !prev || count >= maxWords || token.start - prev.end > PAUSE || !!prev.endsPhrase;
    count = fresh ? 1 : count + 1;
    return { ...token, breakBefore: fresh };
  });
}

/** Token runs that form each caption, as index ranges. */
export function captionRanges(tokens: Token[]) {
  const ranges: { first: number; last: number }[] = [];
  tokens.forEach((token, i) => {
    if (token.breakBefore || i === 0) ranges.push({ first: i, last: i });
    else ranges[ranges.length - 1].last = i;
  });
  return ranges;
}

/**
 * Spoken runs to translate as one piece. Hindi and English order words differently,
 * so a three-word caption translated alone reads as broken English.
 */
export function sentenceRanges(tokens: Token[]) {
  const ranges: { first: number; last: number }[] = [];
  tokens.forEach((token, i) => {
    const prev = tokens[i - 1];
    const open = ranges[ranges.length - 1];
    const length = open ? i - open.first : 0;
    const fresh = !prev || token.start - prev.end > SENTENCE_GAP || length >= LONGEST_SENTENCE || (!!prev.endsPhrase && length >= SHORTEST_SENTENCE);
    if (fresh) ranges.push({ first: i, last: i });
    else open.last = i;
  });
  return ranges;
}

/** English needs a word more than Hindi to say the same thing in a caption. */
const englishChunks = (text: string, maxWords: number) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[][] = [[]];
  for (const word of words) {
    const open = chunks[chunks.length - 1];
    open.push(word);
    // A caption ends with its clause when it can, so lines read as phrases.
    if (open.length > maxWords || (/[,.?!]$/.test(word) && open.length > 1)) chunks.push([]);
  }
  return chunks.filter((chunk) => chunk.length);
};

/** Replaces one on-screen part of a translated sentence. */
export function editEnglish(english: string, part: number, text: string, maxWords: number) {
  const chunks = englishChunks(english, maxWords).map((chunk) => chunk.join(' '));
  chunks[part] = text.trim();
  return chunks.filter(Boolean).join(' ');
}

/** A translation has no word timing of its own, so its words share the caption's time by length. */
function spreadWords(text: string, start: number, end: number): Word[] {
  const parts = text.trim().split(/\s+/);
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  let cursor = start;
  return parts.map((part) => {
    const from = cursor;
    cursor += ((end - start) * part.length) / total;
    return { text: part, start: from, end: cursor };
  });
}

/** Turns tokens into the captions the renderer draws. */
function translatedCaptions({ tokens, offset, maxWords }: Pick<Doc, 'tokens' | 'offset' | 'maxWords'>): Caption[] {
  const ranges = sentenceRanges(tokens);

  return ranges.flatMap(({ first, last }, r) => {
    const nextStart = ranges[r + 1] ? tokens[ranges[r + 1].first].start : Infinity;
    const final = tokens[last];
    const start = tokens[first].start;
    const end = Math.min(final.hold ?? final.end + LINGER, Math.max(nextStart, final.end));

    // Until the translation arrives, the sentence shows in Hinglish.
    const text = tokens[first].english ?? tokens.slice(first, last + 1).map((t) => t.hinglish).join(' ');
    const chunks = englishChunks(text, maxWords);
    const total = chunks.reduce((sum, chunk) => sum + chunk.join(' ').length, 0);

    let cursor = start;
    return chunks.map((chunk, part) => {
      const line = chunk.join(' ');
      const from = cursor;
      cursor += ((end - start) * line.length) / total;
      return { id: `${tokens[first].id}#${part}`, words: spreadWords(line, from + offset, cursor + offset) };
    });
  });
}

export function buildCaptions(doc: Pick<Doc, 'tokens' | 'script' | 'offset' | 'maxWords'>): Caption[] {
  if (doc.script === 'translated') return translatedCaptions(doc);

  const { tokens, script, offset } = doc;
  const ranges = captionRanges(tokens);

  return ranges.map(({ first, last }, r) => {
    const nextStart = ranges[r + 1] ? tokens[ranges[r + 1].first].start : Infinity;
    const words: Word[] = [];
    for (let i = first; i <= last; i++) {
      const token = tokens[i];
      const latest = Math.max(nextStart, token.end);
      words.push({
        text: tokenText(token, script),
        tokenId: token.id,
        style: token.style,
        start: token.start + offset,
        // The highlight runs up to the next word, so it never blinks off mid-caption.
        end: (i < last ? tokens[i + 1].start : Math.min(token.hold ?? token.end + LINGER, latest)) + offset,
      });
    }
    return { id: tokens[first].id, words };
  });
}
