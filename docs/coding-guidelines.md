# barbergo — Coding Guidelines

Engineering standards for the barbergo MVP. We optimize for **time-to-market** now, but code must stay **understandable, maintainable, and easy to refactor** later.

**Related docs:** [project-rules.md](./project-rules.md) (workflow & notifications) · [architecture.md](./architecture.md) · [data-model.md](./data-model.md)

---

## General engineering principles

- Build **MVP-first**, but do not create messy code.
- Prefer **simple, readable, boring** code over clever abstractions.
- **Avoid overengineering** and **premature optimization**.
- Keep files **focused** and reasonably small (split when a file does multiple jobs).
- Prefer **explicit names** over short unclear names.
- Prefer **readable functions** over compact one-liners.
- Do **not** introduce unnecessary dependencies.
- Do **not** rewrite large parts of the app unless there is a clear need.
- Make **incremental** changes.
- Keep the app **running** after every major step.

When in doubt: ship the smallest change that works, then improve.

---

## Repository layout (mobile)

```
apps/mobile/
  app/           # Expo Router screens (screen logic only)
  components/    # Reusable UI
  constants/     # Pricing, theme, static config
  data/          # Mock / fallback static data
  hooks/         # Data-loading hooks (provider, services, bookings)
  services/      # Supabase, bookings, catalog, whatsapp, maps
  types/         # Domain types (single source of truth)
  utils/         # Pure helpers (dates, validation)
```

| Layer | Responsibility |
|-------|----------------|
| `app/` | Layout, navigation, screen state, wiring hooks/services |
| `components/` | Presentational UI, no Supabase calls |
| `services/` | Data access, Supabase, side effects |
| `hooks/` | Async load state for screens |
| `types/` | Domain shapes shared across the app |
| `data/` | Mock fallback only — not the primary data path when Supabase works |

---

## React Native / Expo style

- Use **TypeScript** everywhere (strict, no `any` unless unavoidable and commented).
- Use **functional components** only (no class components).
- Use **clear component names** (`BookingFormScreen`, not `Screen3`).
- Keep **screen components** focused on screen logic; extract repeated UI.
- Move **business / domain logic** into `services/` or `utils/`.
- Move **mock / static data** into `data/`.
- Move **shared types** into `types/domain.ts`.
- Move **constants** into `constants/`.
- **Avoid duplicating** UI logic across screens.
- Prefer **controlled** form inputs.
- Keep **validation** simple and readable (`utils/validation.ts`).
- Follow **Expo Router** conventions (`app/`, file-based routes, `useRouter`, `useLocalSearchParams`).
- Keep **navigation** simple and predictable (avoid deep nesting for MVP).

### Hooks pattern

- Use hooks in `hooks/` for async data (`useProvider`, `useServices`, `useBookings`, `useBooking`).
- Screens should not call Supabase directly — go through `services/`.
- Refresh lists on focus when data may change (e.g. admin booking list).

---

## UI / UX guidelines

- **Mobile-first** — design for phone, not desktop admin panels.
- **Clean, modern** UI — dark brand theme, gold accent (see `docs/branding.md` and `constants/theme.ts`).
- Use **NativeWind** (`className`) consistently; avoid mixing random inline styles.
- Prefer **reusable components** (current names in repo):

  | Component | Purpose |
  |-----------|---------|
  | `AppButton` | Primary / secondary / ghost actions |
  | `AppCard` | Grouped content blocks |
  | `AppInput` | Form fields with label + error |
  | `ServiceCard` | Selectable service row |
  | `StatusBadge` | Booking status chip |
  | `ScreenHeader` | Consistent screen title + back |

  Extract new shared UI when the same pattern appears **twice** (e.g. a `PriceSummary` block for booking totals).

- **Consistent spacing** — prefer Tailwind scale (`px-4`, `gap-3`, `mb-6`).
- **Consistent border radius** — cards and buttons match existing components.
- **Consistent font sizes** — titles `text-lg` / `text-xl`, body `text-base`, hints `text-sm text-slate-400`.
- **Clear primary actions** — one main CTA per screen.
- **Avoid clutter** — show only what the user needs for the current step.
- **German copy** for all user-visible text, validation messages, and WhatsApp templates.
- **Admin UI** — practical, scannable list + detail; no decorative complexity.

---

## Supabase guidelines

