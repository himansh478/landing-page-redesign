import type { Project } from './project';

// Video stays on this device. Each project is a folder in the browser's private
// file system (OPFS): source video, extracted audio and project.json.
const ROOT = 'projects';
const ABANDONED_AFTER = 24 * 60 * 60 * 1000;

async function folder(id?: string, create = false) {
  const opfs = await navigator.storage.getDirectory();
  const projects = await opfs.getDirectoryHandle(ROOT, { create: true });
  return id ? projects.getDirectoryHandle(id, { create }) : projects;
}

async function write(dir: FileSystemDirectoryHandle, name: string, data: Blob | ArrayBuffer | string) {
  const handle = await dir.getFileHandle(name, { create: true });
  const stream = await handle.createWritable();
  await stream.write(data);
  await stream.close();
}

type MediaName = 'source' | 'audio' | 'thumb';

export async function saveMedia(id: string, name: MediaName, data: Blob | ArrayBuffer) {
  // Without this, the browser may clear projects when disk space runs low.
  await navigator.storage.persist();
  await write(await folder(id, true), name, data);
}

export const readMedia = async (id: string, name: MediaName) =>
  (await (await folder(id)).getFileHandle(name)).getFile();

/** Exports are written straight to disk, so a long video never has to fit in memory. */
export const openExport = async (id: string, name: string) => (await (await folder(id, true)).getFileHandle(name, { create: true })).createWritable();

export const readExport = async (id: string, name: string) => (await (await folder(id)).getFileHandle(name)).getFile();

export async function saveProject(project: Project) {
  const saved = { ...project, updatedAt: Date.now() };
  await write(await folder(project.id, true), 'project.json', JSON.stringify(saved));
  return saved;
}

export async function loadProject(id: string): Promise<Project> {
  const dir = await folder(id);
  const file = await (await dir.getFileHandle('project.json')).getFile();
  return JSON.parse(await file.text());
}

export async function listProjects(): Promise<Project[]> {
  const root = await folder();
  const projects: Project[] = [];
  for await (const name of root.keys()) {
    try {
      projects.push(await loadProject(name));
    } catch {
      // No project.json means an upload that never finished, or one still running in
      // another tab, so only a folder left alone for a day is cleared.
      const source = await readMedia(name, 'source').catch(() => null);
      if (source && Date.now() - source.lastModified > ABANDONED_AFTER) await root.removeEntry(name, { recursive: true }).catch(() => {});
    }
  }
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const deleteProject = async (id: string) => (await folder()).removeEntry(id, { recursive: true });
