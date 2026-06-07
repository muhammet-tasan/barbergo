# barbergo — Current Status

Last updated: 2026-06-05

## Project maturity

**MVP stage:** Supabase-backed booking flow with **secure admin baseline** (migration `0003` + login gate). Suitable for internal/demo testing on Expo Go and web. Public launch still deferred — see `TODO.md` roadmap.

## Current working features

### Customer flow (German UI)

- Home → **Termin buchen** → **Barber wählen** (`/barbers`) → **Service** (`/barber/services?providerId=`) → **Buchung** → **Bestätigung**
- Barber-Profil optional über „Profil ansehen“ (`/barber?providerId=`) — kein Pflichtschritt
- **Guest booking** or **logged-in customer** (`customer_id` on insert after migration `0004`)
- Zentrale Bestätigungsseite: WhatsApp, Meine Termine, Zur Startseite + `BookingSummaryCard`
- **`/register`** + **`/login`** — Kunde → Meine Termine; Barber → Admin
- **`/guest/bookings`** + **`/customer/bookings`** — Empty State, Gast-CTA „Konto erstellen“, Storno-Hinweis (24h)

### Admin flow (login required when configured)

- **`EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`** in `.env.example` (recommended)
- Unified login at **`/login`** (Kunde + Barber); role via Supabase `user_metadata.role`
- Barber → **`/admin`** (Buchungen verwalten); Kunde → **`/customer/bookings`**
- **`ScreenHeader`**: Home = Mark-Logo; Unterseiten = Back + Titel + Pill Auth; `slide_from_right` Navigation
- **Gastbuchung**: Insert ohne `.select()`, lokale Guest-Kopie, validate-on-submit Button
- Admin-Liste: Filter-Tabs (Offen / Bestätigt / Abgeschlossen / Storniert) + Pull-to-refresh
- Admin-Detail: WhatsApp → Maps → Abgeschlossen → Storno (Danger + Bestätigungsdialog)
- `/admin/login` (E-Mail + Passwort)
- Sign out from admin list; home screen hides “Termin buchen” when logged in

### Developer / diagnostics

- RLS smoke script: `apps/mobile/scripts/verify-rls-0003.mjs`
- Guest insert verify: `apps/mobile/scripts/verify-guest-insert.mjs`
- Env via `app.config.js` + `supabase-env.ts` (web-safe)
- ntfy scripts (`scripts/notify-*.ps1`)

## Architecture decisions

| Area | Decision |
|------|----------|
| Backend | Supabase; no Spring Boot in MVP |
| Mobile | Expo Router, NativeWind, German UI |
| Auth | Supabase password login for barber only; customers stay anon |
| RLS default | **`0003`** — guest insert; admin read/update needs login |
| RLS demo | `0002_*` optional for login-free local demo (insecure) |
| Comms | WhatsApp + Google Maps deeplinks only |

## Supabase setup status

| Step | Status |
|------|--------|
| Project + `.env` | Configured locally (gitignored) |
| `0001` + `seed.sql` | Required |
| **`0003_bookings_auth_rls.sql`** | **Required** for secure baseline (run in SQL Editor) |
| `0002_*` | Demo-only alternative — do not use with auth gate |
| Barber Auth user | Create in Dashboard |
| `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` | Recommended in `.env` |

### SQL Editor (exact order)

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/0003_bookings_auth_rls.sql`

See [supabase/README.md](../supabase/README.md).

## Security baseline (2026-05-30)

- **RLS `0003`:** anon may create pending bookings; anon cannot read/update bookings.
- **App gate:** `/admin` requires login when `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`.
- **Demo RLS `0002_*`:** still in repo for experiments; documented as insecure.

## Branding

- Canonical palette: `apps/mobile/constants/theme.ts` + Tailwind `brand-*` / `success` / `warning` / `error`
- Assets: `barbergo-header-logo-transparent.png` (Header), `barbergo-wordmark-transparent.png` (Hero), `barbergo-round-dark.png` / `barbergo-avatar-round-512.png` (Avatare), `barbergo-mark-transparent.png` (Empty State)
- Service-Auswahl: `kopf_1_haarschnitt` … `kopf_4_kind` via `ServiceIcon` + `constants/images.ts` (`serviceImages`)
- UI-System: `AppButton` (primary/secondary/tertiary/danger), kompakte `StatusBadge`, einheitliche `SectionHeader` + `BookingSummaryCard`-Zeilen
- Layout: `constants/layout.ts` (Spacing-Tokens), `AppInput` mit Fokus-State, pressable `BookingListCard`, Sektionen auf Service-/Buchungs-Screens
- Home: `HomeHero` — vier visuelle Gruppen, Logo bis 320px (`hero-logo-wide`), Premium-Typografie
- Expo icon/splash/favicon in `app.json` (unchanged paths)

## Next recommended tasks

1. Apply **`0003`** on hosted Supabase if not yet done.
2. Manual E2E: guest book → barber login → list + status update.
3. Continue MVP features from `TODO.md` (no public launch yet).
4. Product priorities and phases: [product-roadmap.md](./product-roadmap.md).

See [TODO.md](../TODO.md).
