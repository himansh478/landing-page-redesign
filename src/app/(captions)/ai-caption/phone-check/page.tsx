'use client';

import Link from 'next/link';
import { ALL_FORMATS, BlobSource, BufferTarget, CanvasSource, Input, Mp4OutputFormat, Output, VideoSampleSink } from 'mediabunny';
import { useEffect, useState } from 'react';
import { loadCanvasKit } from '@/captions/engine/studio';
import { chooseFullEditor, fullEditorChosen } from '@/captions/lib/full-editor';

// Phase 1 of the phone plan: what this phone's browser can do for AI Captions, as one
// report the owner can copy and send. Nothing here is uploaded anywhere.

type Result = { name: string; ok: boolean | null; detail: string };

const ENCODINGS = [
  { label: '1080p High 12 Mbps', codec: 'avc1.640033', width: 1080, height: 1920, bitrate: 12_000_000 },
  { label: '1080p Main 8 Mbps', codec: 'avc1.4d0032', width: 1080, height: 1920, bitrate: 8_000_000 },
  { label: '1080p Baseline 8 Mbps', codec: 'avc1.42e032', width: 1080, height: 1920, bitrate: 8_000_000 },
  { label: '720p Main 5 Mbps', codec: 'avc1.4d001f', width: 720, height: 1280, bitrate: 5_000_000 },
  { label: '720p Baseline 5 Mbps', codec: 'avc1.42e01f', width: 720, height: 1280, bitrate: 5_000_000 },
];

const seconds = (from: number) => ((performance.now() - from) / 1000).toFixed(1);
const reason = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 120);

function device(): Result {
  const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { platform?: string; brands?: { brand: string; version: string }[] } };
  const brand = nav.userAgentData?.brands?.find((b) => !/Not.A.Brand|Chromium/i.test(b.brand));
  const browser = brand ? `${brand.brand} ${brand.version}` : navigator.userAgent.match(/(Version\/[\d.]+ (Mobile\/\w+ )?Safari|Firefox\/[\d.]+|Chrome\/[\d.]+)/)?.[0] ?? 'unknown browser';
  const system = nav.userAgentData?.platform || navigator.userAgent.match(/\((?:Linux; )?([^;)]+)/)?.[1] || 'unknown system';
  return {
    name: 'Phone',
    ok: null,
    detail: `${system}, ${browser} | screen ${screen.width}x${screen.height} at ${devicePixelRatio}x | ${navigator.hardwareConcurrency ?? '?'} cores | ${nav.deviceMemory ? `${nav.deviceMemory} GB memory` : 'memory not reported'}`,
  };
}

async function encoderSettings(): Promise<Result> {
  if (typeof VideoEncoder === 'undefined') return { name: 'Video export settings', ok: false, detail: 'This browser cannot make video (no WebCodecs).' };
  const answers = await Promise.all(
    ENCODINGS.map(async ({ label, codec, width, height, bitrate }) => {
      const { supported } = await VideoEncoder.isConfigSupported({ codec, width, height, bitrate, framerate: 30 }).catch(() => ({ supported: false }));
      return `${label} ${supported ? 'yes' : 'no'}`;
    })
  );
  return { name: 'Video export settings', ok: answers.some((a) => a.endsWith('yes')), detail: answers.join(', ') };
}

async function audioSettings(): Promise<Result> {
  if (typeof AudioEncoder === 'undefined') return { name: 'Small speech audio', ok: false, detail: 'Not available, so the original sound is sent (larger upload).' };
  const { supported } = await AudioEncoder.isConfigSupported({ codec: 'opus', sampleRate: 24000, numberOfChannels: 1, bitrate: 48000 }).catch(() => ({ supported: false }));
  return { name: 'Small speech audio', ok: !!supported, detail: supported ? 'Yes, uploads stay small.' : 'No, the original sound is sent (larger upload).' };
}

/** A real two-second MP4, made the way the export makes one. */
async function testVideo(width: number, height: number): Promise<Result> {
  const name = `Test video ${width}x${height}`;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const draw = canvas.getContext('2d');
    if (!draw) return { name, ok: false, detail: 'No 2D canvas.' };
    const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
    const source = new CanvasSource(canvas, { codec: 'avc', bitrate: width >= 1080 ? 8_000_000 : 5_000_000 });
    output.addVideoTrack(source, { frameRate: 30 });
    await output.start();
    const started = performance.now();
    const FRAMES = 60;
    for (let i = 0; i < FRAMES; i++) {
      draw.fillStyle = `hsl(${(i * 6) % 360} 70% 45%)`;
      draw.fillRect(0, 0, width, height);
      draw.fillStyle = '#fff';
      draw.font = `bold ${Math.round(width / 9)}px sans-serif`;
      draw.fillText(`Cwaya ${i + 1}`, width * 0.12, height / 2);
      await source.add(i / 30, 1 / 30);
    }
    await output.finalize();
    const took = (performance.now() - started) / 1000;
    const size = Math.round((output.target.buffer?.byteLength ?? 0) / 1024);
    return { name, ok: true, detail: `${FRAMES} frames in ${took.toFixed(1)} s (${Math.round(FRAMES / took)} frames a second), ${size} KB` };
  } catch (e) {
    return { name, ok: false, detail: reason(e) };
  }
}

async function drawingEngine(): Promise<Result> {
  const name = 'Drawing engine';
  try {
    const started = performance.now();
    const ck = await loadCanvasKit();
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const surface = ck.MakeWebGLCanvasSurface(canvas, ck.ColorSpace.SRGB, { preserveDrawingBuffer: 1 });
    if (!surface) return { name, ok: false, detail: `Loaded in ${seconds(started)} s, but the graphics chip (WebGL) is not available.` };
    surface.getCanvas().clear(ck.Color(239, 133, 87, 1));
    surface.flush();
    surface.delete();
    return { name, ok: true, detail: `Loaded and drew on the graphics chip in ${seconds(started)} s.` };
  } catch (e) {
    return { name, ok: false, detail: reason(e) };
  }
}

