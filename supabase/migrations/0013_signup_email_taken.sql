-- Reliable duplicate-email check before signUp (anon-safe, security definer).
-- Supabase signUp often returns success for existing e-mails (anti-enumeration).

create or replace function public.signup_email_taken(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from auth.users u
    where lower(trim(u.email)) = lower(trim(p_email))
  );
$$;

revoke all on function public.signup_email_taken(text) from public;
grant execute on function public.signup_email_taken(text) to anon, authenticated;
