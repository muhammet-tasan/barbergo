# barbergo Project Rules

How humans and AI agents work in this repository: workflow, notifications, architecture boundaries, and documentation duties.

**Engineering style (code structure, Supabase, UI, errors):** [coding-guidelines.md](./coding-guidelines.md)

**System design:** [architecture.md](./architecture.md) · **Entities:** [data-model.md](./data-model.md) · **Status:** [current-status.md](./current-status.md)

---

## Philosophy

- **Ship a working MVP fast** — booking flow, Supabase persistence, admin list, WhatsApp/Maps deeplinks.
- **Do not create messy code** — prefer boring, readable solutions ([coding-guidelines.md](./coding-guidelines.md)).
- **Minimize unnecessary interruptions** — semi-autonomous implementation with sensible defaults.
- **Explain important decisions** after implementation instead of blocking on every small choice.
- **Keep the app running** after every major step.

---

## Semi-autonomous workflow

- Prefer continuing implementation with sensible defaults instead of stopping for unnecessary questions.
- Make reasonable technical assumptions and continue.
- Only stop and ask for confirmation when:
  - **Security-sensitive** actions are required
  - **Destructive** actions may happen
  - **Major architecture** is unclear (e.g. replacing Supabase with a custom API)
  - **Materially different** technology choices exist
  - **Credentials**, API keys, or external accounts are required
  - A **library choice** could strongly affect future architecture

For small UI, naming, folder, or implementation details:

- choose a reasonable default (see [coding-guidelines.md](./coding-guidelines.md))
- document the choice briefly
- continue without asking

Prefer **iterative progress** and **small working increments** over perfect upfront design.

---

## Notifications (ntfy)

Run from **repository root**. Topic: `barbergo-muhammet` (see [README.md](../README.md)).

### User interaction required — send **before** stopping

Whenever you need user interaction, approval, clarification, terminal permission, dependency approval, or hit a blocking issue:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "User interaction required"
```

Contextual examples:

- `User interaction required`
- `Terminal approval required`
- `Dependency installation approval required`
- `Architecture decision required`
- `Build failed`
- `Manual testing required`
- `Cursor needs your attention`

Also notify before stopping when security-sensitive or destructive actions need approval, credentials are required, or important architecture choices are unclear.

**Do not** stop for the user without sending the interaction notification first.

### Major task completed

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "Task description"
```

Examples: `Supabase integration completed`, `Booking flow completed`, `Docs updated`.

Default when no specific label is needed:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-done.ps1
```

Send notifications after: feature completion, setup completion, successful builds, important fixes, larger refactors, and before pausing for user input.

---

## Architecture (MVP)

| Area | Choice |
|------|--------|
| Mobile | React Native, **Expo**, TypeScript, **Expo Router**, **NativeWind** |
| Backend / DB | **Supabase** (PostgreSQL, API; Auth later) |
| Communication | **WhatsApp** + **Google Maps** deeplinks only |
| Dev alerts | ntfy.sh + `scripts/*.ps1` |
| Fallback data | `apps/mobile/data/mockData.ts` when Supabase fails or env missing |

**Client entry:** `apps/mobile/services/supabase.ts`

**Not in MVP (do not implement unless requested):**

- n8n, Coolify, Spring Boot (`backend/` is placeholder only)
- Production Auth + strict RLS
- Payments, admin web panel, push notifications

See [architecture.md](./architecture.md) and [coding-guidelines.md](./coding-guidelines.md#time-to-market-rule).

### Product language

- **German** for all visible mobile UI, validation messages, and WhatsApp/Maps-related user copy.

### Supabase status

- Env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `apps/mobile/.env`
- Data layer: `services/providers.ts`, `services/catalog.ts`, `services/bookings.ts`
- **Temporary MVP note:** admin demo may require relaxed RLS on `bookings` until Auth exists — document in [current-status.md](./current-status.md), do not hide.

---

## Documentation duties

### After every major implementation step

End the response with:

1. **Changed files** — paths added/updated/removed (group by `apps/mobile/`, `docs/`, etc.)
2. **Important code changes** — what was built and how pieces connect (beginner-friendly)
3. **Architecture decisions** — brief why and what was deferred

Before stopping, update:

- **`TODO.md`** — mark completed tasks, add next recommended tasks
- **`docs/current-status.md`** — must include: current working state, completed features, known issues, next steps, important technical decisions

Keep summaries **concise**. Then: ntfy notification, what to test, **suggested commit message** (do **not** commit unless the user asks).

### When changing engineering standards

- Update **[coding-guidelines.md](./coding-guidelines.md)** for code/UI/Supabase/git conventions.
- Update **this file** for workflow, notifications, and agent behaviour.

---

## Git rules

- Do **not** automatically **commit** or **push**.
- After stable milestones, suggest a meaningful commit message and summarize changed files first.
- Keep commits small: `feat:`, `fix:`, `docs:`, `refactor:` (see [coding-guidelines.md](./coding-guidelines.md#git-rules)).

---

## Cursor / agent integration

- This file is applied via **`.cursor/rules/barbergo-project.mdc`** and **[AGENTS.md](../AGENTS.md)** (`alwaysApply: true`).
- Read **this file** + **[coding-guidelines.md](./coding-guidelines.md)** for all tasks in this repo.
- Prefer smaller implementation steps; wire Supabase through `services/` only ([coding-guidelines.md](./coding-guidelines.md#supabase-guidelines)).

---

## Quick reference — what to read when

| Task | Read first |
|------|------------|
| New screen or UI | [coding-guidelines.md](./coding-guidelines.md) (UI, Expo, components) |
| Supabase / data | [coding-guidelines.md](./coding-guidelines.md) (Supabase, domain model) + [data-model.md](./data-model.md) |
| Agent workflow / notify | This file |
| Stack overview | [architecture.md](./architecture.md) |
| What's done / next | [current-status.md](./current-status.md), [TODO.md](../TODO.md) |
