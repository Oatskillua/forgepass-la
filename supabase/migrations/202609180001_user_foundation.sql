begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  avatar_url text,
  home_city text check (char_length(home_city) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  interests text[] not null default '{}',
  travel_modes text[] not null default '{}',
  accessibility_needs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  event_reminders boolean not null default true,
  city_alerts boolean not null default true,
  transportation boolean not null default true,
  rewards boolean not null default true,
  marketing boolean not null default false,
  push_enabled boolean not null default false,
  email_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_external_id text not null,
  place_name text not null,
  place_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, place_external_id)
);

create table if not exists public.saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_external_id text not null,
  event_name text not null,
  event_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, event_external_id)
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  starts_on date,
  ends_on date,
  is_public boolean not null default false,
  share_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  item_type text not null check (item_type in ('place', 'event', 'restaurant', 'custom')),
  external_id text,
  title text not null,
  notes text check (char_length(notes) <= 2000),
  starts_at timestamptz,
  position integer not null default 0 check (position >= 0),
  location_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('administrator', 'content_manager', 'support', 'partner_manager')),
  created_at timestamptz not null default now()
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists saved_events_user_id_idx on public.saved_events(user_id);
create index if not exists itineraries_user_id_idx on public.itineraries(user_id);
create index if not exists itinerary_items_itinerary_position_idx on public.itinerary_items(itinerary_id, position);

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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.owns_itinerary(target_itinerary uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.itineraries
    where id = target_itinerary and user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_events enable row level security;
alter table public.itineraries enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.admin_roles enable row level security;

create policy "users manage own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "users manage own preferences" on public.user_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own notification preferences" on public.notification_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own favorites" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own saved events" on public.saved_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own itineraries" on public.itineraries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own itinerary items" on public.itinerary_items for all using (public.owns_itinerary(itinerary_id)) with check (public.owns_itinerary(itinerary_id));
create policy "users read own admin role" on public.admin_roles for select using (user_id = auth.uid());

commit;
