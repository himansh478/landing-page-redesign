import { accountsOn, admin } from './supabase';

export type Viewer = { id: string; email: string | null };

const LOCAL_VIEWER: Viewer = { id: 'local', email: null };
const TEAM_ONLY = 'Cwaya Captions is open to the Cwaya team only for now.';

/** Signed in, but not on the team list. */
const outsiders = new WeakSet<Request>();

/** While the app is open to the team only, ALLOWED_EMAILS lists who may use it. Unset means everyone. */
function onTeam(email: string | null) {
  const team = (process.env.ALLOWED_EMAILS ?? '').split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  return team.length === 0 || (!!email && team.includes(email.toLowerCase()));
}

/** Who sent this request, checked with Supabase. Null means not signed in, or not let in. */
export async function viewerOf(request: Request): Promise<Viewer | null> {
  // Local mode exists for development. A deployed app with no accounts stays locked.
  if (!accountsOn()) return process.env.NODE_ENV === 'development' ? LOCAL_VIEWER : null;

  const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) return null;

  const { data, error } = await admin().auth.getUser(token);
  if (error || !data.user) return null;
  const email = data.user.email ?? null;
  if (!onTeam(email)) {
    outsiders.add(request);
    return null;
  }
  return { id: data.user.id, email };
}

// Someone signed in but not let in hears why, and keeps their session: a 401 would sign them out.
export const signInRequired = (request: Request) =>
  outsiders.has(request) ? Response.json({ error: TEAM_ONLY }, { status: 403 }) : Response.json({ error: 'Please sign in.' }, { status: 401 });
