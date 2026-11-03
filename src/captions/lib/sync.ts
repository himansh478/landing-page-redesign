import { ALL_FORMATS, BlobSource, Input } from 'mediabunny';
import { extractAudio } from './audio';
import { accountsOn, api } from './auth';
import type { Project } from './project';
import { saveMedia, saveProject } from './storage';

// Captions and settings follow the account between devices. The video never does: on
// a new device the person picks their own copy of the file again.
type CloudData = Pick<Project, 'createdAt' | 'media' | 'language' | 'doc' | 'speechGaps' | 'envelope' | 'faces'> & { savedAt: number };

export type CloudProject = { id: string; name: string; media: Project['media']; updated_at: string };

/** How far a file's length may differ and still count as the same video. */
const SAME_LENGTH = 1.5;
/** The waveform is only a picture, so the cloud keeps a fixed number of points. */
const WAVE_POINTS = 4000;

function coarse(envelope: number[]) {
  const step = Math.ceil(envelope.length / WAVE_POINTS);
  if (step <= 1) return envelope;
  const points: number[] = [];
  for (let i = 0; i < envelope.length; i += step) points.push(Math.max(...envelope.slice(i, i + step)));
  return points;
}

export async function pushProject(project: Project) {
  if (!accountsOn) return;
  const { id, name, createdAt, updatedAt, media, language, doc, speechGaps, envelope, faces } = project;
  const data: CloudData = { createdAt, savedAt: updatedAt, media, language, doc, speechGaps, envelope: coarse(envelope), faces };
  await api(`/api/captions/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data }),
  });
}

export async function listCloudProjects(): Promise<CloudProject[]> {
  if (!accountsOn) return [];
  const res = await api('/api/captions/projects');
  return res.ok ? (await res.json()).projects : [];
}

export async function deleteCloudProject(id: string) {
  if (accountsOn) await api(`/api/captions/projects/${id}`, { method: 'DELETE' });
}

async function fetchCloudData(id: string) {
  const res = await api(`/api/captions/projects/${id}`);
  return res.ok ? ((await res.json()).data as CloudData) : null;
}

/** Brings a project to this device, using the person's own copy of the video. */
export async function restoreProject(row: CloudProject, file: File) {
  const data = await fetchCloudData(row.id);
  if (!data) throw new Error("Couldn't fetch this project.");

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const length = await input.computeDuration();
  if (Math.abs(length - data.media.duration) > SAME_LENGTH) {
    throw new Error("That doesn't look like the same video: its length is different.");
  }

  await saveMedia(row.id, 'source', file);
  await saveMedia(row.id, 'audio', await extractAudio(file));
  await saveProject({
    id: row.id,
    name: row.name,
    createdAt: data.createdAt,
    updatedAt: data.savedAt,
    media: data.media,
    language: data.language,
    doc: data.doc,
    speechGaps: data.speechGaps,
    envelope: data.envelope,
    faces: data.faces,
  });
}

/** The newer edits, if this project was changed on another device since. */
export async function newerCloudEdits(project: Project) {
  if (!accountsOn) return null;
  const data = await fetchCloudData(project.id).catch(() => null);
  return data && data.savedAt > project.updatedAt ? data : null;
}
