begin;

-- Existing Auth accounts predate the signup trigger; preserve existing values.
insert into public.profiles(id, full_name)
  select id, nullif(left(raw_user_meta_data ->> 'full_name', 120), '') from auth.users
  on conflict (id) do nothing;
insert into public.user_preferences(user_id)
  select id from public.profiles on conflict (user_id) do nothing;
insert into public.notification_preferences(user_id)
  select id from public.profiles on conflict (user_id) do nothing;
insert into public.reward_accounts(user_id)
  select id from public.profiles on conflict (user_id) do nothing;

-- A profile deletion cascades into reward history and admin roles. Account
-- deletion must use a separately authorized server workflow, not a profile write.
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update(full_name, home_city, avatar_url, updated_at) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name)
    values(new.id, nullif(left(new.raw_user_meta_data ->> 'full_name', 120), ''));
  insert into public.user_preferences(user_id) values(new.id);
  insert into public.notification_preferences(user_id) values(new.id);
  insert into public.reward_accounts(user_id) values(new.id);
  return new;
end;
$$;
commit;
