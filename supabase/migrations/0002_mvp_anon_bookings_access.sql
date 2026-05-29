-- MVP: allow mobile app (anon / publishable key) to use bookings for demo without Auth.
-- Run in Supabase → SQL Editor if Admin-Demo is empty or saves fail with RLS 42501.
-- Safe to re-run: drops policies by name before recreate.

drop policy if exists "MVP anon can read bookings" on public.bookings;
drop policy if exists "MVP anon can create pending bookings" on public.bookings;
drop policy if exists "MVP anon can update booking status" on public.bookings;

create policy "MVP anon can read bookings"
on public.bookings
for select
to anon, authenticated
using (true);

create policy "MVP anon can create pending bookings"
on public.bookings
for insert
to anon, authenticated
with check (status = 'pending');

create policy "MVP anon can update booking status"
on public.bookings
for update
to anon, authenticated
using (true)
with check (true);
