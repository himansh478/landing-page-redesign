-- Photo & video prompts (Cloudinary media + Supabase rows)
-- Run this once in the Supabase SQL Editor: Project -> SQL Editor -> New query -> Run.
-- Safe to re-run: uses IF NOT EXISTS / guarded policies.

create extension if not exists pgcrypto;

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('photo', 'video')),   -- which page it shows on
  title text not null,
  prompt text not null,                                     -- the prompt text people copy
  uploads text[] not null default '{}',                     -- "upload with the prompt" checklist
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,                                  -- public Cloudinary URL of the result
  media_public_id text,                                     -- Cloudinary public_id (for cleanup)
  poster_url text,                                          -- still frame for video results
  width int,
  height int,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index if not exists prompts_kind_published_idx on prompts (kind, published, sort_order, created_at desc);

alter table prompts enable row level security;

drop policy if exists "Public can read published prompts" on prompts;
create policy "Public can read published prompts"
  on prompts for select
  using (published = true);

-- No insert/update/delete policy for anon/authenticated: only the
-- service-role key (used server-side by admin actions) can write here.
