# barbergo — Pre-Launch Checklist

Use this **before any public / production release**. MVP demo settings must be tightened.

## Environment (`apps/mobile/.env`)

- [ ] `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` — Admin-Demo only with barber login
- [ ] Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` point to **production** project
- [ ] Verify WhatsApp phone is the real barber number

## Supabase Auth

- [ ] Barber user created in Supabase Dashboard → Authentication → Users
- [ ] Login tested on device (`/admin/login`)

## Row Level Security (critical)

MVP migration `0002_mvp_anon_bookings_access.sql` allows **anon** read/insert/update on `bookings` — **not for production**.

- [ ] Remove or disable anon `select` / `update` policies on `bookings` (keep anon `insert` for customer booking only, if desired)
- [ ] Ensure `authenticated` policies from `0001` cover admin read/update
- [ ] Test: customer can still book; admin **cannot** access bookings without login

## App smoke test (production config)

- [ ] Customer flow: book → row in Supabase → WhatsApp deeplink
- [ ] Admin without login: **blocked** (redirect to login)
- [ ] Admin with login: list, detail, status update
- [ ] Offline: mock fallback still acceptable or document limitation

## Deferred (post-MVP)

- Payments, push notifications, multi-provider, admin web panel — see `TODO.md`
