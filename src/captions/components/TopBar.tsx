'use client';

import Link from 'next/link';
import { useState } from 'react';
import { accountsOn } from '@/captions/lib/auth';
import { SCRIPTS } from '@/captions/lib/project';
import { useEditor } from '@/captions/state/editor';
import type { ExportKind } from './ExportDialog';
import { VideoModes } from './VideoModes';

export function TopBar({ onExport }: { onExport: (kind: ExportKind) => void }) {
  const project = useEditor((s) => s.project);
  const script = useEditor((s) => s.doc?.script);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const { undo, redo, setScript } = useEditor.getState();
  const [open, setOpen] = useState(false);
  if (!project) return null;

  const pick = (kind: ExportKind) => {
    setOpen(false);
    onExport(kind);
  };

  return (
    <header className="topbar">
      <Link href="/ai-caption" className="ghost" aria-label="Back to projects">
        <button className="ghost">Projects</button>
      </Link>
      <span className="name">{project.name}</span>
      <button className="ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        Undo
      </button>
      <button className="ghost" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
        Redo
      </button>
      <VideoModes />
      <div className="spacer" />
      {accountsOn && (
        <Link href="/ai-caption/account">
          <button className="ghost">Account</button>
        </Link>
      )}
      {SCRIPTS[project.language].length > 1 && (
        <div className="segmented" role="group" aria-label="Caption language">
          {SCRIPTS[project.language].map((s) => (
            <button key={s.id} className={s.id === script ? 'on' : ''} aria-pressed={s.id === script} onClick={() => setScript(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="menu">
        <button className="primary" aria-expanded={open} onClick={() => setOpen(!open)}>
          Export
        </button>
        {open && (
          <div className="menu-list">
            <button onClick={() => pick('mp4')}>
              Video with captions
              <small>MP4, up to 4K</small>
            </button>
            <button onClick={() => pick('overlay')}>
              Transparent captions
              <small>MOV with alpha, for Premiere</small>
            </button>
            <button onClick={() => pick('srt')}>
              Subtitle file
              <small>SRT, for Premiere and YouTube</small>
            </button>
            <button onClick={() => pick('sounds')}>
              Caption sounds
              <small>WAV, to lay under the captions in Premiere</small>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
