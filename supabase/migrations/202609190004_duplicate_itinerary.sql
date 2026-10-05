begin;
create function public.duplicate_itinerary(source_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  original public.itineraries%rowtype;
  copied public.itineraries%rowtype;
  stops jsonb;
begin
  select * into original from public.itineraries
    where id=source_id and user_id=auth.uid() for update;
  if not found then raise exception 'Itinerary unavailable' using errcode='42501'; end if;
  perform id from public.itinerary_items where itinerary_id=source_id order by id for update;
  insert into public.itineraries(user_id,name,starts_on,ends_on)
    values(auth.uid(),left(original.name,113) || ' (copy)',original.starts_on,original.ends_on)
    returning * into copied;
  insert into public.itinerary_items(itinerary_id,item_type,external_id,title,notes,starts_at,position,location_snapshot)
    select copied.id,item_type,external_id,title,notes,starts_at,
      row_number() over (order by position,id)-1,location_snapshot
    from public.itinerary_items where itinerary_id=source_id;
  select coalesce(jsonb_agg(to_jsonb(item) order by item.position,item.id),'[]'::jsonb)
    into stops from public.itinerary_items item where item.itinerary_id=copied.id;
  return to_jsonb(copied) || jsonb_build_object('itinerary_items',stops);
end;
$$;
revoke all on function public.duplicate_itinerary(uuid) from public, anon;
grant execute on function public.duplicate_itinerary(uuid) to authenticated;
commit;
