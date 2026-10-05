begin;
-- A legacy deployment needs a reviewed baseline, not an implicit schema rewrite.
do $$ begin
  if to_regclass('public.waitlist') is not null or to_regclass('public.feedback') is not null then
    raise exception 'Existing intake tables detected. Review and reconcile the legacy schema before applying this fresh-install migration.';
  end if;
end $$;

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null default '' check (char_length(name) <= 100),
  email text not null check (char_length(email) <= 255 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  city text not null default '' check (char_length(city) <= 100),
  interest text not null default '' check (char_length(interest) <= 50),
  created_at timestamptz not null default now()
);
create unique index waitlist_email_unique_idx on public.waitlist(lower(email));
create index waitlist_created_idx on public.waitlist(created_at desc,id desc);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  email text not null check (char_length(email) <= 255 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  category text not null default '' check (char_length(category) <= 50),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  status text not null default 'new' check (status in ('new','reviewed','planned','completed','dismissed')),
  created_at timestamptz not null default now()
);
create index feedback_created_idx on public.feedback(created_at desc,id desc);

alter table public.waitlist enable row level security;
alter table public.feedback enable row level security;
revoke all on public.waitlist,public.feedback from public,anon,authenticated;
grant select,insert,update,delete on public.waitlist,public.feedback to service_role;
-- No client policies: verified server endpoints mediate intake and administration.
commit;
