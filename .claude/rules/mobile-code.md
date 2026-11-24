---
paths:
  - "apps/mobile/**/*.ts"
  - "apps/mobile/**/*.tsx"
  - "apps/mobile/**/*.js"
---

# Mobile-App-Code (Expo / React Native / TypeScript)

Details: `docs/coding-guidelines.md` (Quelle der Wahrheit). Expo-Version beachten: SDK 54, Docs unter https://docs.expo.dev/versions/v54.0.0/ (siehe `apps/mobile/AGENTS.md`).

- **Stack:** Expo, React Native, TypeScript (strict, kein `any` ohne Kommentar), Expo Router (file-based), NativeWind (`className`, keine wilden Inline-Styles). Nur Function Components.
- **Schichten:** `app/` Screens und Navigation · `components/` reine UI ohne Supabase-Calls · `services/` Datenzugriff und Seiteneffekte · `hooks/` Async-Ladezustand · `types/domain.ts` einzige Quelle für Domain-Typen · `constants/` · `data/` nur Mock-Fallback · `utils/` reine Helfer.
- **Screens rufen Supabase nie direkt auf**: immer über `services/` und Hooks. Kein verstreutes `.from('bookings')`.
- **Sichtbare Texte sind Deutsch** (UI, Validierung, Fehlermeldungen, WhatsApp-Texte). Produktionsreife Texte, keine Platzhalter wie „kommt bald“ / „später änderbar“.
- **Booking-Status** nur über `BookingStatus` (`pending`, `confirmed`, `completed`, `cancelled`), nie als freie Strings in Screens.
- Datum Schweizer Format (`DD.MM.YYYY`) via `utils/date.ts`. Anzeige `Europe/Zurich` via `utils/timezone.ts`, Speicherung UTC. Preise in CHF.
- **Fehler:** nie still scheitern. Entwickler-Log über `utils/logger.ts` (Prefix `[barbergo]`), freundliche deutsche Meldung für Nutzer. Formularfehler am Feld (`AppInput` `error`), Banner nur für Server-/API-Fehler.
- Wiederverwendbare Komponenten nutzen (`AppButton`, `AppCard`, `AppInput`, `ServiceCard`, `StatusBadge`, `ScreenHeader`, …). Neue gemeinsame UI extrahieren, wenn ein Muster zum zweiten Mal auftritt.
- Keine unnötigen Abhängigkeiten, keine Over-Engineering-Abstraktionen, Dateien klein und fokussiert halten.
- Nach der Änderung: `npx tsc --noEmit` und `npm run lint` in `apps/mobile`.
