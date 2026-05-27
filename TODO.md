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
- [x] Supabase client (`services/supabase.ts` + `supabase-env.ts`)
- [x] `app.config.js` loads `.env` into Expo `extra`
- [x] Row mappers (`services/supabase-mappers.ts`)
- [x] Provider + services + bookings repositories
- [x] Supabase SQL migrations + seed prepared (`supabase/`)
- [x] Migration `0002_bookings_anon_mvp_policies.sql` (file in repo)
- [x] `@supabase/supabase-js` installed
- [x] Load providers/services/bookings from Supabase
- [x] Persist new bookings and status updates to Supabase
- [x] Catalog error diagnostics + debug panel (service screen)
- [x] UUID validation accepts seed IDs; blocks demo IDs (`provider-1`)
- [x] Migration `0003_bookings_auth_rls.sql` (admin login + stricter bookings RLS)
- [x] Supabase Auth magic-link login screen for admin (`/admin/login`)
- [x] Admin screens gated behind login session
- [ ] Manual E2E: customer book (anon) → admin login → list + status update
- [ ] Supabase Dashboard: Email auth on + redirect URL `barbergo://auth/callback`

### Next recommended tasks

- [ ] Run full customer + admin flow on Expo Go against live Supabase
- [ ] Verify booking row in Supabase after test; admin list survives app reload
- [x] Gate `SupabaseCatalogDebugPanel` + diagnostics behind `__DEV__`
- [ ] Verify migration 0003 applied on hosted Supabase project
- [ ] Add pull-to-refresh on admin booking list (optional UX)
- [ ] Booking form Chrome autofill (web) — optional

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
