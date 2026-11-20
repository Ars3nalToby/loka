-- Loka · 005: stop one account from harvesting every lister's phone / WeChat.
--
-- Before: any signed-in user could `select contact from home_contacts` and get every published contact
-- in one request. A scammer only needed one free account.
-- After: other people's contacts come only through public.reveal_contact(kind, id), one listing at a time.
-- Each account may reveal up to 20 different listings in 24 hours. Opening the same listing again is free.
-- The listing's owner and admins are not limited. Owners still read and edit their own contacts directly.

create table if not exists private.contact_views(
  viewer uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('homes','jobs')),
  item uuid not null,
  at timestamptz not null default now(),
  primary key (viewer, kind, item)
);
create index if not exists contact_views_viewer_at on private.contact_views(viewer, at);
revoke all on private.contact_views from public, anon, authenticated;

-- Direct reads: owner and admin only.
drop policy if exists home_contacts_read on public.home_contacts;
create policy home_contacts_read on public.home_contacts for select to authenticated
  using (exists (select 1 from public.homes h where h.id = home_id and (h.owner = auth.uid() or private.is_admin())));
drop policy if exists job_contacts_read on public.job_contacts;
create policy job_contacts_read on public.job_contacts for select to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and (j.owner = auth.uid() or private.is_admin())));

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
