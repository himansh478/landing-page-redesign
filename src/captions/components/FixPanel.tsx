'use client';

import { useMemo, useState } from 'react';
import { api } from '@/captions/lib/auth';
import { findFillers, findMatches, findSilences } from '@/captions/lib/review';
import { tokenText, type Token } from '@/captions/lib/project';
import { syncScripts } from '@/captions/lib/realign';
import { readVocabulary } from '@/captions/lib/vocabulary';
import { useEditor } from '@/captions/state/editor';
import { VocabularyField } from './VocabularyField';

type Suggestion = { tokenId: string; word: string; fix: string; why: string };

const stamp = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

/** The tools for correcting words: find & replace, proofreading, and clean-up. */
export function FixPanel({ seek }: { seek: (t: number) => void }) {
  const doc = useEditor((s) => s.doc);
  const { replaceEverywhere, replaceWord, removeWords } = useEditor.getState();
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  const tokens = doc?.tokens as Token[] | undefined;
  const script = doc?.script;
  const translated = script === 'translated';
  const matches = useMemo(() => (tokens && script && !translated ? findMatches(tokens, script, find).length : 0), [tokens, script, find, translated]);
  const fillers = useMemo(() => (tokens ? findFillers(tokens) : []), [tokens]);
  const silences = useMemo(() => (tokens ? findSilences(tokens) : []), [tokens]);

  if (!doc || !tokens || !script) return null;

  const proofread = async () => {
    setChecking(true);
    setFailed(false);
    try {
      const res = await api('/api/captions/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: tokens.map((t) => tokenText(t, script)), vocabulary: readVocabulary() }),
      });
      if (!res.ok) throw new Error('Proofreading failed');
      const { suggestions: found } = (await res.json()) as { suggestions: { index: number; fix: string; why: string }[] };
      setSuggestions(found.map((s) => ({ tokenId: tokens[s.index].id, word: tokenText(tokens[s.index], script), fix: s.fix, why: s.why })));
    } catch {
      setFailed(true);
    } finally {
      setChecking(false);
    }
  };

  const drop = (tokenId: string) => setSuggestions((list) => list?.filter((s) => s.tokenId !== tokenId) ?? null);

  const accept = (s: Suggestion) => {
    replaceWord(s.tokenId, s.fix);
    syncScripts();
    drop(s.tokenId);
  };

  const replaceAll = () => {
    replaceEverywhere(find, replace);
    syncScripts();
    setFind('');
    setReplace('');
  };

  return (
    <div className="tab-body fix">
      <div className="section-label">Find and replace</div>
      {translated ? (
        <p className="hint">Switch to Hinglish or हिन्दी to replace words.</p>
      ) : (
        <>
          <input id="find" aria-label="Find" placeholder="Find a word or phrase" value={find} onChange={(e) => setFind(e.target.value)} />
          <input id="replace" aria-label="Replace with" placeholder="Replace with" value={replace} onChange={(e) => setReplace(e.target.value)} />
          <button id="replace-all" disabled={!matches || !replace.trim()} onClick={replaceAll}>
            {find.trim() ? `Replace ${matches} ${matches === 1 ? 'match' : 'matches'}` : 'Replace all'}
          </button>
        </>
      )}

      <div className="section-label">AI proofread</div>
      {!translated && (
        <button id="proofread" disabled={checking} onClick={proofread}>
          {checking ? 'Reading your captions…' : 'Check for mistakes'}
        </button>
      )}
      {failed && <p className="hint">Couldn&apos;t check the captions. Try again in a moment.</p>}
      {suggestions?.length === 0 && <p className="hint">No mistakes found.</p>}
      {suggestions?.map((s) => (
        <div className="suggestion" key={s.tokenId}>
          <div>
            <s>{s.word}</s> → <b>{s.fix}</b>
          </div>
          <small>{s.why}</small>
          <div className="pair">
            <button onClick={() => accept(s)}>Accept</button>
            <button className="ghost" onClick={() => drop(s.tokenId)}>
              Reject
            </button>
          </div>
        </div>
      ))}

      <div className="section-label">Clean up</div>
      {fillers.length === 0 && silences.length === 0 && <p className="hint">No filler words or long pauses found.</p>}
      {fillers.length > 0 && (
        <button id="remove-fillers" onClick={() => removeWords(fillers.map((t) => t.id))}>
          Remove {fillers.length} filler {fillers.length === 1 ? 'word' : 'words'} from captions
        </button>
      )}
      {fillers.map((t) => (
        <button className="ghost line" key={t.id} onClick={() => seek(t.start + 0.001)}>
          {stamp(t.start)} {tokenText(t, script)}
        </button>
      ))}
      {silences.map((s) => (
        <button className="ghost line" key={s.start} onClick={() => seek(s.start)}>
          {stamp(s.start)} pause of {(s.end - s.start).toFixed(1)} s
        </button>
      ))}

      <div className="section-label">Vocabulary</div>
      <VocabularyField />
    </div>
  );
}
