'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { FONT_FAMILIES, hasDevanagari, weightsOf } from '@/captions/engine/fonts';
import { DEFAULT_SOUND, SOUNDS, soundVolume } from '@/captions/engine/sounds';
import { renderThumbnails } from '@/captions/engine/thumbnails';
import type { Caption, CaptionLook, FontWeightName, SoundKind, Style } from '@/captions/engine/types';
import { tokenText } from '@/captions/lib/project';
import { playSound } from '@/captions/lib/sound-player';
import { captionStyle, resolveStyle, useEditor } from '@/captions/state/editor';
import { FixPanel } from './FixPanel';
import { TemplateGallery } from './TemplateGallery';
import { useFaceScan } from './VideoModes';

const TABS = [
  { id: 'style', label: 'Style' },
  { id: 'adjust', label: 'Adjust' },
  { id: 'word', label: 'Word' },
  { id: 'sound', label: 'Sound' },
  { id: 'review', label: 'Review' },
] as const;

type Tab = (typeof TABS)[number]['id'];

/** Tabs that can change one caption instead of all of them. */
const SCOPED: Tab[] = ['style', 'adjust', 'sound'];

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

/** Follow the video, or on, or off, for one caption. */
function Choice({ label, value, video, onChange }: { label: string; value: boolean | undefined; video: boolean; onChange: (v: boolean | undefined) => void }) {
  const options: { label: string; value: boolean | undefined }[] = [
    { label: `As video (${video ? 'on' : 'off'})`, value: undefined },
    { label: 'On', value: true },
    { label: 'Off', value: false },
  ];
  return (
    <div className="field choice">
      {label}
      <div className="segmented" role="group" aria-label={label}>
        {options.map((option) => (
          <button key={option.label} className={value === option.value ? 'on' : ''} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
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

/** A row of sounds, each played as it's picked so it can be heard before it's kept. */
function SoundPicker({ value, volume, extra, onPick }: { value: string; volume: number; extra: { id: string; name: string }[]; onPick: (id: string) => void }) {
  return (
    <div className="sound-grid" role="group" aria-label="Caption sound">
      {[...extra, ...SOUNDS].map(({ id, name }) => (
        <button
          key={id}
          className={`sound-card ${value === id ? 'on' : ''}`}
          aria-pressed={value === id}
          onClick={() => {
            onPick(id);
            if (SOUNDS.some((s) => s.id === id)) playSound(id as SoundKind, volume);
          }}
        >
          <span aria-hidden>{SOUNDS.some((s) => s.id === id) ? '♪' : '–'}</span>
          {name}
        </button>
      ))}
    </div>
  );
}

function SoundControls({ caption }: { caption: Caption | null }) {
  const doc = useEditor((s) => s.doc);
  const { setSound, setCaptionLook } = useEditor.getState();
  if (!doc) return null;
  const sound = doc.sound;
  const volume = soundVolume(sound);

  if (caption) {
    const own = caption.look?.sound;
    return (
      <div className="tab-body">
        <p className="hint">The sound when this caption appears. &quot;As video&quot; uses the sound picked for all captions.</p>
        <SoundPicker
          value={own ?? 'video'}
          volume={volume}
          extra={[
            { id: 'video', name: 'As video' },
            { id: 'none', name: 'None' },
          ]}
          onPick={(id) => setCaptionLook(caption.id, { sound: id === 'video' ? undefined : (id as SoundKind | 'none') })}
        />
        <Slider
          label="Timing (ms)"
          min={-1000}
          max={1000}
          step={10}
          value={Math.round((caption.look?.soundOffset ?? 0) * 1000)}
          onChange={(v) => setCaptionLook(caption.id, { soundOffset: v === 0 ? undefined : v / 1000 }, 'caption-sound-shift')}
        />
        <p className="hint">Moves only this caption&apos;s sound. You can also drag it on the Sounds track under the timeline&apos;s audio.</p>
      </div>
    );
  }

  const kind = sound?.kind ?? 'none';
  return (
    <div className="tab-body">
      <p className="hint">A short sound each time a caption changes, like professional Reels. It plays in the preview and is mixed into the exported video.</p>
      <SoundPicker value={kind} volume={volume} extra={[{ id: 'none', name: 'None' }]} onPick={(id) => setSound({ ...(sound ? {} : DEFAULT_SOUND), kind: id as SoundKind | 'none' })} />
      {kind !== 'none' && (
        <>
          <div className="field choice">
            Play on
            <div className="segmented" role="group" aria-label="Play the sound on">
              {(['caption', 'word'] as const).map((every) => (
                <button key={every} className={(sound?.every ?? 'caption') === every ? 'on' : ''} aria-pressed={(sound?.every ?? 'caption') === every} onClick={() => setSound({ every })}>
                  {every === 'caption' ? 'Each caption' : 'Each word'}
                </button>
              ))}
            </div>
          </div>
          <Slider label="Volume %" min={0} max={100} step={5} value={Math.round(volume * 100)} onChange={(v) => setSound({ volume: v / 100 }, 'sound-volume')} />
          <Slider label="Timing (ms)" min={-300} max={300} step={10} value={Math.round((sound?.offset ?? 0) * 1000)} onChange={(v) => setSound({ offset: v / 1000 }, 'sound-offset')} />
          <p className="hint">Negative timing plays the sound just before the caption, which often feels tighter. Each caption can also have its own sound: select it and choose &quot;This caption&quot;.</p>
        </>
      )}
    </div>
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

export function StylePanel({ seek, captions }: { seek: (t: number) => void; captions: Caption[] }) {
  const doc = useEditor((s) => s.doc);
  const selected = useEditor((s) => s.selectedToken);
  const selectedCaption = useEditor((s) => s.selectedCaption);
  const { setStyle, setMaxWords, setOffset, setCaptionStyle, setCaptionLook, resetCaption } = useEditor.getState();
  const [tab, setTab] = useState<Tab>('style');
  const [scope, setScope] = useState<'all' | 'caption'>('all');
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const { scan, scanning, progress } = useFaceScan();
  const script = doc?.script;

  useEffect(() => {
    if (selected) setTab('word');
  }, [selected]);

  // Choosing a caption in the list or the timeline turns to it, as choosing a word does.
  useEffect(() => {
    setScope(selectedCaption ? 'caption' : 'all');
  }, [selectedCaption]);

  useEffect(() => {
    renderThumbnails(script === 'hindi' ? 'devanagari' : 'latin').then(setThumbs);
  }, [script]);

  if (!doc) return null;
  const target = scope === 'caption' ? (captions.find((c) => c.id === selectedCaption) ?? null) : null;
  const targetText = target?.words.map((w) => w.text).join(' ') ?? '';
  const style = target ? captionStyle(doc, target.look) : resolveStyle(doc);
  const setAny = (partial: Partial<Style>, key?: string) => (target ? setCaptionStyle(target.id, partial, key) : setStyle(partial, key));
  const set = (key: string) => (partial: Partial<Style>) => setAny(partial, key);
  const look = (field: keyof Pick<CaptionLook, 'avoidFaces' | 'followFace' | 'behindPerson'>, value: boolean | undefined) => {
    if (!target) return;
    setCaptionLook(target.id, { [field]: value });
    if (value && field !== 'behindPerson') scan();
  };

  return (
    <aside className="style">
      <div className="tabs" role="tablist">
        {TABS.map(({ id, label }) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {SCOPED.includes(tab) && (
        <div className="scope">
          <div className="segmented" role="group" aria-label="What to change">
            <button className={!target ? 'on' : ''} aria-pressed={!target} onClick={() => setScope('all')}>
              All captions
            </button>
            <button id="scope-caption" className={target ? 'on' : ''} aria-pressed={!!target} disabled={!selectedCaption} onClick={() => setScope('caption')} title={selectedCaption ? undefined : 'Select a caption in the list or the timeline first'}>
              This caption
            </button>
          </div>
          {target && (
            <div className="scope-caption">
              <span title={targetText}>“{targetText}”</span>
              <button className="ghost" disabled={!target.look} onClick={() => resetCaption(target.id)} title="Make this caption follow the video again">
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'style' ? (
        <TemplateGallery thumbs={thumbs} captionId={target?.id} />
      ) : tab === 'review' ? (
        <FixPanel seek={seek} />
      ) : tab === 'word' ? (
        <div className="tab-body">
          <WordControls />
        </div>
      ) : tab === 'sound' ? (
        <SoundControls caption={target} />
      ) : (
        <div className="tab-body">
          {target && (
            <Group title="Face tools for this caption" open>
              <Choice label="Avoid faces" value={target.look?.avoidFaces} video={!!doc.avoidFaces} onChange={(v) => look('avoidFaces', v)} />
              <Choice label="Follow face" value={target.look?.followFace} video={!!doc.followFace} onChange={(v) => look('followFace', v)} />
              <Choice label="Behind person" value={target.look?.behindPerson} video={!!doc.behindPerson} onChange={(v) => look('behindPerson', v)} />
              {scanning && <p className="hint">Finding faces {Math.round((progress ?? 0) * 100)}%</p>}
            </Group>
          )}

          <Group title="Font" open>
          <label className="field">
            Family
            <select
              value={style.fontFamily}
              onChange={(e) => {
                const family = e.target.value;
                const weights = weightsOf(family);
                setAny({ fontFamily: family, fontWeight: weights[weights.length - 1] });
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
              <select value={style.fontWeight} onChange={(e) => setAny({ fontWeight: e.target.value as FontWeightName })}>
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
            <input type="checkbox" checked={style.uppercase} onChange={(e) => setAny({ uppercase: e.target.checked })} />
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
            <input type="checkbox" checked={style.shine} onChange={(e) => setAny({ shine: e.target.checked })} />
          </label>
          <label className="field">
            Blend
            <select value={style.blend} onChange={(e) => setAny({ blend: e.target.value as Style['blend'] })}>
              <option value="normal">Normal</option>
              <option value="overlay">Overlay</option>
              <option value="screen">Screen</option>
              <option value="soft-light">Soft light</option>
            </select>
          </label>
          </Group>

          <Group title={target ? 'Position' : 'Position and timing'} open>
          <Slider label="Height" min={5} max={95} value={Math.round(style.anchorY * 100)} onChange={(v) => set('position')({ anchorY: v / 100 })} />
          {!target && <Slider label="Words each" min={1} max={8} value={doc.maxWords} onChange={setMaxWords} />}
          {!target && <Slider label="Delay (ms)" min={-500} max={500} step={10} value={Math.round(doc.offset * 1000)} onChange={(v) => setOffset(v / 1000)} />}
          </Group>
        </div>
      )}
    </aside>
  );
}
