import { ALL_FORMATS, FilePathSource, Input } from 'mediabunny';

const input = new Input({ formats: ALL_FORMATS, source: new FilePathSource(process.argv[2]) });
const video = await input.getPrimaryVideoTrack();
const audio = await input.getPrimaryAudioTrack();
console.log({
  duration: await input.computeDuration(),
  format: (await input.getFormat()).name,
  video: video && { codec: video.codec, width: video.displayWidth, height: video.displayHeight, rotation: video.rotation },
  audio: audio && { codec: audio.codec, rate: audio.sampleRate, channels: audio.numberOfChannels },
});
