-- Phase 2b: profile phone column + admin profile for existing auth user
-- Run AFTER 0004 in Supabase SQL Editor.
-- Does NOT create auth users — only upserts public.profiles for admin@barbergo.ch.

alter table public.profiles
  add column if not exists phone text;

comment on column public.profiles.phone is
  'Contact phone for the account holder (admin/barber/customer). Source of truth — not user_metadata.';

-- Ensure profile row for manually created admin auth user
insert into public.profiles (id, role, display_name, phone)
select
  u.id,
  'admin',
  'BarberGo Admin',
  '+41 79 000 00 00'
from auth.users u
where lower(trim(u.email)) = lower('admin@barbergo.ch')
on conflict (id) do update set
  role = excluded.role,
  display_name = excluded.display_name,
  phone = excluded.phone;

-- Optional: keep signup trigger in sync with phone from metadata (display still from profiles)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'customer');
begin
  if meta_role not in ('customer', 'barber', 'admin') then
    meta_role := 'customer';
  end if;

  insert into public.profiles (id, role, display_name, phone)
  values (
    new.id,
    meta_role,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    nullif(trim(new.raw_user_meta_data->>'phone'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
