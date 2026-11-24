---
name: doc-sync
description: Keep BarberGo project docs in sync after relevant changes (new features, schema/RLS/migration changes, env vars, architecture or convention changes). Maps each change type to the one doc that owns it and updates only that. Skip for trivial changes. Use after finishing a major step or when the user says "Doku aktualisieren".
---

# doc-sync

Nach **relevanten** Änderungen die zuständige Doku aktualisieren. Bei Trivialem (Tippfehler, reine Styling-Anpassung, Refactoring ohne Verhaltensänderung) **nichts** anfassen.

## Zuordnung: Änderung → Dokument

| Änderung | Aktualisieren |
|---|---|
| Neues/geändertes Feature, Screen, Route | `docs/current-status.md` (Working features), `TODO.md` (abhaken) |
| Bug/Einschränkung entdeckt, Check fehlgeschlagen/übersprungen | `docs/current-status.md` → Known issues |
| Neue Migration, RLS/RPC/Policy | `supabase/README.md`, Setup-Status-Tabelle in `docs/current-status.md`, `docs/data-model.md` bei Schema-Änderung; bei Lockerung/Security zusätzlich `docs/pre-launch-checklist.md` prüfen |
| Neue/geänderte Env-Variable | `apps/mobile/.env.example`, `README.md`, ggf. `docs/pre-launch-checklist.md` |
| Architekturentscheidung | Entscheidungslog in `docs/architecture.md` (+ Stack-Tabelle bei Stackwechsel) |
| Neue Code-/UI-Konvention | `docs/coding-guidelines.md` |
| Neue Arbeitsregel für Agenten | `docs/project-rules.md`, ggf. `CLAUDE.md` / `.claude/rules/` |
| Produktentscheidung, Phase erledigt | `docs/product-roadmap.md` |
| Fehlerursache, Fallstrick, bewährte Lösung | Skill `lessons-learned` |
| Ende der Session | Skill `session-handoff` |

## Vorgehen

1. `git diff --stat` ansehen, Änderungstyp bestimmen, **nur** die zugeordneten Dokumente öffnen.
2. Bestehenden Abschnitt ändern, keinen parallelen anlegen. Informationen nie in zwei Dateien führen, sondern verlinken.
3. „Last updated“ in `docs/current-status.md` nur setzen, wenn der Inhalt wirklich geändert wurde.
4. Prüfen, dass Verweise (Dateinamen, Migrationsnummern, Routen) im Code existieren.
5. Bei Konflikt zwischen Doku und Code gilt der Code. Doku korrigieren und den Widerspruch in der Antwort nennen.

Die Details zu den Zuständigkeiten stehen in `.claude/rules/docs-ownership.md`.
