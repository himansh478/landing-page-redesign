import { signInRequired, viewerOf } from '@/captions/server/auth';
import { listCloudProjects } from '@/captions/server/billing';
import { accountsOn } from '@/captions/server/supabase';

export async function GET(request: Request) {
  const viewer = await viewerOf(request);
  if (!viewer) return signInRequired(request);
  if (!accountsOn()) return Response.json({ projects: [] });
  return Response.json({ projects: await listCloudProjects(viewer.id) });
}
