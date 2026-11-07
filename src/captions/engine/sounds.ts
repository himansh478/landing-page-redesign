import { captionStart, type Caption, type SoundKind, type SoundSettings } from './types';

// Caption sounds are made from scratch with a little signal maths, so there is no sample
// file to license, and the preview and the export play exactly the same samples.

export const SOUNDS: { id: SoundKind; name: string }[] = [
  { id: 'pop', name: 'Pop' },
  { id: 'click', name: 'Click' },
  { id: 'tick', name: 'Tick' },
  { id: 'bubble', name: 'Bubble' },
  { id: 'whoosh', name: 'Whoosh' },
  { id: 'blip', name: 'Blip' },
];

export const DEFAULT_SOUND: SoundSettings = { kind: 'pop', volume: 0.6, every: 'caption', offset: 0 };

/** No sound runs longer than this, so a mix knows how far back one can still be heard. */
export const LONGEST_SOUND = 0.4;

const PEAK = 0.8;
const TAU = 2 * Math.PI;

/** The same "random" hiss every time, so a sound never changes between preview and export. */
function hiss(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 31 - 1;
  };
}

const LENGTHS: Record<SoundKind, number> = { pop: 0.12, click: 0.03, tick: 0.06, bubble: 0.13, whoosh: 0.38, blip: 0.1 };

/** How long a sound lasts, in seconds. */
export const soundLength = (kind: SoundKind) => LENGTHS[kind];

function synthesise(kind: SoundKind, rate: number): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.round(LENGTHS[kind] * rate));
  let phase = 0;

  if (kind === 'pop') {
    // A sine dropping fast in pitch, like a cork.
    for (let i = 0; i < out.length; i++) {
      const t = i / rate;
      phase += (TAU * (180 + 470 * Math.exp(-t / 0.018))) / rate;
      out[i] = Math.sin(phase) * (1 - Math.exp(-t / 0.002)) * Math.exp(-t / 0.03);
    }
  } else if (kind === 'click') {
    // A few milliseconds of bright hiss with a sharp edge.
    const next = hiss(7);
    let previous = 0;
    let high = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / rate;
      const x = next();
      high = 0.6 * (high + x - previous);
      previous = x;
      out[i] = (high * 0.7 + Math.sin(TAU * 3200 * t) * 0.5) * Math.exp(-t / 0.0025);
    }
  } else if (kind === 'tick') {
    // Two short partials, like a wood block.
    for (let i = 0; i < out.length; i++) {
      const t = i / rate;
      out[i] = Math.sin(TAU * 1900 * t) * Math.exp(-t / 0.009) * 0.8 + Math.sin(TAU * 4700 * t) * Math.exp(-t / 0.004) * 0.35;
    }
  } else if (kind === 'bubble') {
    // A pitch rising quickly, like a drop of water.
    for (let i = 0; i < out.length; i++) {
      const t = i / rate;
      phase += (TAU * 280 * Math.pow(1100 / 280, Math.min(1, t / 0.09))) / rate;
      out[i] = Math.sin(phase) * (1 - Math.exp(-t / 0.005)) * Math.exp(-t / 0.04);
    }
  } else if (kind === 'whoosh') {
    // Hiss through a filter sweeping upwards, swelling and fading.
    const next = hiss(11);
    let low = 0;
    let band = 0;
    for (let i = 0; i < out.length; i++) {
      const progress = i / out.length;
      const centre = 500 * Math.pow(7, progress);
      const f = 2 * Math.sin((Math.PI * centre) / rate);
      const high = next() - low - 0.7 * band;
      band += f * high;
      low += f * band;
      out[i] = band * Math.pow(Math.sin(Math.PI * progress), 2);
    }
  } else {
    // Two soft square-ish notes stepping up, like a game pickup.
    const split = Math.round(0.042 * rate);
    for (let i = 0; i < out.length; i++) {
      const second = i >= split;
      const t = (second ? i - split : i) / rate;
      const pitch = second ? 1320 : 880;
      const x = TAU * pitch * t;
      out[i] = (Math.sin(x) + Math.sin(3 * x) / 3) * (1 - Math.exp(-t / 0.002)) * Math.exp(-t / (second ? 0.03 : 0.015));
    }
  }

  let loudest = 0;
  for (const sample of out) loudest = Math.max(loudest, Math.abs(sample));
  if (loudest > 0) for (let i = 0; i < out.length; i++) out[i] *= PEAK / loudest;
  return out;
}

