'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { captionEnd, captionStart, type Caption } from '@/captions/engine/types';
import { useEditor } from '@/captions/state/editor';
import { playhead } from '@/captions/state/playhead';

const MIN_ZOOM = 20;
const MAX_ZOOM = 300;
const WAVE_HEIGHT = 40;
const MIN_LENGTH = 0.1;

type Drag = { id: string; mode: 'move' | 'left' | 'right'; x: number; start: number; end: number; min: number; max: number };

export function Timeline({ captions, seek }: { captions: Caption[]; seek: (t: number) => void }) {
  const project = useEditor((s) => s.project);
  const retime = useEditor((s) => s.retimeCaption);
  const offset = useEditor((s) => s.doc?.offset ?? 0);
  const [zoom, setZoom] = useState(70);
  // Refs, because a quick drag can move before React has re-rendered with the new state.
  const dragRef = useRef<Drag | null>(null);
  const movedRef = useRef<{ id: string; start: number; end: number } | null>(null);
  const [preview, setPreview] = useState<{ id: string; start: number; end: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const duration = project?.media.duration ?? 0;
  const width = Math.max(1, duration * zoom);

  useEffect(() => {
    const update = (time: number) => {
      if (needleRef.current) needleRef.current.style.left = `${time * zoom}px`;
      const scroller = scrollRef.current;
      if (scroller) {
        const x = time * zoom;
        if (x < scroller.scrollLeft || x > scroller.scrollLeft + scroller.clientWidth - 40) scroller.scrollLeft = x - 40;
      }
      setActiveId(captions.find((c) => time >= captionStart(c) && time < captionEnd(c))?.id ?? null);
    };
    update(playhead.get());
    return playhead.subscribe(update);
  }, [zoom, captions]);

  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas || !project) return;
    canvas.width = width;
    canvas.height = WAVE_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#4b4e55';
    const { envelope } = project;
    const perPixel = envelope.length / width;
    for (let x = 0; x < width; x++) {
      const from = Math.floor(x * perPixel);
      const to = Math.max(from + 1, Math.floor((x + 1) * perPixel));
      let peak = -60;
      for (let i = from; i < to; i++) peak = Math.max(peak, envelope[i] ?? -60);
      const height = Math.max(1, ((peak + 60) / 60) * WAVE_HEIGHT);
      ctx.fillRect(x, (WAVE_HEIGHT - height) / 2, 1, height);
    }
  }, [project, width]);

  const timeAt = (e: PointerEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return (e.clientX - box.left) / zoom;
  };

  const begin = (e: PointerEvent<HTMLElement>, caption: Caption, index: number, mode: Drag['mode']) => {
    e.stopPropagation();
    e.preventDefault();
    const start = captionStart(caption);
    const end = caption.words[caption.words.length - 1].end;
    dragRef.current = {
      id: caption.id,
      mode,
      x: e.clientX,
      start,
      end,
      min: index > 0 ? captionEnd(captions[index - 1]) : 0,
      max: index < captions.length - 1 ? captionStart(captions[index + 1]) : duration,
    };
    (e.currentTarget.closest('.track-inner') as HTMLElement).setPointerCapture(e.pointerId);
  };

  const move = (e: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = (e.clientX - drag.x) / zoom;
    let { start, end } = drag;
    if (drag.mode === 'move') {
      const shift = Math.min(drag.max - end, Math.max(drag.min - start, delta));
      start += shift;
      end += shift;
    } else if (drag.mode === 'left') {
      start = Math.min(end - MIN_LENGTH, Math.max(drag.min, start + delta));
    } else {
      end = Math.max(start + MIN_LENGTH, Math.min(drag.max, end + delta));
    }
    movedRef.current = { id: drag.id, start, end };
    setPreview(movedRef.current);
  };

  const finish = () => {
    const drag = dragRef.current;
    const moved = movedRef.current;
    if (drag && moved) retime(moved.id, drag.start - offset, drag.end - offset, moved.start - offset, moved.end - offset);
    dragRef.current = null;
    movedRef.current = null;
    setPreview(null);
  };

  const seconds: number[] = [];
  const stepBy = zoom < 40 ? 5 : zoom < 100 ? 2 : 1;
  for (let s = 0; s < duration; s += stepBy) seconds.push(s);

  return (
    <section className="timeline">
      <div className="timeline-tools">
        <label>
          Zoom{' '}
          <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </label>
        <span>Drag a caption to move it, or its edges to change its length. Space plays, S splits, arrows step one frame.</span>
      </div>
      <div className="track-scroll" ref={scrollRef}>
        <div
          className="track-inner"
          style={{ width }}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
        >
          <div className="ruler" onPointerDown={(e) => seek(timeAt(e))}>
            {seconds.map((s) => (
              <span key={s} style={{ left: s * zoom }}>
                {s}s
              </span>
            ))}
          </div>
          <div className="caption-track">
            {captions.map((caption, index) => {
              const shown = preview?.id === caption.id ? preview : { start: captionStart(caption), end: captionEnd(caption) };
              return (
                <div
                  key={caption.id}
                  className={`block ${caption.id === activeId ? 'active' : ''}`}
                  style={{ left: shown.start * zoom, width: Math.max(4, (shown.end - shown.start) * zoom) }}
                  title={caption.words.map((w) => w.text).join(' ')}
                  onPointerDown={(e) => begin(e, caption, index, 'move')}
                  onDoubleClick={() => seek(captionStart(caption) + 0.001)}
                >
                  <i className="edge left" onPointerDown={(e) => begin(e, caption, index, 'left')} />
                  {caption.words.map((w) => w.text).join(' ')}
                  <i className="edge right" onPointerDown={(e) => begin(e, caption, index, 'right')} />
                </div>
              );
            })}
          </div>
          <canvas className="wave" ref={waveRef} onPointerDown={(e) => seek(timeAt(e))} />
          <div className="needle" ref={needleRef} />
        </div>
      </div>
    </section>
  );
}