async function storage(): Promise<Result> {
  const name = 'Saving projects';
  try {
    const dir = await navigator.storage.getDirectory();
    const handle = await dir.getFileHandle('phone-check.tmp', { create: true });
    if (!('createWritable' in handle)) return { name, ok: false, detail: 'Browser storage exists, but this browser cannot write files to it the way export does.' };
    const writable = await handle.createWritable();
    await writable.write(new Uint8Array(1024 * 1024));
    await writable.close();
    const written = (await handle.getFile()).size;
    await dir.removeEntry('phone-check.tmp');
    const { quota = 0, usage = 0 } = await navigator.storage.estimate();
    const kept = await navigator.storage.persisted?.();
    return {
      name,
      ok: written === 1024 * 1024,
      detail: `Writes work. Space allowed about ${Math.round(quota / 1048576)} MB, ${Math.round(usage / 1048576)} MB used, ${kept ? 'kept safe' : 'may be cleared by the browser'}.`,
    };
  } catch (e) {
    return { name, ok: false, detail: reason(e) };
  }
}

async function screenAwake(): Promise<Result> {
  const name = 'Keep screen on during export';
  const lock = (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
  if (!lock) return { name, ok: false, detail: 'Not available.' };
  try {
    await (await lock.request('screen')).release();
    return { name, ok: true, detail: 'Works.' };
  } catch (e) {
    return { name, ok: false, detail: reason(e) };
  }
}

function sharing(): Result {
  const file = new File([new Uint8Array(16)], 'test.mp4', { type: 'video/mp4' });
  const ok = !!navigator.canShare?.({ files: [file] });
  return { name: 'Share video to apps', ok, detail: ok ? 'Can share a video to Instagram, WhatsApp and others.' : 'Not available; videos can still be saved.' };
}

/** Can this phone read the videos its own camera makes? */
async function ownVideo(file: File): Promise<Result> {
  const name = 'Your own video';
  try {
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
    const track = await input.getPrimaryVideoTrack();
    if (!track) return { name, ok: false, detail: 'No video track found in that file.' };
    const facts = `${track.codec ?? 'unknown format'}, ${track.displayWidth}x${track.displayHeight}, ${(await input.computeDuration()).toFixed(1)} s, ${Math.round(file.size / 1048576)} MB`;
    if (!(await track.canDecode())) return { name, ok: false, detail: `${facts}. This browser cannot read this video format.` };
    const started = performance.now();
    let frames = 0;
    for await (const sample of new VideoSampleSink(track).samples(0, 2)) {
      frames++;
      sample.close();
    }
    return { name, ok: frames > 0, detail: `${facts}. Read ${frames} frames of the first 2 s in ${seconds(started)} s.` };
  } catch (e) {
    return { name, ok: false, detail: reason(e) };
  }
}

export default function PhoneCheck() {
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorOn, setEditorOn] = useState(false);

  useEffect(() => setEditorOn(fullEditorChosen()), []);

  const add = (result: Result) => setResults((all) => [...all, result]);

  const run = async () => {
    setRunning(true);
    setCopied(false);
    setResults([device()]);
    add(await encoderSettings());
    add(await audioSettings());
    const big = await testVideo(1080, 1920);
    add(big);
    if (!big.ok) add(await testVideo(720, 1280));
    add(await drawingEngine());
    add(await storage());
    add(await screenAwake());
    add(sharing());
    setRunning(false);
  };

  const checkVideo = async (file?: File) => {
    if (!file) return;
    setRunning(true);
    add(await ownVideo(file));
    setRunning(false);
  };

  const toggleEditor = () => {
    chooseFullEditor(!editorOn);
    setEditorOn(!editorOn);
  };

  const report = [`Cwaya phone check, ${new Date().toLocaleString('en-IN')}`, ...results.map((r) => `${r.ok === null ? '' : r.ok ? 'OK  ' : 'NO  '}${r.name}: ${r.detail}`)].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="home">
      <h1>Phone check</h1>
      <p className="lead">This tests what your phone can do for AI Captions. It takes about a minute, downloads about 7 MB, and sends nothing anywhere.</p>

      <p>
        <button className="primary" id="run-check" onClick={run} disabled={running}>
          {running ? 'Checking…' : results.length ? 'Run again' : 'Run phone check'}
        </button>
      </p>

      {results.length > 0 && (
        <ul className="check-results">
          {results.map((r, i) => (
            <li key={i}>
              <b>
                {r.ok === null ? '' : r.ok ? 'OK ' : 'NO '}
                {r.name}
              </b>
              <span>{r.detail}</span>
            </li>
          ))}
        </ul>
      )}

      {!running && results.length > 1 && (
        <>
          <label className="pick">
            Also test one of your own videos
            <input type="file" accept="video/*" onChange={(e) => checkVideo(e.target.files?.[0])} />
          </label>
          <p>
            <button className="primary" onClick={copy}>
              {copied ? 'Copied. Paste it to Claude.' : 'Copy report'}
            </button>
          </p>
          <pre className="check-report">{report}</pre>
        </>
      )}

      <p className="notice-line">
        {editorOn ? 'Projects open in the full laptop editor on this phone.' : 'Projects open in Quick Mode on this phone.'}{' '}
        <button className="ghost" onClick={toggleEditor}>
          {editorOn ? 'Use Quick Mode' : 'Use the full editor instead'}
        </button>
      </p>
      <p>
        <Link href="/ai-caption">Back to AI Captions</Link>
      </p>
    </main>
  );
}
