# Supabase setup

Supabase is the MVP backend for barbergo. The mobile app keeps using mock data until
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured.

## First project setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `migrations/0001_initial_schema.sql`.
4. Run `seed.sql`.
5. Copy `apps/mobile/.env.example` to `apps/mobile/.env`.
6. Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Security notes

- The migration enables Row Level Security.
- Anonymous users can read active providers/services and create pending booking requests.
- Reading and updating bookings is limited to authenticated users for the future admin flow.
- Never put a Supabase service role key in the mobile app.
