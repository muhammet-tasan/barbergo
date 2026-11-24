# Session-Handoff

> Wird von `CLAUDE.md` in jeden neuen Chat geladen. **Immer nur der aktuelle Stand** (überschreiben, kein Log, max. ~60 Zeilen). Aktualisiert durch `/my-closeout`. Vor Gebrauch gegen `git status` / `git log` prüfen.

**Datum:** 2026-11-24 · **Branch:** `main` · **Basis-Commit:** `c52ca76` (`chore: migrate Cursor config to Claude Code setup`)
**Uncommittet:** Skill-Konsolidierung auf `my-*` (Skills, `CLAUDE.md`, Rules, Docs). Bewusst noch nicht committet.

## Was in dieser Session passiert ist

- Cursor→Claude-Code-Setup committet (`c52ca76`, lokal, nicht gepusht).
- Skills auf sechs reduziert und mit `my-`-Präfix versehen: universell `my-continue`, `my-status`, `my-closeout`, `my-list-commands`; BarberGo `my-barbergo-review`, `my-barbergo-pre-launch`. Entfallen: `doc-sync`, `lessons-learned`, `next-task`, `goal` (eingebautes `/goal` ersetzt es).
- `CLAUDE.md`: Dokumentenlandkarte mit Spalte *Rolle* (Konvention für universelle Skills), Regel zur automatischen Doku-Pflege, Skill-Tabelle. Mapping Änderung→Dokument jetzt in `.claude/rules/docs-ownership.md`, Lessons-Format in `docs/lessons-learned.md`.
- `docs/product-roadmap.md`: Meilenstein-Tabelle M1–M7 (`PLANNED`/`IN PROGRESS`/`BLOCKED`/`DONE`). `docs/claude-code-setup.md`: Namenskonvention, Übernahme in andere Projekte, Mehr-PC-Hinweise.
- Keine Produktfeatures geändert, kein App-Code.

## Aktueller Stand

- App-/Supabase-Stand unverändert: siehe `docs/current-status.md`. Meilensteine: `docs/product-roadmap.md`.
- Neue Skills sind **statisch geprüft** (Frontmatter, Namen, Grep-Auflistung), aber noch **nicht in einer frischen Session ausgeführt**.

## Offene Probleme / Blocker

- Migrationen `0006`–`0013` auf dem gehosteten Supabase anwenden und per Smoke-Skripten prüfen (benötigt `.env`, nicht von hier aus erledigt). Entspricht Meilenstein M1 (`BLOCKED`).
- Kein Unit-Test-Framework. Qualitätssicherung = `tsc`, `lint`, Smoke-Skripte, manuelle E2E (`docs/e2e-checklist.md`).
- `docs/pre-launch-checklist.md` beschreibt noch teilweise den Vor-`0003`-Zustand (beim nächsten `/my-barbergo-pre-launch` korrigieren).

## Nächste Schritte (priorisiert)

1. Neue Session starten, `/my-list-commands` und `/my-continue` real testen. Dann Skill-Konsolidierung committen.
2. Migrationen `0006`–`0013` anwenden, `npm run verify-rls`, `verify-guest-insert`, `verify-book-slot`.
3. Manuelle E2E nach `docs/e2e-checklist.md`.
4. Supabase Auth: Redirect-URLs, Barber-Mail-Template, Passwort-Mindestlänge ≥ 8.
5. Danach Barber-Verfügbarkeit / Blockzeiten UI (M4).

## Entscheidungen

- Roadmap-Rolle zeigt auf das bestehende `docs/product-roadmap.md` statt neuer `docs/ROADMAP.md` (kein Parallel-Dokument).
- Alle Skills `disable-model-invocation: true` (manuell, spart Kontext). Gruppierung in `/my-list-commands` über Tag `[universal]` / `[BarberGo]` in der `description`.
- Notify: ntfy-Topic `barbergo-muhammet`, Standard **aus**, State pro Session. Details `docs/dev-notifications.md`.

## Gotchas

- Hook-Pfade nutzen `$CLAUDE_PROJECT_DIR`. Nicht auf relative Pfade zurückbauen.
- `.env` ist per Permission-Deny gesperrt. Env-Prüfungen nur über `.env.example`.
- Skills werden in einer bereits laufenden Session erst nach Neustart/`/reload` sichtbar.

## Wie weitermachen

`/my-continue` ausführen, dann die erste Aufgabe unter „Nächste Schritte“ bestätigen.
