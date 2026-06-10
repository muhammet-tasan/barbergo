-- Fix infinite recursion in profiles RLS (admin policies querying profiles).
-- On barber approval: create provider + default services + weekly availability.

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles"
on public.profiles for select to authenticated
using (public.is_admin_user());

drop policy if exists "Admin update all profiles" on public.profiles;
create policy "Admin update all profiles"
on public.profiles for update to authenticated
using (public.is_admin_user())
with check (true);

drop policy if exists "Admin read all bookings" on public.bookings;
create policy "Admin read all bookings"
on public.bookings for select to authenticated
using (public.is_admin_user());

drop policy if exists "Admin update all bookings" on public.bookings;
create policy "Admin update all bookings"
on public.bookings for update to authenticated
using (public.is_admin_user())
with check (true);

drop policy if exists "Admin manage own push tokens" on public.admin_push_tokens;
create policy "Admin manage own push tokens"
on public.admin_push_tokens for all to authenticated
using (user_id = auth.uid() and public.is_admin_user())
with check (user_id = auth.uid() and public.is_admin_user());

create or replace function public.approve_barber_profile(
  p_profile_id uuid,
  p_approval text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
  v_provider_id uuid;
begin
  if not public.is_admin_user() then
    raise exception 'FORBIDDEN';
  end if;

  select display_name, provider_id
    into v_display_name, v_provider_id
  from public.profiles
  where id = p_profile_id and role = 'barber';

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  if p_approval = 'approved' then
    if v_provider_id is null then
      insert into public.providers (name, description, service_area, is_active)
      values (
        coalesce(nullif(trim(v_display_name), ''), 'Barber'),
        'Mobiler Barber — Hausbesuche in Basel & Umgebung.',
        'Basel & Umgebung',
        true
      )
      returning id into v_provider_id;

      insert into public.services (provider_id, name, price_chf, duration_minutes, sort_order, is_active)
      values
        (v_provider_id, 'Herrenhaarschnitt', 45, 30, 1, true),
        (v_provider_id, 'Bart trimmen', 25, 20, 2, true),
        (v_provider_id, 'Haarschnitt + Bart', 60, 45, 3, true),
        (v_provider_id, 'Kinderhaarschnitt', 35, 25, 4, true);

      insert into public.barber_weekly_availability (provider_id, weekday, start_time, end_time, buffer_minutes)
      select v_provider_id, d.weekday, '09:00'::time, '18:00'::time, 15
      from generate_series(1, 6) as d(weekday);
    end if;

    update public.profiles
    set approval_status = 'approved',
        provider_id = v_provider_id
    where id = p_profile_id and role = 'barber';
  elsif p_approval = 'rejected' then
    update public.profiles
    set approval_status = 'rejected'
    where id = p_profile_id and role = 'barber';
  else
    raise exception 'INVALID_APPROVAL';
  end if;
end;
$$;

grant execute on function public.approve_barber_profile(uuid, text) to authenticated;
