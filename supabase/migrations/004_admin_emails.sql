-- Loka · 004: admins by email. An address in private.admin_emails becomes admin automatically,
-- but only once that address is CONFIRMED (the person proved they can open that inbox).
-- The list lives in schema "private" (not reachable from the app or the web API). Add addresses only
-- in the Supabase SQL editor; never commit real email addresses to this repo.
create table if not exists private.admin_emails(email text primary key check (email = lower(email)));
revoke all on private.admin_emails from public, anon, authenticated;

create or replace function private.apply_admin_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and exists (select 1 from private.admin_emails a where a.email = lower(new.email)) then
    insert into public.profiles(id, is_admin) values (new.id, true)
      on conflict (id) do update set is_admin = true;
  end if;
  return new;
end $$;
revoke execute on function private.apply_admin_email() from public, anon, authenticated;
drop trigger if exists zz_admin_email on auth.users;
create trigger zz_admin_email after insert or update of email_confirmed_at, email on auth.users
  for each row execute function private.apply_admin_email();
