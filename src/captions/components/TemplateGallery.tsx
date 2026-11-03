'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { TEMPLATE_GROUPS, groupOf, templateList } from '@/captions/engine/templates';
import { newId } from '@/captions/lib/project';
import { lookOf, readFavourites, readSavedStyles, writeFavourites, writeSavedStyles, type SavedStyle } from '@/captions/lib/styles';
import { useEditor } from '@/captions/state/editor';

const FILTERS = ['All', 'Favourites', ...TEMPLATE_GROUPS] as const;
type Filter = (typeof FILTERS)[number];

/** The template picker: find a look fast, keep the ones you like, save your own. */
export function TemplateGallery({ thumbs }: { thumbs: Record<string, string> }) {
  const doc = useEditor((s) => s.doc);
  const { setTemplate, applyLook } = useEditor.getState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedStyle[]>([]);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setFavourites(readFavourites());
    setSaved(readSavedStyles());
  }, []);

  if (!doc) return null;

  const toggleFavourite = (id: string) => {
    const next = favourites.includes(id) ? favourites.filter((f) => f !== id) : [...favourites, id];
    setFavourites(next);
    writeFavourites(next);
  };

  const updateSaved = (next: SavedStyle[]) => {
    setSaved(next);
    writeSavedStyles(next);
  };

  const saveStyle = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateSaved([{ ...lookOf(doc), id: newId(), name: name.trim() }, ...saved]);
    setName('');
    setNaming(false);
  };

  const words = query.trim().toLowerCase();
  const shown = templateList
    .filter((t) => {
      if (words && !t.name.toLowerCase().includes(words)) return false;
      if (filter === 'All') return true;
      return filter === 'Favourites' ? favourites.includes(t.id) : groupOf(t.id) === filter;
    })
    .sort((a, b) => Number(favourites.includes(b.id)) - Number(favourites.includes(a.id)));

  return (
    <div className="tab-body">
      <div className="saved">
        {saved.map((style) => (
          <div className="saved-row" key={style.id}>
            <button onClick={() => applyLook(style)}>{style.name}</button>
            <button className="ghost" aria-label={`Remove ${style.name}`} onClick={() => updateSaved(saved.filter((s) => s.id !== style.id))}>
              Remove
            </button>
          </div>
        ))}
        {naming ? (
          <form className="saved-row" onSubmit={saveStyle}>
            <input autoFocus aria-label="Style name" placeholder="Name this style" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="primary">Save</button>
          </form>
        ) : (
          <button id="save-style" onClick={() => setNaming(true)}>
            Save current style
          </button>
        )}
      </div>

      <input id="template-search" type="search" aria-label="Search templates" placeholder="Search templates" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="filters" role="group" aria-label="Filter templates">
        {FILTERS.map((name) => (
          <button key={name} className={filter === name ? 'on' : ''} aria-pressed={filter === name} onClick={() => setFilter(name)}>
            {name}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p className="hint">{filter === 'Favourites' && !words ? 'Tap the heart on a template to keep it here.' : 'No templates match.'}</p>}
      <div className="gallery">
        {shown.map((t) => {
          const liked = favourites.includes(t.id);
          return (
            <div className={`card ${t.id === doc.templateId ? 'on' : ''}`} key={t.id}>
              <button className="pick" onClick={() => setTemplate(t.id)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbs[t.id]} alt="" />
                <span>{t.name}</span>
              </button>
              <button className={`heart ${liked ? 'on' : ''}`} aria-label={`${liked ? 'Remove' : 'Add'} ${t.name} ${liked ? 'from' : 'to'} favourites`} aria-pressed={liked} onClick={() => toggleFavourite(t.id)}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                  <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.3 0 4.2 1.4 6 3.6 1.8-2.2 3.7-3.6 6-3.6 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
