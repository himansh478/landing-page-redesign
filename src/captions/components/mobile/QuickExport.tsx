'use client';

import Link from 'next/link';
import { useEffect, useState, type RefObject } from 'react';
import { encodableQuality, type ExportSettings } from '@/captions/engine/export';
import { toSrt } from '@/captions/engine/srt';
import type { Caption } from '@/captions/engine/types';
import { keepScreenOn } from '@/captions/lib/browser';
import type { Doc } from '@/captions/lib/project';
import { useEditor } from '@/captions/state/editor';
import type { PreviewHandle } from '../Preview';

/** The edit the file was made from, so it stops being offered once anything changes. */
type Finished = { file: File; url: string; summary: string; doc: Doc | null };

/** Step three on a phone: make the MP4, then save it or share it straight to an app. */
export function QuickExport({ captions, preview }: { captions: Caption[]; preview: RefObject<PreviewHandle | null> }) {
  const name = useEditor((s) => s.project?.name ?? 'captions');
  const media = useEditor((s) => s.project?.media);
  const reframe = useEditor((s) => !!s.doc?.reframe);
  const doc = useEditor((s) => s.doc);
  /** Undefined while the phone is being asked what it can make. */
  const [quality, setQuality] = useState<ExportSettings['quality'] | null>();
  const [progress, setProgress] = useState<number | null>(null);
  const [finished, setFinished] = useState<Finished | null>(null);
  const [error, setError] = useState<string | null>(null);
  const done = finished?.doc === doc ? finished : null;

  useEffect(() => {
    if (media) encodableQuality(media, reframe).then(setQuality);
  }, [media, reframe]);

  useEffect(() => () => void (finished && URL.revokeObjectURL(finished.url)), [finished]);

  const start = async () => {
    const handle = preview.current;
    if (!handle || !quality) return;
    setError(null);
    setFinished(null);
    setProgress(0);
    const made = doc;
    const release = await keepScreenOn();
    try {
      const { file, seconds } = await handle.exportMp4({ quality, fps: 'source' }, setProgress);
      const named = new File([file], `${name} captions.mp4`, { type: 'video/mp4' });
      setFinished({ file: named, url: URL.createObjectURL(named), summary: `Made in ${Math.round(seconds)} s, ${(file.size / 1048576).toFixed(1)} MB.`, doc: made });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The export failed.');
    } finally {
      release();
      setProgress(null);
    }
  };

  const share = () => {
    if (done) navigator.share({ files: [done.file], title: name }).catch(() => {});
  };

  const saveSubtitles = () => {
    const url = URL.createObjectURL(new Blob([toSrt(captions)], { type: 'application/x-subrip' }));
    Object.assign(document.createElement('a'), { href: url, download: `${name}.srt` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const canShare = !!done && !!navigator.canShare?.({ files: [done.file] });

  return (
    <>
      {quality === undefined ? (
        <p className="hint">Checking what this phone can make…</p>
      ) : quality === null ? (
        <p className="error">This browser can&apos;t make the video. Try the latest Chrome, or save the subtitle file below.</p>
      ) : (
        <>
          <p className="quick-lead">{quality === '720' ? 'Your video will be 720p, the sharpest this phone can make.' : 'Your video will be made at full quality, ready for Reels.'}</p>
          <button className={done ? 'big' : 'primary big'} id="quick-export" onClick={start} disabled={progress !== null}>
            {done ? 'Export again' : 'Export video'}
          </button>
        </>
      )}

      {done && (
        <div className="quick-done" role="status">
          <p>
            <b>Your video is ready.</b> {done.summary}
          </p>
          <div className="pair">
            <a href={done.url} download={done.file.name} id="quick-save">
              <button className="primary">Save to phone</button>
            </a>
            {canShare && (
              <button className="primary" id="quick-share" onClick={share}>
                Share
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}

      <button className="ghost" onClick={saveSubtitles}>
        Subtitle file (SRT)
      </button>
      <p className="hint">
        Export not working? <Link href="/ai-caption/phone-check">Run a phone check</Link> and send us the report.
      </p>

      {progress !== null && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Making your video">
          <div className="dialog">
            <h2>Making your video</h2>
            <div className="bar">
              <i style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p>{Math.round(progress * 100)}%. Keep this screen open until it finishes.</p>
          </div>
        </div>
      )}
    </>
  );
}
