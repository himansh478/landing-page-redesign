'use client';

import { useMemo, useState } from 'react';
import { captionStart, type Caption } from '@/captions/engine/types';
import type { Token } from '@/captions/lib/project';
import { realignPending, syncScripts } from '@/captions/lib/realign';
import { findDoubts } from '@/captions/lib/review';
import { useEditor } from '@/captions/state/editor';

const stamp = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

const tokenIds = (caption: Caption) => caption.words.flatMap((w) => (w.tokenId ? [w.tokenId] : []));

type CardProps = { caption: Caption; doubtful?: Token[]; editing: boolean; setEditing: (id: string | null) => void; seek: (t: number) => void };

function WordCard({ caption, doubtful, editing, setEditing, seek }: CardProps) {
  const text = caption.words.map((w) => w.text).join(' ');
  const [draft, setDraft] = useState(text);
  const { markChecked, editCaption } = useEditor.getState();
  const flagged = new Set(doubtful?.map((t) => t.id));
  const at = captionStart(caption) + 0.001;

  const edit = () => {
    setDraft(text);
    setEditing(caption.id);
    seek(at);
  };

  const save = () => {
    const next = draft.trim();
    setEditing(null);
    if (!next || next === text) return;
    markChecked(tokenIds(caption));
    editCaption(caption.id, next);
    realignPending();
    syncScripts();
  };

  return (
    <div className={`word-card ${doubtful ? 'doubtful' : ''}`}>
      {editing ? (
        <>
          <textarea aria-label={`Caption at ${stamp(at)}`} rows={2} autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="pair">
            <button className="primary" onClick={save}>
              Save
            </button>
            <button className="ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <button className="words" onClick={() => seek(at)}>
            <small>{stamp(at)}</small>
            {caption.words.map((w, i) => (
              <span key={i} className={w.tokenId && flagged.has(w.tokenId) ? 'unsure' : undefined}>
                {w.text}{' '}
              </span>
            ))}
          </button>
          <div className="pair">
            <button onClick={edit}>Edit</button>
            {doubtful && <button onClick={() => markChecked(tokenIds(caption))}>Looks right</button>}
          </div>
        </>
      )}
    </div>
  );
}

/** Step two on a phone: only the words the app wasn't sure of, with every caption a tap away. */
export function QuickWords({ captions, seek }: { captions: Caption[]; seek: (t: number) => void }) {
  const tokens = useEditor((s) => s.doc?.tokens);
  const script = useEditor((s) => s.doc?.script);
  const gaps = useEditor((s) => s.project?.speechGaps ?? []);
  const [all, setAll] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const doubts = useMemo(() => (tokens && script ? findDoubts(captions, tokens, script) : new Map<string, Token[]>()), [captions, tokens, script]);

  const shown = all ? captions : captions.filter((c) => doubts.has(c.id) || c.id === editing);
  const count = doubts.size;

  return (
    <>
      <p className="quick-lead" id="words-summary">
        {count ? `Check ${count} ${count === 1 ? 'caption' : 'captions'}. The highlighted words are the ones the app wasn't sure about.` : 'All words look right. Tap Show all to read or change any caption.'}
      </p>
      {gaps.map((gap) => (
        <div className="gap-warning" key={gap.start}>
          Speech may be missing around {stamp(gap.start)}.
          <button onClick={() => seek(gap.start)}>Listen to this part</button>
        </div>
      ))}
      {shown.map((caption) => (
        <WordCard key={caption.id} caption={caption} doubtful={doubts.get(caption.id)} editing={editing === caption.id} setEditing={setEditing} seek={seek} />
      ))}
      <button className="ghost" id="show-all" onClick={() => setAll(!all)}>
        {all ? 'Show only words to check' : `Show all ${captions.length} captions`}
      </button>
    </>
  );
}
