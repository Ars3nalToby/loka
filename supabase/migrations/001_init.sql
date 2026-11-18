-- Loka · 001_init.sql: the shared database (roadmap task O2).
-- Run once in the Supabase SQL editor of Loka's own project (Sydney region), or with `supabase db push`.
-- Tested with tests/db/rls_check.mjs (PGlite, a real Postgres in WebAssembly).
--
-- Principles
--  • Queensland rules live HERE as CHECK constraints, so no app, script or hacked client can skip them:
--    bond at most 4 weeks of rent; rent in advance at most 2 weeks (room/periodic) or 4 weeks (fixed);
--    sub-letting needs the owner's consent; all four lister declarations must be true.
--  • Row-level security on every table. Anyone reads PUBLISHED rows. Signed-in users write their own rows.
--    Nobody but an admin can publish, verify, or touch someone else's row.
--  • Contact details sit in separate tables that only signed-in users can read.
--  • New rooms and jobs start as 'pending'. An owner's edit sends a published listing back to 'pending'.
--  • At most 3 new rooms and 3 new jobs per account per 24 hours. Three open reports hide an item.
--  • No ID documents, ID numbers, dates of birth or payment details are stored anywhere (AGENTS.md).

-- ───────── Suburbs (coverage list, loaded from js/suburbs.js) ─────────
create table if not exists public.suburbs(
  name text primary key,
  zone text not null check (zone in ('inner','west','innersouth','south'))
);

-- ───────── Profiles: one per signed-in account ─────────
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Who is asking? (Supabase supplies auth.uid() from the signed-in session.)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- Triggers also trust the database owner working in the Supabase SQL editor (role postgres).
-- Requests from the app always run as anon or authenticated, so they never get this path.
create or replace function public.is_trusted() returns boolean
language sql stable set search_path = public as $$
  select public.is_admin() or coalesce(current_setting('role', true), 'none') not in ('anon', 'authenticated')
$$;

-- A profile row appears when someone signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- People may change their display name, never their admin flag.
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_trusted() then
    raise exception 'only an admin can change admin rights';
  end if;
  if new.id is distinct from old.id then raise exception 'id cannot change'; end if;
  return new;
end $$;
drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update on public.profiles for each row execute function public.guard_profile();

