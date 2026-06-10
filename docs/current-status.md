# barbergo — Current Status

Last updated: 2026-06-05

## Project maturity

**MVP stage:** Slot-based booking foundation, role split (customer / approved barber / admin), profile pages, and secure RLS baseline. Suitable for internal/demo testing on Expo Go and web. Public launch still deferred — see `TODO.md` roadmap.

## Current working features

### Customer flow (German UI)

- Home → **Termin buchen** → Barber → Service → **Slot-Auswahl** (Datum + verfügbare Zeiten) → **Bestätigung**
- Kein freies Datum/Uhrzeit-Freitext mehr im Buchungsformular
- Slot-Buchungen default **`confirmed`** via `book_slot` RPC (wenn Migration `0006` angewendet)
- Gastbuchung oder eingeloggter Kunde (`customer_id` auf Insert)
- Bestätigung: primär „Meine Termine“; WhatsApp nur sekundär („Frage per WhatsApp“)
- **`/register`** — Kunde oder Barber (Barber → `barber_pending` + Admin-Freigabe)
- **`/auth/callback`** — E-Mail-Bestätigung (Barber); umgebungsabhängiger Redirect via `getAuthRedirectUrl()`

- **`/login`** — Nach Anmeldung immer Startseite `/` (Rollen-CTAs von dort)
- **`/guest/bookings`** + **`/customer/bookings`** — deduplizierte Listen (kein Doppel aus Gast-Cache + Konto)

### Admin flow (`role = admin` only)

- **`/admin`** — Hub: Buchungen, Profile, Barber-Freigaben, Admin-Profil
- **`/admin/bookings`** — alle Buchungen, Filter-Tabs, Detail
- **`/admin/pending-barbers`** — Genehmigen / Ablehnen
- Bestehender Auth-User **`admin@barbergo.ch`** — Profil in `public.profiles`, keine Duplikat-Anlage in Migrations

### Barber flow (approved `role = barber` only)

- **`/barber/dashboard`** — Hub: Buchungen, Profil
- **`/barber/dashboard/bookings`** — eigene Provider-Buchungen (RLS)
- **`/barber/pending`** — Wartescreen für `barber_pending`

### Timezone

- DB: `start_at` / `end_at` in UTC (Migration `0006`); Legacy `appointment_date` / `appointment_time` bleiben kompatibel
- Anzeige: `Europe/Zurich` via `utils/timezone.ts` + `utils/booking-display.ts`

### Developer / diagnostics

- RLS smoke script: `apps/mobile/scripts/verify-rls-0003.mjs`
- Auth settings doc: `docs/supabase-auth-settings.md`
- ntfy scripts (`scripts/notify-*.ps1`)

## Architecture decisions

| Area | Decision |
|------|----------|
| Backend | Supabase; `book_slot` + `get_available_slots` RPC for atomic slot booking |
| Mobile | Expo Router; customer booking unter `/barber/*`; Barber-Backoffice unter `/barber/dashboard/*` |
| Auth / roles | `public.profiles.role` — `customer`, `barber`, `barber_pending`, `admin`; never fallback to barber |
| E-Mail confirm | Barber: Supabase-Mail → `barbergo://` (native) / `exp://` (Expo Go) / HTTP (web); Kunde: auto-confirm via `0011` |
| Auth redirect | `services/auth-redirect.ts` — keine globale localhost-Ersetzung in Produktion |

| RLS | Admin all; barber own provider; customer own; users cannot self-update `role` / `approval_status` |
| Comms | WhatsApp secondary in customer flow; primary in staff detail views |

## Supabase setup status

| Step | Status |
|------|--------|
| `0001` + `seed.sql` | Required |
| `0003` | Required (secure baseline) |
| `0004` | Required (profiles, customer bookings) |
| `0005` | Required (admin profile seed) |
| **`0006`** | **Required** for slot booking + role split |
| **`0008`** | **Recommended** — `upsert_own_profile` (Admin-Profil speichern) |
| **`0009`** | **Recommended** — `approval_status` + Signup-Trigger (ältere DBs) |
| **`0010`** | **Required** — RLS-Rekursion fix + Barber-Freigabe erstellt Provider |
| **`0013`** | **Recommended** — `signup_email_taken` blockiert doppelte Registrierung |
| `admin@barbergo.ch` | Manual Auth user + profile via `0005`/`0006` |

See [supabase/README.md](../supabase/README.md).

## Next recommended tasks

1. Apply **`0006`**–**`0012`** on hosted Supabase.
2. Supabase Auth: Redirect URLs (`barbergo://auth/callback`, `http://localhost:8081/auth/callback`, `exp://**`), Barber-Mail-Template.
3. Supabase Auth: Passwort-Mindestlänge ≥ 8 (siehe `docs/supabase-auth-settings.md`).
3. Manual E2E: Slot buchen → kein Doppel in Meine Termine; zweiter Slot gleiche Zeit → `SLOT_TAKEN`.
4. Barber-Verfügbarkeit / Blockzeiten UI im Barber-Dashboard (Schema in `0006` vorhanden).
5. Product priorities: [product-roadmap.md](./product-roadmap.md).

See [TODO.md](../TODO.md).
