# Session-Handoff

> Wird von `CLAUDE.md` in jeden neuen Chat geladen. **Immer nur der aktuelle Stand** (überschreiben, kein Log, max. ~60 Zeilen). Aktualisiert durch den Skill `/session-handoff`. Vor Gebrauch gegen `git status` / `git log` prüfen.

**Datum:** 2026-11-23 · **Branch:** `main` · **Basis-Commit:** `297816c` (`feat: unify profile navigation and stabilize MVP flows`)
**Uncommittet:** Claude-Code-Setup (siehe unten), bewusst nicht committet.

## Was in dieser Session passiert ist

- Lokales `main` per fast-forward auf `origin/main` gebracht (war 18 Commits hinter origin).
- Cursor-Konfiguration auf Claude Code migriert: `CLAUDE.md`, `.claude/settings.json`, `.claude/rules/*`, `.claude/skills/*`. Cursor-Regeln entfernt, `AGENTS.md` auf Verweis reduziert.
- Notify-System aus TASAN Media Trips nach PowerShell portiert (`notify:on` / `notify:off`, Hooks `UserPromptSubmit` / `Notification` / `Stop`). Getestet inkl. echtem ntfy-Versand.
- Keine Produktfeatures geändert.

## Aktueller Stand

- App-/Supabase-Stand unverändert: siehe `docs/current-status.md`.
- Notify-Hooks sind in einer **bereits laufenden** Claude-Session erst nach `/hooks` (Reload) oder Neustart aktiv.

## Offene Probleme / Blocker

- Migrationen `0006`–`0013` auf dem gehosteten Supabase anwenden und per Smoke-Skripten prüfen (benötigt `.env`, nicht von hier aus erledigt).
- Kein Unit-Test-Framework vorhanden. Qualitätssicherung = `tsc`, `lint`, Smoke-Skripte, manuelle E2E (`docs/e2e-checklist.md`).
- `docs/pre-launch-checklist.md` beschreibt noch teilweise den Vor-`0003`-Zustand (Korrektur beim nächsten Pre-Launch-Durchlauf).

## Nächste Schritte (priorisiert)

1. Claude-Code-Setup committen (nach Review der Dateiliste).
2. Migrationen `0006`–`0013` anwenden, `npm run verify-rls`, `verify-guest-insert`, `verify-book-slot`.
3. Manuelle E2E nach `docs/e2e-checklist.md`.
4. Supabase Auth: Redirect-URLs, Barber-Mail-Template, Passwort-Mindestlänge ≥ 8.
5. Danach Barber-Verfügbarkeit / Blockzeiten UI.

## Entscheidungen

- Notify: ntfy-Topic bleibt `barbergo-muhammet`, Standard **aus**, State pro Session (wie TASAN). Details `docs/dev-notifications.md`.

## Gotchas

- Hook-Pfade nutzen `$CLAUDE_PROJECT_DIR`. Nicht auf relative Pfade zurückbauen (Arbeitsverzeichnis kann `apps/mobile` sein).
- `.env` ist per Permission-Deny für Claude gesperrt. Env-Prüfungen nur über `.env.example`.

## Wie weitermachen

`/continue-project` ausführen, dann die erste Aufgabe unter „Nächste Schritte“ bestätigen.
