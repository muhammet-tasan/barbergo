-- Safe additive columns for older Supabase projects (run after 0004/0005 if 0006/0007 not yet applied).

alter table public.profiles
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected'));

alter table public.profiles
  add column if not exists address text;

alter table public.profiles
  add column if not exists provider_id uuid references public.providers(id) on delete set null;

-- Signup trigger: barber → pending; works once approval_status exists
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

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert to authenticated
with check (
  id = auth.uid()
  and role in ('customer', 'barber')
);
