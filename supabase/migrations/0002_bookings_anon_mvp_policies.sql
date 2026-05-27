-- MVP fix: mobile app uses the anon key without Supabase Auth.
-- 0001 only allows authenticated users to read/update bookings, so inserts may succeed
-- but the admin list stays empty and Table Editor is the only place to verify rows.
--
-- Run this in the Supabase SQL editor after 0001_initial_schema.sql.

drop policy if exists "Authenticated admins can read bookings" on public.bookings;
drop policy if exists "Authenticated admins can update bookings" on public.bookings;
drop policy if exists "Anon can read bookings for MVP admin demo" on public.bookings;
drop policy if exists "Anon can update booking status for MVP admin demo" on public.bookings;

create policy "Anon can read bookings for MVP admin demo"
on public.bookings
for select
to anon, authenticated
using (true);

create policy "Anon can update booking status for MVP admin demo"
on public.bookings
for update
to anon, authenticated
using (true)
with check (true);
