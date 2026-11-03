'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { CaptionList } from '@/captions/components/CaptionList';
import { ExportDialog, type ExportKind } from '@/captions/components/ExportDialog';
import { Preview, type PreviewHandle } from '@/captions/components/Preview';
import { StylePanel } from '@/captions/components/StylePanel';
import { Timeline } from '@/captions/components/Timeline';
import { TopBar } from '@/captions/components/TopBar';
import { buildCaptions } from '@/captions/engine/group';
import { outputSize } from '@/captions/engine/export';
import { useAccount } from '@/captions/lib/account';
import { accountsOn } from '@/captions/lib/auth';
import { useAutosave } from '@/captions/lib/autosave';
import { loadProject, readMedia, saveProject } from '@/captions/lib/storage';
import { newerCloudEdits } from '@/captions/lib/sync';
import { useEditor } from '@/captions/state/editor';
import { playhead } from '@/captions/state/playhead';

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { ready, signedIn, account } = useAccount();
  const load = useEditor((s) => s.load);
  const setWatermark = useEditor((s) => s.setWatermark);
  const project = useEditor((s) => s.project);
  const doc = useEditor((s) => s.doc);
  const notice = useEditor((s) => s.notice);
  const setNotice = useEditor((s) => s.setNotice);
  const previewRef = useRef<PreviewHandle>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [failed, setFailed] = useState(false);
  const [exporting, setExporting] = useState<ExportKind | null>(null);

  useEffect(() => {
    Promise.all([loadProject(id), readMedia(id, 'source')])
      .then(async ([loaded, file]) => {
        const newer = await newerCloudEdits(loaded);
        const latest = newer ? await saveProject({ ...loaded, doc: newer.doc, faces: newer.faces ?? loaded.faces }) : loaded;
        load(latest);
        if (newer) setNotice('Updated with your edits from another device.');
        setVideo(file);
      })
      .catch(() => setFailed(true));
  }, [id, load, setNotice]);

  useEffect(() => {
    if (accountsOn && ready && !signedIn) router.replace(`/ai-caption/login?next=/ai-caption/studio/${id}`);
  }, [ready, signedIn, router, id]);

  // Until the account says otherwise the mark stays on, so nobody exports without it by luck.
  useEffect(() => setWatermark(accountsOn && (account?.watermark ?? true)), [account, setWatermark]);

  useAutosave();

  const captions = useMemo(() => (doc ? buildCaptions(doc) : []), [doc]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (/^(TEXTAREA|INPUT|SELECT)$/.test(target.tagName)) return;
      const { undo, redo, splitCaption } = useEditor.getState();
      const preview = previewRef.current;
      if (e.code === 'Space') {
        e.preventDefault();
        preview?.toggle();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        preview?.step(e.key === 'ArrowLeft' ? -1 : 1, e.shiftKey ? 30 : 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        const time = playhead.get();
        const caption = captions.find((c) => time >= c.words[0].start && time < c.words[c.words.length - 1].end);
        const index = caption?.words.findIndex((w) => w.start >= time) ?? -1;
        if (caption && index > 0) splitCaption(caption.id, index);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [captions]);

  if (failed) {
    return (
      <main className="home">
        <h1>Project not found</h1>
        <p className="lead">It may have been deleted, or browser data may have been cleared.</p>
        <Link href="/ai-caption">Back to your projects</Link>
      </main>
    );
  }
  if (!project || !doc || !video) return <main className="home">Opening project…</main>;

  const size = outputSize(project.media, !!doc.reframe);

  return (
    <>
      <div className="studio">
        <TopBar onExport={setExporting} />
        <CaptionList captions={captions} seek={(t) => previewRef.current?.seek(t)} />
        <Preview key={doc.reframe ? 'vertical' : 'original'} ref={previewRef} video={video} captions={captions} size={size} />
        <StylePanel seek={(t) => previewRef.current?.seek(t)} />
        <Timeline captions={captions} seek={(t) => previewRef.current?.seek(t)} />
      </div>
      <p className="narrow-note">The caption editor needs a wider screen. Open it on a laptop or desktop.</p>
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button className="ghost" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}
      {exporting && previewRef.current && (
        <ExportDialog kind={exporting} captions={captions} preview={previewRef.current} onClose={() => setExporting(null)} />
      )}
    </>
  );
}
