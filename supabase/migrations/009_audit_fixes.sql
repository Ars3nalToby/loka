-- 009 · Audit fixes, 25 Nov 2026 (Claude Opus 5.5). Owner approved fixing the audit findings ("go ahead").
-- Applied live after 008, same session, same file.
--
--  1. profiles.created_at could be changed by the account itself. That defeated 006's rule that only
--     accounts at least 3 days old can hide a listing by reporting it (3 brand-new accounts backdated
--     themselves and hid a published room). Now only a trusted/admin session can change it.
--  2. On insert, the client chose created_at. A backdated row was not counted by the 3-a-day limit (live
--     on 001-007) and a future date pinned a listing to the top as "just now" forever. Now the database
--     sets created_at := now() on every insert by an app user.
--  3. After approval, an owner could swap the phone / WeChat on a published listing with no re-review.
--     Editing or deleting a contact (delete + re-add is a swap too) now sends a published listing back to
--     'pending'. Adding the first contact does not: the app adds it right after posting, while pending.
--  4. Rent in advance: rooming accommodation is capped at 2 weeks whatever the term (RTA rooming rent
--     fact sheet). Only a whole place ('unit') on a fixed term may ask for more (Loka: 4 weeks; the law
--     allows 1 month).
--  5. Job ads below the national minimum are refused, not just flagged (Fair Work Act s 536AA; FWO filed
--     its first job-ad case 17 Nov 2026). National minimum from 1 July 2026: $26.44/h, casual $33.05/h
--     (adult). UPDATE EVERY 1 JULY together with RULES in js/rules.js.
-- Every function here pins search_path with pg_temp last.

-- 1 ─ profiles.created_at is not the user's to change
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_trusted() then
    raise exception 'only an admin can change admin rights';
  end if;
  if new.id is distinct from old.id then raise exception 'id cannot change'; end if;
  if new.created_at is distinct from old.created_at and not public.is_trusted() then
    raise exception 'account age cannot change';
  end if;
  return new;
end $$;
revoke execute on function public.guard_profile() from public, anon, authenticated;

-- 2 ─ the database, not the phone, decides when a post was made (rest of guard_listing as in 008)
create or replace function public.guard_listing() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
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
    new.created_at := now();
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

-- 3 ─ a changed contact goes back to review
create or replace function private.contact_changed() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare tbl text; id uuid; j jsonb;
begin
  if public.is_trusted() then return coalesce(new, old); end if;
  -- read the key through jsonb: plpgsql resolves new.<col> even in a CASE branch that is not taken
  j := to_jsonb(coalesce(new, old));
  tbl := case tg_table_name when 'home_contacts' then 'homes' when 'job_contacts' then 'jobs' else 'wanted' end;
  id := (j ->> case tg_table_name when 'home_contacts' then 'home_id' when 'job_contacts' then 'job_id' else 'wanted_id' end)::uuid;
  execute format('update public.%I set status = ''pending'' where id = $1 and status = ''published''', tbl) using id;
  return coalesce(new, old);
end $$;
revoke execute on function private.contact_changed() from public, anon, authenticated;
drop trigger if exists zz_contact_home on public.home_contacts;
create trigger zz_contact_home after update or delete on public.home_contacts for each row execute function private.contact_changed();
drop trigger if exists zz_contact_job on public.job_contacts;
create trigger zz_contact_job after update or delete on public.job_contacts for each row execute function private.contact_changed();
drop trigger if exists zz_contact_wanted on public.wanted_contacts;
create trigger zz_contact_wanted after update or delete on public.wanted_contacts for each row execute function private.contact_changed();

-- 4 ─ rooming accommodation: 2 weeks in advance, whatever the term
alter table public.homes drop constraint if exists qld_rent_in_advance;
alter table public.homes add constraint qld_rent_in_advance
  check (adv_weeks <= case when agr = 'fixed' and type = 'unit' then 4 else 2 end);

-- 5 ─ no job ad below the national adult minimum
alter table public.jobs drop constraint if exists fw_min_wage_2026;
alter table public.jobs add constraint fw_min_wage_2026
  check (pay >= case when casual then 33.05 else 26.44 end);
