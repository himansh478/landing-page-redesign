import {
  ALL_FORMATS,
  Conversion,
  EncodedAudioPacketSource,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  FilePathSource,
  FilePathTarget,
  Input,
  Mp4OutputFormat,
  Output,
} from 'mediabunny';

// Makes the hard cases from one clip, without re-encoding. Usage:
//   node scripts/make-test-clips.mjs test-clips/clip.mp4
// clip-rotated.mp4: sideways picture plus a rotation flag, how phones save video.
// clip-long.mp4: the clip looped to at least ten minutes.
const TARGET_SECONDS = 600;
const [source] = process.argv.slice(2);
const base = source.replace(/\.mp4$/, '');

async function rotated() {
  const input = new Input({ formats: ALL_FORMATS, source: new FilePathSource(source) });
  const output = new Output({ format: new Mp4OutputFormat(), target: new FilePathTarget(`${base}-rotated.mp4`) });
  const conversion = await Conversion.init({ input, output, video: { rotate: 90, allowRotationMetadata: true } });
  await conversion.execute();
  console.log('rotated done');
}

async function looped() {
  const input = new Input({ formats: ALL_FORMATS, source: new FilePathSource(source) });
  const videoTrack = await input.getPrimaryVideoTrack();
  const audioTrack = await input.getPrimaryAudioTrack();
  const duration = await input.computeDuration();
  const loops = Math.ceil(TARGET_SECONDS / duration);

  const output = new Output({ format: new Mp4OutputFormat(), target: new FilePathTarget(`${base}-long.mp4`) });
  const video = new EncodedVideoPacketSource(videoTrack.codec);
  const audio = new EncodedAudioPacketSource(audioTrack.codec);
  output.addVideoTrack(video, { frameRate: 30 });
  output.addAudioTrack(audio);
  await output.start();

  const copy = async (track, target) => {
    const decoderConfig = await track.getDecoderConfig();
    const sink = new EncodedPacketSink(track);
    let offset = 0;
    for (let loop = 0; loop < loops; loop++) {
      let end = offset;
      for await (const packet of sink.packets()) {
        const timestamp = packet.timestamp + offset;
        await target.add(packet.clone({ timestamp }), { decoderConfig });
        end = Math.max(end, timestamp + packet.duration);
      }
      // Each loop starts where the last really ended, so rounding can't run backwards.
      offset = end + 1e-6;
    }
    target.close();
  };

  await Promise.all([copy(videoTrack, video), copy(audioTrack, audio)]);
  await output.finalize();
  console.log(`looped ${loops} times: ${(loops * duration).toFixed(0)} s`);
}

await rotated();
await looped();
