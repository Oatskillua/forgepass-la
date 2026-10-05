begin;

-- Compare the client's previous order under locks before applying a complete
-- permutation. SECURITY INVOKER retains the caller's RLS restrictions.
create function public.reorder_itinerary_stops(
  target_itinerary uuid, expected_order uuid[], desired_order uuid[]
) returns void
language plpgsql security invoker set search_path = public
as $$
declare
  current_order uuid[];
begin
  perform id from public.itineraries
    where id = target_itinerary and user_id = auth.uid() for update;
  if not found then
    raise exception 'Itinerary unavailable' using errcode = '42501';
  end if;

  perform id from public.itinerary_items
    where itinerary_id = target_itinerary order by id for update;
  select coalesce(array_agg(id order by position, id), '{}'::uuid[])
    into current_order from public.itinerary_items
    where itinerary_id = target_itinerary;

  if expected_order is distinct from current_order then
    raise exception 'Trip changed. Reload before reordering.' using errcode = '40001';
  end if;
  if desired_order is null
    or cardinality(desired_order) <> cardinality(current_order)
    or exists (select 1 from unnest(desired_order) as x(id) where id is null)
    or (select count(distinct id) from unnest(desired_order) as x(id)) <> cardinality(current_order)
    or not (desired_order <@ current_order) then
    raise exception 'Invalid stop order' using errcode = '22023';
  end if;

  update public.itinerary_items as item set position = ordered.ordinality - 1
    from unnest(desired_order) with ordinality as ordered(id, ordinality)
    where item.id = ordered.id and item.itinerary_id = target_itinerary;
  update public.itineraries set updated_at = now() where id = target_itinerary;
end;
$$;

revoke all on function public.reorder_itinerary_stops(uuid, uuid[], uuid[]) from public, anon;
grant execute on function public.reorder_itinerary_stops(uuid, uuid[], uuid[]) to authenticated;
commit;
