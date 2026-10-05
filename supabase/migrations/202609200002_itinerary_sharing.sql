begin;
create index if not exists itineraries_share_lookup_idx on public.itineraries(share_token) where is_public;

create function public.set_itinerary_sharing(target_id uuid, expected_token uuid, enabled boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare changed public.itineraries%rowtype;
begin
  if enabled is null then raise exception 'Choose a sharing state'; end if;
  update public.itineraries set is_public=enabled, share_token=gen_random_uuid(), updated_at=now()
    where id=target_id and user_id=auth.uid() and share_token=expected_token
    returning * into changed;
  if not found then raise exception 'Sharing changed or itinerary unavailable. Refresh itineraries.' using errcode='40001'; end if;
  return jsonb_build_object('id',changed.id,'is_public',changed.is_public,'share_token',changed.share_token);
end;
$$;
revoke all on function public.set_itinerary_sharing(uuid,uuid,boolean) from public, anon;
grant execute on function public.set_itinerary_sharing(uuid,uuid,boolean) to authenticated;

-- A capability link exposes only this allowlist; table ownership policies stay intact.
create function public.get_shared_itinerary(token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('name',trip.name,'starts_on',trip.starts_on,'ends_on',trip.ends_on,
    'stops',coalesce((select jsonb_agg(jsonb_build_object('title',item.title,'starts_at',item.starts_at)
      order by item.position,item.id) from public.itinerary_items item where item.itinerary_id=trip.id),'[]'::jsonb))
  from public.itineraries trip where trip.share_token=token and trip.is_public limit 1;
$$;
revoke all on function public.get_shared_itinerary(uuid) from public;
grant execute on function public.get_shared_itinerary(uuid) to anon, authenticated;
commit;
