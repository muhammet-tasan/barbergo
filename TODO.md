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
- [x] Pull-to-refresh on admin booking list
- [x] Offline/demo data banner (Admin + confirmation)

### Backend (Supabase)

- [x] Architecture docs + data model
- [x] Supabase client (`services/supabase.ts` + `supabase-env.ts`)
- [x] `app.config.js` loads `.env` into Expo `extra`
- [x] Row mappers (`services/supabase-mappers.ts`)
- [x] Provider + services + bookings repositories
- [x] Supabase SQL migrations + seed prepared (`supabase/`)
- [x] `@supabase/supabase-js` installed
- [x] Load providers/services/bookings from Supabase
- [x] Persist new bookings and status updates to Supabase
- [x] Catalog error diagnostics + debug panel (service screen, `__DEV__`)
- [x] Supabase Auth login for admin (`/admin/login`, E-Mail + Passwort)
- [x] MVP RLS migrations (`0002` demo, `0003` auth)
- [x] Secure baseline documented: `0003` + `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`
- [x] RLS smoke script (`apps/mobile/scripts/verify-rls-0003.mjs`)
- [ ] Row Level Security policies (production hardening — see `docs/pre-launch-checklist.md`)

### Next recommended tasks

- [ ] Apply migration **`0003_bookings_auth_rls.sql`** on hosted Supabase (if not yet)
- [ ] Set `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` in local `.env` (copy from `.env.example`)
- [ ] Manual E2E: guest book → admin login → list + status update
- [ ] Run `node scripts/verify-rls-0003.mjs` after applying `0003`

### Not in MVP

- [ ] ~~Spring Boot REST API~~ → replaced by Supabase (see `backend/README.md`)
- [ ] n8n workflows
- [ ] Coolify deployment

## Product roadmap

Detailliertes Feature Backlog, Phasen und offene Produktentscheidungen: **[docs/product-roadmap.md](docs/product-roadmap.md)**.

Kurzüberblick (priorisiert nach Product Roadmap — siehe Tabellen dort):

- [ ] Phase 1: Datenmodell (`profiles`, `customer_id`, Booking-Access-Token) + RLS Go-live
- [ ] Phase 2: Kunden-Login, Meine Buchungen, Storno
- [ ] Phase 3: Barber-Profil bearbeiten, Avatar, modernes Profil (Card-UI)
- [ ] Phase 4: Kalender/Tagesansicht, Verfügbarkeit, Services in App pflegen
- [ ] Phase 5: Bewertungen + Durchschnitt auf Profil
- [ ] Phase 6 / später: Push, Zahlung (TWINT/Stripe), Multi-Barber, Admin-Web, Chat

## Future roadmap (technisch / Infrastruktur)

- [ ] Supabase production hardening (RLS, backups) — siehe auch Phase 1 in product-roadmap
- [ ] End-user push notifications (Expo / FCM)
- [ ] Payments (TWINT / Stripe)
- [ ] Multiple providers / barbers
- [ ] Admin web panel
- [ ] Calendar sync (Barber-Kalender — siehe product-roadmap #12)

## Future automation stack

- [ ] **n8n** — booking reminders, Supabase webhooks, internal ops
- [ ] **Coolify** — self-hosted VPS for n8n and optional services
- [ ] **Optional Spring Boot** — only if business logic outgrows Supabase comfortably
- [ ] Optional AI-assisted workflows (via n8n or similar)
