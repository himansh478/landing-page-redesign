import { useEditor } from '@/captions/state/editor';
import { extractAudio } from './audio';
import { api } from './auth';
import { captionText, tokenText, type Token } from './project';
import { readMedia } from './storage';

const PAD = 0.15;
const ORDER_GAP = 0.02;

type Timed = { start: number; end: number; score: number } | null;
type Converted = { fixed: string; spoken: string; hinglish: string };

/** Carries a spelling fix over to the other scripts, keeping the word's timing. */
export async function syncScripts() {
  const { project, doc, patch } = useEditor.getState();
  if (!doc || project?.language !== 'hi') return;

  const stale = (doc.tokens as Token[]).filter((t) => t.stale && !t.pending);
  if (stale.length === 0) return;
  const ids = stale.map((t) => t.id);
  const script = doc.script;
  const clear = (current: { tokens: Token[] }) => {
    for (const token of current.tokens) if (ids.includes(token.id)) delete token.stale;
  };

  try {
    const res = await api('/api/captions/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: stale.map((t) => tokenText(t, script)) }),
    });
    if (!res.ok) throw new Error('Respelling failed');
    const { converted } = (await res.json()) as { converted: Converted[] };
    patch((current) => {
      ids.forEach((id, i) => {
        const token = current.tokens.find((t) => t.id === id);
        if (!token) return;
        token.source = converted[i].fixed;
        const shown = captionText(converted[i]);
        if (script !== 'hindi') token.spoken = shown.spoken;
        if (script !== 'hinglish') token.hinglish = shown.hinglish;
      });
      clear(current as { tokens: Token[] });
    });
  } catch {
    patch((current) => clear(current as { tokens: Token[] }));
  }
}

/**
 * Re-times words added during editing. Only the changed phrase's audio is sent,
 * and only those words change, so the rest of the captions stay exactly in place.
 */
export async function realignPending() {
  const { project, doc, patch, setNotice } = useEditor.getState();
  if (!project || !doc) return;

  const tokens = doc.tokens as Token[];
  const firstPending = tokens.findIndex((t) => t.pending);
  if (firstPending < 0) return;

  let lastPending = firstPending;
  while (tokens[lastPending + 1]?.pending) lastPending++;
  const phrase = tokens.slice(Math.max(0, firstPending - 1), lastPending + 2);
  const ids = phrase.map((t) => t.id);

  const start = Math.max(0, phrase[0].start - PAD);
  const end = Math.min(project.media.duration, phrase[phrase.length - 1].end + PAD);

  try {
    const audio = await extractAudio(await readMedia(project.id, 'audio'), { start, end });
    const form = new FormData();
    form.set('audio', new Blob([audio], { type: 'audio/mp4' }));
    form.set('words', JSON.stringify(phrase.map((t) => tokenText(t, doc.script))));
    form.set('language', project.language);

    const res = await api('/api/captions/realign', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Re-timing failed');
    const { timed, converted } = (await res.json()) as { timed: Timed[]; converted: Converted[] };

    patch((current) => {
      ids.forEach((id, i) => {
        const token = current.tokens.find((t) => t.id === id);
        if (!token?.pending) return;
        token.pending = false;
        delete token.stale;
        const time = timed[i];
        if (time) {
          // A word that isn't really in the audio can land anywhere, so it is kept
          // between its neighbours and the captions stay in order.
          const index = current.tokens.indexOf(token);
          const before = current.tokens[index - 1]?.start ?? 0;
          const after = current.tokens[index + 1]?.start ?? Infinity;
          token.start = Math.min(Math.max(time.start + start, before + ORDER_GAP), after - ORDER_GAP);
          token.end = Math.max(token.start + ORDER_GAP, Math.min(time.end + start, after));
          token.score = time.score;
        }
        const words = converted[i];
        if (words && project.language === 'hi') {
          Object.assign(token, captionText(words));
          token.source = words.fixed;
        }
      });
    });
    await realignPending();
  } catch {
    patch((current) => {
      for (const token of current.tokens) if (token.pending) token.pending = false;
    });
    setNotice("Couldn't re-time the new word. Drag its caption on the timeline if it looks off.");
  }
}
