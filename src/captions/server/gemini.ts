import { fetchWithRetry } from './limits';

// Models are named exactly, because a "latest" name can change its price and habits.
// One that is out of its limit hands over to the next, so a job never stops for it.
const MODELS = [process.env.GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'].filter((model) => !!model);

export async function askGemini(parts: object[], generationConfig: object) {
  let res: Response | undefined;
  for (const model of MODELS) {
    res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, () => ({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig }),
    }));
    if (res.status !== 429) break;
  }
  return res as Response;
}
