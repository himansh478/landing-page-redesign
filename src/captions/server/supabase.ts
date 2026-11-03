import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-only. This key passes every database rule, so nothing from here goes to a
// browser unfiltered. Without these settings the app runs in local mode, with no
// accounts and no limits, and only while developing.
export const accountsOn = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

export function admin() {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Calls one of the functions in supabase/caption-schema.sql. */
export async function rpc<T>(name: string, args: Record<string, unknown>) {
  const { data, error } = await admin().rpc(name, args);
  if (error) throw new Error(`${name} failed: ${error.message}`);
  return data as T;
}
