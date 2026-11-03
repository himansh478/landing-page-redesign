'use client';

import Link from 'next/link';
import { useState, type RefObject } from 'react';
import type { Caption } from '@/captions/engine/types';
import { useEditor } from '@/captions/state/editor';
import { Preview, type PreviewHandle } from '../Preview';
import { QuickExport } from './QuickExport';
import { QuickStyle } from './QuickStyle';
import { QuickWords } from './QuickWords';

const STEPS = [
  { id: 'style', label: 'Style' },
  { id: 'words', label: 'Words' },
  { id: 'export', label: 'Export' },
] as const;

type Step = (typeof STEPS)[number]['id'];

type Props = {
  video: File;
  captions: Caption[];
  size: { width: number; height: number };
  previewRef: RefObject<PreviewHandle | null>;
  onFullEditor: () => void;
};

/**
 * The phone editor: pick a look, check the words, export. It edits the same project with
 * the same engine as the full editor, so a project can move between the two at any time.
 */
export function QuickMode({ video, captions, size, previewRef, onFullEditor }: Props) {
  const name = useEditor((s) => s.project?.name);
  const reframe = useEditor((s) => !!s.doc?.reframe);
  const canUndo = useEditor((s) => s.past.length > 0);
  const [step, setStep] = useState<Step>('style');
  const seek = (time: number) => previewRef.current?.seek(time);
  const next = STEPS[STEPS.findIndex((s) => s.id === step) + 1];

  return (
    <div className="quick">
      <header className="quick-top">
        <Link href="/ai-caption" aria-label="Back to projects">
          <button className="ghost">Projects</button>
        </Link>
        <span className="name">{name}</span>
        <button className="ghost" id="quick-undo" onClick={() => useEditor.getState().undo()} disabled={!canUndo}>
          Undo
        </button>
        <button className="ghost" id="full-editor" onClick={onFullEditor}>
          Full editor
        </button>
      </header>

      <Preview key={reframe ? 'vertical' : 'original'} ref={previewRef} video={video} captions={captions} size={size} />

      <nav className="quick-steps" role="tablist" aria-label="Steps">
        {STEPS.map(({ id, label }, i) => (
          <button key={id} role="tab" id={`step-${id}`} aria-selected={id === step} className={id === step ? 'on' : ''} onClick={() => setStep(id)}>
            <b>{i + 1}</b> {label}
          </button>
        ))}
      </nav>

      {/* All three stay mounted, so a running export or a half-typed edit survives a change of step. */}
      <section className="quick-panel" role="tabpanel" aria-labelledby={`step-${step}`}>
        <div hidden={step !== 'style'}>
          <QuickStyle />
        </div>
        <div hidden={step !== 'words'}>
          <QuickWords captions={captions} seek={seek} />
        </div>
        <div hidden={step !== 'export'}>
          <QuickExport captions={captions} preview={previewRef} />
        </div>
        {next && (
          <button className="primary quick-next" onClick={() => setStep(next.id)}>
            Next: {next.label}
          </button>
        )}
      </section>
    </div>
  );
}
