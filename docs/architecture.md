# barbergo — Architecture

MVP architecture for a mobile-first barber booking platform (Basel, Switzerland).

## Active MVP stack

| Layer | Technology | Role |
|-------|------------|------|
| Mobile | React Native, Expo, TypeScript, Expo Router, NativeWind | Customer + admin demo UI |
| Backend | **Supabase** | PostgreSQL database, REST/Realtime, Auth (when enabled) |
| Communication | WhatsApp + Google Maps **deeplinks** | No paid messaging APIs |
| Dev alerts | ntfy.sh + PowerShell scripts | Developer phone notifications |

## Why Supabase for MVP speed

- **One platform** for database, auth, and auto-generated APIs — no custom Java server to build and deploy for v1.
- **PostgreSQL** under the hood — same data model you'd want in production; easy to grow.
- **Free tier** is enough for development and early pilots in Basel.
- **Fast integration** with Expo via `@supabase/supabase-js` and Row Level Security when you're ready.
- **Less ops** than running Spring Boot + Postgres + auth yourself on a VPS during MVP.

Spring Boot remains a **future option** only if business logic outgrows Supabase functions and edge cases (see `backend/README.md`).

## Why mock data first

- Supabase needs a **project URL** and **anon key** (and later RLS policies).
- Mobile screens and booking flow can be built and tested **offline** with `data/mockData.ts`.
- `services/supabase.ts` is prepared so switching from mocks to live data is a small change (env vars + repository layer).
- Avoids blocking UI work on account setup and schema migration.

When credentials are ready: add `.env` from `.env.example`, run SQL migrations in Supabase, then replace mock repositories.

## Communication (unchanged)

- **WhatsApp:** `services/whatsapp.ts` — prefilled booking confirmation messages (deeplink).
- **Google Maps:** `services/maps.ts` — open customer address for home visits (deeplink).

No WhatsApp Business API or Maps SDK billing for MVP.

## Mobile app structure

```
apps/mobile/
  app/              # Expo Router screens
  components/       # Reusable UI
  constants/        # Pricing, theme
  data/             # Mock data (until Supabase live)
  services/         # supabase, whatsapp, maps
  types/            # Domain types (align with docs/data-model.md)
  hooks/
  utils/
```

## Data layer (planned)

See **[data-model.md](./data-model.md)** for tables/entities: providers, services, bookings, booking statuses.

```
UI screens → hooks/services → mockData OR supabase client → Postgres (Supabase)
```

## Future automation stack (not in MVP)

Documented only — **do not implement yet.**

| Tool | Future use |
|------|------------|
| **n8n** | Workflow automation (booking reminders, status webhooks, internal alerts) |
| **Coolify** | Self-hosted deployment on a VPS (mobile web build, future services) |
| **Optional Spring Boot** | Custom services if logic exceeds Supabase Edge Functions comfortably |
| **Optional AI workflows** | Later (e.g. n8n + LLM for ops), not MVP |

### Why n8n is postponed

- MVP booking flow does not need visual automation yet.
- WhatsApp confirmation is handled by **deeplinks** from the app.
- Adding n8n now increases moving parts before core screens and Supabase are stable.

### Why Coolify is postponed

- Expo Go and local dev are enough for building the app.
- Production hosting (Expo EAS, Supabase cloud) comes after MVP validation.
- Coolify is valuable when you self-host n8n or extra services — not required for first users in Basel.

## Security notes (when Supabase goes live)

- Use **Row Level Security** on `bookings` and `providers`.
- Never ship **service role** keys in the mobile app — only `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Store secrets in `.env` (gitignored); use `.env.example` as a template.

## Related docs

- [branding.md](./branding.md) — colors, assets, UI rules
- [data-model.md](./data-model.md) — entities and fields
- [product-roadmap.md](./product-roadmap.md) — feature backlog, phases, product decisions (does not override stack choices here)
- [setup-notes.md](./setup-notes.md) — stack choices in more detail
- [project-rules.md](./project-rules.md) — how agents work on this repo