const made = new Map<string, Float32Array<ArrayBuffer>>();

/** One sound as mono samples at `rate`, made once and kept. */
export function soundSamples(kind: SoundKind, rate: number): Float32Array<ArrayBuffer> {
  const key = `${kind}@${rate}`;
  let samples = made.get(key);
  if (!samples) {
    samples = synthesise(kind, rate);
    made.set(key, samples);
  }
  return samples;
}

/** One sound: when it plays, which one, and the caption it belongs to. */
export type SoundEvent = { time: number; kind: SoundKind; captionId: string };

/**
 * When each sound plays, in order. A caption's own sound wins over the video's, and its own
 * timing moves its sounds on top of the video's timing.
 */
export function soundEvents(captions: Caption[], settings: SoundSettings | undefined): SoundEvent[] {
  const events: SoundEvent[] = [];
  for (const caption of captions) {
    const kind = caption.look?.sound ?? settings?.kind ?? 'none';
    if (kind === 'none') continue;
    const offset = (settings?.offset ?? 0) + (caption.look?.soundOffset ?? 0);
    const times = settings?.every === 'word' ? caption.words.map((w) => w.start) : [captionStart(caption)];
    for (const time of times) events.push({ time: Math.max(0, time + offset), kind, captionId: caption.id });
  }
  return events.sort((a, b) => a.time - b.time);
}

/** A sound's outline as a little SVG path across a 0–100 by 0–20 box, for drawing it on a clip. */
export function soundShape(kind: SoundKind) {
  const samples = soundSamples(kind, 8000);
  const points = 40;
  const per = samples.length / points;
  const tops: string[] = [];
  const bottoms: string[] = [];
  for (let p = 0; p < points; p++) {
    let peak = 0;
    for (let i = Math.floor(p * per); i < Math.floor((p + 1) * per); i++) peak = Math.max(peak, Math.abs(samples[i]));
    const x = ((p + 0.5) / points) * 100;
    const h = (peak / PEAK) * 9 + 0.6;
    tops.push(`${x.toFixed(1)},${(10 - h).toFixed(1)}`);
    bottoms.unshift(`${x.toFixed(1)},${(10 + h).toFixed(1)}`);
  }
  return `M0,10 L${tops.join(' L')} L100,10 L${bottoms.join(' L')} Z`;
}

export const soundVolume = (settings: SoundSettings | undefined) => settings?.volume ?? DEFAULT_SOUND.volume;

/** Adds the sounds heard in a block of audio that starts at `start` seconds. Says whether any were. */
export function mixInto(planes: Float32Array[], start: number, rate: number, events: SoundEvent[], volume: number) {
  const frames = planes[0]?.length ?? 0;
  const end = start + frames / rate;
  let heard = false;
  for (const event of events) {
    if (event.time >= end) break;
    if (event.time + LONGEST_SOUND <= start) continue;
    const samples = soundSamples(event.kind, rate);
    const at = Math.round((event.time - start) * rate);
    const from = Math.max(0, -at);
    const to = Math.min(samples.length, frames - at);
    for (const plane of planes) {
      for (let i = from; i < to; i++) plane[at + i] = Math.max(-1, Math.min(1, plane[at + i] + samples[i] * volume));
    }
    heard ||= to > from;
  }
  return heard;
}

/** The sounds alone as a 16-bit WAV, to lay under the captions in another editor. */
export function soundTrack(events: SoundEvent[], volume: number, duration: number, rate = 48000) {
  const frames = Math.ceil(duration * rate);
  const plane = new Float32Array(frames);
  mixInto([plane], 0, rate, events, volume);

  const bytes = new DataView(new ArrayBuffer(44 + frames * 2));
  const text = (at: number, value: string) => [...value].forEach((ch, i) => bytes.setUint8(at + i, ch.charCodeAt(0)));
  text(0, 'RIFF');
  bytes.setUint32(4, 36 + frames * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  bytes.setUint32(16, 16, true);
  bytes.setUint16(20, 1, true);
  bytes.setUint16(22, 1, true);
  bytes.setUint32(24, rate, true);
  bytes.setUint32(28, rate * 2, true);
  bytes.setUint16(32, 2, true);
  bytes.setUint16(34, 16, true);
  text(36, 'data');
  bytes.setUint32(40, frames * 2, true);
  for (let i = 0; i < frames; i++) bytes.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, plane[i])) * 32767), true);
  return new Blob([bytes.buffer], { type: 'audio/wav' });
}
