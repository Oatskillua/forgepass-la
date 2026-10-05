begin;

-- RLS limits rows, not columns. Only read_at may be changed by a user.
revoke update on public.notifications from public, anon, authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select on public.notifications to authenticated;

commit;
