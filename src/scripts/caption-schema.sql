-- Cwaya Captions: minutes, payments and project sync.
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- Login uses the same Supabase accounts as the Cwaya site. Browsers can't reach any
-- of this directly: tables have row level security with no policies, and functions
-- run only for the service role, which only the app's server holds. The money logic
-- lives in these functions so that two requests at once can never overspend.

create table if not exists public.caption_credits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id text unique,
  plan_id text not null,
  seconds_total integer not null check (seconds_total > 0),
  seconds_left integer not null check (seconds_left >= 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists caption_credits_user on public.caption_credits (user_id, expires_at);

create table if not exists public.caption_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  seconds integer not null check (seconds > 0),
  from_free integer not null default 0,
  from_credits jsonb not null default '[]',
  refunded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists caption_usage_user on public.caption_usage (user_id, created_at desc);

create table if not exists public.caption_orders (
  order_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  amount_paise integer not null check (amount_paise > 0),
  seconds integer not null check (seconds > 0),
  days integer not null check (days > 0),
  status text not null default 'created' check (status in ('created', 'paid')),
  payment_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists caption_orders_user on public.caption_orders (user_id, created_at desc);

-- Captions and settings only. Video and audio never reach this table.
create table if not exists public.caption_projects (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.caption_credits enable row level security;
alter table public.caption_usage enable row level security;
alter table public.caption_orders enable row level security;
alter table public.caption_projects enable row level security;

-- Free minutes renew on the 1st of each month, India time.
create or replace function public.caption_free_used(p_user uuid)
returns integer language sql stable set search_path = public as $$
  select coalesce(sum(from_free), 0)::integer
  from caption_usage
  where user_id = p_user
    and not refunded
    and created_at >= (date_trunc('month', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata');
$$;

create or replace function public.caption_state(p_user uuid, p_free_seconds integer)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_paid_left integer;
  v_paid_until timestamptz;
begin
  select coalesce(sum(seconds_left), 0)::integer, max(expires_at)
  into v_paid_left, v_paid_until
  from caption_credits
  where user_id = p_user and expires_at > now();

  return jsonb_build_object(
    'freeLeft', greatest(p_free_seconds - caption_free_used(p_user), 0),
    'paidLeft', v_paid_left,
    'paidUntil', v_paid_until,
    -- A pack removes the watermark until it expires, even once its minutes run out.
    'watermark', v_paid_until is null
  );
end;
$$;

-- Takes minutes for one upload: this month's free minutes first, then the pack that
-- expires soonest. Either the whole amount is taken or nothing is.
create or replace function public.caption_spend(p_user uuid, p_seconds integer, p_free_seconds integer, p_label text)
returns jsonb language plpgsql set search_path = public as $$
declare
  v_free_left integer;
  v_paid_left integer;
  v_from_free integer;
  v_needed integer;
  v_take integer;
  v_parts jsonb := '[]';
  v_credit record;
  v_usage bigint;
begin
  if p_seconds <= 0 then
    raise exception 'seconds must be positive';
  end if;

  -- One spend at a time for each person, so parallel uploads can't overdraw.
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));

  v_free_left := greatest(p_free_seconds - caption_free_used(p_user), 0);
  select coalesce(sum(seconds_left), 0)::integer into v_paid_left
  from caption_credits where user_id = p_user and expires_at > now();

  if v_free_left + v_paid_left < p_seconds then
    return jsonb_build_object('ok', false, 'short', p_seconds - v_free_left - v_paid_left);
  end if;

  v_from_free := least(v_free_left, p_seconds);
  v_needed := p_seconds - v_from_free;

  for v_credit in
    select id, seconds_left from caption_credits
    where user_id = p_user and expires_at > now() and seconds_left > 0
    order by expires_at
    for update
  loop
    exit when v_needed = 0;
    v_take := least(v_credit.seconds_left, v_needed);
    update caption_credits set seconds_left = seconds_left - v_take where id = v_credit.id;
    v_parts := v_parts || jsonb_build_object('id', v_credit.id, 'seconds', v_take);
    v_needed := v_needed - v_take;
  end loop;

  insert into caption_usage (user_id, label, seconds, from_free, from_credits)
  values (p_user, p_label, p_seconds, v_from_free, v_parts)
  returning id into v_usage;

  return jsonb_build_object('ok', true, 'usageId', v_usage);
end;
$$;

-- Gives minutes back when a job fails. Doing it twice has no extra effect.
create or replace function public.caption_refund(p_user uuid, p_usage bigint)
returns jsonb language plpgsql set search_path = public as $$
declare
  v_parts jsonb;
  v_part jsonb;
begin
  update caption_usage set refunded = true
  where id = p_usage and user_id = p_user and not refunded
  returning from_credits into v_parts;

  if v_parts is null then
    return jsonb_build_object('ok', false);
  end if;

  for v_part in select * from jsonb_array_elements(v_parts) loop
    update caption_credits
    set seconds_left = seconds_left + (v_part ->> 'seconds')::integer
    where id = (v_part ->> 'id')::bigint and user_id = p_user;
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.caption_open_order(p_order text, p_user uuid, p_plan text, p_amount integer, p_seconds integer, p_days integer)
returns jsonb language plpgsql set search_path = public as $$
begin
  insert into caption_orders (order_id, user_id, plan_id, amount_paise, seconds, days)
  values (p_order, p_user, p_plan, p_amount, p_seconds, p_days);
  return jsonb_build_object('ok', true);
end;
$$;

-- Marks an order paid and adds its minutes, exactly once. The browser's return and
-- Razorpay's webhook can both arrive, in either order, and the second does nothing.
-- p_user is set when a signed-in person confirms: only the buyer can settle it.
create or replace function public.caption_settle_order(p_order text, p_payment text, p_paid_paise integer, p_user uuid default null)
returns jsonb language plpgsql set search_path = public as $$
declare
  v_order caption_orders;
begin
  select * into v_order from caption_orders where order_id = p_order for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unknown-order');
  end if;
  if p_user is not null and v_order.user_id <> p_user then
    return jsonb_build_object('ok', false, 'reason', 'not-yours');
  end if;
  if v_order.status = 'paid' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  if p_paid_paise <> v_order.amount_paise then
    return jsonb_build_object('ok', false, 'reason', 'wrong-amount');
  end if;

  update caption_orders set status = 'paid', payment_id = p_payment, paid_at = now() where order_id = p_order;

  insert into caption_credits (user_id, order_id, plan_id, seconds_total, seconds_left, expires_at)
  values (v_order.user_id, p_order, v_order.plan_id, v_order.seconds, v_order.seconds, now() + make_interval(days => v_order.days));

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.caption_history(p_user uuid, p_limit integer)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'usage', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'seconds', seconds, 'refunded', refunded, 'at', created_at) order by created_at desc)
      from (select * from caption_usage where user_id = p_user order by created_at desc limit p_limit) recent
    ), '[]'),
    'orders', coalesce((
      select jsonb_agg(jsonb_build_object('plan', plan_id, 'amountPaise', amount_paise, 'seconds', seconds, 'at', paid_at) order by paid_at desc)
      from (select * from caption_orders where user_id = p_user and status = 'paid' order by paid_at desc limit p_limit) paid
    ), '[]')
  );
