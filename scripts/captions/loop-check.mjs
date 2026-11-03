import { readFileSync } from 'node:fs';

// Finds words lost on a long clip. yt-1-b-long is one clip repeated, so every copy must
// hold the same words at the same moments, and a missing word shows as a hole. Usage:
//   curl --data-binary @work/yt-1-b-long.m4a localhost:3100/api/dev/transcribe -o work/long.words.json
//   node scripts/loop-check.mjs work/long.words.json work/yt-1-b.groq.json
const [longPath, shortPath] = process.argv.slice(2);
const COPIES = 28;
const PERIOD = 21.5;
const REACH = 0.4;
/** The stitching step of the transcriber: a new 12 s piece starts every 10 s. */
const PIECE_STEP = 10;

const long = JSON.parse(readFileSync(longPath, 'utf8'));
const reference = JSON.parse(readFileSync(shortPath, 'utf8')).words;

const counts = [];
const lost = [];
for (let copy = 0; copy < COPIES; copy++) {
  const from = copy * PERIOD;
  const here = long.words.filter((w) => w.start >= from && w.start < from + PERIOD);
  counts.push(here.length);
  for (const word of reference) {
    const at = from + word.start;
    if (!here.some((w) => Math.abs(w.start - at) <= REACH)) lost.push({ copy, word: word.word, at });
  }
}

const total = counts.reduce((sum, n) => sum + n, 0);
console.log(`re-read ${long.reread ?? 0} pieces, second looks ${long.secondLooks ?? 0}, improved ${long.improved ?? 0}, language ${long.language}`);
console.log(`words ${total} of ${reference.length * COPIES}, worst copy ${Math.min(...counts)}, best copy ${Math.max(...counts)}`);
console.log(`per copy: ${counts.join(' ')}`);
console.log(`loud gaps flagged: ${long.speechGaps?.length ?? 0}`, (long.speechGaps ?? []).map((g) => `${g.start.toFixed(1)}-${g.end.toFixed(1)}`).join(' '));
console.log(`words with nothing near them: ${lost.length}`);

const runs = [];
for (const item of lost) {
  const last = runs[runs.length - 1];
  if (last && item.at - last.end < 1.5) {
    last.end = item.at;
    last.words.push(item.word);
  } else runs.push({ start: item.at, end: item.at, words: [item.word] });
}
for (const run of runs) {
  const inPiece = (run.start % PIECE_STEP).toFixed(1);
  console.log(`${run.start.toFixed(1)}-${run.end.toFixed(1)} s (${inPiece} s after a piece starts), ${run.words.length} words: ${run.words.join(' ').slice(0, 90)}`);
}

const buckets = new Array(PIECE_STEP).fill(0);
for (const item of lost) buckets[Math.floor(item.at % PIECE_STEP)]++;
console.log(`lost words by second within the 10 s step: ${buckets.join(' ')}`);
