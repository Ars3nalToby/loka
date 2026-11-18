-- Loka · 002: keep helper functions off the public web API (Supabase security advisor 0028/0029).
-- is_admin() moves to schema "private", which the API does not expose. Row-level policies still use it
-- (they point at the function itself, not its name), so signed-out and signed-in visitors keep EXECUTE on it.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create or replace function public.is_trusted() returns boolean
language sql stable set search_path = public as $$
  select private.is_admin() or coalesce(current_setting('role', true), 'none') not in ('anon', 'authenticated')
$$;

-- Trigger functions run only from their triggers; nobody needs to call them.
revoke execute on function public.handle_new_user(), public.guard_profile(), public.guard_listing(),
  public.after_report(), public.guard_report() from public, anon, authenticated;
