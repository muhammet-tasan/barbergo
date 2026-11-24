---
name: barbergo-review
description: BarberGo-specific quality gate for the current diff. Checks architecture conformity, TypeScript, React Native/Expo, Supabase/RLS security, German UI copy and tests, then runs tsc and lint. Use before suggesting a commit, after a major step, or when the user asks for a review or "Qualitätscheck". For a generic bug hunt use the built-in code-review skill.
---

# /barbergo-review

Projektspezifischer Qualitäts-Check der aktuellen Änderungen (`git diff`, `git status`). Ergänzt, ersetzt nicht, das generische `code-review`.

## Ablauf

1. Änderungen erfassen: `git status -sb`, `git diff` (inkl. neue Dateien). Betroffene Dateien **vollständig** lesen, nicht nur den Diff.
2. Checkliste durchgehen (Details: `docs/coding-guidelines.md`, `.claude/rules/`):

   **Architektur**
   - [ ] Supabase nur in `services/` (nie in `app/` oder `components/`), Mapping in `supabase-mappers.ts`
   - [ ] Domain-Typen in `types/domain.ts`, Konstanten in `constants/`, Mock nur in `data/`
   - [ ] Kein Spring Boot / n8n / Coolify / Zahlungen / Push-Ausbau „nebenbei“
   - [ ] Keine unnötige Abhängigkeit, keine Grossumbauten, Rückwärtskompatibilität gewahrt

   **TypeScript & React Native / Expo**
   - [ ] Strict-konform, kein unkommentiertes `any`, Function Components, Expo Router Konventionen
   - [ ] NativeWind konsistent, bestehende Komponenten wiederverwendet, keine duplizierte UI-Logik
   - [ ] `BookingStatus` statt Status-Strings, Datum/Zeit via `utils/date.ts` / `utils/timezone.ts`
   - [ ] Expo-SDK-54-APIs (Docs prüfen, wenn unsicher)

   **Sicherheit (Supabase / Auth)**
   - [ ] Keine Secrets/`service_role` im Code oder Git, `.env` nicht committet
   - [ ] RLS-Auswirkung bewertet: keine neue anonyme Lese-/Schreibrechte auf fremde Daten
   - [ ] Rollen aus `profiles.role`, nie `user_metadata`; kein Fallback auf `barber`
   - [ ] Migrationen idempotent, nummeriert, bestehende nicht umgeschrieben
   - [ ] Pre-Launch-Checkliste berührt? (`docs/pre-launch-checklist.md`)

   **UX / Sprache**
   - [ ] Alle sichtbaren Texte Deutsch, keine Platzhalter-Texte, Fehler freundlich + geloggt (`[barbergo]`)
   - [ ] Fehlerpfade zeigen etwas an (nie still scheitern), Mock-Fallback funktioniert ohne Env

   **Tests / Verifikation**
   - [ ] `npx tsc --noEmit` und `npm run lint` in `apps/mobile` ausführen und Ergebnis berichten
   - [ ] Bei Supabase-/RLS-/Slot-Änderungen passendes Smoke-Skript (`verify-rls`, `verify-guest-insert`, `verify-book-slot`) nennen oder ausführen, falls `.env` konfiguriert ist
   - [ ] Manuelle Testschritte aus `docs/e2e-checklist.md` benennen, die relevant sind
   - [ ] Es gibt kein Unit-Test-Framework. Das nicht erfinden, sondern ehrlich als Lücke nennen.

3. Direkt behebbare Fehler **selbst beheben**, Ergebnis erneut prüfen. Nur Unsicheres/Architektur-Entscheidungen zurückmelden.

## Ausgabe

Gruppiert nach **Blocker / Wichtig / Hinweis**, je mit `datei:zeile` und konkretem Fix. Danach Zeile „tsc: ok/fehlgeschlagen · lint: ok/fehlgeschlagen“. Wiederkehrende Fehlermuster an `lessons-learned` melden.
