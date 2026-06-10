-- Admin profile lists + save (bypass broken RLS recursion without 0010).
-- Safe to re-run.

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
  or exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(trim(u.email)) = lower('admin@barbergo.ch')
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

create or replace function public.list_profiles_for_admin()
returns table (
  id uuid,
  role text,
  display_name text,
  phone text,
  address text,
  approval_status text,
  provider_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user() then
    raise exception 'FORBIDDEN';
  end if;

  return query
  select
    p.id,
    case when p.role = 'barber_pending' then 'barber' else p.role end,
    p.display_name,
    p.phone,
    p.address,
    case
      when p.role = 'barber_pending' then 'pending'
      else coalesce(p.approval_status, 'approved')
    end,
    p.provider_id
  from public.profiles p
  order by p.role, p.display_name nulls last;
end;
$$;

revoke all on function public.list_profiles_for_admin() from public;
grant execute on function public.list_profiles_for_admin() to authenticated;

create or replace function public.upsert_own_profile(
  p_display_name text,
  p_phone text default null,
  p_address text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_meta_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();

  if v_role is null then
    select nullif(trim(raw_user_meta_data->>'role'), '')
      into v_meta_role
    from auth.users
    where id = auth.uid();

    if public.is_admin_user() then
      v_role := 'admin';
    elsif v_meta_role in ('customer', 'barber', 'barber_pending') then
      v_role := case when v_meta_role in ('barber', 'barber_pending') then 'barber' else 'customer' end;
    else
      v_role := 'customer';
    end if;
  end if;

  insert into public.profiles (id, role, display_name, phone, address)
  values (
    auth.uid(),
    v_role,
    nullif(trim(p_display_name), ''),
    nullif(trim(p_phone), ''),
    nullif(trim(p_address), '')
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    phone = excluded.phone,
    address = coalesce(excluded.address, public.profiles.address);
end;
$$;

grant execute on function public.upsert_own_profile(text, text, text) to authenticated;
