---
name: my-barbergo-pre-launch
description: "[BarberGo] Go-live-Prüfung (Env, Secrets, Supabase Auth, RLS, Datenschutz, Buchungsflow, Smoke-Tests, Build) mit Ergebnis GO / GO mit Einschränkungen / NO-GO. Keine Änderungen an Produktion."
disable-model-invocation: true
---

# /my-barbergo-pre-launch

Quelle der Checkliste: `docs/pre-launch-checklist.md` (pfadgebundene Regel: `.claude/rules/pre-launch.md`). Während der normalen MVP-Entwicklung nichts ungefragt umstellen.

## Ablauf

1. Lesen: `docs/pre-launch-checklist.md`, Setup-Stand in `docs/current-status.md`, `supabase/README.md`, offene Blocker im Handoff/TODO.
2. Jeden Punkt **gegen den echten Stand** prüfen (Code, `.env.example`, Migrationen, Skripte), nicht nur abhaken. `.env` wird nie gelesen. Env-Prüfung nur über `.env.example` und Hinweise des Users.
   - **Produktionskonfiguration / Env:** `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true`; URL/Anon-Key zeigen auf das **Produktions**-Projekt; echte WhatsApp-Nummer; nach Env-Änderung `npx expo start -c`
   - **Secrets:** kein `service_role`/Token im Code, in Git-Historie oder App-Bundle; `.gitignore` deckt `.env*`
   - **Supabase Auth:** Redirect-URLs, Barber-Mail-Template, Passwort-Mindestlänge ≥ 8 (`docs/supabase-auth-settings.md`); Admin-/Barber-User existiert, Login getestet
   - **RLS / Datenzugriff (kritisch):** anonyme Alt-Policies aus `0002_*` entfernt; `0003`–`0013` angewendet; anon nur Buchen (`insert` `pending` bzw. `book_slot`); Admin/Barber/Kunde sehen nur das Erlaubte; Admin ohne Login ohne Zugriff
   - **Datenschutz:** nur nötige Personendaten, kein Logging von Name/Telefon/Adresse, Zugriff auf fremde Buchungen ausgeschlossen
   - **Kritische Abläufe:** Kundenbuchung (Gast + Konto), Storno, Barber-Freigabe, Admin-Verwaltung, Offline-Verhalten (`docs/e2e-checklist.md`)
   - **Smoke:** `npm run verify-rls`, `verify-guest-insert`, `verify-book-slot` (benötigen konfigurierte `.env`)
   - **Build / Deployment:** `npx tsc --noEmit`, `npm run lint`, Build-Konfiguration (`app.config.js`, EAS/Web-Export), keine Debug-Flags
3. Ergebnis als Tabelle **bestanden / offen / nicht prüfbar** (je Datei- oder Migrationsverweis). Nicht Überprüfbares **ausdrücklich** so kennzeichnen.
4. Änderungen an gehostetem Supabase, Produktions-Env oder Deployments **nicht selbst ausführen**: Schritte nennen, Freigabe einholen.
5. Gefundene Abweichungen in `status` (Known issues) und `todo` eintragen. Bekannt: `docs/pre-launch-checklist.md` beschreibt teils noch den Vor-`0003`-Zustand. Beim Durchlauf korrigieren, ohne Prüfpunkte zu streichen.

## Ausgabe

Tabelle wie oben, dann Fazit mit Begründung nur aus tatsächlich durchgeführten Prüfungen:

- **GO**: alle kritischen Punkte bestanden
- **GO mit Einschränkungen**: nur nicht-kritische Punkte offen/nicht prüfbar (Liste)
- **NO-GO**: mindestens ein kritischer Punkt (RLS, Secrets, Auth, Buchungsflow) offen oder nicht prüfbar
