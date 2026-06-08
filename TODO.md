# barbergo — TODO

## MVP (in progress)

### Mobile UI

- [x] Monorepo folders (`apps/mobile`, `backend/`, `scripts/`, `docs/`)
- [x] Expo + TypeScript + Expo Router + NativeWind
- [x] Home screen (rollenbasierte CTAs: Gast / Kunde / Barber)
- [x] Unified login `/login` + Header Anmelden/Abmelden
- [x] Customer register `/register` + Phase 2 bookings (`0004`, Storno, Meine Termine)
- [x] Barber selection screen `/barbers` (BarberCard → Services direkt; Profil optional)
- [x] Barber profile screen (optional, `?providerId=`)
- [x] Service selection screen (ProviderMiniHeader; Service-Klick → Buchung)
- [x] Booking form + validation + sticky CTA + BookingSummaryCard
- [x] Booking confirmation (zentral) + WhatsApp + 3 CTAs
- [x] Admin booking list + filter tabs + detail (Maps + WhatsApp + Danger-Storno)
- [x] Reusable UI: ScreenHeader, AuthActionButton, BarberCard, BookingSummaryCard, EmptyState, BookingListCard
- [x] Brand assets (header logo, wordmark, avatars) in `constants/images.ts`
- [x] Service-Kopf-Bilder (`kopf_1`–`kopf_4`) in Service-Auswahl statt Ionicons
- [x] UI-System: Button-Varianten (primary/secondary/tertiary/danger), kompakte StatusBadge, SectionHeader
- [x] Layout-Tokens (`constants/layout.ts`), Formularfelder, Spacing & pressable Booking-Karten
- [x] Home-Hero (`HomeHero`) mit Brand-/Text-/Badge-/Action-Gruppen und größerem Logo
- [x] Per-barber routing via `providerId` query param
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
- [x] Catalog error diagnostics (user-facing banner on service screen; no dev debug panel)
- [x] Supabase Auth login for admin (`/admin/login`, E-Mail + Passwort)
- [x] MVP RLS migrations (`0002` demo, `0003` auth)
- [x] Secure baseline documented: `0003` + `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`
- [x] RLS smoke script (`apps/mobile/scripts/verify-rls-0003.mjs`)
- [x] App roles from `public.profiles` (not `user_metadata`); admin profile seed `0005`
- [x] Migration `0006` — slots, `book_slot` RPC, `barber_pending`, admin/barber RLS split
- [x] Slot booking UI (Datum-Chips + Slot-Grid); WhatsApp sekundär in Kundenflow
- [x] Role routing: admin `/admin`, barber `/barber/dashboard`, customer `/customer/bookings`
- [x] Profile pages (customer, barber, admin) + pending barber approval
- [x] Timezone helpers (`Europe/Zurich` display, UTC storage)
- [x] Duplicate booking list fix (guest cache + fingerprint dedupe)
- [ ] Row Level Security policies (production hardening — see `docs/pre-launch-checklist.md`)

- [x] Gastbuchung UX-Fix (validate-on-submit, kein disabled Press-Feedback, lokale Guest-Kopie)
- [x] Navigation: Stack-Animationen, konsistenter Dark-Background, Header Home/Subpage
- [x] UX-Runde: Home, BarberCard, Services+Icons, Buchungsformular-Sections, Admin-Gruppen

### Next recommended tasks

- [ ] Apply migration **`0006_slots_roles_profiles.sql`** on hosted Supabase
- [ ] Supabase Auth password min length ≥ 8 (`docs/supabase-auth-settings.md`)
- [ ] Manual E2E: slot book (confirmed) → no duplicate in customer list → `SLOT_TAKEN` on double book
- [ ] Manual E2E: barber register → pending → admin approve → `/barber/dashboard`
- [ ] Barber UI: weekly availability + blocked times (schema ready in `0006`)
- [ ] Run `node scripts/verify-rls-0003.mjs` after applying `0003`–`0006`

### Not in MVP

- [ ] ~~Spring Boot REST API~~ → replaced by Supabase (see `backend/README.md`)
- [ ] n8n workflows
- [ ] Coolify deployment

## Product roadmap

Detailliertes Feature Backlog, Phasen und offene Produktentscheidungen: **[docs/product-roadmap.md](docs/product-roadmap.md)**.

Kurzüberblick (priorisiert nach Product Roadmap — siehe Tabellen dort):

- [ ] Phase 1: Datenmodell (`profiles`, `customer_id`, Booking-Access-Token) + RLS Go-live
- [ ] Apply migration **`0004_customer_profiles_and_booking_access.sql`** on hosted Supabase
- [ ] Manual E2E Phase 2: register customer → book → Meine Termine → Storno; guest book → device list
- [ ] Phase 3: Barber-Profil bearbeiten, Avatar-Upload, Profil in Supabase pflegen
- [x] Phase 4 (MVP): Slot-Auswahl im Buchungsflow + `book_slot` RPC
- [ ] Phase 4: Barber-Verfügbarkeit/Blockzeiten in App pflegen (DB-Schema vorhanden)
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
