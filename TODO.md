# barbergo — TODO

## MVP (in progress)

### Mobile UI

- [x] Monorepo folders (`apps/mobile`, `backend/`, `scripts/`, `docs/`)
- [x] Expo + TypeScript + Expo Router + NativeWind
- [x] Home screen
- [x] Barber profile screen
- [x] Service selection screen
- [x] Booking form + validation
- [x] Booking confirmation + WhatsApp deeplink
- [x] Admin booking list + detail (Maps + WhatsApp)
- [x] Reusable UI components (cards, inputs, badges)
- [x] Mock data + pricing constants (`constants/pricing.ts`)
- [x] German app language for visible UI and WhatsApp messages
- [x] Async data hooks for provider, services, and bookings

### Backend (Supabase)

- [x] Architecture docs + data model
- [x] Supabase client activated (`services/supabase.ts`)
- [x] Row mappers (`services/supabase-mappers.ts`)
- [x] Provider + services + bookings repositories with mock fallback
- [x] Supabase SQL migration + seed files prepared
- [x] Current status tracking document (`docs/current-status.md`)
- [x] Supabase project + env vars configured
- [x] `@supabase/supabase-js` installed
- [x] Load providers/services/bookings from Supabase
- [x] Persist new bookings and status updates to Supabase
- [ ] Manually test full flow on Expo Go with live Supabase data
- [ ] Verify admin list/detail works with your Supabase RLS settings (see `docs/current-status.md`)
- [ ] Row Level Security policies (production hardening)
- [ ] Optional: Supabase Auth for barber admin

### Next recommended tasks

- [ ] Manually test German customer + admin flow with Expo Go against live Supabase
- [ ] Confirm bookings appear in Supabase Table Editor after customer booking
- [ ] If admin list is empty: adjust RLS or disable RLS on `bookings` for MVP demo (no auth yet)
- [ ] Add pull-to-refresh on admin booking list (optional UX)

### Not in MVP

- [ ] ~~Spring Boot REST API~~ → replaced by Supabase (see `backend/README.md`)
- [ ] n8n workflows
- [ ] Coolify deployment

## Future roadmap

- [ ] Supabase production hardening (RLS, backups)
- [ ] Customer + provider authentication
- [ ] End-user push notifications (Expo / FCM)
- [ ] Payments (TWINT / Stripe)
- [ ] Multiple providers / barbers
- [ ] Admin web panel
- [ ] Ratings and reviews
- [ ] Calendar sync

## Future automation stack

- [ ] **n8n** — booking reminders, Supabase webhooks, internal ops
- [ ] **Coolify** — self-hosted VPS for n8n and optional services
- [ ] **Optional Spring Boot** — only if business logic outgrows Supabase comfortably
- [ ] Optional AI-assisted workflows (via n8n or similar)
