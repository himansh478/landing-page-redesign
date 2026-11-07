import { ALL_FORMATS, BlobSource, Input } from 'mediabunny';
import { autoBreak } from '@/captions/engine/group';
import { templates } from '@/captions/engine/templates';
import { speechAudio } from './audio';
import { api } from './auth';
import { isTooLong, TOO_LONG } from './plans';
import { newId, SCRIPTS, type Project, type Token } from './project';
import { saveMedia, saveProject } from './storage';
import { lastLook } from './styles';
import { pushProject } from './sync';
import { makeThumbnail } from './thumbnail';
import { readVocabulary } from './vocabulary';

export type Stage = 'reading' | 'transcribing' | 'converting' | 'aligning';

const DEFAULT_MAX_WORDS = 3;
/** The host refuses bigger uploads outright, and Safari reports that only as a failed load. */
const LARGEST_UPLOAD = 4 * 1024 * 1024;
const TOO_BIG = "This video's sound is too large to send from this browser. Please try the latest Chrome.";
const CONNECTION_LOST = 'The connection to the caption service dropped. Check your internet, keep this screen open, and try again.';

type ProcessResult = {
  language: 'hi' | 'en';
  tokens: (Omit<Token, 'id' | 'breakBefore'> & { endsPhrase: boolean })[];
  envelope: number[];
  speechGaps: { start: number; end: number }[];
};

/** The account has too few minutes for this video. */
export class OutOfMinutes extends Error {}

// A dropped connection surfaces as "Load failed" or "Failed to fetch", which says nothing useful.
const lost = (): never => {
  throw new Error(CONNECTION_LOST);
};

async function runPipeline(audio: ArrayBuffer, name: string, onStage: (stage: Stage, fraction?: number) => void) {
  if (audio.byteLength > LARGEST_UPLOAD) throw new Error(TOO_BIG);
  const res = await api('/api/captions/process', {
    method: 'POST',
    body: audio,
    headers: {
      'x-vocabulary': encodeURIComponent(JSON.stringify(readVocabulary())),
      'x-project-name': encodeURIComponent(JSON.stringify(name)),
    },
  }).catch(lost);
  if (!res.ok || !res.body) {
    const { error } = (await res.json().catch(() => ({}))) as { error?: string };
    const message = error ?? 'The caption service could not be reached.';
    throw res.status === 402 ? new OutOfMinutes(message) : new Error(message);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let result: ProcessResult | null = null;
  for (;;) {
    const { value, done } = await reader.read().catch(lost);
    if (done) break;
    buffer += value;
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line) continue;
      const event = JSON.parse(line);
      if (event.stage === 'error') throw new Error(event.message);
      if (event.stage === 'done') result = event.result;
      else onStage(event.stage, event.fraction);
    }
  }
  if (!result) throw new Error('The caption service stopped before finishing.');
  return result;
}

/** Upload to finished project: stores the video locally and fetches timed words. */
export async function createProject(file: File, onStage: (stage: Stage, fraction?: number) => void) {
  onStage('reading');
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const [video, audioTrack, duration] = await Promise.all([input.getPrimaryVideoTrack(), input.getPrimaryAudioTrack(), input.computeDuration()]);
  if (!video) throw new Error('No video track found in this file.');
  if (!audioTrack) throw new Error('This video has no sound to caption.');
  if (isTooLong(duration)) throw new Error(TOO_LONG);

  const audio = await speechAudio(file);
  const name = file.name.replace(/\.[^.]+$/, '');
  const { language, tokens, envelope, speechGaps } = await runPipeline(audio, name, onStage);

  const id = newId();
  await saveMedia(id, 'source', file);
  await saveMedia(id, 'audio', audio);
  const thumbnail = await makeThumbnail(file).catch(() => null);
  if (thumbnail) await saveMedia(id, 'thumb', thumbnail);

  const width = video.displayWidth;
  const height = video.displayHeight;
  const seeded = tokens.map((t) => ({ ...t, id: newId(), breakBefore: false }));

  // A new video starts from the last look, so a creator's style carries over by itself.
  const last = lastLook();
  const look = last && templates[last.templateId] ? last : { templateId: 'pop-viral', overrides: {}, maxWords: DEFAULT_MAX_WORDS };

  const now = Date.now();
  const project: Project = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    media: { fileName: file.name, width, height, duration },
    language,
    envelope,
    speechGaps,
    doc: {
      tokens: autoBreak(seeded, look.maxWords),
      script: SCRIPTS[language][0].id,
      templateId: look.templateId,
      overrides: { ...look.overrides, ...(templates[look.templateId].rows ? {} : { anchorY: width > height ? 0.82 : 0.62 }) },
      maxWords: look.maxWords,
      // A creator's sound carries over to the next video, like the rest of the look.
      ...('sound' in look && look.sound ? { sound: look.sound } : {}),
      offset: 0,
    },
  };
  const saved = await saveProject(project);
  await pushProject(saved).catch(() => {});
  return id;
}
