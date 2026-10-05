begin;

create function public.save_account_settings(
  new_full_name text, new_home_city text,
  new_event_reminders boolean, new_city_alerts boolean,
  new_transportation boolean, new_rewards boolean, new_marketing boolean
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in to save account settings.' using errcode = '42501';
  end if;
  update public.profiles
    set full_name = nullif(btrim(new_full_name), ''),
        home_city = nullif(btrim(new_home_city), ''), updated_at = now()
    where id = auth.uid();
  if not found then raise exception 'Profile unavailable. Refresh before saving.'; end if;

  update public.notification_preferences
    set event_reminders = new_event_reminders, city_alerts = new_city_alerts,
        transportation = new_transportation, rewards = new_rewards,
        marketing = new_marketing, updated_at = now()
    where user_id = auth.uid();
  if not found then raise exception 'Preferences unavailable. Refresh before saving.'; end if;
end;
$$;

revoke all on function public.save_account_settings(text,text,boolean,boolean,boolean,boolean,boolean) from public, anon;
grant execute on function public.save_account_settings(text,text,boolean,boolean,boolean,boolean,boolean) to authenticated;
commit;
