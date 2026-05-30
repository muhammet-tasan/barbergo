# barbergo

Mobile barber booking MVP — home service haircuts in **Basel, Switzerland**.

A customer books a mobile barber at home; the barber manages appointments via an admin demo flow. Communication uses **WhatsApp** and **Google Maps** deeplinks (no paid messaging APIs).

## Architecture overview

| Layer | Stack |
|-------|--------|
| Mobile | React Native, Expo, TypeScript, Expo Router, NativeWind |
| Backend | **Supabase** (Postgres, Auth, API) |
| Dev alerts | ntfy.sh + PowerShell (`scripts/`) |

Details: [docs/architecture.md](docs/architecture.md) · Data model: [docs/data-model.md](docs/data-model.md)

**MVP uses Supabase** when `apps/mobile/.env` is configured; otherwise the app shows catalog errors (no silent demo IDs). See [docs/current-status.md](docs/current-status.md).

## Monorepo layout

```
barbergo/
  apps/mobile/       # Expo app
  backend/           # Placeholder — optional Spring Boot later (not active MVP)
  scripts/           # ntfy notifications
  docs/              # Rules, architecture, setup
```

## Run the mobile app

```powershell
cd apps/mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on Android, or press `a` for an emulator.

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `apps/mobile/.env.example` → `apps/mobile/.env`.
3. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (anon or publishable key).
4. In the SQL editor, run (in order):
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/seed.sql`
   - `supabase/migrations/0003_bookings_auth_rls.sql` (secure baseline; see [supabase/README.md](supabase/README.md))
5. Copy `.env.example` → `.env` and set `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` (default).
6. Create a barber user in Supabase Auth.
7. Start the app with cache clear: `npx expo start -c`.

Details: [supabase/README.md](supabase/README.md) · Status: [docs/current-status.md](docs/current-status.md)

## Developer notifications (ntfy)

When Cursor finishes a task, notify your phone:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-done.ps1
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "Your message"
```

Subscribe in the [ntfy Android app](https://ntfy.sh) to topic: `barbergo-muhammet`

## Project rules (Cursor)

- [docs/project-rules.md](docs/project-rules.md) — workflow, notifications, documentation duties
- [docs/coding-guidelines.md](docs/coding-guidelines.md) — engineering standards (Expo, Supabase, UI, errors, git)

Applied automatically via `.cursor/rules/barbergo-project.mdc`.

## Roadmap (not MVP)

- n8n automation
- Coolify self-hosting
- Optional custom Spring Boot services

See [TODO.md](TODO.md).

## More

[docs/setup-notes.md](docs/setup-notes.md) — why Expo, NativeWind, Supabase, and deferred tools.
