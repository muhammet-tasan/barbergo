-- Customers: auto-confirm email so signup works with global "Confirm email" ON.
-- Barbers (role=barber in user_metadata) still receive confirmation emails.

create or replace function public.handle_auth_user_auto_confirm_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'customer');
begin
  if meta_role in ('customer', 'barber_pending') then
    new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
    new.confirmed_at := coalesce(new.confirmed_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_auto_confirm_customer on auth.users;
create trigger on_auth_user_auto_confirm_customer
  before insert on auth.users
  for each row execute function public.handle_auth_user_auto_confirm_customer();
