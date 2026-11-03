import { readFileSync } from 'node:fs';
import { ALL_FORMATS, BufferSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } from 'mediabunny';
import { ModalClient } from 'modal';

// Does timing change when the audio is cut differently? This works on real Hindi
// speech, where we have no true answer: good timing should land every word at the
// same moment no matter where the audio starts. Usage:
//   node --env-file=.env.local scripts/repeatability.mjs work/clip.m4a work/clip.aligned.json [language]
const [audioPath, alignedPath, language = 'hi'] = process.argv.slice(2);
const SHIFTS = [0, 0.137, 0.291, 0.463, 0.619];
const BLOCK = 24;
const PAD = 0.6;
/** The app throws away this many words at each block edge, so they are scored apart. */
const EDGE = 3;

const file = readFileSync(audioPath);
const audio = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
const { tokens } = JSON.parse(readFileSync(alignedPath, 'utf8'));

async function cut(start, end) {
  const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(audio) });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const conversion = await Conversion.init({ input, output, trim: { start, end } });
  await conversion.execute();
  return new Uint8Array(output.target.buffer);
}

const modal = new ModalClient({ tokenId: process.env.MODAL_TOKEN_ID, tokenSecret: process.env.MODAL_TOKEN_SECRET });
const worker = (await (await modal.cls.fromName('cwaya-align', 'Aligner')).instance()).method('align');

const spreads = [];
for (let first = 0; first + 6 < tokens.length; first += BLOCK) {
  const block = tokens.slice(first, first + BLOCK);
  const seen = block.map(() => []);
  for (const shift of SHIFTS) {
    const start = Math.max(0, block[0].start - PAD - shift);
    const end = block[block.length - 1].end + PAD + (SHIFTS[SHIFTS.length - 1] - shift);
    const piece = await cut(start, end);
    // Trimming lands on an audio packet, so the real start comes from the file.
    const { segments } = await worker.remote([piece, [{ start: 0, end: 1e9, words: block.map((t) => t.spoken) }], language]);
    segments[0].forEach((timed, i) => {
      if (timed) seen[i].push(timed.start + start);
    });
  }
  seen.forEach((values, i) => {
    if (values.length < SHIFTS.length) return;
    const middle = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    const furthest = Math.max(...values.map((v) => Math.abs(v - middle)));
    const edge = (i < EDGE && first > 0) || (i >= block.length - EDGE && first + BLOCK < tokens.length);
    spreads.push({ word: block[i].source, furthest, edge });
  });
  console.log(`block at word ${first} done`);
}

const report = (label, list) => {
  const sorted = list.map((s) => s.furthest).sort((a, b) => a - b);
  const pick = (q) => Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] * 1000);
  console.log(label, { words: sorted.length, medianMs: pick(0.5), p90Ms: pick(0.9), maxMs: pick(1) });
};
report('kept by the app:', spreads.filter((s) => !s.edge));
report('block edges, thrown away:', spreads.filter((s) => s.edge));
console.log('least stable kept:', spreads.filter((s) => !s.edge).sort((a, b) => b.furthest - a.furthest).slice(0, 6).map((s) => `${s.word} ${Math.round(s.furthest * 1000)}ms`).join(', '));
