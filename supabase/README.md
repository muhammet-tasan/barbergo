# Supabase setup

Supabase is the MVP backend for barbergo. The mobile app uses Supabase when
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured.

## First project setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `migrations/0001_initial_schema.sql`.
4. Run `seed.sql`.
5. Choose RLS path:
   - **Demo without login:** `migrations/0002_mvp_anon_bookings_access.sql`
   - **Admin login required:** `migrations/0003_bookings_auth_rls.sql` (stricter; run instead of 0002)
6. Copy `apps/mobile/.env.example` → `apps/mobile/.env`.
7. Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
8. Create barber user: Supabase Dashboard → **Authentication** → **Users**.
9. Restart Expo: `npx expo start -c`.

## Barber admin login

The app includes `/admin/login` (E-Mail + Passwort).

1. Create a barber user in Supabase Auth.
2. Optional: `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` in `apps/mobile/.env` to block Admin without login.
3. With `0003` applied, admin read/update requires login; customers can still book as anon.

## Troubleshooting (empty Admin-Demo / cannot save bookings)

1. The app uses the **anon** role (publishable key), not the dashboard service role.
2. Migration `0001` only allows **authenticated** users to `select`/`update` bookings — anon gets `[]` or RLS error `42501`.
3. Run `0002` (demo) or log in after `0003` (auth), then restart Expo.

## Security notes

- Row Level Security is enabled on all tables.
- **Customers (anonymous):** read active providers/services; create pending bookings.
- **Barber (logged in):** read/update bookings when `0003` or `0001` authenticated policies apply.
- **MVP demo (`0002`):** anon can read/update bookings — not for production. See `docs/pre-launch-checklist.md`.
- Never put a Supabase service role key in the mobile app.
