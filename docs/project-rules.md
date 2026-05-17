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

Whenever implementation pauses because user input is truly required:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "User input required"
```

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
- pausing because user input is truly required

Do not skip notifications.

## Architecture

Tech stack:

- React Native with Expo
- TypeScript
- Expo Router
- NativeWind
- Spring Boot
- PostgreSQL

Rules:

- Keep the MVP simple
- Prefer clean and beginner-friendly code
- Avoid overengineering
- Avoid paid APIs and paid services where possible
- Use reusable components
- Use clean folder structures
- Keep future scalability in mind

## Workflow

- This file is applied automatically via `.cursor/rules/barbergo-project.mdc` and `AGENTS.md` — no need to @-mention it each chat
- Read and follow this file for all future tasks
- Prefer smaller implementation steps
- Explain what was implemented after each major task
- Keep documentation updated
- Use mock data first before complex backend integrations

## Workflow Philosophy

- Keep development fast and practical.
- Prefer shipping a working MVP over overengineering.
- Minimize unnecessary interruptions.
- Keep explanations concise but useful.
- Explain important decisions after implementation instead of blocking beforehand.
