import { askGemini } from './gemini';
import { inOrder } from './limits';

// Suggestions only: a person accepts or rejects each one, so nothing changes silently.
const BATCH = 150;
const PARALLEL = 3;

export type Suggestion = { index: number; fix: string; why: string };

const schema = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: { index: { type: 'INTEGER' }, fix: { type: 'STRING' }, why: { type: 'STRING' } },
    required: ['index', 'fix', 'why'],
  },
};

const prompt = (lines: string[], vocabulary: string[]) => `You proofread video captions in Hindi, Hinglish or English. Each line below is "index: word" in spoken order.
Report only clear mistakes: misspelled words, wrongly heard names, or a word that makes no sense in its sentence and was clearly misheard. Do not rephrase, restyle, translate or change grammar that a person would really say. Fewer suggestions is better than wrong ones. If nothing is wrong return an empty array.
${vocabulary.length ? `These names must be spelt exactly like this: ${vocabulary.join(', ')}.\n` : ''}For each mistake give the index, the corrected word as "fix", and a reason of under eight words as "why".

${lines.join('\n')}`;

async function check(words: { index: number; text: string }[], vocabulary: string[]): Promise<Suggestion[]> {
  const lines = words.map((w) => `${w.index}: ${w.text}`);
  const res = await askGemini([{ text: prompt(lines, vocabulary) }], { temperature: 0, responseMimeType: 'application/json', responseSchema: schema });
  if (!res.ok) throw new Error(`Proofreading failed (${res.status})`);
  const json = await res.json();
  return JSON.parse(json.candidates[0].content.parts.map((p: { text: string }) => p.text).join(''));
}

export async function proofread(words: string[], vocabulary: string[]) {
  const indexed = words.map((text, index) => ({ index, text }));
  const batches: (typeof indexed)[] = [];
  for (let i = 0; i < indexed.length; i += BATCH) batches.push(indexed.slice(i, i + BATCH));
  const results = (await inOrder(batches, PARALLEL, (batch) => check(batch, vocabulary))).flat();
  return results.filter((s) => words[s.index] !== undefined && words[s.index] !== s.fix);
}
