# barbergo — Current Status

Last updated: 2026-05-19

## Completed

- Project rules, ntfy scripts, and Cursor always-apply rule are set up.
- Expo mobile app is scaffolded with TypeScript, Expo Router, and NativeWind.
- Customer MVP flow is implemented:
  - home screen
  - barber profile
  - service selection
  - booking form with Swiss date input (`DD.MM.YYYY`)
  - booking confirmation
  - WhatsApp deeplink
- Visible app UI copy, validation messages, and WhatsApp messages are German.
- Admin demo flow is implemented:
  - booking list
  - booking detail
  - status updates
  - Google Maps deeplink
  - WhatsApp customer message
- Supabase schema and seed SQL are prepared in `supabase/`.
- Supabase is configured via `apps/mobile/.env`.
- `@supabase/supabase-js` is installed and the client is active.
- Data layer reads/writes through Supabase with mock fallback:
  - `services/providers.ts` — default provider
  - `services/catalog.ts` — services list
  - `services/bookings.ts` — list, create, update status
  - `services/supabase-mappers.ts` — DB row → domain types
  - `hooks/use-provider.ts`, `use-services.ts`, `use-bookings.ts`, `use-booking.ts`
- Screens load data asynchronously with loading states and graceful offline fallback.
- Engineering docs: `docs/project-rules.md` (workflow) and `docs/coding-guidelines.md` (code standards).

## Current State

- **Primary data source:** Supabase when env vars are set and queries succeed.
- **Fallback:** `data/mockData.ts` when Supabase is unavailable or a query fails (user sees an alert on writes).
- **Auth:** not implemented yet.
- **RLS:** SQL migration includes policies, but auth/RLS hardening is deferred. For the admin demo without login, ensure `bookings` allows anon `select` and `update` in Supabase, or temporarily disable RLS on that table for testing.
- **WhatsApp:** uses `EXPO_PUBLIC_WHATSAPP_PHONE` (falls back to `EXPO_PUBLIC_BARBER_WHATSAPP`).
- Dates are displayed in Swiss format and stored as ISO date strings in Postgres.

## Next Recommended Tasks

1. Restart Expo (`npx expo start`) and test customer booking end-to-end.
2. Confirm the new row appears in Supabase → Table Editor → `bookings`.
3. Open Admin-Demo and verify list + status update (fix RLS if list is empty).
4. Test offline behaviour (airplane mode) — app should fall back to mock data with a warning.
5. Plan RLS + barber auth before any public/production release.
