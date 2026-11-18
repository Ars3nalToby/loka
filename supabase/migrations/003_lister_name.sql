-- Loka · 003: the short name shown as "Listed by …" on a room or job. Profiles stay private,
-- so the public name lives on the listing itself. Plain text, max 40 characters.
alter table public.homes add column if not exists by_name text not null default '' check (char_length(by_name) <= 40);
alter table public.jobs  add column if not exists by_name text not null default '' check (char_length(by_name) <= 40);
