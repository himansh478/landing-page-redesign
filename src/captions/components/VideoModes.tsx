'use client';

import { useState } from 'react';
import { scanFaces } from '@/captions/engine/faces';
import { readMedia, saveProject } from '@/captions/lib/storage';
import { pushProject } from '@/captions/lib/sync';
import { useEditor } from '@/captions/state/editor';

/** Finds the faces in the video once, when a tool that needs them is first turned on. */
export function useFaceScan() {
  const { setAvoidFaces, setOption, setFaces, setNotice } = useEditor.getState();
  const [progress, setProgress] = useState<number | null>(null);

  const scan = async () => {
    const { project } = useEditor.getState();
    if (!project || project.faces || progress !== null) return;
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

  return { scan, progress, scanning: progress !== null };
}

/** What the video and its person do: vertical crop, and how text behaves around people. */
export function VideoModes() {
  const project = useEditor((s) => s.project);
  const avoid = useEditor((s) => !!s.doc?.avoidFaces);
  const follow = useEditor((s) => !!s.doc?.followFace);
  const behind = useEditor((s) => !!s.doc?.behindPerson);
  const reframe = useEditor((s) => !!s.doc?.reframe);
  const { setAvoidFaces, setOption, setReframe } = useEditor.getState();
  const { scan, progress, scanning } = useFaceScan();
  if (!project) return null;

  const wide = project.media.width > project.media.height;

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
