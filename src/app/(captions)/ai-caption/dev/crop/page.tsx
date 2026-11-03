'use client';

import { useState } from 'react';
import { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } from 'mediabunny';

// Dev tool: crops a landscape test clip to an upright 9:16 one, like a real reel.
// /dev/crop?name=yt-1-b saves <name>-portrait.mp4 into work/.
export default function CropTool() {
  const [status, setStatus] = useState('Ready');

  const run = async () => {
    const name = new URLSearchParams(location.search).get('name') ?? 'yt-1-b';
    setStatus('Cropping…');
    const blob = await fetch(`/api/captions/clip/${name}.mp4`).then((r) => r.blob());
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(blob) });
    const track = await input.getPrimaryVideoTrack();
    if (!track) return setStatus('No video');

    const height = track.displayHeight;
    const width = Math.round((height * 9) / 16 / 2) * 2;
    const left = Math.round((track.displayWidth - width) / 2 / 2) * 2;
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
    const conversion = await Conversion.init({
      input,
      output,
      video: { crop: { left, top: 0, width, height }, codec: 'avc', bitrate: 8_000_000, forceTranscode: true },
    });
    await conversion.execute();

    await fetch(`/api/captions/clip/${name}-portrait.mp4`, { method: 'PUT', body: output.target.buffer as ArrayBuffer });
    setStatus(`Done: ${width}×${height}`);
  };

  return (
    <main className="home">
      <h1>Crop test clip</h1>
      <p id="status">{status}</p>
      <button id="run" onClick={run}>
        Crop to 9:16
      </button>
    </main>
  );
}
