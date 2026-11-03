'use client';

import { useEffect, useState } from 'react';
import { templateList, templates } from '@/captions/engine/templates';
import { renderThumbnails } from '@/captions/engine/thumbnails';
import { SCRIPTS } from '@/captions/lib/project';
import { readFavourites, readSavedStyles, writeFavourites, type SavedStyle } from '@/captions/lib/styles';
import { resolveStyle, useEditor } from '@/captions/state/editor';

/** Caption heights that stay clear of Instagram's buttons and caption text. */
const PLACES = [
  { label: 'Top', anchorY: 0.25 },
  { label: 'Middle', anchorY: 0.5 },
  { label: 'Bottom', anchorY: 0.72 },
];

/** Step one on a phone: the look, where it sits, and how big it is. */
export function QuickStyle() {
  const doc = useEditor((s) => s.doc);
  const language = useEditor((s) => s.project?.language);
  const { setTemplate, applyLook, setStyle, setScript } = useEditor.getState();
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [favourites, setFavourites] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedStyle[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const script = doc?.script;

  // The order is set once, so a tapped card doesn't jump away from under the finger.
  useEffect(() => {
    const liked = readFavourites();
    const current = useEditor.getState().doc?.templateId;
    const rank = (id: string) => (id === current ? 0 : liked.includes(id) ? 1 : 2);
    setFavourites(liked);
    setSaved(readSavedStyles());
    setOrder(templateList.map((t) => t.id).sort((a, b) => rank(a) - rank(b)));
  }, []);

  useEffect(() => {
    renderThumbnails(script === 'hindi' ? 'devanagari' : 'latin').then(setThumbs);
  }, [script]);

  if (!doc || !language) return null;
  const style = resolveStyle(doc);
  const base = templates[doc.templateId]?.fontSize ?? style.fontSize;
  const size = Math.round((style.fontSize / base) * 100);
  const scripts = SCRIPTS[language];

  const toggleFavourite = (id: string) => {
    const next = favourites.includes(id) ? favourites.filter((f) => f !== id) : [...favourites, id];
    setFavourites(next);
    writeFavourites(next);
  };

  return (
    <>
      {saved.length > 0 && (
        <div className="filters" role="group" aria-label="Your saved styles">
          {saved.map((look) => (
            <button key={look.id} onClick={() => applyLook(look)}>
              {look.name}
            </button>
          ))}
        </div>
      )}
      <div className="quick-cards" role="group" aria-label="Caption styles">
        {order.map((id) => {
          const liked = favourites.includes(id);
          const name = templates[id].name;
          return (
            <div className={`card ${id === doc.templateId ? 'on' : ''}`} key={id}>
              <button className="pick" aria-pressed={id === doc.templateId} onClick={() => setTemplate(id)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {thumbs[id] ? <img src={thumbs[id]} alt="" /> : <i className="thumb-wait" aria-hidden />}
                <span>{name}</span>
              </button>
              <button className={`heart ${liked ? 'on' : ''}`} aria-label={`${liked ? 'Remove' : 'Add'} ${name} ${liked ? 'from' : 'to'} favourites`} aria-pressed={liked} onClick={() => toggleFavourite(id)}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                  <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.3 0 4.2 1.4 6 3.6 1.8-2.2 3.7-3.6 6-3.6 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {scripts.length > 1 && (
        <div className="quick-row">
          <span>Captions in</span>
          <div className="segmented" role="group" aria-label="Caption language">
            {scripts.map((s) => (
              <button key={s.id} className={s.id === script ? 'on' : ''} aria-pressed={s.id === script} onClick={() => setScript(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="quick-row">
        <span>Position</span>
        <div className="segmented" role="group" aria-label="Caption position">
          {PLACES.map(({ label, anchorY }) => {
            const on = Math.abs(style.anchorY - anchorY) < 0.02;
            return (
              <button key={label} className={on ? 'on' : ''} aria-pressed={on} onClick={() => setStyle({ anchorY }, 'position')}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="hint">Or drag the caption up or down on the video.</p>

      <label className="quick-row">
        <span>Size</span>
        <input id="quick-size" type="range" min={60} max={160} step={5} value={size} onChange={(e) => setStyle({ fontSize: Math.round((base * Number(e.target.value)) / 100) }, 'size')} />
        <span className="quick-value">{size}%</span>
      </label>
    </>
  );
}
