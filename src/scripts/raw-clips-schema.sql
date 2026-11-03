-- Raw clips: catalogue, purchases, and Telegram delivery.
-- Run this once in the Supabase SQL Editor: Project -> SQL Editor -> New query -> Run.
-- Safe to re-run: uses IF NOT EXISTS everywhere.
--
-- Every table here has Row Level Security ON and NO policies, so the public
-- (anon) key used in browsers can't read or change anything. All access goes
-- through the server with the service-role key, which keeps clip storage keys,
-- Telegram message ids and purchase status out of reach.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────
-- CLIPS — what the /raw-clips page lists.
-- The actual file lives either on Cloudinary (r2_video_key) or in the private
-- Telegram storage channel (telegram_message_ids), or both.
-- ─────────────────────────────────────────────────────────
create table if not exists raw_clips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Cinematic',
  description text default '',
  duration text default '',
  tags text default '',
  is_free boolean not null default false,
  is_active boolean not null default true,
  thumbnail_url text default '',
  r2_thumbnail_key text,
  r2_video_key text,
  free_drive_url text,
  paid_drive_url text,
  telegram_message_ids bigint[] not null default '{}',
  download_count int not null default 0,
  created_at timestamptz default now()
);

alter table raw_clips add column if not exists telegram_message_ids bigint[] not null default '{}';
alter table raw_clips enable row level security;

-- ─────────────────────────────────────────────────────────
-- PURCHASES — one row per Razorpay order for a package.
-- telegram_user_id: the Telegram account that claimed this purchase. Once set,
-- only that account can receive these files from the bot.
-- ─────────────────────────────────────────────────────────
create table if not exists raw_clips_purchases (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  payment_id text,
  amount numeric not null,
  package_type text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'SUCCESS', 'FAILED')),
  download_url text,
  telegram_user_id bigint,
  telegram_claimed_at timestamptz,
  created_at timestamptz default now()
);

alter table raw_clips_purchases add column if not exists telegram_user_id bigint;
alter table raw_clips_purchases add column if not exists telegram_claimed_at timestamptz;
alter table raw_clips_purchases enable row level security;

-- ─────────────────────────────────────────────────────────
-- PACKAGES — which Telegram messages make up the Starter / Pro packs.
-- ─────────────────────────────────────────────────────────
create table if not exists raw_clip_packages (
  package_type text primary key check (package_type in ('Starter', 'Pro')),
  telegram_message_ids bigint[] not null default '{}',
  updated_at timestamptz default now()
);

insert into raw_clip_packages (package_type) values ('Starter'), ('Pro')
on conflict (package_type) do nothing;

alter table raw_clip_packages enable row level security;

-- ─────────────────────────────────────────────────────────
-- TELEGRAM LINKS — one-time "open in Telegram" codes for paid files.
-- Created only after a purchase is paid; expire after 24 hours; the first
-- Telegram account to use one is recorded and nobody else can use it.
-- ─────────────────────────────────────────────────────────
create table if not exists telegram_links (
  token text primary key,
  kind text not null check (kind in ('package', 'paid_clip')),
  order_id text not null references raw_clips_purchases (order_id) on delete cascade,
  clip_id uuid references raw_clips (id) on delete cascade,
  expires_at timestamptz not null,
  used_by bigint,
  used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists telegram_links_order_idx on telegram_links (order_id, kind);
alter table telegram_links enable row level security;
