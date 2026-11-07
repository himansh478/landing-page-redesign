'use client';

import { useEffect, useRef, useState } from 'react';
import { outputSize, type ExportSettings } from '@/captions/engine/export';
import { soundEvents, soundTrack, soundVolume } from '@/captions/engine/sounds';
import { toSrt } from '@/captions/engine/srt';
import type { Caption } from '@/captions/engine/types';
import { canEncodeVideo } from '@/captions/lib/browser';
import { useEditor } from '@/captions/state/editor';
import type { PreviewHandle } from './Preview';

export type ExportKind = 'mp4' | 'srt' | 'overlay' | 'sounds';

type Finished = { url: string; fileName: string; summary: string };

const TITLES = { mp4: 'Export video', srt: 'Export subtitles', overlay: 'Export transparent captions', sounds: 'Export caption sounds' };

/** Server export sends the whole video, more than a hosted request can carry, so it is local only for now. */
const SERVER_EXPORT = process.env.NODE_ENV === 'development';

export function ExportDialog({ kind, captions, preview, onClose }: { kind: ExportKind; captions: Caption[]; preview: PreviewHandle; onClose: () => void }) {
  const name = useEditor((s) => s.project?.name ?? 'captions');
  const media = useEditor((s) => s.project?.media);
  const reframe = useEditor((s) => !!s.doc?.reframe);
  const behindPerson = useEditor((s) => !!s.doc?.behindPerson);
  const sound = useEditor((s) => s.doc?.sound);
  // These are made at once, with nothing to choose first.
  const instant = kind === 'srt' || kind === 'sounds';
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<Finished | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ExportSettings>({ quality: '1080', fps: 'source' });
  const [onServer, setOnServer] = useState(false);
  const [canEncode, setCanEncode] = useState(true);
  const [running, setRunning] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !instant) return;
    started.current = true;
    if (kind === 'srt') {
      const url = URL.createObjectURL(new Blob([toSrt(captions)], { type: 'application/x-subrip' }));
      setDone({ url, fileName: `${name}.srt`, summary: `${captions.length} captions` });
      return;
    }
    const events = soundEvents(captions, sound);
    if (!events.length) {
      setError('No caption sounds are on. Pick one in the Sound tab first.');
      return;
    }
    const url = URL.createObjectURL(soundTrack(events, soundVolume(sound), media?.duration ?? 0));
    setDone({ url, fileName: `${name} caption sounds.wav`, summary: `${events.length} sounds, timed to the video. Lay it under your captions in Premiere.` });
  }, [kind, instant, captions, name, sound, media]);

  useEffect(() => {
    if (kind !== 'mp4' || !media) return;
    const { width, height } = outputSize(media, reframe, settings.quality);
    canEncodeVideo(width, height).then((able) => {
      setCanEncode(able);
      if (!able && SERVER_EXPORT) setOnServer(true);
    });
  }, [kind, media, reframe, settings.quality]);

  const uploading = onServer && kind === 'mp4' && progress >= 0.5;

  const start = () => {
    setRunning(true);
    const run = kind === 'overlay' ? preview.exportOverlay : onServer ? preview.exportOnServer : preview.exportMp4;
    run(settings, setProgress)
      .then(({ file, seconds, frames }) => {
        const url = URL.createObjectURL(file);
        const size = (file.size / 1048576).toFixed(1);
        const fileName = kind === 'overlay' ? `${name} captions.mov` : `${name} captions.mp4`;
        setDone({ url, fileName, summary: `${frames} frames, ${size} MB, made in ${seconds.toFixed(1)} s` });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'The export failed.'));
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={TITLES[kind]}>
      <div className="dialog">
        <h2>{TITLES[kind]}</h2>
        {error ? (
          <p className="error">{error}</p>
        ) : done ? (
          <p id="export-summary">{done.summary}</p>
        ) : !running && !instant ? (
          <>
            <label className="field">
              Quality
              <select id="quality" value={settings.quality} onChange={(e) => setSettings({ ...settings, quality: e.target.value as ExportSettings['quality'] })}>
                <option value="1080">1080p</option>
                <option value="4k">4K</option>
              </select>
            </label>
            <label className="field">
              Frame rate
              <select id="fps" value={String(settings.fps)} onChange={(e) => setSettings({ ...settings, fps: e.target.value === '60' ? 60 : 'source' })}>
                <option value="source">Same as video</option>
                <option value="60">60 fps</option>
              </select>
            </label>
            {kind === 'mp4' && SERVER_EXPORT && (
              <label className="field">
                Made on
                <select id="where" value={onServer ? 'server' : 'here'} disabled={!canEncode} onChange={(e) => setOnServer(e.target.value === 'server')}>
                  <option value="here">This computer</option>
                  <option value="server">Our server</option>
                </select>
              </label>
            )}
            {!canEncode && (
              <p className="hint">
                {SERVER_EXPORT ? 'This browser can’t make the video by itself, so our server will finish it.' : 'This browser can’t make this video. Please use Chrome or Edge on a computer.'}
              </p>
            )}
            {kind === 'mp4' && onServer && (
              <p className="hint" id="server-consent">
                Your video will be uploaded to make this export, and deleted as soon as it&apos;s done.
                {behindPerson && " Text behind the person needs Chrome or Edge on a computer, so here it goes in front."}
              </p>
            )}
            {kind === 'overlay' && <p className="hint">Only the captions, on transparency. Drop it above your video in Premiere.</p>}
            {kind === 'overlay' && behindPerson && <p className="hint">Text behind the person needs the video, so this file leaves it out.</p>}
          </>
        ) : (
          <>
            <div className="bar">
              <i style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p>{uploading ? 'Finishing on our server. This can take a few minutes.' : `Making your file: ${Math.round(progress * 100)}%.`} Keep this tab open.</p>
          </>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          {(done || error) && <button onClick={onClose}>Close</button>}
          {!running && !done && !error && !instant && (
            <>
              <button onClick={onClose}>Cancel</button>
              <button id="start-export" className="primary" onClick={start}>
                Export
              </button>
            </>
          )}
          {done && (
            <a href={done.url} download={done.fileName} id="export-link">
              <button className="primary">Save file</button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
