# barbergo — Current Status

Last updated: 2026-05-18

## Completed

- Project rules, ntfy scripts, and Cursor always-apply rule are set up.
- Expo mobile app is scaffolded with TypeScript, Expo Router, and NativeWind.
- Customer MVP flow is implemented with mock data:
  - home screen
  - barber profile
  - service selection
  - booking form with Swiss date input (`DD.MM.YYYY`)
  - booking confirmation
  - WhatsApp deeplink
- Admin demo flow is implemented:
  - booking list
  - booking detail
  - status updates
  - Google Maps deeplink
  - WhatsApp customer message
- Supabase schema and seed SQL are prepared in `supabase/`.

## Current State

- The app still uses mock data.
- Supabase credentials are not configured yet.
- Bookings are stored in memory for the current app session.
- Dates are displayed in Swiss format and stored internally as ISO strings for Supabase compatibility.
- `main` has been pushed through commit `fe1793a`.

## Next Recommended Tasks

1. Run the app on Expo Go and manually test the full customer + admin flow.
2. Create a Supabase project and run `supabase/migrations/0001_initial_schema.sql`, then `supabase/seed.sql`.
3. Add `apps/mobile/.env` from `.env.example` with Supabase URL, anon key, and real barber WhatsApp number.
4. Install `@supabase/supabase-js` and replace mock provider/service reads with Supabase queries.
5. Add a persistent booking repository so customer-created bookings survive app reloads.
