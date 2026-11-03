import { askGemini } from './gemini';
import { inOrder } from './limits';

// Hindi and English word order differ, so a translation cannot keep word timing.
// Each spoken phrase is translated whole and keeps that phrase's time on screen.
const BATCH = 60;
const PARALLEL = 3;
const ATTEMPTS = 3;

const prompt = (lines: string[]) => `You translate a Hindi or Hinglish video creator's speech into natural spoken English, the way a native speaker would say it. Never translate word by word.
The JSON array below holds ${lines.length} spoken phrases in order. A phrase may continue the one before it, so read them all first for meaning. Return exactly ${lines.length} strings, one per input phrase, same order. Keep names and product words as they are. No quotation marks.

Phrases:
${JSON.stringify(lines)}`;

async function ask(lines: string[]): Promise<string[]> {
  const res = await askGemini([{ text: prompt(lines) }], { temperature: 0, responseMimeType: 'application/json', responseSchema: { type: 'ARRAY', items: { type: 'STRING' } } });
  if (!res.ok) throw new Error(`Translation failed (${res.status})`);
  const json = await res.json();
  return JSON.parse(json.candidates[0].content.parts.map((p: { text: string }) => p.text).join(''));
}

async function batch(lines: string[]) {
  let failure: unknown;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const result = await ask(lines);
      if (result.length === lines.length) return result;
      failure = new Error(`Translation returned ${result.length} of ${lines.length} lines`);
    } catch (e) {
      failure = e;
    }
  }
  throw failure;
}

export async function translate(lines: string[]) {
  const batches: string[][] = [];
  for (let i = 0; i < lines.length; i += BATCH) batches.push(lines.slice(i, i + BATCH));
  return (await inOrder(batches, PARALLEL, batch)).flat();
}
