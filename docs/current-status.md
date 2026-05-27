# barbergo — Current Status

Last updated: 2026-05-27

## Project maturity

**MVP stage:** Supabase-backed booking flow with **admin login**. Suitable for **internal/demo testing** on Expo Go and web preview. Production still needs polish (deep links, email allowlist, optional pull-to-refresh).

## Current working features

### Customer flow (German UI)

- Home → barber profile → service selection → booking form (`DD.MM.YYYY`, `HH:MM`)
- Booking confirmation screen + WhatsApp deeplink
- Provider and services loaded from **Supabase** when `apps/mobile/.env` is set
- New bookings **persist** to `bookings` table (customers can submit without login)
- Swiss date display; ISO date storage in Postgres

### Admin flow (login required)

- **Admin Login** via magic link email (`/admin/login`)
- Booking list and detail (status updates) — only when logged in
- Google Maps + WhatsApp deeplinks to customer
- Logout button on admin list

### Developer / diagnostics

- `SupabaseCatalogDebugPanel` on service selection (URL present, query counts, errors)
- Console logs: `[barbergo] Supabase catalog diagnostics`
- ntfy scripts (`scripts/notify-*.ps1`, topic `barbergo-muhammet`)

## Completed recently (2026-05-27)

- **Admin login** (magic link per E-Mail) before Buchungsliste
- **RLS 0003:** Kunden dürfen nur Anfragen stellen; Barber sieht/bearbeitet nur nach Login
- Startseite „Admin-Demo“ führt direkt zum Login

## Completed earlier (2026-05-24)

- Fixed **Expo env loading** for web/native (`app.config.js` → `expo.extra`, `services/supabase-env.ts`)
- Fixed **false “Demo-ID” errors** — seed UUIDs (`11111111-…`) are now accepted (`utils/uuid.ts`)
- **No mock provider/services** returned when Supabase client is configured (clear catalog errors instead)
- Specific error reasons: env missing, empty tables, RLS denied, query failed, demo IDs
- SQL migration **`0002_bookings_anon_mvp_policies.sql`** for anon read/update on `bookings` (MVP admin without auth)
- Booking form: validation cycle fix, web-safe alerts (`show-message.ts`), catalog error banners
- Troubleshooting notes in `docs/setup-notes.md`

## Architecture decisions (current)

| Area | Decision |
|------|----------|
| Backend | Supabase (Postgres + anon client); no Spring Boot in MVP |
| Mobile | Expo Router, NativeWind, German product copy |
| Env | `EXPO_PUBLIC_*` in `apps/mobile/.env`, mirrored via `app.config.js` `extra` |
| Data access | `providers.ts`, `catalog.ts`, `bookings.ts` + hooks; mappers in `supabase-mappers.ts` |
| Offline / failure | Mock data only when env missing or explicit offline demo; no silent mock IDs for Supabase writes |
| Auth | Supabase magic link for barber admin; customer flow stays without login |
| Comms | WhatsApp + Google Maps deeplinks only |

## Supabase setup status

| Step | Status |
|------|--------|
| Supabase project + `.env` | Configured locally (not in git) |
| `0001_initial_schema.sql` | Required — providers, services, bookings + base RLS |
| `seed.sql` | Required — demo barber + 4 services |
| `0003_bookings_auth_rls.sql` | **Required** — anon can only create pending bookings; admin read/update needs login |
| `0002_bookings_anon_mvp_policies.sql` | Legacy demo only (superseded by 0003) |
| Publishable/anon API key | Supported (`sb_publishable_*` tested) |

## Tested flows (checkpoint)

| Check | Result |
|-------|--------|
| `npm run lint` (apps/mobile) | Pass |
| Supabase SELECT providers/services/bookings (Node + `.env`) | Pass |
| Debug panel: URL present, counts 1 / 4 | Pass (user screenshot) |
| End-to-end booking + admin refresh | **Manual re-test recommended** after pull |

## Known issues / MVP compromises

- **RLS:** Migration 0002 allows **anon** read/update on `bookings` — acceptable for demo only; tighten before public release.
- **No barber auth** — anyone with the app can open Admin-Demo.
- **Debug panel** + diagnostics are gated behind `__DEV__`; invisible in production builds.
- **Web autofill** on booking form — not fully implemented (task aborted).
- **Expo must reload** after `.env` changes: `npx expo start -c`.
- **Bookings fallback** on network errors still uses in-memory mock for reads; writes show explicit errors.

## Open issues

- [ ] Full manual test: customer book → row in Table Editor → admin list after refresh
- [ ] Confirm migration 0002 applied on production Supabase project
- [ ] Confirm migration 0002 is applied on hosted Supabase project
- [ ] Production RLS + Supabase Auth for barber admin

## Environment requirements

- Node.js 18+ (LTS recommended)
- `apps/mobile/.env` (copy from `.env.example`) with real Supabase URL + anon/publishable key
- Expo CLI via `npx expo`
- Supabase project with migrations 0001 + **0002** + seed

## Important commands

```powershell
# From repo root
cd apps\mobile
npm install
npx expo start -c

# Supabase smoke test (optional, uses .env)
# See scripts in docs/setup-notes.md

# Notifications
cd ..\..
powershell -ExecutionPolicy Bypass -File scripts\notify-done.ps1
```

## Next recommended milestone

**Milestone: “Auth & RLS live”** — mostly done; verify on device

1. ~~Supabase Auth + admin login screen.~~ done
2. ~~RLS migration 0003 (stricter bookings).~~ done (run in SQL editor if not yet)
3. Manual test: customer books → admin logs in → sees booking → updates status
4. Supabase Dashboard: enable Email auth + redirect URL
5. Optional polish: pull-to-refresh, web autofill, production deep-link hardening

See [TODO.md](../TODO.md) for the task list.
