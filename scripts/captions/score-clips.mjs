import { existsSync, readdirSync, readFileSync } from 'node:fs';

// Word errors on real clips, one score for each caption view a viewer can see. A
// reference is test-clips/<clip>.gold.<view>.txt, where <view> is english, hindi or
// hinglish. Run scripts/run-clip.mjs on the clip first. Usage:
//   node scripts/score-clips.mjs
// A reference is only as good as whoever made it, so say so when quoting these numbers.
const FIELD = { english: 'source', hindi: 'spoken', hinglish: 'hinglish' };
const CLIPS = 'test-clips';
const TARGET = { english: 0.05, hindi: 0.08, hinglish: 0.08 };

// Spelling that readers treat as the same word: capitals, dots under letters, and
// chandrabindu against anusvara. In Roman script, doubled letters, v against w, and a
// silent final h (to, toh).
const fold = (word) =>
  word
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\p{N}']/gu, '')
    .replace(/़/g, '')
    .replace(/ँ/g, 'ं')
    .replace(/([a-z])\1+/g, '$1')
    .replace(/v/g, 'w')
    .replace(/([a-z])h$/, '$1');

/** Edit distance, with the words that differ. A word split by a space is not an error. */
function compare(gold, heard) {
  const a = gold.map(fold);
  const b = heard.map(fold);
  const cost = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) cost[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const options = [cost[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), cost[i - 1][j] + 1, cost[i][j - 1] + 1];
      if (i > 1 && a[i - 2] + a[i - 1] === b[j - 1]) options.push(cost[i - 2][j - 1]);
      if (j > 1 && b[j - 2] + b[j - 1] === a[i - 1]) options.push(cost[i - 1][j - 2]);
      cost[i][j] = Math.min(...options);
    }
  }

  const changes = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 1 && j > 0 && a[i - 2] + a[i - 1] === b[j - 1] && cost[i][j] === cost[i - 2][j - 1]) {
      i -= 2;
      j--;
    } else if (j > 1 && i > 0 && b[j - 2] + b[j - 1] === a[i - 1] && cost[i][j] === cost[i - 1][j - 2]) {
      i--;
      j -= 2;
    } else if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && cost[i][j] === cost[i - 1][j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + 1) {
      changes.push(`${gold[--i]} -> ${heard[--j]}`);
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      changes.push(`${gold[--i]} -> (missing)`);
    } else {
      changes.push(`(extra) -> ${heard[--j]}`);
    }
  }
  return { errors: cost[a.length][b.length], changes: changes.reverse() };
}

const totals = {};
for (const file of readdirSync(CLIPS).sort()) {
  const match = file.match(/^(.+)\.gold\.(\w+)\.txt$/);
  if (!match) continue;
  const [, clip, view] = match;
  const result = `work/${clip}.aligned.json`;
  if (!existsSync(result)) {
    console.log(`${clip}: no result yet, run scripts/run-clip.mjs first`);
    continue;
  }

  const gold = readFileSync(`${CLIPS}/${file}`, 'utf8').trim().split(/\s+/);
  const { tokens } = JSON.parse(readFileSync(result, 'utf8'));
  const heard = tokens.flatMap((token) => token[FIELD[view]].trim().split(/\s+/));
  const { errors, changes } = compare(gold, heard);

  console.log(`${clip} ${view}: ${errors} errors in ${gold.length} words, ${((errors / gold.length) * 100).toFixed(1)}%`);
  for (const change of changes) console.log(`   ${change}`);
  totals[view] ??= { errors: 0, words: 0 };
  totals[view].errors += errors;
  totals[view].words += gold.length;
}

console.log('');
for (const [view, { errors, words }] of Object.entries(totals)) {
  const rate = errors / words;
  console.log(`${view}: ${(rate * 100).toFixed(1)}% over ${words} words, target under ${TARGET[view] * 100}%: ${rate < TARGET[view] ? 'met' : 'NOT met'}`);
}
