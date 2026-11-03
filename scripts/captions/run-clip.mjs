import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

// Runs a real clip through the real pipeline on the dev server (captions-dev preview),
// and saves what came back for scoring. The sound goes to Groq, Gemini and Modal. Usage:
//   node scripts/run-clip.mjs test-clips/clip.mp4
// Writes work/<clip>.m4a and work/<clip>.aligned.json.
const SERVER = 'http://localhost:3100';

const source = process.argv[2];
const name = basename(source, extname(source));
const audio = `work/${name}.m4a`;
execFileSync(process.execPath, ['scripts/extract-audio.mjs', source, audio], { stdio: 'ignore' });

const started = performance.now();
const res = await fetch(`${SERVER}/api/process`, { method: 'POST', body: readFileSync(audio) });
if (!res.ok) throw new Error(`The server said ${res.status}: ${await res.text()}`);

// Progress arrives as lines, so each step's time can be read off as it happens.
let text = '';
let stage = 'starting';
let stageStart = performance.now();
const steps = [];
const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  text += value;
  const now = text.split('\n').filter(Boolean).at(-1);
  const next = now.startsWith('{"stage":"') ? now.slice(10, now.indexOf('"', 10)) : stage;
  if (next !== stage) {
    steps.push(`${stage} ${((performance.now() - stageStart) / 1000).toFixed(0)} s`);
    stage = next;
    stageStart = performance.now();
  }
}

const last = text.trim().split('\n').map((line) => JSON.parse(line)).at(-1);
if (last.stage !== 'done') throw new Error(last.message ?? 'The pipeline did not finish.');

writeFileSync(`work/${name}.aligned.json`, JSON.stringify(last.result));
const { language, duration, tokens, speechGaps } = last.result;
console.log(`${name}: ${language}, ${duration.toFixed(1)} s, ${tokens.length} words, ${((performance.now() - started) / 1000).toFixed(1)} s to process, ${speechGaps.length} loud gaps (${steps.join(', ')})`);
console.log(tokens.map((token) => token.source).join(' '));
console.log(tokens.map((token) => token.hinglish).join(' '));
