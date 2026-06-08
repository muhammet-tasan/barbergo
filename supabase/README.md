# Supabase setup

Supabase is the MVP backend for barbergo. The mobile app uses Supabase when
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured.

## First project setup (recommended secure baseline)

1. Create a Supabase project.
2. Open **Supabase → SQL Editor**.
3. Run migrations in order:
   - **`migrations/0001_initial_schema.sql`** — tables + base RLS
   - **`seed.sql`** — demo barber + services (Basel)
   - **`migrations/0003_bookings_auth_rls.sql`** — secure baseline (guest insert; barber read/update)
   - **`migrations/0004_customer_profiles_and_booking_access.sql`** — Phase 2: profiles, `customer_id`, guest `access_token`, customer RLS
   - **`migrations/0005_profiles_phone_admin_seed.sql`** — `profiles.phone`, admin profile for existing `admin@barbergo.ch` (no duplicate auth user)
   - **`migrations/0006_slots_roles_profiles.sql`** — slot booking (`start_at`/`end_at`), `book_slot` + `get_available_slots` RPC, `barber_pending`, availability/blocked-time tables, admin/barber RLS split
4. Copy `apps/mobile/.env.example` → `apps/mobile/.env`.
5. Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
6. Keep **`EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`** (default in `.env.example`).
7. Create staff user in **Authentication → Users** (e.g. `admin@barbergo.ch` — **do not duplicate** if already exists).
   - Run **`0005`** to upsert `public.profiles` with `role = admin` (or `barber`).
   - **Roles live in `public.profiles.role`**, not User Metadata. See **`docs/admin-account.md`**.
8. Restart Expo: `cd apps/mobile && npx expo start -c`.

### Exact SQL to run in Supabase SQL Editor

Run **three separate executions** (or paste each file in full):

| Step | File | Purpose |
|------|------|---------|
| 1 | `supabase/migrations/0001_initial_schema.sql` | Schema + RLS on `providers`, `services`, `bookings` |
| 2 | `supabase/seed.sql` | Demo provider + 4 services |
| 3 | `supabase/migrations/0003_bookings_auth_rls.sql` | Remove anon booking read/update; keep anon **insert** (`pending` only) |
| 4 | `supabase/migrations/0004_customer_profiles_and_booking_access.sql` | Profiles, customer bookings, guest access token, barber-only admin RLS |
| 5 | `supabase/migrations/0005_profiles_phone_admin_seed.sql` | Profile phone column + admin row for `admin@barbergo.ch` |
| 6 | `supabase/migrations/0006_slots_roles_profiles.sql` | Slot RPC, roles split, availability schema, profile field protection |

**Do not run `0003` before `0001`.** `0003` is idempotent and removes any prior demo policies from `0002_*` if they were applied earlier.

Verify RLS locally (optional):

```powershell
cd apps/mobile
node scripts/verify-rls-0003.mjs
```

## Demo-only RLS (insecure — local experiments only)

If you need Admin **without** login (no Supabase Auth user), run **`0002_mvp_anon_bookings_access.sql`** instead of **`0003`**, and set `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=false` in `.env`.

Legacy file `0002_bookings_anon_mvp_policies.sql` is equivalent to older docs — prefer `0002_mvp_anon_bookings_access.sql`. **Never use 0002 paths for production or public release.**

## Barber admin login

The app includes `/login` (E-Mail + Passwort).

1. Staff user in Supabase Auth + matching row in **`public.profiles`** (`role` = `admin` for `admin@barbergo.ch`; approved barbers `role` = `barber`).
2. `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` blocks `/admin` without login (when Supabase is configured).
3. With **`0003`**–**`0006`**, RLS and the app read roles from **`profiles.role`**. Admin → `/admin`; approved barber → `/barber/dashboard`.
4. Auth password settings: see **`docs/supabase-auth-settings.md`**.

### Customer registration (E-Mail)

By default Supabase sends a **confirmation e-mail**; the user appears under **Authentication → Users** (often as „Waiting for verification“) and cannot log in until confirmed.

**For local testing:** Supabase Dashboard → **Authentication** → **Providers** → **Email** → disable **Confirm email**.

After confirmation (or with confirm off), a row is created in **`public.profiles`** via trigger.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Admin list empty after login | `0003` not applied; only `0001` active | Run `0003`; log in as barber |
| Admin list empty, not logged in | Expected with `0003` + auth required | Log in at `/admin/login` |
| Cannot save booking | Missing `.env`, invalid UUIDs, or RLS insert blocked | Check `.env`, run `0001`+`seed`, ensure status `pending` |
| Admin works without login | `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=false` or demo `0002` RLS | Enable auth flag + run `0003` |

## Security notes

- Row Level Security is enabled on all tables.
- **Customers (anonymous):** read active providers/services; **create** pending bookings only.
- **Barber (logged in):** read/update bookings when **`0003`** (or `0001` authenticated policies) apply.
- **Demo (`0002_*`):** anon can read/update all bookings — documented for offline experiments only.
- Never put a Supabase **service role** key in the mobile app.

See also `docs/pre-launch-checklist.md` before any public release.

