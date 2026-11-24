# Arbeitsweise (semi-autonom)

Quelle der Wahrheit: `docs/project-rules.md`. Hier nur die verbindlichen Kurzregeln.

## Autonomie

- Mit sinnvollen Defaults weiterarbeiten, keine unnötigen Rückfragen. Kleine UI-/Namens-/Ordnerentscheidungen: Default wählen, kurz dokumentieren, weitermachen.
- **Nur nachfragen bei:** sicherheitskritischen oder destruktiven Aktionen, unklarer grosser Architektur, wesentlich unterschiedlichen Technologiewahlen, fehlenden Zugangsdaten/API-Keys/Accounts, Bibliotheken mit starkem Einfluss auf die künftige Architektur.
- Iterativ in kleinen, lauffähigen Schritten arbeiten. Die App muss nach jedem grösseren Schritt laufen.

## Änderungssicherheit

- Bestehende Logik nicht ohne Grund ändern. Refactoring nur, wenn gewünscht, für einen Bugfix oder für das Feature nötig, oder die Implementierung klar kaputt ist.
- Rückwärtskompatibilität wahren (Env-Variablen, öffentliche Props, exportierte Service-Funktionen, Supabase-Spaltennamen).
- **Vorher bestätigen lassen:** grosse Architektur-Umbauten, Breaking Changes an API/Props, destruktive Operationen (Dateien löschen, Tabellen droppen, Force-Push), Löschen wichtiger Codepfade, Änderungen an Projektkonventionen (`CLAUDE.md`, `.claude/rules/`, `docs/project-rules.md`, `docs/coding-guidelines.md`).

## Verifikation

Nach jedem relevanten Meilenstein vor dem Stoppen prüfen (in `apps/mobile`):

- `npx tsc --noEmit` und `npm run lint`
- bei Bedarf App-Start (`npx expo start -c`) oder gezielter manueller Smoke-Test
- Fehler selbst beheben; Fehlgeschlagenes/Übersprungenes in `docs/current-status.md` → Known issues vermerken.

## Abschluss nach jedem grösseren Schritt

Antwort endet mit:

1. **Geänderte Dateien** (gruppiert nach `apps/mobile/`, `docs/`, …)
2. **Wichtige Codeänderungen** (einsteigerfreundlich: was gebaut wurde, wie es zusammenhängt)
3. **Architekturentscheidungen** (kurz: warum, was verschoben wurde)

Dazu: was zu testen ist und eine **vorgeschlagene Commit-Message** (Conventional Commits). Vor dem Stoppen `TODO.md` und `docs/current-status.md` aktualisieren (Skill `doc-sync`). Bei trivialen Aufgaben keine Doku-Änderungen.

## Git

- **Nie automatisch committen oder pushen.** Kein `reset --hard`, `clean`, Force-Push, kein Überschreiben lokaler Änderungen.
- Vor einem Commit-Vorschlag: geänderte Dateien, wichtige Logikänderungen und mögliche Risiken (Regressionen, RLS-/Security-Auswirkung) zusammenfassen.

## Benachrichtigungen

Läuft automatisch über Hooks (`notify:on` / `notify:off`, siehe `docs/dev-notifications.md`). **Niemals selbst** `scripts/notify-*.ps1` aufrufen. Das würde doppelte Pings erzeugen. Ausnahme: der User verlangt ausdrücklich einen manuellen Ping.
