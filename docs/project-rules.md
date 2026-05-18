# barbergo Project Rules

## Autonomous / Semi-Autonomous Workflow

- Prefer continuing implementation with sensible defaults instead of stopping for unnecessary questions.
- Work semi-autonomously whenever possible.
- Make reasonable technical assumptions and continue implementation.
- Only stop and ask for confirmation when:
  - security-sensitive actions are required
  - destructive actions may happen
  - important architecture decisions are unclear
  - multiple significantly different technology choices exist
  - credentials, API keys, or accounts are required
  - package/library choice could strongly affect the future architecture

- For small UI, naming, folder, or implementation details:
  - choose a reasonable default
  - document the choice
  - continue implementation without asking

- Prefer iterative progress over waiting for perfect clarification.
- Prefer small working MVP implementations.
- Keep implementation momentum high.

## Notifications

### User interaction required (send immediately before stopping)

Whenever you need user interaction, approval, clarification, terminal permission, dependency approval, or hit a blocking issue: **send ntfy first, then stop**. Do not wait for the user to notice you paused.

Base command (use a specific message when possible):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "User interaction required"
```

Contextual examples:

- `User interaction required` (generic)
- `Terminal approval required`
- `Dependency installation approval required`
- `Architecture decision required`
- `Build failed`
- `Manual testing required`

Also notify before stopping when:

- security-sensitive or destructive actions need approval
- credentials, API keys, or accounts are required
- important architecture or library choices are unclear

### Major task completed

Whenever a major task is completed:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "Task description"
```

Examples:

- "Expo setup completed"
- "Navigation implemented"
- "Backend endpoints completed"
- "Booking flow completed"

Default notification (when no specific label is needed):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-done.ps1
```

Send notifications after:

- feature completion
- setup completion
- dependency installation
- successful builds
- important fixes
- larger refactors
- pausing because user interaction is required (notify **before** stopping)

Do not skip notifications. Never stop for the user without sending the interaction notification first.

## Architecture

Tech stack:

**Mobile**

- React Native with Expo
- TypeScript
- Expo Router
- NativeWind

**Backend / auth / database (MVP)**

- Supabase (PostgreSQL, Auth, API)

**Communication**

- WhatsApp deeplinks only
- Google Maps deeplinks only

**Developer notifications**

- ntfy.sh PowerShell scripts

**Future only (do not implement in MVP)**

- n8n automation
- Coolify hosting
- optional Spring Boot services if logic becomes complex

Rules:

- Keep the MVP simple
- Prefer clean and beginner-friendly code
- App product language is **German** from now on; all visible mobile UI copy, validation messages, and customer/barber WhatsApp messages should be German.
- Avoid overengineering
- Avoid paid APIs and paid services where possible (Supabase free tier is OK)
- Use reusable components
- Use clean folder structures
- Keep future scalability in mind
- Use **mock data** until Supabase credentials are provided; integrate via `apps/mobile/services/supabase.ts`
- See `docs/architecture.md` and `docs/data-model.md`

## Workflow

- This file is applied automatically via `.cursor/rules/barbergo-project.mdc` and `AGENTS.md` — no need to @-mention it each chat
- Read and follow this file for all future tasks
- Prefer smaller implementation steps
- Keep documentation updated
- Use mock data first; wire Supabase when `EXPO_PUBLIC_SUPABASE_*` env vars are available

### After every major implementation step

When a milestone is finished (feature, screen group, setup, refactor, or docs migration), end the response with a short structured summary:

1. **Changed files** — list paths added, updated, or removed (group by area: `apps/mobile/`, `docs/`, etc.)
2. **Important code changes** — what was built or wired, key functions/components, and how they connect (beginner-friendly, no wall of identifiers)
3. **Architecture decisions** — brief why (trade-offs, defaults chosen, what was deferred)

Also update project tracking before stopping:

- update `TODO.md`
- update `docs/current-status.md`
- mark completed tasks
- add next recommended tasks

Keep it concise. Then send ntfy, suggest what to test, and suggest a commit message if the milestone is stable (do not commit unless the user asks).

## Workflow Philosophy

- Keep development fast and practical.
- Prefer shipping a working MVP over overengineering.
- Minimize unnecessary interruptions.
- Keep explanations concise but useful.
- Explain important decisions after implementation instead of blocking beforehand.
