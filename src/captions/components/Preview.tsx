'use client';

import { useEffect, useImperativeHandle, useRef, useState, type PointerEvent, type Ref } from 'react';
import type { TextureSource } from 'canvaskit-wasm';
import { planPositions } from '@/captions/engine/avoid';
import { exportVideo, outputSize, type Crop, type ExportSettings } from '@/captions/engine/export';
import { cameraPath, cropShare, framedFaces } from '@/captions/engine/framing';
import { exportOverlay, sourceFrameRate } from '@/captions/engine/overlay';
import { drawCutout, PersonMask } from '@/captions/engine/segment';
import { createStudio, type Studio } from '@/captions/engine/studio';
import { faceTrack } from '@/captions/engine/tracking';
import type { Caption, Style } from '@/captions/engine/types';
import { currentWatermark } from '@/captions/lib/account';
import { api } from '@/captions/lib/auth';
import { openExport, readExport } from '@/captions/lib/storage';
import { neededFamilies, resolveStyle, useEditor } from '@/captions/state/editor';
import { playhead } from '@/captions/state/playhead';

const FRAME = 1 / 30;
/** Pixels the pointer must travel before a click on a word becomes a drag. */
const DRAG_START = 4;
const CENTRE = 0.5;
/** How near the middle of the frame a dragged caption catches, as a share of its height. */
const CENTRE_SNAP = 0.015;
/** How often the server is told where the vertical frame moves. */
const CAMERA_STEP = 0.2;
/** Part of a server export's progress bar that is the browser's own work. */
const OVERLAY_SHARE = 0.5;

type Exported = { file: File; seconds: number; frames: number };

export type PreviewHandle = {
  toggle(): void;
  seek(time: number): void;
  step(direction: number, frames: number): void;
  exportMp4(settings: ExportSettings, onProgress: (fraction: number) => void): Promise<Exported>;
  exportOverlay(settings: ExportSettings, onProgress: (fraction: number) => void): Promise<Exported>;
  exportOnServer(settings: ExportSettings, onProgress: (fraction: number) => void): Promise<Exported>;
};

const clock = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const f = Math.floor((t % 1) * 100);
  return `${m}:${String(s).padStart(2, '0')}.${String(f).padStart(2, '0')}`;
};

