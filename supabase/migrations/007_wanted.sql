-- Loka · 007: Wanted posts 求租 (roadmap task S5).
--
-- Renters post what they need (weekly budget, sides of town, move-in date, stay, campus). Listers browse them
-- and contact the renter. This gives Loka something useful on days with few rooms.
--
-- Same safety model as rooms and jobs:
--  • New posts start 'pending'; only an admin publishes. Any edit by the owner sends it back to 'pending'.
--  • At most 3 new posts per account per 24 h (public.guard_listing, shared with homes/jobs).
--  • The renter's contact sits in wanted_contacts: owner and admin read it directly; everyone else only through
--    reveal_contact('wanted', id), signed in, 20 different contacts per account per day (same counter as 005).
--  • A post lasts 30 days, then disappears from public view. The client cannot choose its own expiry date:
--    any change to expires_at renews it to "30 days from now" (and the edit goes back to review).
--  • The free-text note may not carry a phone number, email or WeChat ID (those belong in the protected
--    contact field, otherwise the daily contact limit would be pointless).
--  • Reports work as for rooms (reports.kind gains 'wanted'); the owner alert feed gains new/edited wanted.
-- Tested offline in tests/db/rls_check.mjs ([007] checks).

create table if not exists public.wanted(
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','published','removed')),
  kind text not null default 'room' check (kind in ('any','room','unit','student')),
  budget numeric(6,0) not null check (budget between 50 and 3000),
  zones text[] not null check (cardinality(zones) between 1 and 4 and zones <@ array['inner','west','innersouth','south']::text[]),
  move_in date,
  stay text not null default 'any' check (stay in ('any','3','6','12')),
  campus text not null default '' check (campus in ('','uq','qut-gp','qut-kg','gu-nathan','gu-sb')),
  zh_home boolean not null default false,
  note text not null default '' check (char_length(note) <= 300),
  by_name text not null default '' check (char_length(by_name) <= 40),
  decl_true boolean not null,
  decl_contact_ok boolean not null,
  hidden_by_reports boolean not null default false,
  reviewed_reason text not null default '' check (char_length(reviewed_reason) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  constraint wanted_declarations_true check (decl_true and decl_contact_ok),
  constraint wanted_move_in_sane check (move_in is null or move_in <= (created_at + interval '1 year')::date),
  constraint wanted_note_no_contact check (
    note !~ '@' and note !~ '(\d[\s.-]*){8,}' and note !~* '(微信|wechat|\mwx\s*[:：]|\mvx\s*[:：])')
);
create index if not exists wanted_status_exp on public.wanted(status, expires_at);

create table if not exists public.wanted_contacts(
  wanted_id uuid primary key references public.wanted(id) on delete cascade,
  contact text not null check (char_length(contact) between 3 and 140)
);

-- guard_listing is shared by homes, jobs and wanted. The 006 version tested "tg_table_name = 'homes' and
-- (new.verified ...)" in one expression; plpgsql resolves new.verified even when the first half is false, so on
-- a table without a verified column (wanted) every owner edit failed. Same rules, homes check nested.
create or replace function public.guard_listing() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int;
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
    if recent >= 3 then raise exception 'limit: 3 new % per day', tg_table_name; end if;
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

-- Status, review fields, owner and the daily limit: the same guard as rooms and jobs.
drop trigger if exists guard_wanted on public.wanted;
create trigger guard_wanted before insert or update on public.wanted for each row execute function public.guard_listing();

-- Expiry: always 30 days from posting (or from the latest renewal). Admin / SQL editor may set it freely.
create or replace function private.guard_wanted_expiry() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_trusted() then return new; end if;
  if tg_op = 'INSERT' then
    new.expires_at := now() + interval '30 days';
  elsif new.expires_at is distinct from old.expires_at then
    new.expires_at := now() + interval '30 days';
  end if;
  return new;
end $$;
revoke execute on function private.guard_wanted_expiry() from public, anon, authenticated;
drop trigger if exists guard_wanted_expiry on public.wanted;
create trigger guard_wanted_expiry before insert or update on public.wanted for each row execute function private.guard_wanted_expiry();

-- Row-level security
alter table public.wanted enable row level security;
alter table public.wanted_contacts enable row level security;
drop policy if exists wanted_read on public.wanted;
create policy wanted_read on public.wanted for select
  using ((status = 'published' and not hidden_by_reports and expires_at > now()) or owner = auth.uid() or private.is_admin());
drop policy if exists wanted_insert on public.wanted;
create policy wanted_insert on public.wanted for insert to authenticated with check (owner = auth.uid());
drop policy if exists wanted_update on public.wanted;
create policy wanted_update on public.wanted for update to authenticated
  using (owner = auth.uid() or private.is_admin()) with check (owner = auth.uid() or private.is_admin());
drop policy if exists wanted_delete on public.wanted;
create policy wanted_delete on public.wanted for delete to authenticated using (owner = auth.uid() or private.is_admin());

drop policy if exists wanted_contacts_read on public.wanted_contacts;
create policy wanted_contacts_read on public.wanted_contacts for select to authenticated
  using (exists (select 1 from public.wanted w where w.id = wanted_id and (w.owner = auth.uid() or private.is_admin())));
drop policy if exists wanted_contacts_write on public.wanted_contacts;
create policy wanted_contacts_write on public.wanted_contacts for all to authenticated
  using (exists (select 1 from public.wanted w where w.id = wanted_id and w.owner = auth.uid()))
  with check (exists (select 1 from public.wanted w where w.id = wanted_id and w.owner = auth.uid()));

revoke insert, update, delete on public.wanted, public.wanted_contacts from anon;

-- Reports and the contact counter learn the new kind.
alter table public.reports drop constraint if exists reports_kind_check;
alter table public.reports add constraint reports_kind_check check (kind in ('homes','jobs','questions','answers','wanted'));
alter table private.contact_views drop constraint if exists contact_views_kind_check;
alter table private.contact_views add constraint contact_views_kind_check check (kind in ('homes','jobs','wanted'));

create or replace function public.reveal_contact(p_kind text, p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); o uuid; vis boolean; c text; n int;
begin
  if me is null then raise exception 'sign_in_required'; end if;
  if p_kind = 'homes' then
    select owner, (status = 'published' and not hidden_by_reports) into o, vis from public.homes where id = p_id;
    select contact into c from public.home_contacts where home_id = p_id;
  elsif p_kind = 'jobs' then
    select owner, (status = 'published' and not hidden_by_reports) into o, vis from public.jobs where id = p_id;
    select contact into c from public.job_contacts where job_id = p_id;
  elsif p_kind = 'wanted' then
    select owner, (status = 'published' and not hidden_by_reports and expires_at > now()) into o, vis from public.wanted where id = p_id;
    select contact into c from public.wanted_contacts where wanted_id = p_id;
  else raise exception 'bad_kind'; end if;
  if o is null then return null; end if;
  if o = me or private.is_admin() then return c; end if;
  if not vis then return null; end if;
  if not exists (select 1 from private.contact_views where viewer = me and kind = p_kind and item = p_id) then
    select count(*) into n from private.contact_views where viewer = me and at > now() - interval '24 hours';
    if n >= 20 then raise exception 'contact_limit: 20 contacts per day'; end if;
    insert into private.contact_views(viewer, kind, item) values (me, p_kind, p_id) on conflict do nothing;
  end if;
  return c;
end $$;
revoke execute on function public.reveal_contact(text, uuid) from public, anon;
grant execute on function public.reveal_contact(text, uuid) to authenticated;

-- Owner alerts: new and edited wanted posts.
alter table private.owner_alerts drop constraint if exists owner_alerts_kind_check;
alter table private.owner_alerts add constraint owner_alerts_kind_check
  check (kind in ('new_home','new_job','edited_home','edited_job','report','new_user','new_wanted','edited_wanted'));
create or replace function private.alert_wanted() returns trigger
language plpgsql security definer set search_path = public as $$
declare s text := left('<= $' || new.budget || '/wk · ' || array_to_string(new.zones, ', '), 120);
begin
  if tg_op = 'INSERT' then
    insert into private.owner_alerts(kind, item, note) values ('new_wanted', new.id, s);
  elsif new.status = 'pending' and old.status is distinct from 'pending' then
    insert into private.owner_alerts(kind, item, note) values ('edited_wanted', new.id, s);
  end if;
  return null;
end $$;
revoke execute on function private.alert_wanted() from public, anon, authenticated;
drop trigger if exists zz_alert_wanted on public.wanted;
create trigger zz_alert_wanted after insert or update on public.wanted for each row execute function private.alert_wanted();
