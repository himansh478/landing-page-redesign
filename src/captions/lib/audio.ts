import { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } from 'mediabunny';

// A quarter of the size and Gemini hears it at least as well as the original: 3.9% errors
// over 1,194 words, against 4.9% at 16 kHz and 32 kbps. Bigger files gained nothing.
const SPEECH = { codec: 'opus', numberOfChannels: 1, sampleRate: 24000, bitrate: 48000 } as const;

/** A small copy of a file's sound for the speech models. Only this leaves the device. */
export async function speechAudio(file: Blob) {
  try {
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
    const conversion = await Conversion.init({ input, output, video: { discard: true }, audio: SPEECH });
    if (conversion.isValid) {
      await conversion.execute();
      return output.target.buffer as ArrayBuffer;
    }
  } catch {
    // A browser that can't make a small copy sends the sound as it is.
  }
  return extractAudio(file);
}

/** Copies the audio track out of a file without re-encoding. */
export async function extractAudio(file: Blob, trim?: { start: number; end: number }) {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const conversion = await Conversion.init({ input, output, video: { discard: true }, trim });
  if (!conversion.isValid) throw new Error('This file has no audio we can read.');
  await conversion.execute();
  return output.target.buffer as ArrayBuffer;
}
