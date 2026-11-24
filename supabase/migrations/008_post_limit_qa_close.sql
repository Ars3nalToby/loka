-- 008 · Weekly maintenance 24 Nov 2026 (Claude Opus 5.5). NOT applied live until the owner approves.
--
-- Two gaps found:
--  1. The "3 new posts per day" limit counted rows still in the table. Deleting your own posts reset
--     the count, so one account could insert → delete → insert without end (fills the admin queue and
--     the owner alert feed). Now every post by an app user is also written to private.post_log, which
--     the app cannot read or delete, and the limit counts the larger of the two.
--  2. public.questions / public.answers (Ask board) are not used by the app yet (it shows samples),
--     but any signed-in account could insert unmoderated, publicly readable text through the API with
--     no limit. Inserting is now admin-only until a moderated Ask board is built.

create table if not exists private.post_log(
  owner uuid not null,
  tbl text not null,
  at timestamptz not null default now()
);
create index if not exists post_log_owner_at on private.post_log(owner, tbl, at);
revoke all on private.post_log from public, anon, authenticated;

create or replace function public.guard_listing() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int; logged int;
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;
  if public.is_trusted() then
    new.updated_at := now();
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.owner is distinct from auth.uid() then raise exception 'you can only post as yourself'; end if;
    execute format('select count(*) from public.%I where owner = $1 and created_at > now() - interval ''24 hours''', tg_table_name)
      into recent using auth.uid();
    select count(*) into logged from private.post_log
      where owner = auth.uid() and tbl = tg_table_name and at > now() - interval '24 hours';
    if greatest(recent, logged) >= 3 then raise exception 'limit: 3 new % per day', tg_table_name; end if;
    delete from private.post_log where owner = auth.uid() and at < now() - interval '2 days';
    insert into private.post_log(owner, tbl) values (auth.uid(), tg_table_name);
    new.status := 'pending';
    new.hidden_by_reports := false;
    new.reviewed_reason := '';
    if tg_table_name = 'homes' then new.verified := false; new.verified_at := null; new.verified_checks := null; end if;
  else
    if new.owner is distinct from old.owner then raise exception 'owner cannot change'; end if;
    if new.status is distinct from old.status and new.status <> 'removed' then raise exception 'only an admin can publish'; end if;
    if new.hidden_by_reports is distinct from old.hidden_by_reports or new.reviewed_reason is distinct from old.reviewed_reason then
      raise exception 'only an admin can change review fields'; end if;
    if tg_table_name = 'homes' then
      if new.verified is distinct from old.verified or new.verified_at is distinct from old.verified_at
         or new.verified_checks is distinct from old.verified_checks then raise exception 'only an admin can verify'; end if;
    end if;
    if new.status <> 'removed' then new.status := 'pending'; end if;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end $$;
revoke execute on function public.guard_listing() from public, anon, authenticated;

drop policy if exists questions_insert on public.questions;
create policy questions_insert on public.questions for insert to authenticated
  with check (private.is_admin() and owner = auth.uid());
drop policy if exists answers_insert on public.answers;
create policy answers_insert on public.answers for insert to authenticated
  with check (private.is_admin() and owner = auth.uid());
