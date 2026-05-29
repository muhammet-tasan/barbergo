# barbergo — Current Status

Last updated: 2026-05-29

## Project maturity

**MVP stage:** Supabase-backed booking flow with optional barber login. Suitable for internal/demo testing on Expo Go and web. Before public release: enable admin auth gate and tighten RLS (`docs/pre-launch-checklist.md`).

## Current working features

### Customer flow (German UI)

- Home → barber profile → service selection → booking form (`DD.MM.YYYY`, `HH:MM`)
- Booking confirmation + WhatsApp deeplink
- Provider/services from Supabase when `.env` is set
- New bookings persist to `bookings` (no customer login)
- Offline fallback to mock data with banner on writes/reads

### Admin flow

- Booking list with pull-to-refresh + offline/demo banner
- Booking detail: status updates, Maps, WhatsApp
- `/admin/login` (E-Mail + Passwort, inline error on web)
- Optional gate: `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`
- Sign out from admin list when logged in

### Developer / diagnostics

- `SupabaseCatalogDebugPanel` on service screen (`__DEV__` only)
- Env via `app.config.js` + `supabase-env.ts` (web-safe)
- ntfy scripts (`scripts/notify-*.ps1`)

## Architecture decisions

| Area | Decision |
|------|----------|
| Backend | Supabase; no Spring Boot in MVP |
| Mobile | Expo Router, NativeWind, German UI |
| Auth | Supabase password login for barber; customers stay anon |
| RLS | `0002` demo (anon admin) or `0003` (login required) |
| Comms | WhatsApp + Google Maps deeplinks only |

## Supabase setup status

| Step | Status |
|------|--------|
| Project + `.env` | Configured locally (gitignored) |
| `0001` + `seed.sql` | Required |
| `0002` or `0003` | Apply one path in SQL editor |
| Barber Auth user | Create in Dashboard |

## Next recommended tasks

1. Confirm RLS migration applied on hosted Supabase.
2. E2E: customer book → admin login → status update.
3. **Before go-live:** follow `docs/pre-launch-checklist.md`.

See [TODO.md](../TODO.md).