-- ───────── Rooms ─────────
create table if not exists public.homes(
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','published','removed')),
  type text not null check (type in ('room','unit','student')),
  agr text not null check (agr in ('fixed','room')),
  role text not null default 'owner' check (role in ('owner','head','agent')),
  owner_consent boolean not null default false,
  title text not null check (char_length(title) between 3 and 140),
  area text not null references public.suburbs(name),
  near text not null default '' check (char_length(near) <= 140),
  rent numeric(8,2) not null check (rent > 0 and rent <= 5000),
  bond numeric(9,2) not null default 0 check (bond >= 0),
  adv_weeks numeric(4,1) not null default 0 check (adv_weeks >= 0),
  bills boolean not null default false,
  furnished boolean not null default false,
  chinese_ok boolean not null default false,
  note text not null default '' check (char_length(note) <= 1200),
  decl_fixed_price boolean not null,
  decl_bond_rta boolean not null,
  decl_sublet_ok boolean not null,
  decl_true boolean not null,
  verified boolean not null default false,
  verified_at date,
  verified_checks jsonb,
  hidden_by_reports boolean not null default false,
  reviewed_reason text not null default '' check (char_length(reviewed_reason) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Queensland rules (Residential Tenancies and Rooming Accommodation Act 2008)
  constraint qld_bond_max_4_weeks check (bond <= rent * 4),
  constraint qld_rent_in_advance check (adv_weeks <= case when agr = 'fixed' then 4 else 2 end),
  constraint sublet_needs_owner_consent check (role <> 'head' or owner_consent),
  constraint all_declarations_true check (decl_fixed_price and decl_bond_rta and decl_sublet_ok and decl_true),
  constraint verified_has_date check (not verified or verified_at is not null)
);
create index if not exists homes_status_area on public.homes(status, area);

create table if not exists public.home_contacts(
  home_id uuid primary key references public.homes(id) on delete cascade,
  contact text not null check (char_length(contact) between 3 and 140)
);

-- ───────── Jobs ─────────
create table if not exists public.jobs(
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','published','removed')),
  title text not null check (char_length(title) between 3 and 140),
  area text not null references public.suburbs(name),
  pay numeric(7,2) not null check (pay > 0 and pay <= 1000),
  casual boolean not null default true,
  hours text not null default '' check (char_length(hours) <= 60),
  languages text not null default '' check (char_length(languages) <= 60),
  note text not null default '' check (char_length(note) <= 1200),
  decl_award_pay boolean not null,
  decl_no_cash_only boolean not null,
  decl_true boolean not null,
  hidden_by_reports boolean not null default false,
  reviewed_reason text not null default '' check (char_length(reviewed_reason) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_declarations_true check (decl_award_pay and decl_no_cash_only and decl_true)
);
create table if not exists public.job_contacts(
  job_id uuid primary key references public.jobs(id) on delete cascade,
  contact text not null check (char_length(contact) between 3 and 140)
);

-- ───────── Ask (questions and answers) ─────────
create table if not exists public.questions(
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 3 and 300),
  area text references public.suburbs(name),
  hidden_by_reports boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.answers(
  id uuid primary key default gen_random_uuid(),
  question uuid not null references public.questions(id) on delete cascade,
  owner uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  hidden_by_reports boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────── Reports ─────────
create table if not exists public.reports(
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('homes','jobs','questions','answers')),
  item uuid not null,
  reporter uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  why text not null check (char_length(why) between 3 and 300),
  open boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kind, item, reporter)
);

-- ───────── Guards: what only an admin may do, and rate limits ─────────
create or replace function public.guard_listing() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int;
begin
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
    if tg_table_name = 'homes' and (new.verified is distinct from old.verified or new.verified_at is distinct from old.verified_at
       or new.verified_checks is distinct from old.verified_checks) then raise exception 'only an admin can verify'; end if;
    -- The owner may take a listing down (status 'removed'); any other edit goes back for review.
    if new.status <> 'removed' then new.status := 'pending'; end if;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists guard_homes on public.homes;
create trigger guard_homes before insert or update on public.homes for each row execute function public.guard_listing();
drop trigger if exists guard_jobs on public.jobs;
create trigger guard_jobs before insert or update on public.jobs for each row execute function public.guard_listing();

-- Three open reports hide the item until an admin looks.
create or replace function public.after_report() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from public.reports where kind = new.kind and item = new.item and open;
  if n >= 3 then
    execute format('update public.%I set hidden_by_reports = true where id = $1', new.kind) using new.item;
  end if;
  return new;
end $$;
drop trigger if exists after_report on public.reports;
create trigger after_report after insert on public.reports for each row execute function public.after_report();

-- Reporters cannot open, close or move reports after sending them.
create or replace function public.guard_report() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_trusted() then new.open := true; new.reporter := auth.uid(); end if;
  elsif not public.is_trusted() then raise exception 'only an admin can change a report';
  end if;
  return new;
end $$;
drop trigger if exists guard_report on public.reports;
create trigger guard_report before insert or update on public.reports for each row execute function public.guard_report();

-- ───────── Row-level security ─────────
alter table public.suburbs enable row level security;
alter table public.profiles enable row level security;
alter table public.homes enable row level security;
alter table public.home_contacts enable row level security;
alter table public.jobs enable row level security;
alter table public.job_contacts enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.reports enable row level security;

drop policy if exists suburbs_read on public.suburbs;
create policy suburbs_read on public.suburbs for select using (true);

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update using (id = auth.uid() or public.is_admin());

-- Rooms and jobs: public sees published + not hidden; owners see their own; admins see all.
drop policy if exists homes_read on public.homes;
create policy homes_read on public.homes for select
  using ((status = 'published' and not hidden_by_reports) or owner = auth.uid() or public.is_admin());
drop policy if exists homes_insert on public.homes;
create policy homes_insert on public.homes for insert to authenticated with check (owner = auth.uid());
drop policy if exists homes_update on public.homes;
create policy homes_update on public.homes for update to authenticated
  using (owner = auth.uid() or public.is_admin()) with check (owner = auth.uid() or public.is_admin());
drop policy if exists homes_delete on public.homes;
create policy homes_delete on public.homes for delete to authenticated using (owner = auth.uid() or public.is_admin());

drop policy if exists jobs_read on public.jobs;
create policy jobs_read on public.jobs for select
  using ((status = 'published' and not hidden_by_reports) or owner = auth.uid() or public.is_admin());
drop policy if exists jobs_insert on public.jobs;
create policy jobs_insert on public.jobs for insert to authenticated with check (owner = auth.uid());
drop policy if exists jobs_update on public.jobs;
create policy jobs_update on public.jobs for update to authenticated
  using (owner = auth.uid() or public.is_admin()) with check (owner = auth.uid() or public.is_admin());
drop policy if exists jobs_delete on public.jobs;
create policy jobs_delete on public.jobs for delete to authenticated using (owner = auth.uid() or public.is_admin());

-- Contact details: signed-in users only, and only for listings they can see.
drop policy if exists home_contacts_read on public.home_contacts;
create policy home_contacts_read on public.home_contacts for select to authenticated
  using (exists (select 1 from public.homes h where h.id = home_id
         and ((h.status = 'published' and not h.hidden_by_reports) or h.owner = auth.uid() or public.is_admin())));
drop policy if exists home_contacts_write on public.home_contacts;
create policy home_contacts_write on public.home_contacts for all to authenticated
  using (exists (select 1 from public.homes h where h.id = home_id and h.owner = auth.uid()))
  with check (exists (select 1 from public.homes h where h.id = home_id and h.owner = auth.uid()));
drop policy if exists job_contacts_read on public.job_contacts;
create policy job_contacts_read on public.job_contacts for select to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id
         and ((j.status = 'published' and not j.hidden_by_reports) or j.owner = auth.uid() or public.is_admin())));
