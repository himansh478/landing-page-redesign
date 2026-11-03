import { readFileSync, writeFileSync } from 'node:fs';

// A check on Whisper that doesn't depend on Whisper: Gemini hears the raw audio and
// never sees our transcript. Agreement between them is good evidence, but it is not a
// person listening. Usage:
//   node --env-file=.env.local scripts/second-listener.mjs work/clip.m4a [model]
// Writes work/<clip>.<model>.txt.
const [audioPath, model = 'gemini-flash-latest'] = process.argv.slice(2);
const ATTEMPTS = 4;
const WAIT_MS = 8000;

const PROMPT = `You are a professional transcriber. Listen to this audio and write exactly the words that are spoken, word for word, in spoken order.
Rules:
- Do not translate, summarise, fix grammar or add anything that is not said.
- Write Hindi words in Devanagari. Write words the speaker says in English in Latin letters.
- Write numbers as digits only if the speaker says a year or a number.
- If you cannot make out a word, write [?] in its place. Never guess to make a sentence read better.
- Return only the transcript, with no notes.`;

const body = JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: PROMPT }, { inline_data: { mime_type: 'audio/mp4', data: readFileSync(audioPath).toString('base64') } }] }],
  generationConfig: { temperature: 0 },
});

for (let attempt = 1; ; attempt++) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
    body,
  });
  if (res.ok) {
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join('').trim() ?? '';
    writeFileSync(audioPath.replace(/\.m4a$/, `.${model}.txt`), text);
    console.log(`${audioPath} ${model}:\n${text}\n`);
    break;
  }
  if (attempt === ATTEMPTS) throw new Error(`Gemini said ${res.status}`);
  await new Promise((done) => setTimeout(done, WAIT_MS * attempt));
}