// Video is shown by the browser for smooth playback and synced sound. Captions sit
// on a canvas above it, drawn by the same renderer the export uses.
export function Preview({
  ref,
  video,
  captions,
  size,
}: {
  ref: Ref<PreviewHandle>;
  video: File;
  captions: Caption[];
  size: { width: number; height: number };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const studioRef = useRef<Studio | null>(null);
  const captionsRef = useRef(captions);
  const pressRef = useRef<{ y: number; tokenId?: string; moved: boolean } | null>(null);
  const planRef = useRef<{ key: unknown[]; at: (caption: Caption, time: number) => number } | null>(null);
  const trackRef = useRef<{ faces: unknown; at: ReturnType<typeof faceTrack> } | null>(null);
  const cropRef = useRef<{ faces: unknown; crop: Crop } | null>(null);
  const personRef = useRef<PersonMask | null>(null);
  const exportingRef = useRef(false);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [safe, setSafe] = useState(size.height > size.width);
  const [centred, setCentred] = useState(false);

  const families = useEditor((s) => (s.doc ? neededFamilies(s.doc).join('|') : ''));
  const behind = useEditor((s) => !!s.doc?.behindPerson);
  const blend = useEditor((s) => (s.doc ? resolveStyle(s.doc).blend : 'normal'));
  const videoWidth = useEditor((s) => (s.doc?.reframe && s.project ? 100 / cropShare(s.project.media.width, s.project.media.height) : null));

  useEffect(() => {
    const next = URL.createObjectURL(video);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [video]);

  /** The moving 9:16 window, when a wide video is being reframed. */
  const currentCrop = (): Crop | null => {
    const { doc, project } = useEditor.getState();
    if (!doc?.reframe || !project) return null;
    if (!cropRef.current || cropRef.current.faces !== project.faces) {
      const share = cropShare(project.media.width, project.media.height);
      cropRef.current = { faces: project.faces, crop: { share, leftAt: cameraPath(project.faces, share) } };
    }
    return cropRef.current.crop;
  };

  /** The style for a caption at a time, including any move off a face. */
  const styler = (): ((caption: Caption, time: number) => Style) => {
    const { doc, project } = useEditor.getState();
    const studio = studioRef.current;
    const style = resolveStyle(doc!);
    const faces = project?.faces;
    if (!studio || !faces?.length) return () => style;

    const crop = currentCrop();
    if (doc?.followFace && !crop) {
      if (trackRef.current?.faces !== faces) trackRef.current = { faces, at: faceTrack(faces) };
      const { at } = trackRef.current;
      return (_caption, time) => {
        const { dx, dy } = at(time);
        return { ...style, anchorX: Math.min(0.92, Math.max(0.08, style.anchorX + dx)), anchorY: Math.min(0.95, Math.max(0.05, style.anchorY + dy)) };
      };
    }

    if (!doc?.avoidFaces) return () => style;

    const key = [doc, captionsRef.current, faces];
    if (!planRef.current || planRef.current.key.some((part, i) => part !== key[i])) {
      const measure = (caption: Caption, s: Style) => studio.renderer.measure(caption, s);
      const seen = crop ? framedFaces(faces, crop.leftAt, crop.share) : faces;
      planRef.current = { key, at: planPositions(captionsRef.current, style, seen, measure, size.height > size.width) };
    }
    const { at } = planRef.current;
    return (caption, time) => ({ ...style, anchorY: at(caption, time) });
  };

  const draw = (time: number) => {
    const studio = studioRef.current;
    const { doc } = useEditor.getState();
    if (!studio || !doc || exportingRef.current) return;
    const canvas = studio.surface.getCanvas();
    canvas.clear(studio.ck.TRANSPARENT);
    const styleAt = styler();
    studio.renderer.draw(canvas, captionsRef.current, time, (caption) => styleAt(caption, time));

    const el = videoRef.current;
    const crop = currentCrop();
    const view = { left: crop ? crop.leftAt(time) : 0, share: crop?.share ?? 1 };
    if (crop && el) el.style.left = `${(-view.left / view.share) * 100}%`;

    const person = personRef.current;
    if (doc.behindPerson && person && el && el.readyState >= 2) {
      const { ck, surface } = studio;
      const frame = surface.makeImageFromTextureSource(el as unknown as TextureSource, { width: el.videoWidth, height: el.videoHeight, alphaType: ck.AlphaType.Premul, colorType: ck.ColorType.RGBA_8888, colorSpace: ck.ColorSpace.SRGB });
      const mask = person.read(ck, el);
      if (frame && mask) drawCutout(ck, canvas, frame, mask, view, ck.LTRBRect(0, 0, size.width, size.height));
      mask?.delete();
      frame?.delete();
    }
    if (useEditor.getState().watermark) studio.renderer.drawWatermark(canvas);
    studio.surface.flush();
  };

  const redraw = () => draw(playhead.get());

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    createStudio(canvasEl, size.width, size.height).then(async (studio) => {
      studioRef.current = studio;
      await Promise.all(families.split('|').map((family) => studio.fonts.ensure(family)));
      // Anything drawn while the fonts were loading was measured without them.
      studio.renderer.dispose();
      planRef.current = null;
      redraw();
    });
    // The studio is created once for this canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const studio = studioRef.current;
    if (!studio || !families) return;
    Promise.all(families.split('|').map((family) => studio.fonts.ensure(family))).then(() => {
      studio.renderer.dispose();
      planRef.current = null;
      redraw();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [families]);

  useEffect(() => {
    if (!behind || personRef.current) return;
    PersonMask.create()
      .then((person) => {
        personRef.current = person;
        redraw();
      })
      .catch(() => useEditor.getState().setNotice("Couldn't load the person cutout."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [behind]);

  useEffect(() => {
    captionsRef.current = captions;
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captions]);

  useEffect(() => useEditor.subscribe((s, p) => void ((s.doc !== p.doc || s.project !== p.project || s.watermark !== p.watermark) && redraw())));

  useEffect(() => {
    const show = (time: number) => {
      if (clockRef.current) clockRef.current.textContent = clock(time);
    };
    return playhead.subscribe(show);
  }, []);

  // While playing, follow the video's own clock on every display frame.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      const el = videoRef.current;
      if (el) {
        playhead.set(el.currentTime);
        draw(el.currentTime);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const seek = (time: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(time, el.duration || time));
    playhead.set(el.currentTime);
    draw(el.currentTime);
  };

  /** The captions alone, as a transparent MOV in this project's storage. */
  const renderOverlay = async (settings: ExportSettings, name: string, onProgress: (fraction: number) => void) => {
    const { doc, project } = useEditor.getState();
    if (!doc || !project) throw new Error('The editor is still loading.');
    videoRef.current?.pause();

    const target = outputSize(project.media, !!doc.reframe, settings.quality);
    const fps = settings.fps === 60 ? 60 : await sourceFrameRate(video);
    const watermark = await currentWatermark();
    const writable = await openExport(project.id, name);
    const job = { ...target, fps, duration: project.media.duration, captions: captionsRef.current, styleAt: styler(), watermark, writable, onProgress };
    const result = await exportOverlay(job);
    return { ...result, target, file: await readExport(project.id, name) };
  };

  useImperativeHandle(ref, () => ({
    toggle() {
      const el = videoRef.current;
      if (!el) return;
      if (el.paused) el.play();
      else el.pause();
    },
    seek,
    step(direction, frames) {
      videoRef.current?.pause();
      seek(playhead.get() + direction * frames * FRAME);
    },
    async exportMp4(settings, onProgress) {
      const { doc, project } = useEditor.getState();
      if (!studioRef.current || !doc || !project) throw new Error('The editor is still loading.');
      videoRef.current?.pause();
      exportingRef.current = true;

      // The export has its own canvas, so it can be larger than the preview.
      const target = outputSize(project.media, !!doc.reframe, settings.quality);
      const canvasEl = document.createElement('canvas');
      canvasEl.width = target.width;
      canvasEl.height = target.height;
      try {
        const studio = await createStudio(canvasEl, target.width, target.height);
        const person = doc.behindPerson ? await PersonMask.create() : null;
        const watermark = await currentWatermark();
        const writable = await openExport(project.id, 'export.mp4');
        const job = { video, captions: captionsRef.current, styleAt: styler(), writable, settings, person, watermark, crop: currentCrop(), onProgress };
        const result = await exportVideo(studio, canvasEl, job);
        person?.close();
        studio.renderer.dispose();
        studio.surface.delete();
        return { ...result, file: await readExport(project.id, 'export.mp4') };
      } finally {
        canvasEl.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
        exportingRef.current = false;
        redraw();
      }
    },
    async exportOverlay(settings, onProgress) {
      const { file, seconds, frames } = await renderOverlay(settings, 'captions.mov', onProgress);
      return { file, seconds, frames };
    },
    async exportOnServer(settings, onProgress) {
      const { project } = useEditor.getState();
      if (!project) throw new Error('The editor is still loading.');
      const started = performance.now();
      const { file: overlay, frames, target } = await renderOverlay(settings, 'captions.mov', (part) => onProgress(part * OVERLAY_SHARE));

      const crop = currentCrop();
      const path: { time: number; left: number }[] = [];
      if (crop) for (let time = 0; time < project.media.duration; time += CAMERA_STEP) path.push({ time, left: crop.leftAt(time) });

      const form = new FormData();
      form.set('video', video);
      form.set('overlay', overlay);
      form.set('options', JSON.stringify({ ...target, crop: crop && { share: crop.share, path } }));

      const res = await api('/api/captions/export', { method: 'POST', body: form });
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(error ?? 'The server could not make this video.');
      }

      const writable = await openExport(project.id, 'export.mp4');
      await writable.write(await res.blob());
      await writable.close();
      onProgress(1);
      return { file: await readExport(project.id, 'export.mp4'), seconds: (performance.now() - started) / 1000, frames };
    },
  }));

  // A click on a word selects it, a drag moves the captions, and a click elsewhere plays.
  const grab = (e: PointerEvent<HTMLCanvasElement>) => {
    const studio = studioRef.current;
    if (!studio) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * size.width;
    const y = ((e.clientY - box.top) / box.height) * size.height;
    const time = playhead.get();
    const styleAt = styler();
    const hit = studio.renderer.locate(captionsRef.current, time, (caption) => styleAt(caption, time), x, y);
    if (!hit) {
      useEditor.getState().selectToken(null);
      previewToggle(videoRef.current);
      return;
    }
    pressRef.current = { y: e.clientY, tokenId: hit.caption.words[hit.index].tokenId, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const release = () => {
    const press = pressRef.current;
    pressRef.current = null;
    setCentred(false);
    if (press && !press.moved && press.tokenId) useEditor.getState().selectToken(press.tokenId);
  };

  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    const press = pressRef.current;
    if (!press) return;
    if (!press.moved && Math.abs(e.clientY - press.y) < DRAG_START) return;
    press.moved = true;
    const box = e.currentTarget.getBoundingClientRect();
    const anchorY = Math.min(0.95, Math.max(0.05, (e.clientY - box.top) / box.height));
    const snapped = Math.abs(anchorY - CENTRE) < CENTRE_SNAP;
    setCentred(snapped);
    useEditor.getState().setStyle({ anchorY: snapped ? CENTRE : Math.round(anchorY * 1000) / 1000 }, 'position');
  };

  const ratio = size.width / size.height;

  return (
    <section className="stage">
      <div className="viewport">
        <div className="frame" style={{ aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))` }}>
          {url && (
            <video
              ref={videoRef}
              src={url}
              playsInline
              style={videoWidth ? { position: 'absolute', top: 0, height: '100%', width: `${videoWidth}%`, maxWidth: 'none' } : undefined}
              onLoadedData={(e) => {
                e.currentTarget.currentTime = playhead.get();
                redraw();
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onSeeked={(e) => {
                playhead.set(e.currentTarget.currentTime);
                draw(e.currentTarget.currentTime);
              }}
              onTimeUpdate={(e) => {
                if (!playing) return;
                playhead.set(e.currentTarget.currentTime);
              }}
            />
          )}
          <canvas
            id="stage"
            ref={canvasRef}
            width={size.width}
            height={size.height}
            style={{ mixBlendMode: blend === 'normal' ? undefined : blend }}
            onPointerDown={grab}
            onPointerMove={move}
            onPointerUp={release}
          />
          {safe && (
            <div className="safe" aria-hidden>
              <i style={{ left: 0, right: 0, top: 0, height: '13%' }} />
              <i style={{ left: 0, right: 0, bottom: 0, height: '20%' }} />
              <i style={{ right: 0, top: '13%', bottom: '20%', width: '13%' }} />
            </div>
          )}
          {centred && <i className="centre-line" aria-hidden />}
        </div>
      </div>
      <div className="transport">
        <button onClick={() => previewToggle(videoRef.current)} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <span className="clock" ref={clockRef}>
          0:00.00
        </span>
        <button className={safe ? '' : 'ghost'} aria-pressed={safe} onClick={() => setSafe(!safe)}>
          Safe zone
        </button>
      </div>
    </section>
  );
}

const previewToggle = (el: HTMLVideoElement | null) => {
  if (!el) return;
  if (el.paused) el.play();
  else el.pause();
};
