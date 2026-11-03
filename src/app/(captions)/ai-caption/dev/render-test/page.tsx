'use client';

import { useEffect, useRef, useState } from 'react';
import { DURATION, FPS, HEIGHT, WIDTH, exportMp4, renderFrame, verifyExport } from '@/captions/engine/spike';
import { createStudio, type Studio } from '@/captions/engine/studio';

// Rendering regression test: proves frame accuracy and Hindi shaping.
export default function RenderTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const studioRef = useRef<Studio | null>(null);
  const busyRef = useRef(false);
  const [status, setStatus] = useState('Loading engine…');
  const [report, setReport] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    let raf = 0;
    let cancelled = false;
    createStudio(canvasEl, WIDTH, HEIGHT)
      .then(async (studio) => {
        await studio.fonts.ensure('Poppins');
        if (cancelled) return;
        studioRef.current = studio;
        setStatus('Ready');
        const started = performance.now();
        const loop = () => {
          if (!busyRef.current) {
            const t = ((performance.now() - started) / 1000) % DURATION;
            renderFrame(studio, Math.floor(t * FPS));
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch((e) => setStatus(`Failed: ${e instanceof Error ? e.message : e}`));
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const run = async () => {
    const studio = studioRef.current;
    const canvasEl = canvasRef.current;
    if (!studio || !canvasEl || busyRef.current) return;
    busyRef.current = true;
    setReport('');
    try {
      setStatus('Exporting…');
      const result = await exportMp4(studio, canvasEl, (done, total) => setStatus(`Exporting frame ${done} / ${total}`));
      setVideoUrl(URL.createObjectURL(new Blob([result.buffer], { type: 'video/mp4' })));
      setStatus('Verifying every frame…');
      const verdict = await verifyExport(result.buffer);
      setReport(
        JSON.stringify(
          {
            codec: result.codec,
            sizeMB: +(result.buffer.byteLength / 1048576).toFixed(2),
            exportSeconds: +result.seconds.toFixed(1),
            speedTimesRealtime: +result.speed.toFixed(2),
            totalFrames: result.totalFrames,
            ...verdict,
          },
          null,
          2
        )
      );
      setStatus(verdict.allOk ? 'PASS' : 'FAIL');
    } catch (e) {
      setStatus(`Failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <main style={{ display: 'flex', gap: 24, padding: 24, flexWrap: 'wrap' }}>
      <canvas id="stage" ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ height: '85vh', aspectRatio: '9 / 16', background: '#000' }} />
      <section style={{ flex: '1 1 320px', minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Rendering test</h1>
        <p id="status">{status}</p>
        <button id="run" onClick={run} style={{ height: 44, padding: '0 20px', fontWeight: 600 }}>
          Export 1080p60 and verify
        </button>
        {videoUrl && (
          <p>
            <a href={videoUrl} download="render-test.mp4" style={{ color: '#ef8557' }}>
              Save the exported MP4
            </a>
          </p>
        )}
        <pre id="report" style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{report}</pre>
      </section>
    </main>
  );
}
