import { sentenceRanges } from '@/captions/engine/group';
import { useEditor } from '@/captions/state/editor';
import { api } from './auth';
import type { Token } from './project';

let running = false;

/** Fills in English for any caption that lacks it, when English is on screen. */
export async function ensureTranslations() {
  const { doc, patch, setNotice } = useEditor.getState();
  if (running || doc?.script !== 'translated') return;

  const tokens = doc.tokens as Token[];
  const missing = sentenceRanges(tokens).filter(({ first }) => !tokens[first].english);
  if (missing.length === 0) return;

  running = true;
  setNotice('Translating captions to English…');
  try {
    const lines = missing.map(({ first, last }) => tokens.slice(first, last + 1).map((t) => t.source).join(' '));
    const ids = missing.map(({ first }) => tokens[first].id);
    const res = await api('/api/captions/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines }),
    });
    if (!res.ok) throw new Error('Translation failed');
    const { lines: english } = (await res.json()) as { lines: string[] };

    patch((current) => {
      ids.forEach((id, i) => {
        const token = current.tokens.find((t) => t.id === id);
        if (token) token.english = english[i];
      });
    });
    setNotice(null);
  } catch {
    setNotice("Couldn't translate the captions. Switch language and back to try again.");
  } finally {
    running = false;
  }
}
