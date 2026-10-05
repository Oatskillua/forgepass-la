begin;

-- Match account-scoped cursor ordering, including ties in creation time.
create index if not exists notifications_user_history_idx
  on public.notifications(user_id, created_at desc, id desc);
create index if not exists reward_transactions_user_history_idx
  on public.reward_transactions(user_id, created_at desc, id desc);

commit;
