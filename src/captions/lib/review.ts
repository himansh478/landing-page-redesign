import { tokenText, type ScriptId, type Token } from './project';

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
