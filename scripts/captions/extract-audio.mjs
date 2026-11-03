import { ALL_FORMATS, Conversion, FilePathSource, FilePathTarget, Input, Mp4OutputFormat, Output } from 'mediabunny';

// Copies the audio track out of a video without re-encoding it, so the speech
// services get the original sound and we never upload the picture.
// Optional start and end seconds cut out one part. Usage:
//   node scripts/extract-audio.mjs clip.mp4 out.m4a [start end]
const [src, dest, start, end] = process.argv.slice(2);

const input = new Input({ formats: ALL_FORMATS, source: new FilePathSource(src) });
const output = new Output({ format: new Mp4OutputFormat(), target: new FilePathTarget(dest) });
const trim = start === undefined ? undefined : { start: Number(start), end: end === undefined ? undefined : Number(end) };
const conversion = await Conversion.init({ input, output, video: { discard: true }, trim });
if (!conversion.isValid) throw new Error('Cannot copy audio: ' + JSON.stringify(conversion.discardedTracks));
await conversion.execute();
console.log('saved', dest);
