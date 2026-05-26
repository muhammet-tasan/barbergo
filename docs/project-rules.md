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

## Session bootstrap

At the start of a new chat / session, before making changes, read in this order:

1. [README.md](../README.md)
2. [TODO.md](../TODO.md)
3. [current-status.md](./current-status.md)
4. This file ([project-rules.md](./project-rules.md))
5. [coding-guidelines.md](./coding-guidelines.md)

Also run `git status` once before larger edits to understand the working tree (untracked files, uncommitted changes, current branch).

---

## Stability & change safety

In addition to the semi-autonomous defaults, follow these to keep the working MVP intact:

- Do **not** break existing working logic intentionally.
- Do **not** overwrite or refactor existing behavior unless one of these is true:
  - the user explicitly requested it
  - it is required to fix a bug
  - it is required to complete the requested feature
  - the current implementation is clearly broken
- **Preserve backward compatibility** where reasonable (env vars, public component props, exported service functions, Supabase column names).
- Prefer **incremental** changes over large rewrites.

Ask for confirmation (ntfy + chat) before:

- major architecture rewrites
- breaking API / public function / prop changes
- destructive operations (delete files, drop tables, force-push)
- deleting important code paths
- changing established project conventions (this file, [coding-guidelines.md](./coding-guidelines.md), [AGENTS.md](../AGENTS.md), `.cursor/rules/`)

---

## Verification after milestones

After every meaningful milestone, run a lightweight check before stopping. Pick what fits the change:

- `npx tsc --noEmit` (in `apps/mobile`) — TypeScript
- `npm run lint` (in `apps/mobile`) — ESLint via Expo
- App still starts: `npx expo start -c`
- Targeted manual smoke flow (e.g. booking create) only when relevant

If a check fails or is skipped, note it in [current-status.md](./current-status.md) → *Known issues*. The detailed checklist lives in [coding-guidelines.md](./coding-guidelines.md#code-review-checklist-self-check-before-finishing).

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

Keep summaries **concise**. **Avoid duplicate documentation** — update the existing section instead of adding a parallel one. Then: ntfy notification, what to test, **suggested commit message** (do **not** commit unless the user asks).

### When changing engineering standards

- Update **[coding-guidelines.md](./coding-guidelines.md)** for code/UI/Supabase/git conventions.
- Update **this file** for workflow, notifications, and agent behaviour.

---

## Git rules

- Do **not** automatically **commit** or **push** unless the user explicitly requests it.
- Before suggesting a commit, summarize:
  - **changed files**
  - **important logic changes**
  - **potential risks** (regressions, RLS/security impact, behavior changes for existing flows)
- Prefer **small, clean commits** with conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` (see [coding-guidelines.md](./coding-guidelines.md#git-rules)).

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
