import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Warning: Supabase service role credentials are missing. Course admin features and secure video lookups will fail until SUPABASE_SERVICE_ROLE_KEY is set.');
}

// Server-only client. This key bypasses Row Level Security entirely, so it
// can read the `lessons` table (including the private Cloudinary video_key
// column) and write `courses` / `course_purchases` regardless of policy.
//
// NEVER import this file into a 'use client' component, and never send
// anything it returns straight to the browser without filtering out
// sensitive fields (video_key) first.
export const supabaseAdmin = createClient(
  supabaseUrl || 'http://localhost:54321',
  serviceRoleKey || 'missing-service-role-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
);
