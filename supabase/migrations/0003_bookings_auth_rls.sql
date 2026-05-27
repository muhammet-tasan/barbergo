-- Production-oriented RLS tightening for bookings.
-- Goal: anonymous users may only create pending booking requests.
-- Admin read/update requires Supabase Auth (authenticated).
--
-- Apply AFTER:
-- - 0001_initial_schema.sql
-- - (Optional) 0002_bookings_anon_mvp_policies.sql (this migration removes its anon policies)

-- Remove MVP demo policies (if present)
drop policy if exists "Anon can read bookings for MVP admin demo" on public.bookings;
drop policy if exists "Anon can update booking status for MVP admin demo" on public.bookings;

-- Remove previous authenticated admin policies (if present)
drop policy if exists "Authenticated admins can read bookings" on public.bookings;
drop policy if exists "Authenticated admins can update bookings" on public.bookings;

-- Keep insert policy from 0001 (recreate idempotently)
drop policy if exists "Public can create booking requests" on public.bookings;
create policy "Public can create booking requests"
on public.bookings
for insert
to anon, authenticated
with check (status = 'pending');

-- Admin policies: only authenticated users can read/update bookings
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

