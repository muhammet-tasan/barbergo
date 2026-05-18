-- barbergo MVP Supabase schema
-- Run this in a fresh Supabase project before connecting the mobile app.

create extension if not exists pgcrypto;

create type public.booking_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  service_area text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  name text not null,
  price_chf numeric(10, 2) not null check (price_chf >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id),
  service_id uuid not null references public.services(id),
  status public.booking_status not null default 'pending',
  customer_name text not null,
  phone text not null,
  address text not null,
  appointment_date date not null,
  appointment_time text not null,
  note text,
  service_price_chf numeric(10, 2) not null check (service_price_chf >= 0),
  service_fee_chf numeric(10, 2) not null default 1 check (service_fee_chf >= 0),
  total_chf numeric(10, 2) not null check (total_chf >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_provider_date_idx
  on public.bookings(provider_id, appointment_date, appointment_time);

create index services_provider_sort_idx
  on public.services(provider_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

alter table public.providers enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

create policy "Public can read active providers"
on public.providers
for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active services"
on public.services
for select
to anon, authenticated
using (is_active = true);

create policy "Public can create booking requests"
on public.bookings
for insert
to anon, authenticated
with check (status = 'pending');

create policy "Authenticated admins can read bookings"
on public.bookings
for select
to authenticated
using (true);

create policy "Authenticated admins can update bookings"
on public.bookings
for update
to authenticated
using (true)
with check (true);
