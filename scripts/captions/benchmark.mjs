import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_FORMATS, BufferSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } from 'mediabunny';

// Scores the real pipeline against known answers, using the running dev server.
//   powershell -File scripts/make-speech-cases.ps1
//   node scripts/benchmark.mjs
// Each work/benchmark/<case>.wav has a <case>.gold.json with its true words and
// start times. Noisy copies of every other case show how speech holds up in the
// conditions real videos have.
const DIR = 'work/benchmark';
const SERVER = 'http://localhost:3100';
const HISS_SNR = 15;
const MUSIC_SNR = 10;
/** Music as loud as the speech: meant to be hard enough to show where it breaks. */
const LOUD_SNR = 0;

const clean = (word) => word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');

function readWav(buffer) {
  let offset = 12;
  let format = null;
  while (offset < buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') format = { channels: buffer.readUInt16LE(offset + 10), rate: buffer.readUInt32LE(offset + 12), bits: buffer.readUInt16LE(offset + 22) };
    if (id === 'data') return { ...format, samples: new Int16Array(buffer.buffer.slice(buffer.byteOffset + offset + 8, buffer.byteOffset + offset + 8 + size)) };
    offset += 8 + size + (size % 2);
  }
  throw new Error('No audio in WAV');
}

function writeWav({ rate, samples }) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + samples.byteLength, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(samples.byteLength, 40);
  return Buffer.concat([header, Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength)]);
}

const power = (values) => values.reduce((sum, v) => sum + v * v, 0) / values.length;

/** Mixes in background sound at a set speech-to-noise ratio. */
function mix(wav, snr, kind) {
  const speech = Float64Array.from(wav.samples);
  const noise = new Float64Array(speech.length);
  for (let i = 0; i < noise.length; i++) {
    const t = i / wav.rate;
    if (kind === 'hiss') noise[i] = Math.random() - 0.5;
    else {
      const beat = 0.6 + 0.4 * Math.cos(2 * Math.PI * 2 * t);
      noise[i] = beat * (Math.sin(2 * Math.PI * 110 * t) + 0.7 * Math.sin(2 * Math.PI * 220 * t) + 0.5 * Math.sin(2 * Math.PI * 277 * t) + 0.5 * Math.sin(2 * Math.PI * 330 * t));
    }
  }
  const gain = Math.sqrt(power(speech) / power(noise) / 10 ** (snr / 10));
  const samples = Int16Array.from(speech, (s, i) => Math.max(-32768, Math.min(32767, s + noise[i] * gain)));
  return { rate: wav.rate, samples };
}

async function toMp4(wavBuffer) {
  const buffer = wavBuffer.buffer.slice(wavBuffer.byteOffset, wavBuffer.byteOffset + wavBuffer.byteLength);
  const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(buffer) });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const conversion = await Conversion.init({ input, output });
  await conversion.execute();
  return output.target.buffer;
}

async function runPipeline(audio) {
  const res = await fetch(`${SERVER}/api/process`, { method: 'POST', body: audio });
  const events = (await res.text()).trim().split('\n').map((line) => JSON.parse(line));
  const last = events[events.length - 1];
  if (last.stage !== 'done') throw new Error(last.message ?? 'Pipeline stopped');
  return last.result;
}

/** Edit-distance alignment: returns error count and the word pairs that match. */
function compare(gold, heard) {
  const a = gold.map((w) => clean(w.text));
  const b = heard.map((w) => clean(w.source));
  const cost = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) cost[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      cost[i][j] = Math.min(cost[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), cost[i - 1][j] + 1, cost[i][j - 1] + 1);
    }
  }
  const pairs = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1] && cost[i][j] === cost[i - 1][j - 1]) {
      pairs.push([gold[i - 1], heard[j - 1]]);
      i--;
      j--;
    } else if (cost[i][j] === cost[i - 1][j - 1] + 1) {
      i--;
      j--;
    } else if (cost[i][j] === cost[i - 1][j] + 1) i--;
    else j--;
  }
  return { errors: cost[a.length][b.length], pairs: pairs.reverse() };
}

