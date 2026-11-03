import type { Caption } from '@/captions/engine/types';
import { tokenText, type ScriptId, type Token } from './project';

const LOW_SCORE = 0.15;

/** The words worth a second look, by caption. English captions of a Hindi video have none. */
export function findDoubts(captions: Caption[], tokens: Token[], script: ScriptId) {
  const doubts = new Map<string, Token[]>();
  if (script === 'translated') return doubts;
  const byId = new Map(tokens.map((t) => [t.id, t]));
  // Newer projects know which words the listeners disagreed on. Older ones have only
  // the timing score, which also flags many correct words.
  const compared = tokens.some((t) => t.unsure !== undefined);
  for (const caption of captions) {
    const words = caption.words.flatMap((w) => {
      const token = w.tokenId ? byId.get(w.tokenId) : undefined;
      return token && (compared ? token.unsure : token.score < LOW_SCORE) ? [token] : [];
    });
    if (words.length) doubts.set(caption.id, words);
  }
  return doubts;
}

const FILLERS = new Set(['um', 'umm', 'uh', 'uhh', 'uhm', 'hmm', 'hm', 'er', 'erm', 'ah', 'aah', 'matlab', 'मतलब', 'हम्म', 'अं', 'उम्म', 'आं']);
const LONG_SILENCE = 0.8;

const bare = (word: string) => word.toLowerCase().replace(/[,.?!।]+$/, '');

/** Filler words, for review. "Matlab" can be a real word, so nothing is removed unasked. */
export const findFillers = (tokens: Token[]) => tokens.filter((t) => FILLERS.has(bare(t.source)) || FILLERS.has(bare(t.hinglish)) || FILLERS.has(bare(t.spoken)));

/** Pauses long enough to feel empty on screen. */
export function findSilences(tokens: Token[]) {
  const silences: { start: number; end: number }[] = [];
  tokens.forEach((token, i) => {
    const next = tokens[i + 1];
    if (next && next.start - token.end >= LONG_SILENCE) silences.push({ start: token.end, end: next.start });
  });
  return silences;
}

/** Where a word or phrase occurs, as the index of its first word. */
export function findMatches(tokens: Token[], script: ScriptId, find: string) {
  const needle = find.trim().split(/\s+/).filter(Boolean).map(bare);
  if (needle.length === 0) return [];
  const words = tokens.map((t) => bare(tokenText(t, script)));
  const matches: number[] = [];
  for (let i = 0; i + needle.length <= words.length; i++) {
    if (needle.every((word, k) => words[i + k] === word)) {
      matches.push(i);
      i += needle.length - 1;
    }
  }
  return matches;
}
