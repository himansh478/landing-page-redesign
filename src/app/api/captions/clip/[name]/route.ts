import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Dev only: hands local test clips and pipeline results to the test page.
const FOLDERS = ['test-clips', 'work'];
const TYPES: Record<string, string> = { '.mp4': 'video/mp4', '.m4a': 'audio/mp4', '.mov': 'video/quicktime', '.json': 'application/json' };

const allowed = (name: string) =>
  process.env.NODE_ENV === 'development' && /^[\w-]+(\.[\w-]+)*$/.test(name) && !!TYPES[path.extname(name)];

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!allowed(name)) return new Response('Not found', { status: 404 });

  for (const folder of FOLDERS) {
    try {
      const body = await readFile(path.join(process.cwd(), folder, name));
      return new Response(body, { headers: { 'Content-Type': TYPES[path.extname(name)] } });
    } catch {
      // Try the next folder.
    }
  }
  return new Response('Not found', { status: 404 });
}

/** Saves a finished export into work/ so it can be opened from disk. */
export async function PUT(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!allowed(name)) return new Response('Not found', { status: 404 });
  await writeFile(path.join(process.cwd(), 'work', name), Buffer.from(await request.arrayBuffer()));
  return new Response(null, { status: 204 });
}
