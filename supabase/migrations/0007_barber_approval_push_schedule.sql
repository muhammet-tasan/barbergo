-- Barber approval flow (role=barber + approval_status=pending), push tokens, day schedule RPC
-- Run AFTER 0006. Does not create auth users or passwords.

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------------------
-- Profiles: address, barber role model (no new barber_pending registrations)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists address text;

-- Migrate legacy barber_pending → barber with same approval_status
update public.profiles
set role = 'barber'
where role = 'barber_pending';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('customer', 'barber', 'admin'));

-- Signup: barber registrations get role=barber, approval_status=pending
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'customer');
  resolved_role text := 'customer';
  resolved_approval text := 'approved';
begin
  if meta_role in ('barber', 'barber_pending') then
    resolved_role := 'barber';
    resolved_approval := 'pending';
  elsif meta_role = 'admin' then
    resolved_role := 'customer';
    resolved_approval := 'approved';
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
-- Admin Expo push tokens
-- ---------------------------------------------------------------------------

create table if not exists public.admin_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  device_name text,
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index if not exists admin_push_tokens_user_idx on public.admin_push_tokens(user_id);

alter table public.admin_push_tokens enable row level security;

create policy "Admin manage own push tokens"
on public.admin_push_tokens for all to authenticated
using (
  user_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  user_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Edge Function (service role) reads all admin tokens — no client policy needed

-- ---------------------------------------------------------------------------
-- Notify admins on new pending barber (via pg_net → Edge Function)
-- Set in Supabase Dashboard → Project Settings → Database → custom config:
--   app.notify_new_barber_url = https://<ref>.supabase.co/functions/v1/notify-new-barber
--   app.notify_new_barber_secret = <service_role_or_anon_with_fn_jwt>
-- Or deploy Edge Function and configure webhook manually (see docs/push-notifications.md)
-- ---------------------------------------------------------------------------

create or replace function public.trigger_notify_new_barber()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_secret text;
  v_body jsonb;
begin
  if NEW.role = 'barber' and NEW.approval_status = 'pending' then
    begin
      v_url := current_setting('app.notify_new_barber_url', true);
      v_secret := current_setting('app.notify_new_barber_secret', true);
    exception when others then
      v_url := null;
      v_secret := null;
    end;

    if v_url is not null and v_url <> '' then
      v_body := jsonb_build_object(
        'type', 'INSERT',
        'record', jsonb_build_object(
          'id', NEW.id,
          'role', NEW.role,
          'display_name', NEW.display_name,
          'phone', NEW.phone,
          'approval_status', NEW.approval_status
        )
      );

      perform net.http_post(
        url := v_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || coalesce(v_secret, '')
        ),
        body := v_body
      );
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists profiles_notify_new_barber on public.profiles;
create trigger profiles_notify_new_barber
  after insert on public.profiles
  for each row execute function public.trigger_notify_new_barber();

-- ---------------------------------------------------------------------------
-- get_provider_day_schedule — all slots (free + booked) for barber calendar
-- ---------------------------------------------------------------------------

create or replace function public.get_provider_day_schedule(
  p_provider_id uuid,
  p_date date,
  p_step_minutes integer default 15
)
returns table (
  slot_start timestamptz,
  slot_end timestamptz,
  is_booked boolean,
  booking_id uuid,
  customer_name text,
  phone text,
  customer_id uuid,
  service_id uuid,
  booking_status text,
  address text,
  note text,
  customer_email text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_weekday smallint;
  v_rec record;
  v_slot timestamptz;
  v_slot_end timestamptz;
  v_day_end timestamptz;
  v_step interval;
  v_bk public.bookings%rowtype;
  v_email text;
begin
  if auth.uid() is not null and not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'barber' and p.approval_status = 'approved' and p.provider_id = p_provider_id)
      )
  ) then
    raise exception 'FORBIDDEN';
  end if;

  v_weekday := extract(isodow from (p_date::timestamp at time zone 'Europe/Zurich'));
  v_step := (p_step_minutes || ' minutes')::interval;

  for v_rec in
    select a.start_time, a.end_time
    from public.barber_weekly_availability a
    where a.provider_id = p_provider_id
      and a.weekday = v_weekday
      and a.is_active = true
  loop
    v_slot := (p_date::text || ' ' || v_rec.start_time::text)::timestamp at time zone 'Europe/Zurich';
    v_day_end := (p_date::text || ' ' || v_rec.end_time::text)::timestamp at time zone 'Europe/Zurich';

    while v_slot < v_day_end loop
      v_slot_end := v_slot + v_step;

      select bk.* into v_bk
      from public.bookings bk
      where bk.provider_id = p_provider_id
        and bk.status in ('pending', 'confirmed')
        and bk.start_at is not null
        and bk.end_at is not null
        and bk.start_at < v_slot_end
        and bk.end_at > v_slot
      order by bk.start_at
      limit 1;

      if v_bk.id is not null then
        slot_start := v_bk.start_at;
        slot_end := v_bk.end_at;
        is_booked := true;
        booking_id := v_bk.id;
        customer_name := v_bk.customer_name;
        phone := v_bk.phone;
        customer_id := v_bk.customer_id;
        service_id := v_bk.service_id;
        booking_status := v_bk.status;
        address := v_bk.address;
        note := v_bk.note;
        if v_bk.customer_id is not null then
          select u.email into v_email from auth.users u where u.id = v_bk.customer_id;
        else
          v_email := null;
        end if;
        customer_email := v_email;
        return next;
        v_slot := v_bk.end_at;
      elsif not exists (
        select 1 from public.barber_blocked_times b
        where b.provider_id = p_provider_id
          and b.start_at < v_slot_end
          and b.end_at > v_slot
      ) then
        slot_start := v_slot;
        slot_end := v_slot_end;
        is_booked := false;
        booking_id := null;
        customer_name := null;
        phone := null;
        customer_id := null;
        service_id := null;
        booking_status := null;
        address := null;
        note := null;
        customer_email := null;
        return next;
        v_slot := v_slot + v_step;
      else
        v_slot := v_slot + v_step;
      end if;
    end loop;
  end loop;
end;
$$;

grant execute on function public.get_provider_day_schedule(uuid, date, integer) to authenticated;

-- Fix get_available_slots: also exclude slots without start_at bookings using legacy date/time
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
          and (
            (bk.start_at is not null and bk.end_at is not null
             and bk.start_at < v_slot_end + (v_buffer || ' minutes')::interval
             and bk.end_at + (v_buffer || ' minutes')::interval > v_slot)
            or (
              bk.start_at is null
              and bk.appointment_date = p_date
              and bk.appointment_time is not null
              and (p_date::text || ' ' || bk.appointment_time)::timestamp at time zone 'Europe/Zurich' < v_slot_end
              and (p_date::text || ' ' || bk.appointment_time)::timestamp at time zone 'Europe/Zurich'
                  + (v_duration || ' minutes')::interval > v_slot
            )
          )
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

-- Admin approve barber: set demo provider link for single-barber MVP
create or replace function public.approve_barber_profile(
  p_profile_id uuid,
  p_approval text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'FORBIDDEN';
  end if;

  if p_approval = 'approved' then
    update public.profiles
    set approval_status = 'approved',
        provider_id = coalesce(provider_id, '11111111-1111-1111-1111-111111111111'::uuid)
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
