@AGENTS.md

# apps/mobile

Projektweite Regeln: `../../CLAUDE.md` (wird automatisch mitgeladen) und `../../.claude/rules/mobile-code.md`.

Befehle (aus `apps/mobile`):

- `npx expo start -c` · App starten (Cache leeren)
- `npx tsc --noEmit` · TypeScript-Check
- `npm run lint` · ESLint via Expo
- `npm run verify-rls` / `verify-guest-insert` / `verify-book-slot` · Supabase-Smoke-Skripte (benötigen `.env`)

`.env` enthält Zugangsdaten, nicht lesen oder committen. Vorlage: `.env.example`.
