'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { captionEnd, captionStart, type Caption } from '@/captions/engine/types';
import { tokenText } from '@/captions/lib/project';
import { realignPending, syncScripts } from '@/captions/lib/realign';
import { useEditor } from '@/captions/state/editor';
import { playhead } from '@/captions/state/playhead';

const LOW_SCORE = 0.15;

const stamp = (t: number) => {
  const m = Math.floor(t / 60);
  return `${m}:${(t % 60).toFixed(2).padStart(5, '0')}`;
};

type RowProps = { caption: Caption; active: boolean; hasNext: boolean; doubtful: string; seek: (t: number) => void };

const wordsKey = (caption: Caption) => caption.words.map((w) => `${w.text}|${w.start}|${w.end}|${w.style ? 1 : 0}`).join('~');

// A long video has hundreds of rows, so each redraws only when its own caption changes.
const Row = memo(RowView, (a, b) => a.active === b.active && a.hasNext === b.hasNext && a.doubtful === b.doubtful && a.caption.id === b.caption.id && wordsKey(a.caption) === wordsKey(b.caption));

const tokenIds = (caption: Caption) => caption.words.flatMap((w) => (w.tokenId ? [w.tokenId] : []));

function RowView({ caption, active, hasNext, doubtful, seek }: RowProps) {
  const text = caption.words.map((w) => w.text).join(' ');
  const [draft, setDraft] = useState(text);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const { editCaption, splitCaption, mergeWithNext, deleteCaption, selectToken, markChecked } = useEditor.getState();
  const selected = useEditor((s) => (active ? s.selectedToken : null));

  useEffect(() => setDraft(text), [text]);

  useEffect(() => {
    if (active && document.activeElement !== areaRef.current) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const save = () => {
    if (draft.trim() === text) return;
    if (!draft.trim()) {
      setDraft(text);
      return;
    }
    markChecked(tokenIds(caption));
    editCaption(caption.id, draft);
    realignPending();
    syncScripts();
  };

  // Splits at the word the cursor is in.
  const split = () => {
    const cursor = areaRef.current?.selectionStart ?? 0;
    const index = draft.slice(0, cursor).trim().split(/\s+/).filter(Boolean).length;
    splitCaption(caption.id, Math.min(index || 1, caption.words.length - 1));
  };

  return (
    <div className={`row ${active ? 'active' : ''}`} ref={rowRef}>
      <div className="row-head">
        <button className="time" onClick={() => seek(captionStart(caption) + 0.001)}>
          {stamp(captionStart(caption))} – {stamp(captionEnd(caption))}
        </button>
        <div className="row-actions">
          <button className="ghost" onClick={split} disabled={caption.words.length < 2 || !caption.words[0].tokenId} title="Split at the cursor">
            Split
          </button>
          <button className="ghost" onClick={() => mergeWithNext(caption.id)} disabled={!hasNext || !caption.words[0].tokenId} title="Join with the next caption">
            Merge
          </button>
          <button className="ghost" onClick={() => deleteCaption(caption.id)} disabled={!caption.words[0].tokenId} title="Delete this caption">
            Delete
          </button>
        </div>
      </div>
      <textarea
        ref={areaRef}
        rows={1}
        value={draft}
        aria-label={`Caption at ${stamp(captionStart(caption))}`}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => seek(captionStart(caption) + 0.001)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === 'Escape') {
            setDraft(text);
            e.currentTarget.blur();
          }
        }}
      />
      {active && caption.words[0].tokenId && (
        <div className="chips" role="group" aria-label="Style one word">
          {caption.words.map((word) => (
            <button
              key={word.tokenId}
              className={`${word.tokenId === selected ? 'on' : ''} ${word.style ? 'styled' : ''}`}
              aria-pressed={word.tokenId === selected}
              onClick={() => selectToken(word.tokenId ?? null)}
            >
              {word.text}
            </button>
          ))}
        </div>
      )}
      {doubtful && (
        <div className="check">
          Check: {doubtful}
          <button className="ghost" onClick={() => markChecked(tokenIds(caption))}>
            Looks right
          </button>
        </div>
      )}
    </div>
  );
}

export function CaptionList({ captions, seek }: { captions: Caption[]; seek: (t: number) => void }) {
  const gaps = useEditor((s) => s.project?.speechGaps ?? []);
  const tokens = useEditor((s) => s.doc?.tokens);
  const script = useEditor((s) => s.doc?.script);

  const doubts = useMemo(() => {
    const low = new Map<string, string>();
    if (!tokens || !script || script === 'translated') return low;
    const byId = new Map(tokens.map((t) => [t.id, t]));
    // Newer projects know which words the listeners disagreed on. Older ones have only
    // the timing score, which also flags many correct words.
    const compared = tokens.some((t) => t.unsure !== undefined);
    for (const caption of captions) {
      const words = caption.words.flatMap((w) => {
        const token = w.tokenId ? byId.get(w.tokenId) : undefined;
        const doubt = token && (compared ? token.unsure : token.score < LOW_SCORE);
        return doubt ? [tokenText(token, script)] : [];
      });
      if (words.length) low.set(caption.id, words.join(', '));
    }
    return low;
  }, [tokens, script, captions]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const update = (time: number) => {
      const current = captions.find((c) => time >= captionStart(c) && time < captionEnd(c));
      setActiveId(current?.id ?? null);
    };
    update(playhead.get());
    return playhead.subscribe(update);
  }, [captions]);

  const nextDoubt = () => {
    const flagged = captions.filter((c) => doubts.has(c.id));
    const after = flagged.find((c) => captionStart(c) > playhead.get() + 0.01) ?? flagged[0];
    if (after) seek(captionStart(after) + 0.001);
  };

  return (
    <aside className="list">
      <div className="list-head">
        <span>Captions {captions.length}</span>
        {doubts.size > 0 ? (
          <button id="next-check" onClick={nextDoubt}>
            Check {doubts.size} next
          </button>
        ) : (
          <span className="all-clear">All checked</span>
        )}
      </div>
      {gaps.map((gap) => (
        <div className="gap-warning" key={gap.start}>
          Speech may be missing around {stamp(gap.start)} – {stamp(gap.end)}.
          <button onClick={() => seek(gap.start)}>Listen to this part</button>
        </div>
      ))}
      <div className="rows">
        {captions.map((caption, i) => (
          <Row key={caption.id} caption={caption} active={caption.id === activeId} hasNext={i < captions.length - 1} doubtful={doubts.get(caption.id) ?? ''} seek={seek} />
        ))}
      </div>
    </aside>
  );
}
