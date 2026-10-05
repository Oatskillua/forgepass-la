begin;
alter table public.reward_transactions add column request_id uuid;
create unique index reward_request_unique on public.reward_transactions(user_id, request_id);
alter table public.reward_transactions drop constraint reward_transactions_points_check;
alter table public.reward_transactions add constraint reward_transactions_points_check
  check (points <> 0 or transaction_type = 'redeem');

create function public.redeem_reward(target_reward uuid, expected_cost integer, request_key uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  account public.reward_accounts%rowtype;
  reward public.rewards%rowtype;
  previous public.reward_transactions%rowtype;
  receipt uuid;
begin
  if actor is null or request_key is null then raise exception 'Authentication and request key required'; end if;
  select * into account from public.reward_accounts where user_id = actor for update;
  if not found then raise exception 'Reward account unavailable'; end if;
  select * into previous from public.reward_transactions where user_id=actor and request_id=request_key;
  if found then
    if previous.reward_id is distinct from target_reward or -previous.points is distinct from expected_cost then
      raise exception 'Request key already used for a different redemption';
    end if;
    return previous.id;
  end if;
  select * into reward from public.rewards where id=target_reward for update;
  if not found or not reward.active or (reward.starts_at is not null and reward.starts_at > now())
    or (reward.ends_at is not null and reward.ends_at <= now()) then raise exception 'Reward unavailable'; end if;
  if reward.points_cost is distinct from expected_cost then raise exception 'Reward price changed. Refresh before redeeming.'; end if;
  if reward.inventory is not null and reward.inventory < 1 then raise exception 'Reward sold out'; end if;
  if account.available_points < reward.points_cost then raise exception 'Insufficient points'; end if;
  update public.reward_accounts set available_points=available_points-reward.points_cost, updated_at=now() where user_id=actor;
  update public.rewards set inventory=inventory-1 where id=target_reward and inventory is not null;
  insert into public.reward_transactions(user_id,reward_id,transaction_type,points,description,request_id)
    values(actor,target_reward,'redeem',-reward.points_cost,'Redeemed: ' || reward.title,request_key) returning id into receipt;
  return receipt;
end;
$$;
revoke all on function public.redeem_reward(uuid, integer, uuid) from public, anon;
grant execute on function public.redeem_reward(uuid, integer, uuid) to authenticated;
commit;
