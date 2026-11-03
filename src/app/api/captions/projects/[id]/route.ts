import { signInRequired, viewerOf } from '@/captions/server/auth';
import { deleteCloudProject, getCloudProject, saveCloudProject } from '@/captions/server/billing';
import { accountsOn } from '@/captions/server/supabase';

// Captions and settings only. Video and audio never come through here.
const LARGEST_PROJECT = 4 * 1024 * 1024;

type Context = { params: Promise<{ id: string }> };

async function open(request: Request, { params }: Context) {
  const viewer = await viewerOf(request);
  if (!viewer) return { blocked: signInRequired(request) };
  if (!accountsOn()) return { blocked: Response.json({ error: 'Accounts are off.' }, { status: 404 }) };

  const { id } = await params;
  if (!/^[\w-]{1,64}$/.test(id)) return { blocked: Response.json({ error: 'Bad project id.' }, { status: 400 }) };
  return { user: viewer.id, id };
}

function readProject(text: string): { name?: unknown; data?: unknown } {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function GET(request: Request, context: Context) {
  const { blocked, user, id } = await open(request, context);
  if (blocked) return blocked;
  const data = await getCloudProject(user, id);
  return data ? Response.json({ data }) : Response.json({ error: 'Not found.' }, { status: 404 });
}

export async function PUT(request: Request, context: Context) {
  const { blocked, user, id } = await open(request, context);
  if (blocked) return blocked;

  const text = await request.text();
  if (text.length > LARGEST_PROJECT) return Response.json({ error: 'Project is too large to sync.' }, { status: 413 });
  const { name, data } = readProject(text);
  if (typeof name !== 'string' || typeof data !== 'object' || data === null) return Response.json({ error: 'Bad project.' }, { status: 400 });

  await saveCloudProject(user, id, name.slice(0, 200), data);
  return Response.json({ ok: true });
}

export async function DELETE(request: Request, context: Context) {
  const { blocked, user, id } = await open(request, context);
  if (blocked) return blocked;
  await deleteCloudProject(user, id);
  return Response.json({ ok: true });
}
