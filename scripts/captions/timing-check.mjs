import { readFile } from 'node:fs/promises';

// Independent timing check, no hand-made captions needed. Wherever a word follows
// silence, the audio itself shows when it starts, so we compare that moment with
// the word's start from alignment and from Whisper. Only words after a pause can
// be measured this way. Usage:
//   node scripts/timing-check.mjs work/clip.aligned.json work/clip.groq.json
const [alignedPath, groqPath] = process.argv.slice(2);
const { tokens, envelope, duration } = JSON.parse(await readFile(alignedPath, 'utf8'));
const groq = JSON.parse(await readFile(groqPath, 'utf8')).words;

const STEP = 0.01;
const sorted = [...envelope].sort((a, b) => a - b);
const floor = sorted[Math.floor(sorted.length * 0.1)];
const threshold = floor + 15;
const loud = envelope.map((db) => db > threshold);

const quietBefore = (i, frames) => {
  for (let k = i - frames; k < i; k++) if (k < 0 || loud[k]) return false;
  return true;
};
const loudAfter = (i, frames) => {
  for (let k = i; k < i + frames; k++) if (!loud[k]) return false;
  return true;
};

// At least 30 ms of sound after some quiet. A short quiet can sit inside a word, before
// a loud syllable, so only a pause of 200 ms or more surely means a new word starts.
const SHORT_QUIET = 8;
const REAL_PAUSE = 20;
const onsetsAfter = (frames) => {
  const found = [];
  for (let i = frames; i < envelope.length - 3; i++) if (quietBefore(i, frames) && loudAfter(i, 3)) found.push(i * STEP);
  return found;
};

const summary = (values) => {
  const abs = values.map(Math.abs).sort((a, b) => a - b);
  const signed = [...values].sort((a, b) => a - b);
  const pick = (q) => Math.round(abs[Math.min(abs.length - 1, Math.floor(abs.length * q))] * 1000);
  // Below zero means words show before the sound starts.
  return { n: abs.length, medianMs: pick(0.5), p90Ms: pick(0.9), maxMs: pick(1), biasMs: Math.round(signed[Math.floor(signed.length / 2)] * 1000) };
};

/** An onset is one moment in the sound, so it only measures the word closest to it. */
function measure(frames, label) {
  const onsets = onsetsAfter(frames);
  const nearest = (t) => onsets.reduce((best, o) => (Math.abs(o - t) < Math.abs(best - t) ? o : best), Infinity);
  const owners = new Map();
  tokens.forEach((token, i) => {
    if (token.start === undefined) return;
    const onset = nearest(token.start);
    const gap = Math.abs(onset - token.start);
    if (gap <= 0.2 && gap < (owners.get(onset)?.gap ?? Infinity)) owners.set(onset, { token, i, gap });
  });

  const aligned = [];
  const whisper = [];
  const rows = [];
  for (const [onset, { token, i }] of owners) {
    aligned.push(token.start - onset);
    // Whisper's own times only line up when it heard the same number of words.
    if (groq.length === tokens.length) whisper.push(groq[i].start - onset);
    rows.push(`${token.source.padEnd(12)} onset ${onset.toFixed(2)}  aligned ${token.start.toFixed(2)}`);
  }

  console.log(`\n${label}`);
  console.log(rows.join('\n'));
  if (rows.length === 0) return;
  console.log('aligned vs audio', summary(aligned));
  if (whisper.length) console.log('whisper vs audio', summary(whisper));
}

console.log({ floorDb: floor });
measure(SHORT_QUIET, 'After any quiet (can include syllables inside a word):');
measure(REAL_PAUSE, 'After a real pause (a word surely starts here):');

// Is anyone still speaking after the last word?
const last = tokens[tokens.length - 1];
const tail = [];
for (let s = Math.floor(last.end ?? 0); s < duration; s++) {
  const slice = envelope.slice(s * 100, (s + 1) * 100);
  tail.push(`${s}s:${Math.max(...slice).toFixed(0)}dB/${Math.round((slice.filter((d) => d > threshold).length / slice.length) * 100)}%`);
}
console.log('after last word (peak level / share above speech level):', tail.join('  '));
console.log('low-confidence words:', tokens.filter((t) => (t.score ?? 1) < 0.4).map((t) => `${t.spoken} ${t.score?.toFixed(2)}`).join(', ') || 'none');
