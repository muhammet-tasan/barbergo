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

`CLAUDE.md` loads [session-handoff.md](./session-handoff.md) automatically. Run `/continue-project` to verify it against git and get the next task. At the start of a new chat / session, before making changes, read in this order:

1. [session-handoff.md](./session-handoff.md)
2. [TODO.md](../TODO.md)
3. [current-status.md](./current-status.md)
4. This file ([project-rules.md](./project-rules.md))
5. [coding-guidelines.md](./coding-guidelines.md)
6. [lessons-learned.md](./lessons-learned.md) when touching RLS, auth, bookings or timezones

Also run `git status` once before larger edits to understand the working tree (untracked files, uncommitted changes, current branch). At the end of a session run `/session-handoff`.

---

## Document map (single owner per topic)

| Topic | Owner |
|-------|-------|
| Overview, setup, run | [README.md](../README.md) |
| Architecture + **decision log** | [architecture.md](./architecture.md) |
| Entities / tables | [data-model.md](./data-model.md) |
| Agent workflow rules | this file |
| Code / UI / Supabase standards | [coding-guidelines.md](./coding-guidelines.md) |
| **Current state**, known issues, Supabase setup status | [current-status.md](./current-status.md) |
| Open tasks | [TODO.md](../TODO.md) |
| Product vision, phases | [product-roadmap.md](./product-roadmap.md) |
| Go-live hardening | [pre-launch-checklist.md](./pre-launch-checklist.md) |
| Hand-off to the next chat | [session-handoff.md](./session-handoff.md) |
| Lessons learned | [lessons-learned.md](./lessons-learned.md) |
| Dev notifications | [dev-notifications.md](./dev-notifications.md) |
| Claude Code setup, Cursor migration | [claude-code-setup.md](./claude-code-setup.md) |

Update the owning file; link instead of duplicating. Skill `/doc-sync` maps change types to files.

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
- changing established project conventions (this file, [coding-guidelines.md](./coding-guidelines.md), [CLAUDE.md](../CLAUDE.md), `.claude/rules/`)

---

## Verification after milestones

After every meaningful milestone, run a lightweight check before stopping. Pick what fits the change:

- `npx tsc --noEmit` (in `apps/mobile`) — TypeScript
- `npm run lint` (in `apps/mobile`) — ESLint via Expo
- App still starts: `npx expo start -c`
- Targeted manual smoke flow (e.g. booking create) only when relevant

If a check fails or is skipped, note it in [current-status.md](./current-status.md) → *Known issues*. The detailed checklist lives in [coding-guidelines.md](./coding-guidelines.md#code-review-checklist-self-check-before-finishing).

---

## Notifications (ntfy, Claude Code hooks)

Dev alerts to the phone (ntfy topic `barbergo-muhammet`) are sent **automatically by Claude Code hooks** — agents must **not** call `scripts/notify-*.ps1` themselves (duplicate pings).

- `notify:on` / `notify:off` in a prompt (or `/goal`) toggles pings for the current session; default is **off**.
- Ping when a task ends (`Stop`) and when Claude waits for the user (`Notification`: permission / decision).
- Still stop and ask for: security-sensitive or destructive actions, credentials, unclear major architecture.

Full description: [dev-notifications.md](./dev-notifications.md).

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

Keep summaries **concise**. **Avoid duplicate documentation** — update the existing section instead of adding a parallel one; skip doc updates for trivial changes (`/doc-sync`). Then: what to test and a **suggested commit message** (do **not** commit unless the user asks). Notifications are sent by hooks, not by the agent.

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

## Claude Code / agent integration

- This file is the detailed source behind **[CLAUDE.md](../CLAUDE.md)** and **`.claude/rules/`** (see [claude-code-setup.md](./claude-code-setup.md)). `AGENTS.md` only points there.
- Reusable workflows are skills: `/continue-project`, `/session-handoff`, `/doc-sync`, `/barbergo-review`, `/lessons-learned`, `/pre-launch`, `/goal`.
- Read **this file** + **[coding-guidelines.md](./coding-guidelines.md)** for all tasks in this repo.
- Prefer smaller implementation steps; wire Supabase through `services/` only ([coding-guidelines.md](./coding-guidelines.md#supabase-guidelines)).

---

## Quick reference — what to read when

| Task | Read first |
|------|------------|
| New screen or UI | [coding-guidelines.md](./coding-guidelines.md) (UI, Expo, components) |
| Supabase / data | [coding-guidelines.md](./coding-guidelines.md) (Supabase, domain model) + [data-model.md](./data-model.md) |
| Agent workflow | This file |
| Dev notifications | [dev-notifications.md](./dev-notifications.md) |
| Where does X belong? | *Document map* above |
| Stack overview | [architecture.md](./architecture.md) |
| What's done / next | [current-status.md](./current-status.md), [TODO.md](../TODO.md) |