$$;

create or replace function public.caption_project_save(p_user uuid, p_id text, p_name text, p_data jsonb)
returns jsonb language plpgsql set search_path = public as $$
begin
  insert into caption_projects (user_id, id, name, data, updated_at)
  values (p_user, p_id, p_name, p_data, now())
  on conflict (user_id, id) do update set name = excluded.name, data = excluded.data, updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.caption_project_list(p_user uuid)
returns jsonb language sql stable set search_path = public as $$
  select coalesce(jsonb_agg(row order by row.updated_at desc), '[]')
  from (
    select id, name, data -> 'media' as media, updated_at
    from caption_projects
    where user_id = p_user
    order by updated_at desc
    limit 500
  ) row;
$$;

create or replace function public.caption_project_get(p_user uuid, p_id text)
returns jsonb language sql stable set search_path = public as $$
  select data from caption_projects where user_id = p_user and id = p_id;
$$;

create or replace function public.caption_project_delete(p_user uuid, p_id text)
returns jsonb language plpgsql set search_path = public as $$
begin
  delete from caption_projects where user_id = p_user and id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- Supabase lets anyone call public functions unless told otherwise, so every door is
-- closed here and opened only for the server's service role.
do $$
declare
  v_fn text;
begin
  foreach v_fn in array array[
    'caption_free_used(uuid)',
    'caption_state(uuid, integer)',
    'caption_spend(uuid, integer, integer, text)',
    'caption_refund(uuid, bigint)',
    'caption_open_order(text, uuid, text, integer, integer, integer)',
    'caption_settle_order(text, text, integer, uuid)',
    'caption_history(uuid, integer)',
    'caption_project_save(uuid, text, text, jsonb)',
    'caption_project_list(uuid)',
    'caption_project_get(uuid, text)',
    'caption_project_delete(uuid, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', v_fn);
    execute format('grant execute on function public.%s to service_role', v_fn);
  end loop;
end;
$$;

revoke all on public.caption_credits, public.caption_usage, public.caption_orders, public.caption_projects from anon, authenticated;
grant select, insert, update, delete on public.caption_credits, public.caption_usage, public.caption_orders, public.caption_projects to service_role;