const summary = (errors) => {
  const abs = errors.map(Math.abs).sort((x, y) => x - y);
  const signed = [...errors].sort((x, y) => x - y);
  const pick = (list, q) => Math.round(list[Math.min(list.length - 1, Math.floor(list.length * q))] * 1000);
  return {
    words: abs.length,
    medianMs: pick(abs, 0.5),
    p90Ms: pick(abs, 0.9),
    p99Ms: pick(abs, 0.99),
    maxMs: pick(abs, 1),
    within30: `${Math.round((abs.filter((e) => e <= 0.03).length / abs.length) * 100)}%`,
    within80: `${Math.round((abs.filter((e) => e <= 0.08).length / abs.length) * 100)}%`,
    biasMs: pick(signed, 0.5),
  };
};

const names = readdirSync(DIR).filter((f) => f.endsWith('.wav')).map((f) => f.replace('.wav', '')).sort();
const groups = { clean: [], hiss: [], music: [], loud: [] };
const rows = [];

const run = async (name, group, wavBuffer, gold) => {
  try {
    const started = performance.now();
    const result = await runPipeline(await toMp4(wavBuffer));
    const { errors, pairs } = compare(gold.words, result.tokens);
    const offsets = pairs.map(([truth, heard]) => heard.start - truth.start);
    groups[group].push({ name, errors, total: gold.words.length, offsets });
    const row = { case: name, group, words: gold.words.length, wrong: errors, ...summary(offsets), seconds: +((performance.now() - started) / 1000).toFixed(1), language: result.language, gaps: result.speechGaps.length };
    rows.push(row);
    console.log(`${name.padEnd(22)} ${group.padEnd(6)} wrong ${errors}/${gold.words.length}  median ${row.medianMs} ms  max ${row.maxMs} ms  bias ${row.biasMs} ms  (${row.seconds}s)`);
  } catch (e) {
    console.log(`${name.padEnd(22)} ${group.padEnd(6)} FAILED: ${e.message}`);
    rows.push({ case: name, group, failed: e.message });
  }
};

for (const [index, name] of names.entries()) {
  const wavBuffer = readFileSync(join(DIR, `${name}.wav`));
  const gold = JSON.parse(readFileSync(join(DIR, `${name}.gold.json`), 'utf8').replace(/^﻿/, ''));
  await run(name, 'clean', wavBuffer, gold);
  if (index % 2 === 0) {
    const wav = readWav(wavBuffer);
    await run(name, 'hiss', writeWav(mix(wav, HISS_SNR, 'hiss')), gold);
    await run(name, 'music', writeWav(mix(wav, MUSIC_SNR, 'music')), gold);
    await run(name, 'loud', writeWav(mix(wav, LOUD_SNR, 'music')), gold);
  }
}

console.log('\nOverall');
const totals = {};
for (const [group, cases] of Object.entries(groups)) {
  if (!cases.length) continue;
  const offsets = cases.flatMap((c) => c.offsets);
  const errors = cases.reduce((sum, c) => sum + c.errors, 0);
  const total = cases.reduce((sum, c) => sum + c.total, 0);
  totals[group] = { cases: cases.length, wer: `${((errors / total) * 100).toFixed(1)}%`, ...summary(offsets) };
  console.log(group.padEnd(6), JSON.stringify(totals[group]));
}
// Passages 2-3 played no part in setting the English timing correction.
const unseen = rows.filter((r) => /^p[23]-/.test(r.case) && r.group === 'clean').map((r) => r.case);
const unseenOffsets = groups.clean.filter((c) => unseen.includes(c.name)).flatMap((c) => c.offsets);
if (unseenOffsets.length) console.log('unseen', JSON.stringify(summary(unseenOffsets)));
writeFileSync(join(DIR, 'results.json'), JSON.stringify({ when: new Date().toISOString(), totals, rows }, null, 2));
