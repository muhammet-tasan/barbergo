# Supabase setup

Supabase is the MVP backend for barbergo. The mobile app uses Supabase when
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured.

## First project setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `migrations/0001_initial_schema.sql`.
4. Run `seed.sql`.
5. Run `migrations/0003_bookings_auth_rls.sql` (admin login required; removes MVP anon admin policies from 0002).
6. Copy `apps/mobile/.env.example` → `apps/mobile/.env`.
7. Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
8. In Supabase Dashboard → **Authentication** → enable Email provider; add redirect URL `barbergo://auth/callback` (for magic link).
9. Restart Expo with cache clear: `npx expo start -c`.

**Note:** Migration `0002_bookings_anon_mvp_policies.sql` was for the temporary demo without login. Use **0003** for the current app. 0002 is safe to re-run but not needed if 0003 is applied.

## Security notes

- Row Level Security is enabled on all tables.
- **Customers (anonymous):** can read active providers/services; can **create** booking requests with status `pending` only.
- **Barber (logged in):** can read and update bookings via Supabase Auth session.
- Never put a Supabase service role key in the mobile app.
