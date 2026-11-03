// Whisper can hear one name as two words ("Cap Cut"), and the language step must keep
// one output per word, so names from the user's list are joined up here, before timing.
export type HeardWord = { word: string; start: number; end: number; fixed: string; spoken: string; hinglish: string; unsure?: boolean };

const key = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, '');

const asName = (word: HeardWord, name: string): HeardWord => ({ ...word, fixed: name, hinglish: name });

export function applyVocabulary(words: HeardWord[], vocabulary: string[]) {
  const names = new Map(vocabulary.map((name) => [key(name), name]));
  if (names.size === 0) return words;

  const result: HeardWord[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const next = words[i + 1];
    const alone = names.get(key(word.hinglish)) ?? names.get(key(word.fixed));
    const joined = next && (names.get(key(word.hinglish + next.hinglish)) ?? names.get(key(word.fixed + next.fixed)));

    if (joined) {
      result.push(asName({ ...word, word: next.word, end: next.end, spoken: `${word.spoken} ${next.spoken}` }, joined));
      i++;
    } else {
      result.push(alone ? asName(word, alone) : word);
    }
  }
  return result;
}
