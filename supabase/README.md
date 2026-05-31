# Supabase setup

Supabase is the MVP backend for barbergo. The mobile app uses Supabase when
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured.

## First project setup (recommended secure baseline)

1. Create a Supabase project.
2. Open **Supabase → SQL Editor**.
3. Run migrations in order:
   - **`migrations/0001_initial_schema.sql`** — tables + base RLS
   - **`seed.sql`** — demo barber + services (Basel)
   - **`migrations/0003_bookings_auth_rls.sql`** — **secure baseline** (guest book only; admin read/update needs login)
4. Copy `apps/mobile/.env.example` → `apps/mobile/.env`.
5. Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
6. Keep **`EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`** (default in `.env.example`).
7. Create barber user: **Authentication → Users → Add user** (E-Mail + Passwort).
   - Optional metadata for role: `{ "role": "barber" }` in **User Metadata** (default if omitted).
   - Customer accounts: `{ "role": "customer" }`.
8. Restart Expo: `cd apps/mobile && npx expo start -c`.

### Exact SQL to run in Supabase SQL Editor

Run **three separate executions** (or paste each file in full):

| Step | File | Purpose |
|------|------|---------|
| 1 | `supabase/migrations/0001_initial_schema.sql` | Schema + RLS on `providers`, `services`, `bookings` |
| 2 | `supabase/seed.sql` | Demo provider + 4 services |
| 3 | `supabase/migrations/0003_bookings_auth_rls.sql` | Remove anon booking read/update; keep anon **insert** (`pending` only) |

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

The app includes `/admin/login` (E-Mail + Passwort).

1. Create a barber user in Supabase Auth.
2. `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` blocks `/admin` without login (when Supabase is configured).
3. With **`0003`** applied, RLS also blocks anon read/update on `bookings`; customers can still book as anon.

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
