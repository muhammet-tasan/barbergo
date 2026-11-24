---
name: my-barbergo-review
description: "[BarberGo] Technische Qualitätskontrolle der aktuellen Änderungen (Architektur, TypeScript, Expo/RN, Supabase/RLS, Datenschutz, deutsche UI) inkl. tsc und lint. Analysiert und berichtet, ändert nichts."
disable-model-invocation: true
---

# /my-barbergo-review

Projektspezifischer Review von `git diff` / `git status`. Ergänzt das generische `code-review`. **Standardmässig nur analysieren und berichten, keine Änderungen ohne Auftrag.** Standards: `docs/coding-guidelines.md`, `.claude/rules/`.

## Ablauf

1. Änderungen erfassen (`git status -sb`, `git diff`, neue Dateien). Betroffene Dateien **vollständig** lesen, nicht nur den Diff. Nur dort lesen, wo geändert wurde.
2. Prüfen:

   **Architektur / Wartbarkeit**
   - Supabase nur in `services/` (nie in `app/`, `components/`), Mapping in `supabase-mappers.ts`; Typen in `types/domain.ts`, Konstanten in `constants/`, Mock nur in `data/`
   - Wiederverwendung statt duplizierter UI-/Logik, keine unnötige Abhängigkeit, keine Grossumbauten, Rückwärtskompatibilität (Env, Props, Service-Exports, Spaltennamen)
   - Kein Spring Boot / n8n / Coolify / Zahlungen / Admin-Web „nebenbei“

   **TypeScript / Expo / React Native**
   - Strict-konform, kein unkommentiertes `any`, Function Components, Expo-Router-Konventionen
   - NativeWind konsistent, `BookingStatus` statt Strings, Datum/Zeit via `utils/date.ts` / `utils/timezone.ts`
   - Expo-SDK-54-APIs (bei Unsicherheit versionierte Docs prüfen)
   - Performance: unnötige Re-Renders, ungebremste Listen/Queries, N+1-Abfragen

   **Sicherheit / Datenschutz (Supabase, Auth, RLS)**
   - Keine Secrets/`service_role` in Code oder Git, `.env` nicht committet
   - RLS-Auswirkung bewertet: keine neuen anonymen Lese-/Schreibrechte auf fremde Daten; Policies ohne Rekursion auf `profiles`
   - Rollen aus `profiles.role`, nie `user_metadata`, kein Fallback auf `barber`
   - Migrationen idempotent, nummeriert, bestehende nicht umgeschrieben
   - Personendaten (Name, Telefon, Adresse) nicht unnötig geloggt oder exponiert
   - Pre-Launch-Checkliste berührt? (`docs/pre-launch-checklist.md`)

   **Fehlerbehandlung / UX**
   - Fehlerpfade zeigen etwas an (nie still scheitern), freundlich + geloggt (`[barbergo]`), Mock-Fallback ohne Env
   - Alle sichtbaren Texte und WhatsApp-Texte Deutsch, keine Platzhalter

   **Tests**
   - In `apps/mobile`: `npx tsc --noEmit` und `npm run lint` ausführen und Ergebnis berichten
   - Bei Supabase-/RLS-/Slot-Änderungen passendes Smoke-Skript nennen (`verify-rls`, `verify-guest-insert`, `verify-book-slot`) und ausführen, falls konfiguriert
   - Relevante Schritte aus `docs/e2e-checklist.md` benennen
   - Es gibt kein Unit-Test-Framework. Nicht erfinden, als Lücke nennen

3. Wiederkehrende Fehlermuster oder neue Erkenntnisse als Vorschlag für `lessons` melden (Eintrag nur auf Wunsch bzw. im `/my-closeout`).

## Ausgabe

Gruppiert nach **Kritisch** (Sicherheit, Datenverlust, Crash) · **Wichtig** · **Optional**, je `datei:zeile` + konkreter Fix. Danach: `tsc: ok/fehlgeschlagen/nicht ausgeführt · lint: ok/fehlgeschlagen/nicht ausgeführt · Smoke: …`. Am Ende anbieten, die Funde zu beheben.
