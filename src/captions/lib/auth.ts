import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The same Supabase project as the Cwaya site, so one account works on both. Without
// these settings the app runs in local mode, for development: no login and no limits.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const accountsOn = !!supabase;

/** A request to this app's own API, as the person signed in. */
export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const session = supabase && (await supabase.auth.getSession()).data.session;
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);
  return fetch(path, { ...init, headers });
}
