import { askGemini } from './gemini';
import { inOrder } from './limits';

// Turns heard words into the forms the app needs, strictly one output per input word so
// timing stays attached. The words already come from Gemini's listening, so Flash-Lite is
// enough: 1.1% errors in Hindi, at a fraction of the time and cost of the bigger models.
const BATCH = 120;
const ATTEMPTS = 3;
const PARALLEL = 3;
const ONLY_DEVANAGARI = /^[^\p{L}]*(?:\p{Script=Devanagari}[^\p{L}]*)*$/u;

type Respelt = { spoken: string; hinglish: string };
export type ConvertedWord = Respelt & { fixed: string };

// Pairs, not named fields: the reply is the costliest part of a job, and the names were half of it.
const schema = {
  type: 'ARRAY',
  items: { type: 'ARRAY', items: { type: 'STRING' }, minItems: 2, maxItems: 2 },
};

const prompt = (words: string[], vocabulary: string[]) => `You prepare Hindi and Hinglish speech transcripts for video captions.
The transcript below is a JSON array of ${words.length} tokens in spoken order. Return exactly ${words.length} pairs, one per input token, same order, each pair as [spoken, hinglish]. Never merge, split, add, drop or reorder tokens. If the transcriber clearly glued two spoken words into one token, put both in this one pair with a space (मरील -> में रील, mein reel).

In each pair:
- spoken: exactly the word that was said, in plain Devanagari letters. It is the Hindi caption and is used for audio alignment. Never replace it with a different word, a synonym, a more formal form or a translation: colloquial forms stay as said (बोलके stays बोलके, never बोलकर), and an English word stays that English word (good -> गुड, never अच्छा). Only fix its spelling: misspelt Hindi words (ज़िन्दगि -> ज़िंदगी), and English words take the standard Hindi spelling of how they sound, even if the transcriber spelt them badly in Devanagari (CapCut -> कैपकट, timeline -> टाइमलाइन, plan -> प्लान, bank -> बैंक, special -> स्पेशल). Numbers are written out as they are said (2005 -> दो हज़ार पाँच). No punctuation.
- hinglish: natural Roman-script Hinglish as Indian creators type it (poora, dekh, liya, kaise, hain, woh, wahi). English words keep English spelling (CapCut, timeline). Capitals only for names and brands. No trailing punctuation.

${vocabulary.length ? `These names must be spelt exactly like this: ${vocabulary.join(', ')}.\n` : ''}Tokens:
${JSON.stringify(words)}`;

async function ask(words: string[], vocabulary: string[]): Promise<ConvertedWord[]> {
  const res = await askGemini([{ text: prompt(words, vocabulary) }], { temperature: 0, responseMimeType: 'application/json', responseSchema: schema });
  if (!res.ok) throw new Error(`Language step failed (${res.status})`);
  const json = await res.json();
  const pairs: string[][] = JSON.parse(json.candidates[0].content.parts.map((p: { text: string }) => p.text).join(''));
  return pairs.map(([spoken, hinglish], i) => ({ spoken, hinglish, fixed: (words[i] ?? '').replace(/[,.?!।]+$/, '') }));
}

/** A word still in other letters is asked about alone, which usually settles it. */
async function respell(tokens: ConvertedWord[], vocabulary: string[]) {
  const left = tokens.filter((token) => !ONLY_DEVANAGARI.test(token.spoken));
  if (left.length === 0) return tokens;
  const again = await ask(left.map((token) => token.fixed), vocabulary).catch(() => []);
  if (again.length === left.length) left.forEach((token, i) => ONLY_DEVANAGARI.test(again[i].spoken) && (token.spoken = again[i].spoken));
  return tokens;
}

async function answer(words: string[], vocabulary: string[]) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await ask(words, vocabulary);
    } catch (e) {
      if (attempt === ATTEMPTS) throw e;
    }
  }
}

// The same request gets the same answer, so a usable batch is never sent twice: a wrong
// count is split, and a word in other letters, which would leave it untimed and out of
// place in Hindi captions, is asked about alone.
async function batch(words: string[], vocabulary: string[]): Promise<ConvertedWord[]> {
  const tokens = await answer(words, vocabulary);
  if (tokens.length === words.length) return respell(tokens, vocabulary);

  // A long batch can lose one word in the telling, and that mustn't end the whole job.
  if (words.length === 1) return [{ fixed: words[0], spoken: words[0], hinglish: words[0] }];
  const middle = Math.ceil(words.length / 2);
  return [...(await batch(words.slice(0, middle), vocabulary)), ...(await batch(words.slice(middle), vocabulary))];
}

export async function convert(words: string[], vocabulary: string[] = [], onProgress?: (fraction: number) => void) {
  const batches: string[][] = [];
  for (let i = 0; i < words.length; i += BATCH) batches.push(words.slice(i, i + BATCH));
  let done = 0;
  const results = await inOrder(batches, PARALLEL, async (words) => {
    const result = await batch(words, vocabulary);
    onProgress?.(++done / batches.length);
    return result;
  });
  return results.flat();
}
