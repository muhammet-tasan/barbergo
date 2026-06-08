-- Slot booking, role split (admin / barber / customer), availability schema
-- Run AFTER 0005. Does not create auth users or passwords.
-- Preserves 0005 admin@barbergo.ch profile seed intent.

-- ---------------------------------------------------------------------------
-- Profiles: barber_pending, approval_status, provider link, phone already in 0005
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists provider_id uuid references public.providers(id) on delete set null;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('customer', 'barber', 'admin', 'barber_pending'));

-- Keep admin profile (do not duplicate auth user)
insert into public.profiles (id, role, display_name, phone, approval_status)
select
  u.id,
  'admin',
  'BarberGo Admin',
  '+41 79 000 00 00',
  'approved'
from auth.users u
where lower(trim(u.email)) = lower('admin@barbergo.ch')
on conflict (id) do update set
  role = 'admin',
  approval_status = 'approved',
  display_name = coalesce(public.profiles.display_name, excluded.display_name),
  phone = coalesce(public.profiles.phone, excluded.phone);

-- ---------------------------------------------------------------------------
-- Bookings: UTC start/end (legacy date/time columns kept for compatibility)
-- ---------------------------------------------------------------------------

alter table public.bookings
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz;

create index if not exists bookings_provider_start_at_idx
  on public.bookings(provider_id, start_at)
  where status in ('pending', 'confirmed');

-- ---------------------------------------------------------------------------
-- Barber availability
-- ---------------------------------------------------------------------------

create table if not exists public.barber_weekly_availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0),
  check (end_time > start_time)
);

create index if not exists barber_weekly_availability_provider_idx
  on public.barber_weekly_availability(provider_id, weekday)
  where is_active = true;

create table if not exists public.barber_blocked_times (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  check (end_at > start_at)
);

create index if not exists barber_blocked_times_provider_idx
  on public.barber_blocked_times(provider_id, start_at, end_at);

alter table public.barber_weekly_availability enable row level security;
alter table public.barber_blocked_times enable row level security;

-- Demo availability for seed provider (Mon–Sat 09:00–18:00, 15 min buffer)
insert into public.barber_weekly_availability (provider_id, weekday, start_time, end_time, buffer_minutes)
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  d.weekday,
  '09:00'::time,
  '18:00'::time,
  15
from generate_series(1, 6) as d(weekday)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Profile field protection (users cannot self-promote)
-- ---------------------------------------------------------------------------

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and auth.uid() = old.id then
    if new.role is distinct from old.role
       or new.approval_status is distinct from old.approval_status
       or new.provider_id is distinct from old.provider_id then
      raise exception 'ROLE_CHANGE_FORBIDDEN';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged on public.profiles;
create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- Signup trigger: barber_pending from metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'customer');
  resolved_role text;
  resolved_approval text := 'approved';
begin
  if meta_role = 'barber' or meta_role = 'barber_pending' then
    resolved_role := 'barber_pending';
    resolved_approval := 'pending';
  elsif meta_role = 'admin' then
    resolved_role := 'customer';
    resolved_approval := 'approved';
  elsif meta_role = 'customer' then
    resolved_role := 'customer';
  else
    resolved_role := 'customer';
  end if;

  insert into public.profiles (id, role, display_name, phone, approval_status)
  values (
    new.id,
    resolved_role,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    resolved_approval
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: profiles — admin reads/updates all; users own row
-- ---------------------------------------------------------------------------

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

create policy "Users read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "Admin read all profiles"
on public.profiles for select to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Users update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admin update all profiles"
on public.profiles for update to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (true);

-- Availability: public read for slot picker; barber/admin manage own provider
create policy "Public read active availability"
on public.barber_weekly_availability for select to anon, authenticated
using (is_active = true);

create policy "Staff manage availability"
on public.barber_weekly_availability for all to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'barber')
      and (p.role = 'admin' or p.provider_id = provider_id)
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'barber')
      and (p.role = 'admin' or p.provider_id = provider_id)
  )
);

create policy "Public read blocked times"
on public.barber_blocked_times for select to anon, authenticated
using (true);

create policy "Staff manage blocked times"
on public.barber_blocked_times for all to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'barber')
      and (p.role = 'admin' or p.provider_id = provider_id)
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'barber')
      and (p.role = 'admin' or p.provider_id = provider_id)
  )
);

-- ---------------------------------------------------------------------------
-- Bookings RLS: split admin (all) vs barber (own provider) vs customer (own)
-- ---------------------------------------------------------------------------

drop policy if exists "Barbers read all bookings" on public.bookings;
drop policy if exists "Barbers update bookings" on public.bookings;

create policy "Admin read all bookings"
on public.bookings for select to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "Admin update all bookings"
on public.bookings for update to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (true);

create policy "Barbers read provider bookings"
on public.bookings for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'barber'
      and p.approval_status = 'approved'
      and p.provider_id = bookings.provider_id
  )
);

