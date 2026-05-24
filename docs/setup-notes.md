# Setup notes — barbergo

## Why React Native + Expo

- **One codebase** for Android (and iOS later) with fast refresh and Expo Go for testing.
- **Expo Router** gives file-based navigation without extra boilerplate.
- **Low cost** — no Mac required to start on Android; EAS Build optional later.

## Why NativeWind

- **Tailwind-style** utility classes — quick, consistent UI for MVP screens.
- Works well with a small set of reusable components (`AppButton`, `AppCard`, etc.).
- Easier for beginners than styling every screen with StyleSheet-only code.

## Why Supabase (not Spring Boot for MVP)

| Spring Boot MVP | Supabase MVP |
|-----------------|--------------|
| Run Java server + Postgres yourself | Managed Postgres + API in one place |
| Build auth from scratch | Auth ready when you need it |
| Slower first deploy | Connect mobile app with URL + anon key |
| More DevOps early | Focus on screens and booking flow |

Spring Boot is **not deleted** — see `backend/README.md` as an optional future path if custom server logic is needed.

**Why mock data first:** UI and booking flow can ship before you create a Supabase project. `services/supabase.ts` + `data/mockData.ts` keep the switch small when credentials arrive.

## Why no paid APIs (MVP)

- **WhatsApp deeplink** — free; opens chat with prefilled booking text (no Meta Business API).
- **Google Maps deeplink** — free; opens navigation to customer address.
- **ntfy** — free developer alerts from your PC (not end-user push).
- **Supabase** — generous free tier for development and early users in Basel.

## Why ntfy for developer alerts

See the original ntfy section in [README.md](../README.md). End-user push (FCM / Expo notifications) is a **future** item after MVP validation.

## Why n8n is postponed

- MVP does not need workflow automation yet.
- Booking confirmation uses in-app WhatsApp deeplinks.
- Add n8n when you want webhooks (e.g. Supabase → Slack/email/reminders) without writing custom cron jobs.

## Why Coolify is postponed

- Local Expo dev is enough while building screens.
- Supabase is hosted by Supabase; the mobile app talks to it directly.
- Coolify helps when you **self-host** n8n or extra services on a VPS — not required for first MVP users.

## Future deployment (high level)

1. **Now:** Expo Go / dev build + mock data or Supabase cloud.
2. **Later:** EAS Build for store-ready APK; Supabase production project with RLS.
3. **Optional:** Coolify on VPS for n8n + any self-hosted services.

## Cursor integration

Project rules apply via `.cursor/rules/barbergo-project.mdc`. Run `scripts/notify-*.ps1` after major tasks (see [project-rules.md](./project-rules.md)).

## Topic for developer ntfy

```
barbergo-muhammet
```

Scripts post to: `https://ntfy.sh/barbergo-muhammet`

### ntfy kommt nicht an?

1. In der **ntfy-App** (Android/iOS) erneut Topic **`barbergo-muhammet`** abonnieren (nach „alles löschen“ sind Abos weg).
2. Test vom PC (Repo-Root):
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "Test barbergo"
   ```
3. Prüfen: Handy online, keine Störung „Nur wichtig“, Topic exakt `barbergo-muhammet` (Groß/Klein beachten).

## Buchungen verschwinden nach Refresh / leer in Supabase?

Typische Ursachen:

1. **`apps/mobile/.env` fehlt oder Expo nicht neu gestartet** — App läuft im Demo-Modus.
2. **SQL-Migration 0002 nicht ausgeführt** — Insert kann klappen, aber die App darf Buchungen als `anon` nicht lesen (`0002_bookings_anon_mvp_policies.sql`).
3. **Provider/Services aus Demo-IDs** (`provider-1`) statt Supabase-UUIDs — Insert schlägt fehl, App zeigt nur temporär Mock-Daten.

Fix-Reihenfolge: `.env` → Migration 0001 + **0002** + `seed.sql` → `cd apps/mobile` → `npx expo start -c` → Testbuchung → Supabase Table Editor → `bookings`.
