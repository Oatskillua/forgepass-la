begin;

create table if not exists public.reward_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  available_points integer not null default 0 check (available_points >= 0),
  lifetime_points integer not null default 0 check (lifetime_points >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_cost integer not null check (points_cost >= 0),
  inventory integer check (inventory is null or inventory >= 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_id uuid references public.rewards(id) on delete set null,
  transaction_type text not null check (transaction_type in ('earn', 'redeem', 'adjustment', 'expire')),
  points integer not null check (points <> 0),
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('event', 'place', 'transportation', 'city', 'weather', 'safety', 'promotion', 'reward', 'system')),
  title text not null,
  body text not null,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists reward_transactions_user_created_idx on public.reward_transactions(user_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id) where read_at is null;

insert into public.reward_accounts (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  insert into public.user_preferences (user_id) values (new.id);
  insert into public.notification_preferences (user_id) values (new.id);
  insert into public.reward_accounts (user_id) values (new.id);
  return new;
end;
$$;

alter table public.reward_accounts enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_transactions enable row level security;
alter table public.notifications enable row level security;

create policy "users read own reward account" on public.reward_accounts for select using (user_id = auth.uid());
create policy "active rewards are public" on public.rewards for select using (active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy "users read own reward transactions" on public.reward_transactions for select using (user_id = auth.uid());
create policy "users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "users update own notification reads" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users delete own notifications" on public.notifications for delete using (user_id = auth.uid());

commit;
