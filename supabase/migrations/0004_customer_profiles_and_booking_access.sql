-- Phase 2: profiles, customer_id, guest access_token, customer + barber RLS
-- Run AFTER 0001, seed, and 0003 in Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- Profiles (roles)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'barber', 'admin')),
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Auto-create profile on signup
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

  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    meta_role,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for existing auth users
insert into public.profiles (id, role, display_name)
select
  u.id,
  case
    when coalesce(u.raw_user_meta_data->>'role', '') in ('customer', 'barber', 'admin')
      then u.raw_user_meta_data->>'role'
    else 'barber'
  end,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'display_name'), ''),
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Bookings: customer_id + access_token
-- ---------------------------------------------------------------------------

alter table public.bookings
  add column if not exists customer_id uuid references auth.users(id) on delete set null,
  add column if not exists access_token text;

create unique index if not exists bookings_access_token_uidx
  on public.bookings(access_token)
  where access_token is not null;

create index if not exists bookings_customer_id_idx
  on public.bookings(customer_id);

-- ---------------------------------------------------------------------------
-- Replace broad authenticated booking policies (0003) with role-aware rules
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated admins can read bookings" on public.bookings;
drop policy if exists "Authenticated admins can update bookings" on public.bookings;
drop policy if exists "Public can create booking requests" on public.bookings;

drop policy if exists "Guest can create pending booking" on public.bookings;
create policy "Guest can create pending booking"
on public.bookings for insert to anon
with check (
  status = 'pending'
  and customer_id is null
  and access_token is not null
);

drop policy if exists "Customer can create own pending booking" on public.bookings;
create policy "Customer can create own pending booking"
on public.bookings for insert to authenticated
with check (
  status = 'pending'
  and customer_id = auth.uid()
);

drop policy if exists "Customers read own bookings" on public.bookings;
create policy "Customers read own bookings"
on public.bookings for select to authenticated
using (customer_id = auth.uid());

drop policy if exists "Customers cancel own bookings" on public.bookings;
create policy "Customers cancel own bookings"
on public.bookings for update to authenticated
using (
  customer_id = auth.uid()
  and status in ('pending', 'confirmed')
)
with check (
  customer_id = auth.uid()
  and status = 'cancelled'
);

drop policy if exists "Barbers read all bookings" on public.bookings;
create policy "Barbers read all bookings"
on public.bookings for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('barber', 'admin')
  )
);

drop policy if exists "Barbers update bookings" on public.bookings;
create policy "Barbers update bookings"
on public.bookings for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('barber', 'admin')
  )
)
with check (true);

-- ---------------------------------------------------------------------------
-- Guest access via RPC (no anon SELECT on all token rows)
-- ---------------------------------------------------------------------------

create or replace function public.get_guest_booking(p_booking_id uuid, p_access_token text)
returns table (
  id uuid,
  provider_id uuid,
  service_id uuid,
  status public.booking_status,
  customer_name text,
  phone text,
  address text,
  appointment_date date,
  appointment_time text,
  note text,
  service_price_chf numeric,
  service_fee_chf numeric,
  total_chf numeric,
  customer_id uuid,
  access_token text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    b.id,
    b.provider_id,
    b.service_id,
    b.status,
    b.customer_name,
    b.phone,
    b.address,
    b.appointment_date,
    b.appointment_time,
    b.note,
    b.service_price_chf,
    b.service_fee_chf,
    b.total_chf,
    b.customer_id,
    b.access_token,
    b.created_at,
    b.updated_at
  from public.bookings b
  where b.id = p_booking_id
    and b.access_token = p_access_token
    and b.customer_id is null;
$$;

create or replace function public.cancel_guest_booking(p_booking_id uuid, p_access_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.bookings%rowtype;
  v_start timestamptz;
begin
  select * into v_row
  from public.bookings
  where id = p_booking_id
    and access_token = p_access_token
    and customer_id is null
  for update;

  if not found then
    return false;
  end if;

  if v_row.status not in ('pending', 'confirmed') then
    raise exception 'Termin kann in diesem Status nicht storniert werden';
  end if;

  v_start := v_row.appointment_date::timestamptz + v_row.appointment_time::time;
  if v_start <= now() + interval '24 hours' then
    raise exception 'Storno nur bis 24 Stunden vor Terminbeginn möglich';
  end if;

  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id;

  return true;
end;
$$;

grant execute on function public.get_guest_booking(uuid, text) to anon, authenticated;
grant execute on function public.cancel_guest_booking(uuid, text) to anon, authenticated;
