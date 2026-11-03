import { readdirSync, readFileSync } from 'node:fs';

// Checks the benchmark's answer key against the audio alone, with no aligner
// involved: wherever a word follows real silence, sound must start where the key
// says. Run this before trusting benchmark.mjs; an earlier key was wrong by 1.378×.
const DIR = 'work/benchmark';
const STEP = 0.005;
const QUIET_FRAMES = 40;

const errors = [];
const rows = [];
for (const name of readdirSync(DIR).filter((f) => f.endsWith('.wav'))) {
  const buffer = readFileSync(`${DIR}/${name}`);
  let offset = 12;
  let rate = 0;
  let samples = null;
  while (offset < buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') rate = buffer.readUInt32LE(offset + 12);
    if (id === 'data') samples = new Int16Array(buffer.buffer.slice(buffer.byteOffset + offset + 8, buffer.byteOffset + offset + 8 + size));
    offset += 8 + size + (size % 2);
  }

  const gold = JSON.parse(readFileSync(`${DIR}/${name.replace('.wav', '.gold.json')}`, 'utf8').replace(/^﻿/, ''));
  const hop = Math.round(rate * STEP);
  const levels = [];
  for (let i = 0; i + hop <= samples.length; i += hop) {
    let energy = 0;
    for (let k = i; k < i + hop; k++) energy += samples[k] * samples[k];
    levels.push(Math.sqrt(energy / hop));
  }
  const peak = Math.max(...levels);
  const loud = levels.map((level) => level > peak * 0.03);

  const onsets = [];
  for (let i = QUIET_FRAMES; i < loud.length - 3; i++) {
    const quiet = loud.slice(i - QUIET_FRAMES, i).every((frame) => !frame);
    if (quiet && loud[i] && loud[i + 1] && loud[i + 2]) onsets.push(i * STEP);
  }

  const here = onsets.map((onset) => gold.words.reduce((best, w) => (Math.abs(w.start - onset) < Math.abs(best.start - onset) ? w : best)).start - onset);
  errors.push(...here);
  const duration = samples.length / rate;
  const lastWord = gold.words[gold.words.length - 1].start;
  rows.push(`${name.padEnd(20)} ${rate} Hz  length ${duration.toFixed(2)}  last word ${lastWord.toFixed(2)}  ${lastWord < duration ? 'ok' : 'IMPOSSIBLE'}  key minus audio: ${here.map((e) => Math.round(e * 1000)).join(', ')} ms`);
}

console.log(rows.slice(0, 5).join('\n'));
const abs = errors.map(Math.abs).sort((a, b) => a - b);
const signed = [...errors].sort((a, b) => a - b);
console.log({ onsets: abs.length, medianMs: Math.round(abs[abs.length >> 1] * 1000), maxMs: Math.round(abs[abs.length - 1] * 1000), biasMs: Math.round(signed[signed.length >> 1] * 1000) });