drop policy if exists job_contacts_write on public.job_contacts;
create policy job_contacts_write on public.job_contacts for all to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.owner = auth.uid()))
  with check (exists (select 1 from public.jobs j where j.id = job_id and j.owner = auth.uid()));

-- Ask: anyone reads what is not hidden; signed-in users post as themselves.
drop policy if exists questions_read on public.questions;
create policy questions_read on public.questions for select using (not hidden_by_reports or owner = auth.uid() or public.is_admin());
drop policy if exists questions_insert on public.questions;
create policy questions_insert on public.questions for insert to authenticated with check (owner = auth.uid() and not hidden_by_reports);
drop policy if exists questions_delete on public.questions;
create policy questions_delete on public.questions for delete to authenticated using (owner = auth.uid() or public.is_admin());
drop policy if exists answers_read on public.answers;
create policy answers_read on public.answers for select using (not hidden_by_reports or owner = auth.uid() or public.is_admin());
drop policy if exists answers_insert on public.answers;
create policy answers_insert on public.answers for insert to authenticated with check (owner = auth.uid() and not hidden_by_reports);
drop policy if exists answers_delete on public.answers;
create policy answers_delete on public.answers for delete to authenticated using (owner = auth.uid() or public.is_admin());
drop policy if exists qa_admin_update on public.questions;
create policy qa_admin_update on public.questions for update to authenticated using (public.is_admin());
drop policy if exists ans_admin_update on public.answers;
create policy ans_admin_update on public.answers for update to authenticated using (public.is_admin());

-- Reports: signed-in users send; they see their own; admins see and close all.
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert to authenticated with check (reporter = auth.uid());
drop policy if exists reports_read on public.reports;
create policy reports_read on public.reports for select to authenticated using (reporter = auth.uid() or public.is_admin());
drop policy if exists reports_admin on public.reports;
create policy reports_admin on public.reports for update to authenticated using (public.is_admin());

-- Signed-out visitors may only read.
revoke insert, update, delete on all tables in schema public from anon;
insert into public.suburbs(name,zone) values
 ('Brisbane City','inner'),
 ('Spring Hill','inner'),
 ('Fortitude Valley','inner'),
 ('Bowen Hills','inner'),
 ('Newstead','inner'),
 ('New Farm','inner'),
 ('Kelvin Grove','inner'),
 ('Milton','inner'),
 ('South Brisbane','inner'),
 ('West End','inner'),
 ('Highgate Hill','inner'),
 ('Kangaroo Point','inner'),
 ('East Brisbane','inner'),
 ('Woolloongabba','inner'),
 ('St Lucia','west'),
 ('Toowong','west'),
 ('Auchenflower','west'),
 ('Taringa','west'),
 ('Indooroopilly','west'),
 ('Dutton Park','innersouth'),
 ('Fairfield','innersouth'),
 ('Annerley','innersouth'),
 ('Yeronga','innersouth'),
 ('Moorooka','innersouth'),
 ('Greenslopes','innersouth'),
 ('Stones Corner','innersouth'),
 ('Coorparoo','innersouth'),
 ('Holland Park','innersouth'),
 ('Tarragindi','innersouth'),
 ('Sunnybank','south'),
 ('Sunnybank Hills','south'),
 ('Robertson','south'),
 ('Macgregor','south'),
 ('Nathan','south'),
 ('Coopers Plains','south'),
 ('Salisbury','south'),
 ('Acacia Ridge','south'),
 ('Runcorn','south'),
 ('Eight Mile Plains','south'),
 ('Kuraby','south'),
 ('Underwood','south'),
 ('Mount Gravatt','south'),
 ('Mount Gravatt East','south'),
 ('Upper Mount Gravatt','south'),
 ('Wishart','south'),
 ('Mansfield','south'),
 ('Rochedale','south'),
 ('Rochedale South','south'),
 ('Calamvale','south'),
 ('Stretton','south'),
 ('Drewvale','south'),
 ('Algester','south'),
 ('Parkinson','south')
on conflict (name) do update set zone=excluded.zone;
