'use client';

import { useState } from 'react';
import { scanFaces } from '@/captions/engine/faces';
import { readMedia, saveProject } from '@/captions/lib/storage';
import { pushProject } from '@/captions/lib/sync';
import { useEditor } from '@/captions/state/editor';

/** What the video and its person do: vertical crop, and how text behaves around people. */
export function VideoModes() {
  const project = useEditor((s) => s.project);
  const avoid = useEditor((s) => !!s.doc?.avoidFaces);
  const follow = useEditor((s) => !!s.doc?.followFace);
  const behind = useEditor((s) => !!s.doc?.behindPerson);
  const reframe = useEditor((s) => !!s.doc?.reframe);
  const { setAvoidFaces, setOption, setReframe, setFaces, setNotice } = useEditor.getState();
  const [progress, setProgress] = useState<number | null>(null);
  if (!project) return null;

  const scanning = progress !== null;
  const wide = project.media.width > project.media.height;

  const scan = async () => {
    if (project.faces) return;
    try {
      setProgress(0);
      const found = await scanFaces(await readMedia(project.id, 'source'), setProgress);
      setFaces(found);
      const { project: latest, doc } = useEditor.getState();
      if (latest && doc) void pushProject(await saveProject({ ...latest, doc })).catch(() => {});
      if (!found.some((sample) => sample.boxes.length)) setNotice('No faces found in this video, so it stays centred.');
    } catch {
      setAvoidFaces(false);
      setOption({ followFace: false });
      setNotice("Couldn't scan this video for faces.");
    } finally {
      setProgress(null);
    }
  };

  const toggle = (label: string, on: boolean, change: (next: boolean) => void, needsFaces = true, id?: string) => (
    <button
      id={id}
      className={on ? 'on' : ''}
      aria-pressed={on}
      disabled={needsFaces && scanning}
      onClick={() => {
        change(!on);
        if (needsFaces && !on) scan();
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="modes" role="group" aria-label="Video options">
      {wide && toggle('Vertical 9:16', reframe, setReframe, true, 'reframe')}
      {toggle('Avoid faces', avoid, setAvoidFaces)}
      {toggle('Follow face', follow, (followFace) => setOption({ followFace }))}
      {toggle('Behind person', behind, (behindPerson) => setOption({ behindPerson }), false)}
      {scanning && <span className="scan">Finding faces {Math.round((progress ?? 0) * 100)}%</span>}
    </div>
  );
}
