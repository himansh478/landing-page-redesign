'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { FONT_FAMILIES, hasDevanagari, weightsOf } from '@/captions/engine/fonts';
import { renderThumbnails } from '@/captions/engine/thumbnails';
import type { FontWeightName, Style } from '@/captions/engine/types';
import { tokenText } from '@/captions/lib/project';
import { resolveStyle, useEditor } from '@/captions/state/editor';
import { FixPanel } from './FixPanel';
import { TemplateGallery } from './TemplateGallery';

const TABS = [
  { id: 'style', label: 'Style' },
  { id: 'adjust', label: 'Adjust' },
  { id: 'word', label: 'Word' },
  { id: 'review', label: 'Review' },
] as const;

const opaque = (color: string) => color.slice(0, 7);

function Slider({ label, min, max, step = 1, value, onChange }: { label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="field">
      {label}
      <div className="pair">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <span style={{ minWidth: 34, textAlign: 'right' }}>{value}</span>
      </div>
    </label>
  );
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="field">
      {label}
      <input type="color" value={opaque(value)} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function WordControls() {
  const doc = useEditor((s) => s.doc);
  const selected = useEditor((s) => s.selectedToken);
  const { setWordStyle } = useEditor.getState();
  const token = doc?.tokens.find((t) => t.id === selected);

  if (!doc || !token) return <p className="hint">Click a word in the preview, or in the caption being played, to give it its own look.</p>;
  const style = token.style ?? {};
  const base = resolveStyle(doc);

  return (
    <>
      <div className="section-label">{tokenText(token, doc.script)}</div>
      <Color label="Colour" value={style.color ?? base.activeColor} onChange={(color) => setWordStyle(token.id, { color }, 'word-color')} />
      <label className="field">
        Font
        <select
          value={style.fontFamily ?? ''}
          onChange={(e) => {
            const family = e.target.value;
            const weights = weightsOf(family);
            setWordStyle(token.id, family ? { fontFamily: family, fontWeight: weights[weights.length - 1] } : { fontFamily: undefined, fontWeight: undefined });
          }}
        >
          <option value="">Same as caption</option>
          {FONT_FAMILIES.map((family) => (
            <option key={family} value={family}>
              {family}
              {hasDevanagari(family) ? ' (हिन्दी)' : ''}
            </option>
          ))}
        </select>
      </label>
      <Slider label="Size %" min={50} max={250} step={5} value={Math.round((style.scale ?? 1) * 100)} onChange={(v) => setWordStyle(token.id, { scale: v / 100 }, 'word-size')} />
      <button disabled={!token.style} onClick={() => setWordStyle(token.id, null)}>
        Reset this word
      </button>
    </>
  );
}

function Group({ title, open, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="group" open={open}>
      <summary>{title}</summary>
      {children}
    </details>
  );
}

export function StylePanel({ seek }: { seek: (t: number) => void }) {
  const doc = useEditor((s) => s.doc);
  const selected = useEditor((s) => s.selectedToken);
  const { setStyle, setMaxWords, setOffset } = useEditor.getState();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('style');
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const script = doc?.script;

  useEffect(() => {
    if (selected) setTab('word');
  }, [selected]);

  useEffect(() => {
    renderThumbnails(script === 'hindi' ? 'devanagari' : 'latin').then(setThumbs);
  }, [script]);

  if (!doc) return null;
  const style = resolveStyle(doc);
  const set = (key: string) => (partial: Parameters<typeof setStyle>[0]) => setStyle(partial, key);

  return (
    <aside className="style">
      <div className="tabs" role="tablist">
        {TABS.map(({ id, label }) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'style' ? (
        <TemplateGallery thumbs={thumbs} />
      ) : tab === 'review' ? (
        <FixPanel seek={seek} />
      ) : tab === 'word' ? (
        <div className="tab-body">
          <WordControls />
        </div>
      ) : (
        <div className="tab-body">
          <Group title="Font" open>
          <label className="field">
            Family
            <select
              value={style.fontFamily}
              onChange={(e) => {
                const family = e.target.value;
                const weights = weightsOf(family);
                setStyle({ fontFamily: family, fontWeight: weights[weights.length - 1] });
              }}
            >
              {FONT_FAMILIES.map((family) => (
                <option key={family} value={family}>
                  {family}
                  {hasDevanagari(family) ? ' (हिन्दी)' : ''}
                </option>
              ))}
            </select>
          </label>
          {weightsOf(style.fontFamily).length > 1 && (
            <label className="field">
              Weight
              <select value={style.fontWeight} onChange={(e) => setStyle({ fontWeight: e.target.value as FontWeightName })}>
                {weightsOf(style.fontFamily).map((weight) => (
                  <option key={weight}>{weight}</option>
                ))}
              </select>
            </label>
          )}
          <Slider label="Size" min={30} max={220} value={style.fontSize} onChange={(fontSize) => set('size')({ fontSize })} />
          <Slider label="Letter gap" min={-4} max={20} value={style.letterSpacing} onChange={(letterSpacing) => set('spacing')({ letterSpacing })} />
          <label className="field">
            Capitals
            <input type="checkbox" checked={style.uppercase} onChange={(e) => setStyle({ uppercase: e.target.checked })} />
          </label>
          </Group>

          <Group title="Colour" open>
          <Color label="Text" value={style.color} onChange={(color) => set('color')({ color })} />
          <Color label="Spoken word" value={style.activeColor} onChange={(activeColor) => set('active')({ activeColor })} />
          {style.highlight === 'pill' && <Color label="Box" value={style.pillColor} onChange={(pillColor) => set('pill')({ pillColor })} />}
          </Group>

          <Group title="Outline and shadow">
          <Slider
            label="Outline"
            min={0}
            max={30}
            value={style.stroke?.width ?? 0}
            onChange={(width) => set('stroke')({ stroke: width ? { color: style.stroke?.color ?? '#000000', width } : null })}
          />
          {style.stroke && (
            <Color label="Outline colour" value={style.stroke.color} onChange={(color) => set('stroke-color')({ stroke: { ...style.stroke!, color } })} />
          )}
          <Slider
            label="Shadow"
            min={0}
            max={50}
            value={style.shadow?.blur ?? 0}
            onChange={(blur) => set('shadow')({ shadow: blur ? { color: style.shadow?.color ?? '#000000AA', offsetY: style.shadow?.offsetY ?? 6, blur } : null })}
          />
          </Group>

          <Group title="Effects">
          <label className="field">
            Shine
            <input type="checkbox" checked={style.shine} onChange={(e) => setStyle({ shine: e.target.checked })} />
          </label>
          <label className="field">
            Blend
            <select value={style.blend} onChange={(e) => setStyle({ blend: e.target.value as Style['blend'] })}>
              <option value="normal">Normal</option>
              <option value="overlay">Overlay</option>
              <option value="screen">Screen</option>
              <option value="soft-light">Soft light</option>
            </select>
          </label>
          </Group>

          <Group title="Position and timing" open>
          <Slider label="Height" min={5} max={95} value={Math.round(style.anchorY * 100)} onChange={(v) => set('position')({ anchorY: v / 100 })} />
          <Slider label="Words each" min={1} max={8} value={doc.maxWords} onChange={setMaxWords} />
          <Slider label="Delay (ms)" min={-500} max={500} step={10} value={Math.round(doc.offset * 1000)} onChange={(v) => setOffset(v / 1000)} />
          </Group>
        </div>
      )}
    </aside>
  );
}
