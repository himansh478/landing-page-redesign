-- Course platform schema (Cloudinary video storage + Supabase Auth + Razorpay payments)
-- Run this once in the Supabase SQL Editor: Project -> SQL Editor -> New query -> Run.
-- Safe to re-run: uses IF NOT EXISTS / guarded policies.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────
-- COURSES — public metadata, safe to expose to anyone.
-- ─────────────────────────────────────────────────────────
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text default '',
  price numeric not null default 0,       -- in INR, e.g. 999
  cover_image_url text,
  published boolean not null default false,
  created_at timestamptz default now()
);

alter table courses enable row level security;

drop policy if exists "Public can read published courses" on courses;
create policy "Public can read published courses"
  on courses for select
  using (published = true);

-- No insert/update/delete policy for anon/authenticated: only the
-- service-role key (used server-side by admin actions) can write here.


-- ─────────────────────────────────────────────────────────
-- LESSONS — the actual video content.
-- video_key (a Cloudinary public_id, uploaded with Access Mode: Authenticated)
-- must NEVER reach the browser directly. That is why this table has NO
-- select policy at all for the anon/authenticated roles — only the
-- service-role key can read it. Public-safe lesson lists are served by a
-- server action that selects a safe subset of columns (title, order,
-- thumbnail — never video_key).
-- ─────────────────────────────────────────────────────────
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text default '',
  order_index integer not null default 0,
  duration_seconds integer,
  thumbnail_url text,
  video_key text not null,                -- Cloudinary public_id (authenticated access) — server-side only
  is_free_preview boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now()
);

alter table lessons enable row level security;
-- Intentionally zero policies: locked to the service role only.


-- ─────────────────────────────────────────────────────────
-- COURSE_PURCHASES — who bought what.
-- ─────────────────────────────────────────────────────────
create table if not exists course_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  order_id text unique not null,
  payment_id text,
  amount numeric not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'SUCCESS', 'FAILED')),
  created_at timestamptz default now()
);

alter table course_purchases enable row level security;

drop policy if exists "Users can read their own purchases" on course_purchases;
create policy "Users can read their own purchases"
  on course_purchases for select
  using (auth.uid() = user_id);

-- No insert/update policy: only the service-role key (the create-order route,
-- the local dev-confirm route, and the Razorpay webhook) can write purchase
-- rows. This stops anyone from marking their own purchase "SUCCESS" from
-- the browser console.

create index if not exists idx_lessons_course on lessons(course_id, order_index);
create index if not exists idx_purchases_user on course_purchases(user_id);
create index if not exists idx_purchases_course on course_purchases(course_id);