create policy "Barbers update provider bookings"
on public.bookings for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'barber'
      and p.approval_status = 'approved'
      and p.provider_id = bookings.provider_id
  )
)
with check (true);

-- ---------------------------------------------------------------------------
-- get_available_slots — Europe/Zurich weekday from p_date
-- ---------------------------------------------------------------------------

create or replace function public.get_available_slots(
  p_provider_id uuid,
  p_service_id uuid,
  p_date date
)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration integer;
  v_buffer integer;
  v_weekday smallint;
  v_rec record;
  v_slot timestamptz;
  v_slot_end timestamptz;
  v_step interval := interval '15 minutes';
begin
  select duration_minutes into v_duration
  from public.services
  where id = p_service_id and provider_id = p_provider_id and is_active = true;

  if v_duration is null then
    return;
  end if;

  v_weekday := extract(isodow from (p_date::timestamp at time zone 'Europe/Zurich'));

  for v_rec in
    select a.start_time, a.end_time, a.buffer_minutes
    from public.barber_weekly_availability a
    where a.provider_id = p_provider_id
      and a.weekday = v_weekday
      and a.is_active = true
  loop
    v_buffer := coalesce(v_rec.buffer_minutes, 0);
    v_slot := (p_date::text || ' ' || v_rec.start_time::text)::timestamp at time zone 'Europe/Zurich';

    while v_slot + (v_duration || ' minutes')::interval <=
          (p_date::text || ' ' || v_rec.end_time::text)::timestamp at time zone 'Europe/Zurich'
    loop
      v_slot_end := v_slot + (v_duration || ' minutes')::interval;

      if not exists (
        select 1 from public.barber_blocked_times b
        where b.provider_id = p_provider_id
          and b.start_at < v_slot_end
          and b.end_at > v_slot
      ) and not exists (
        select 1 from public.bookings bk
        where bk.provider_id = p_provider_id
          and bk.status in ('pending', 'confirmed')
          and bk.start_at is not null
          and bk.end_at is not null
          and bk.start_at < v_slot_end + (v_buffer || ' minutes')::interval
          and bk.end_at + (v_buffer || ' minutes')::interval > v_slot
      ) then
        slot_start := v_slot;
        slot_end := v_slot_end;
        return next;
      end if;

      v_slot := v_slot + v_step;
    end loop;
  end loop;
end;
$$;

grant execute on function public.get_available_slots(uuid, uuid, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- book_slot — atomic insert with overlap check, default status confirmed
-- ---------------------------------------------------------------------------

create or replace function public.book_slot(
  p_provider_id uuid,
  p_service_id uuid,
  p_start_at timestamptz,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_note text default null,
  p_customer_id uuid default null,
  p_access_token text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration integer;
  v_price numeric;
  v_fee numeric := 1;
  v_total numeric;
  v_end_at timestamptz;
  v_buffer integer := 15;
  v_booking_id uuid := gen_random_uuid();
  v_local_date date;
  v_local_time text;
begin
  select duration_minutes, price_chf into v_duration, v_price
  from public.services
  where id = p_service_id and provider_id = p_provider_id and is_active = true;

  if v_duration is null then
    raise exception 'SERVICE_NOT_FOUND';
  end if;

  v_end_at := p_start_at + (v_duration || ' minutes')::interval;

  if exists (
    select 1 from public.barber_blocked_times b
    where b.provider_id = p_provider_id
      and b.start_at < v_end_at
      and b.end_at > p_start_at
  ) then
    raise exception 'SLOT_BLOCKED';
  end if;

  if exists (
    select 1 from public.bookings bk
    where bk.provider_id = p_provider_id
      and bk.status in ('pending', 'confirmed')
      and bk.start_at is not null
      and bk.end_at is not null
      and bk.start_at < v_end_at + (v_buffer || ' minutes')::interval
      and bk.end_at + (v_buffer || ' minutes')::interval > p_start_at
  ) then
    raise exception 'SLOT_TAKEN';
  end if;

  v_total := v_price + v_fee;
  v_local_date := (p_start_at at time zone 'Europe/Zurich')::date;
  v_local_time := to_char(p_start_at at time zone 'Europe/Zurich', 'HH24:MI');

  insert into public.bookings (
    id, provider_id, service_id, status,
    customer_name, phone, address, note,
    appointment_date, appointment_time,
    start_at, end_at,
    service_price_chf, service_fee_chf, total_chf,
    customer_id, access_token
  ) values (
    v_booking_id, p_provider_id, p_service_id, 'confirmed',
    trim(p_customer_name), trim(p_phone), trim(p_address), nullif(trim(p_note), ''),
    v_local_date, v_local_time,
    p_start_at, v_end_at,
    v_price, v_fee, v_total,
    p_customer_id, p_access_token
  );

  return v_booking_id;
end;
$$;

grant execute on function public.book_slot(uuid, uuid, timestamptz, text, text, text, text, uuid, text) to anon, authenticated;
