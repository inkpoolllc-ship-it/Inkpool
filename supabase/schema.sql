create extension if not exists "pgcrypto";

-- artists
create table if not exists artists (
  id uuid primary key default auth.uid(),
  email text not null,
  name text,
  brand_color text default '#10b981',
  logo_url text,
  facebook_url text,
  instagram_url text,
  website_url text,
  ref_code text unique,
  referred_by uuid references artists(id) on delete set null,
  referral_bonus_awarded boolean not null default false,
  stripe_customer_id text,
  pool_tokens int not null default 0,
  created_at timestamptz default now()
);

-- pools
create table if not exists pools (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  name text not null,
  status text check (status in ('open','paused','closed')) default 'open',
  rules jsonb not null, -- {price,spots,prize,credit,tokens,transfer}
  created_at timestamptz default now()
);

-- customers (per-artist)
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  name text,
  handle text,
  email text
);

-- entries (buy-ins)
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid references pools(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  amount_cents int not null,
  source text, -- 'stripe'|'admin'
  created_at timestamptz default now()
);

-- ledgers
create table if not exists credits_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  pool_id uuid references pools(id) on delete cascade,
  delta_cents int not null,
  reason text,  -- 'non_winner_credit'|'redeem'|'adjust'
  created_at timestamptz default now()
);

create table if not exists tokens_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  pool_id uuid references pools(id) on delete cascade,
  delta int not null,
  reason text,  -- 'played'|'win_reset'
  created_at timestamptz default now()
);

-- winners + audit
create table if not exists winners (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid references pools(id) on delete cascade,
  customer_id uuid references customers(id),
  method text, -- 'random'|'guaranteed'
  prize_cents int not null,
  created_at timestamptz default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  pool_id uuid,
  type text,
  payload jsonb,
  created_at timestamptz default now()
);

-- requests (client -> artist)
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  customer_id uuid references customers(id),
  pool_id uuid,
  kind text check (kind in ('credit','winner')) not null,
  note text,
  amount_cents int,
  when_text text,
  status text check (status in ('pending','approved','declined','scheduled')) default 'pending',
  created_at timestamptz default now()
);

-- payments (token purchases)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  stripe_session_id text,
  product text,   -- 'token'
  quantity int not null default 1,
  amount_cents int not null,
  created_at timestamptz default now()
);

-- messages (artist <-> client chat)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  sender text check (sender in ('artist','client')) not null,
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

alter table messages enable row level security;
create policy "artist read messages" on messages
  for select using (artist_id = auth.uid());
create policy "artist write messages" on messages
  for insert with check (artist_id = auth.uid() and sender = 'artist');

-- referrals core tables
create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  referrer_customer_id uuid references customers(id) on delete cascade,
  code text not null
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  referrer_customer_id uuid references customers(id) on delete cascade,
  referred_customer_id uuid references customers(id) on delete cascade,
  status text check (status in ('pending','credited')) not null default 'pending',
  first_entry_at timestamptz
);

-- indexes and constraints
create unique index if not exists uq_referrals_pair on referrals(artist_id, referrer_customer_id, referred_customer_id);
alter table referrals
  add constraint no_self_referral check (referrer_customer_id <> referred_customer_id);
create unique index if not exists uq_referrals_credited_once on referrals(artist_id, referred_customer_id) where status = 'credited';
create unique index if not exists uq_referral_codes_owner on referral_codes(artist_id, referrer_customer_id);
create unique index if not exists uq_referral_codes_code on referral_codes(code);

-- award function
create or replace function award_referral_and_maybe_token(
  p_artist uuid,
  p_referrer uuid,
  p_referred uuid,
  p_pool uuid,
  p_credit_cents int default 1000
) returns void
language plpgsql
as $$
declare
  credited_count int;
begin
  update referrals
     set status = 'credited',
         first_entry_at = now()
   where artist_id = p_artist
     and referrer_customer_id = p_referrer
     and referred_customer_id = p_referred
     and status = 'pending';

  if found then
    insert into credits_ledger(customer_id, pool_id, delta_cents, reason)
    values
      (p_referrer, p_pool, p_credit_cents, 'referral_bonus'),
      (p_referred, p_pool, p_credit_cents, 'referral_welcome');

    select count(*) into credited_count
      from referrals
     where artist_id = p_artist
       and referrer_customer_id = p_referrer
       and status = 'credited';

    if credited_count % 5 = 0 then
      perform increment_artist_tokens(p_artist, 1);
      insert into audit_events(artist_id, pool_id, type, payload)
      values (p_artist, p_pool, 'referral_token_awarded',
              jsonb_build_object('referrer_customer_id', p_referrer,
                                 'credited_referrals', credited_count));
    end if;
  end if;
end;
$$;

-- RLS (essentials)
alter table artists enable row level security;
create policy "own artist row"
on artists for all
using (id = auth.uid())
with check (id = auth.uid());

-- helper: add artist_id to tables that have it
do $$ begin
  for r in select tablename from pg_tables where schemaname='public' and tablename in
  ('pools','customers','entries','credits_ledger','tokens_ledger','winners','audit_events','requests','payments')
  loop
    execute format('alter table %I enable row level security;', r.tablename);
  end loop;
end $$;

-- generic read/write by artist
create policy "artist can read own rows" on pools for select using (artist_id = auth.uid());
create policy "artist can write own rows" on pools for insert with check (artist_id = auth.uid());
create policy "artist can update own rows" on pools for update using (artist_id = auth.uid()) with check (artist_id = auth.uid());
-- TODO: repeat similar select/insert/update for: customers, entries, credits_ledger, tokens_ledger, winners, audit_events, requests, payments

-- Explore view for open pools
create or replace view v_open_pools as
select
  p.id as pool_id,
  p.name,
  p.rules,
  p.status,
  p.created_at,
  a.id as artist_id,
  a.name as artist_name,
  a.logo_url,
  a.brand_color,
  coalesce((select count(*) from entries e where e.pool_id = p.id), 0) as entry_count
from pools p
join artists a on a.id = p.artist_id
where p.status = 'open';

-- RPCs for atomic token adjustments
create or replace function decrement_artist_tokens(artist_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update artists
  set pool_tokens = pool_tokens - 1
  where id = decrement_artist_tokens.artist_id
    and pool_tokens > 0;
$$;

create or replace function increment_artist_tokens(artist_id uuid, qty int default 1)
returns void
language sql
security definer
set search_path = public
as $$
  update artists
  set pool_tokens = pool_tokens + qty
  where id = increment_artist_tokens.artist_id;
$$;


