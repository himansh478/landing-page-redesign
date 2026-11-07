import { soundSamples, type SoundEvent } from '@/captions/engine/sounds';
import type { SoundKind } from '@/captions/engine/types';

// Plays caption sounds in the browser, for the preview and for trying a sound in the panel.
// The context starts on the first sound, which always follows a click, as browsers require.
let context: AudioContext | null = null;
const buffers = new Map<SoundKind, AudioBuffer>();

function ready() {
  context ??= new AudioContext();
  return context;
}

function source(ctx: AudioContext, kind: SoundKind, volume: number) {
  let buffer = buffers.get(kind);
  if (!buffer) {
    const samples = soundSamples(kind, ctx.sampleRate);
    buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
    buffer.copyToChannel(samples, 0);
    buffers.set(kind, buffer);
  }
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  node.connect(gain).connect(ctx.destination);
  return node;
}

export function playSound(kind: SoundKind, volume: number) {
  if (volume <= 0) return;
  const ctx = ready();
  void ctx.resume();
  source(ctx, kind, volume).start();
}

/**
 * Lines up every sound still to come on the audio clock, from where the video is now, so they
 * land on time however often the screen redraws. Returns how to call them all off.
 */
export function scheduleSounds(events: SoundEvent[], videoTime: () => number, volume: number) {
  const nodes: AudioBufferSourceNode[] = [];
  let cancelled = false;
  if (volume > 0 && events.length) {
    const ctx = ready();
    void ctx.resume().then(() => {
      if (cancelled) return;
      const now = ctx.currentTime;
      const from = videoTime();
      for (const event of events) {
        if (event.time < from) continue;
        const node = source(ctx, event.kind, volume);
        node.start(now + (event.time - from));
        nodes.push(node);
      }
    });
  }
  return () => {
    cancelled = true;
    for (const node of nodes) {
      try {
        node.stop();
      } catch {
        // Already finished.
      }
      node.disconnect();
    }
  };
}
