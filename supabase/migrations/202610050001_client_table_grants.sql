begin;

-- Explicit client privileges for authenticated ForgePass users.
-- Row-level security continues to determine which rows each user may access.

grant select, insert, update, delete
  on public.favorites
  to authenticated;

grant select, insert, update, delete
  on public.saved_events
  to authenticated;

grant select, insert, update, delete
  on public.itineraries
  to authenticated;

grant select, insert, update, delete
  on public.itinerary_items
  to authenticated;

grant select, update
  on public.notification_preferences
  to authenticated;

grant select
  on public.reward_accounts
  to authenticated;

grant select
  on public.reward_transactions
  to authenticated;

grant select
  on public.rewards
  to authenticated;

commit;