- Use **Supabase** for MVP database (and later auth).
- Keep **all client setup** in `services/supabase.ts` (singleton, env-based).
- **Never** expose `service_role` keys in the mobile app.
- Mobile may only use:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_WHATSAPP_PHONE` (and optional legacy `EXPO_PUBLIC_BARBER_WHATSAPP`)
- Use **mock data as fallback** when Supabase is down or misconfigured (`data/mockData.ts` via services).
- Map DB rows in **`services/supabase-mappers.ts`** (snake_case → domain types).
- Add **clear error handling** — log for developers, friendly message for users.
- Do **not** implement complex **Auth** or production **RLS** until explicitly requested.
- **Document** temporary security simplifications in `docs/current-status.md` (do not hide them).
- Add **`TODO`** comments where MVP shortcuts exist (e.g. anon admin read on `bookings`).

### Data access rules

- Reads: `services/providers.ts`, `services/catalog.ts`, `services/bookings.ts`
- Writes: `createBooking`, `updateBookingStatus` in `services/bookings.ts`
- On failure: return `{ source: 'mock', error?: string }` pattern; never silent fail
- Do not scatter `.from('bookings')` across screens

---

## Data / domain model guidelines

Use **domain-oriented naming** in types and UI copy. Centralize in `types/domain.ts`.

| Concept | Type / name in code | Notes |
|---------|---------------------|--------|
| Barber business | `Provider` | One or many later |
| Bookable offering | `Service` | Price CHF, duration minutes |
| Appointment | `Booking` | Links provider + service + customer |
| Status | `BookingStatus` | Enum, not free strings |
| Customer fields | On `Booking` | `customerName`, `phone`, `address` |

### Booking statuses

Use exactly these values everywhere:

- `pending` — customer submitted, awaiting barber
- `confirmed` — barber accepted
- `completed` — service done
- `cancelled` — cancelled by either side

**Avoid** hardcoding status strings in screens — import `BookingStatus` or use maps like `bookingStatusText`.

### Dates and money

- Display dates in **Swiss format** (`DD.MM.YYYY`) via `utils/date.ts`.
- Store `appointment_date` as **ISO date** strings for Postgres.
- Prices in **CHF**; platform fee in `constants/pricing.ts`.

---

## Error handling

- Show **user-friendly German** error messages (`Alert.alert` or inline errors).
- Log useful **developer** messages with a `[barbergo]` prefix in `console.warn` / `console.error`.
- **Never silently fail** — if Supabase fails, user should know (or see fallback alert on writes).
- If Supabase fails on read → fall back to mock data and log.
- If Supabase fails on write → fall back to in-memory mock **and** warn that data may not persist.
- Keep fallback behavior **simple** — one code path in services, not duplicated in every screen.

---

## Documentation rules

After every **major milestone**:

1. Update **`TODO.md`** — check off done items, add next tasks.
2. Update **`docs/current-status.md`** — see required sections below.
3. Summarize **what changed** in the agent response.
4. List **next recommended steps**.
5. Note any **temporary MVP compromises** (RLS, auth, admin without login).

### `docs/current-status.md` must always include

- **Current working state** — what runs, what data source is live
- **Completed features**
- **Known issues** — bugs, RLS blocks, env gaps
- **Next steps** — ordered, actionable
- **Important technical decisions** — what we chose and what we deferred

---

## Git rules

- Do **not** automatically commit or push.
- After stable milestones, **suggest** a meaningful commit message.
- Before suggesting a commit, **summarize changed files**.
- Keep commits **small and meaningful**.

### Commit message style

```
feat: add booking persistence via Supabase
fix: handle Supabase booking load errors
docs: update current project status
refactor: simplify booking service fallback
```

Use conventional prefixes: `feat`, `fix`, `docs`, `refactor`, `chore`.

---

## AI workflow rules

See also [project-rules.md](./project-rules.md) for notification commands.

- Work **semi-autonomously** — do not ask unnecessary questions.
- Make **reasonable assumptions** and continue.
- **Only stop** for:
  - credentials / API keys
  - destructive actions
  - security-sensitive decisions
  - major architecture changes
  - unclear external service setup

When blocked, notify:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "Cursor needs your attention"
```

After completing a major task:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-done.ps1
```

Or use `notify-custom.ps1` with a specific task description.

---

## Time-to-market rule

### Now (MVP — must work)

- End-to-end **booking flow** (customer)
- **Supabase persistence** for bookings (when configured)
- **Admin booking list** shows real bookings from Supabase
- **WhatsApp deeplink** works (`services/whatsapp.ts`)
- **Maps deeplink** works (`services/maps.ts`)
- App remains usable with **mock fallback** if Supabase is temporarily unavailable

### Later (do not implement unless explicitly requested)

- Supabase Auth (barber login)
- Strict production RLS
- n8n automation
- Coolify self-hosting
- Payments (TWINT / Stripe)
- Admin web panel
- Multiple providers
- Push notifications
- Spring Boot custom API

Deferring these is intentional — document them in roadmap docs, do not build them “while you’re here”.

---

## Code review checklist (self-check before finishing)

- [ ] TypeScript compiles (`npx tsc --noEmit` in `apps/mobile`)
- [ ] No secrets in git (only `.env.example`, not `.env`)
- [ ] German user-facing strings
- [ ] Supabase access only in `services/`
- [ ] Mock fallback still works when env vars are missing
- [ ] `TODO.md` and `docs/current-status.md` updated for major milestones
- [ ] ntfy sent when required by project rules
