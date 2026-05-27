# Supabase setup

Supabase is the MVP backend for barbergo. The mobile app keeps using mock data until
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured.

## First project setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `migrations/0001_initial_schema.sql`.
4. Run `migrations/0002_bookings_anon_mvp_policies.sql` (required for admin list without login; safe to re-run — uses `DROP POLICY IF EXISTS`).
5. Run `seed.sql`.
6. Copy `apps/mobile/.env.example` to `apps/mobile/.env`.
7. Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
8. Restart Expo with cache clear: `npx expo start -c`.

## Security notes

- The migration enables Row Level Security.
- Anonymous users can read active providers/services and create pending booking requests.
- **Migration 0002** allows anonymous read/update on `bookings` for the MVP admin demo (no login yet). Tighten this before production.
- Never put a Supabase service role key in the mobile app.
