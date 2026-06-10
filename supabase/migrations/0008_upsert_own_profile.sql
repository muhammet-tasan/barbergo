-- Ensures profile save works when public.profiles row is missing (e.g. manual admin auth user).

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

    if exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and lower(trim(u.email)) = lower('admin@barbergo.ch')
    ) then
      v_role := 'admin';
    elsif v_meta_role in ('customer', 'barber', 'admin') then
      v_role := v_meta_role;
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
    address = excluded.address;
end;
$$;

revoke all on function public.upsert_own_profile(text, text, text) from public;
grant execute on function public.upsert_own_profile(text, text, text) to authenticated;
