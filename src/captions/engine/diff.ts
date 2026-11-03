import { newId, tokenText, withTokenText, type ScriptId, type Token } from '@/captions/lib/project';

const MIN_NEW_WORD = 0.12;

type Hunk = { before: Token[]; after: string[] };

/** Longest-common-subsequence diff, returned as the changed stretches only. */
function hunks(tokens: Token[], next: string[], script: ScriptId) {
  const a = tokens.map((t) => tokenText(t, script));
  const lengths = Array.from({ length: a.length + 1 }, () => new Array<number>(next.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = next.length - 1; j >= 0; j--) {
      lengths[i][j] = a[i] === next[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const steps: (Token | Hunk)[] = [];
  let i = 0;
  let j = 0;
  let open: Hunk | null = null;
  const hunk = () => {
    open ??= { before: [], after: [] };
    return open;
  };
  while (i < a.length || j < next.length) {
    if (i < a.length && j < next.length && a[i] === next[j]) {
      if (open) steps.push(open);
      open = null;
      steps.push(tokens[i]);
      i++;
      j++;
    } else if (j < next.length && (i === a.length || lengths[i][j + 1] >= lengths[i + 1][j])) {
      hunk().after.push(next[j++]);
    } else {
      hunk().before.push(tokens[i++]);
    }
  }
  if (open) steps.push(open);
  return steps;
}

/**
 * Applies a caption text edit.
 * - A changed word keeps its timing.
 * - A deleted word disappears and its neighbours keep their timing.
 * - An added word gets a time guess now, and is marked `pending` for re-alignment.
 */
export function applyTextEdit(tokens: Token[], text: string, script: ScriptId, limits: { after: number; before: number }) {
  const next = text.trim().split(/\s+/).filter(Boolean);
  const steps = hunks(tokens, next, script);
  const output: Token[] = [];

  steps.forEach((step, s) => {
    if ('id' in step) {
      output.push(step);
      return;
    }
    const { before, after } = step;
    if (after.length === 0) return;

    if (after.length <= before.length) {
      after.forEach((word, i) => output.push({ ...withTokenText(before[i], script, word), stale: true }));
      return;
    }

    // More words than before: share the old span by word length.
    const last = output[output.length - 1];
    const following = steps.slice(s + 1).find((x): x is Token => 'id' in x);
    let from = before[0]?.start ?? last?.end ?? limits.after;
    let to = before[before.length - 1]?.end ?? following?.start ?? limits.before;
    if (to - from < MIN_NEW_WORD * after.length) {
      from = Math.max(limits.after, from - (MIN_NEW_WORD * after.length) / 2);
      to = from + MIN_NEW_WORD * after.length;
    }

    const total = after.reduce((sum, word) => sum + word.length, 0);
    let cursor = from;
    after.forEach((word, i) => {
      const length = ((to - from) * word.length) / total;
      const reused = before[i];
      const base: Token = reused ?? {
        id: newId(),
        source: word,
        spoken: word,
        hinglish: word,
        start: cursor,
        end: cursor + length,
        score: 0,
        breakBefore: false,
      };
      output.push({ ...withTokenText(base, script, word), start: cursor, end: cursor + length, pending: true });
      cursor += length;
    });
  });

  // The caption's first word must keep the caption's break.
  if (output.length) output[0] = { ...output[0], breakBefore: tokens[0].breakBefore };
  return output;
}
