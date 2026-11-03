// The lost-speech alarm. Whisper can drop speech without any error, so we compare
// its words with the audio itself: a long loud stretch with no words on it means
// either lost speech or music, and a person should look at it.
const STEP = 0.01;
const MIN_LENGTH = 1.5;
const MIN_LOUD_SHARE = 0.4;
const REACH = 0.3;
const CLOSE_AFTER = 0.5;
// Whisper can report a word lasting many seconds, which would hide a gap.
const LONGEST_WORD = 1.5;
// Quieter than the pauses of a real recording, so no voice can be under this.
const SILENCE = -60;

type Stretch = { first: number; last: number; loud: number };

const speechLevel = (envelope: number[]) => {
  const sorted = [...envelope].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.1)] + 15;
};

/** The share of loud audio between two times that has a word on it. */
export function coverage(envelope: number[], words: { start: number; end: number }[], from: number, to: number) {
  const level = speechLevel(envelope);
  const reach = REACH / 2;
  let loud = 0;
  let covered = 0;
  for (let i = Math.floor(from / STEP); i < Math.min(envelope.length, to / STEP); i++) {
    if (envelope[i] <= level) continue;
    loud++;
    const time = i * STEP;
    if (words.some((w) => time >= w.start - reach && time <= Math.min(w.end, w.start + LONGEST_WORD) + reach)) covered++;
  }
  return loud === 0 ? 1 : covered / loud;
}

// Whisper can also skip a stretch, or misread it as a few drawn-out words, depending on
// where its reading happened to start. Either way the words are too few for the sound.
const THIN_WINDOW = 3;
const THIN_SHARE = 0.7;
const THIN_LEAST_SOUND = 1.2;
const THIN_LONGEST = 8;

/** Stretches holding far fewer words than this video's own pace would put there. */
export function findThinStretches(envelope: number[], words: { start: number; end: number }[]) {
  const level = speechLevel(envelope);
  const seconds = Math.ceil(envelope.length * STEP);
  const sound = new Array<number>(seconds).fill(0);
  envelope.forEach((db, i) => {
    if (db > level) sound[Math.floor(i * STEP)] += STEP;
  });
  const heard = new Array<number>(seconds).fill(0);
  for (const w of words) heard[Math.min(seconds - 1, Math.floor((w.start + w.end) / 2))]++;

  const total = (list: number[], from = 0, to = list.length) => list.slice(from, to).reduce((sum, n) => sum + n, 0);
  const pace = words.length / Math.max(total(sound), 1);

  const stretches: { start: number; end: number }[] = [];
  for (let s = 0; s + THIN_WINDOW <= seconds; s++) {
    const loud = total(sound, s, s + THIN_WINDOW);
    if (loud < THIN_LEAST_SOUND || total(heard, s, s + THIN_WINDOW) >= pace * loud * THIN_SHARE) continue;
    const last = stretches.at(-1);
    if (last && s <= last.end && s + THIN_WINDOW - last.start <= THIN_LONGEST) last.end = s + THIN_WINDOW;
    else stretches.push({ start: last ? Math.max(s, last.end) : s, end: s + THIN_WINDOW });
  }
  return stretches;
}

/** Whisper can invent words over silence, so a word needs some sound under it. */
export function heardWords<T extends { start: number; end: number }>(words: T[], envelope: number[]) {
  return words.filter((word) => {
    const from = Math.max(0, Math.floor((word.start - REACH) / STEP));
    const to = Math.min(envelope.length, Math.ceil((word.end + REACH) / STEP));
    return envelope.slice(from, to).some((db) => db > SILENCE);
  });
}

export function findSpeechGaps(envelope: number[], words: { start: number; end: number }[]) {
  const threshold = speechLevel(envelope);

  const covered = new Array<boolean>(envelope.length).fill(false);
  for (const w of words) {
    const from = Math.max(0, Math.floor((w.start - REACH) / STEP));
    const to = Math.min(envelope.length, Math.ceil((Math.min(w.end, w.start + LONGEST_WORD) + REACH) / STEP));
    covered.fill(true, from, to);
  }

  const stretches: Stretch[] = [];
  let open: Stretch | null = null;

  envelope.forEach((db, i) => {
    if (covered[i]) {
      if (open) stretches.push(open);
      open = null;
    } else if (db > threshold) {
      const current: Stretch = open ?? { first: i, last: i, loud: 0 };
      current.last = i;
      current.loud++;
      open = current;
    } else if (open && (i - open.last) * STEP >= CLOSE_AFTER) {
      stretches.push(open);
      open = null;
    }
  });
  if (open) stretches.push(open);

  return stretches
    .filter((s) => {
      const length = (s.last - s.first + 1) * STEP;
      return length >= MIN_LENGTH && s.loud * STEP >= length * MIN_LOUD_SHARE;
    })
    .map((s) => ({ start: s.first * STEP, end: (s.last + 1) * STEP }));
}
