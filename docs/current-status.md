# barbergo — Current Status

Last updated: 2026-05-24 (end-of-day checkpoint)

## Project maturity

**MVP stage:** Supabase-backed mobile booking flow is implemented and stabilized. Suitable for **internal/demo testing** on Expo Go and web preview. Not production-ready (RLS/auth hardening pending).

## Current working features

### Customer flow (German UI)

- Home → barber profile → service selection → booking form (`DD.MM.YYYY`, `HH:MM`)
- Booking confirmation screen + WhatsApp deeplink
- Provider and services loaded from **Supabase** when `apps/mobile/.env` is set
- New bookings **persist** to `bookings` table (with RLS migration 0002 applied)
- Swiss date display; ISO date storage in Postgres

### Admin demo flow

- Booking list and detail (status updates)
- Google Maps + WhatsApp deeplinks to customer
- List reloads from Supabase on screen focus

### Developer / diagnostics

- `SupabaseCatalogDebugPanel` on service selection (URL present, query counts, errors)
- Console logs: `[barbergo] Supabase catalog diagnostics`
- ntfy scripts (`scripts/notify-*.ps1`, topic `barbergo-muhammet`)

## Completed today (2026-05-24)

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
| Auth | Deferred — admin uses anon key + relaxed RLS for demo |
| Comms | WhatsApp + Google Maps deeplinks only |

## Supabase setup status

| Step | Status |
|------|--------|
| Supabase project + `.env` | Configured locally (not in git) |
| `0001_initial_schema.sql` | Required — providers, services, bookings + base RLS |
| `seed.sql` | Required — demo barber + 4 services |
| `0002_bookings_anon_mvp_policies.sql` | **Required** for admin list + status updates without login |
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
- **Debug panel** visible on service screen — remove or gate behind `__DEV__` before production.
- **Web autofill** on booking form — not fully implemented (task aborted).
- **Expo must reload** after `.env` changes: `npx expo start -c`.
- **Bookings fallback** on network errors still uses in-memory mock for reads; writes show explicit errors.

## Open issues

- [ ] Full manual test: customer book → row in Table Editor → admin list after refresh
- [ ] Confirm migration 0002 applied on production Supabase project
- [ ] Optional: hide debug panel outside development
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

**Milestone: “Demo-ready on device”** (1–2 sessions)

1. Manual E2E test on Expo Go (book + admin + Supabase row).
2. Remove or `__DEV__`-gate Supabase debug UI.
3. Harden RLS with barber-only policies + Supabase Auth (or magic link).
4. Optional: pull-to-refresh on admin list, autofill on booking form (web).

See [TODO.md](../TODO.md) for the task list.
