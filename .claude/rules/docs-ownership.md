# Dokumentation: Zuständigkeiten

Jede Information hat **genau ein** Zuhause (Single Source of Truth). Bestehende Abschnitte aktualisieren statt Parallel-Dokumente anzulegen. Vollständige Tabelle inkl. *Rolle*-Konvention für die `/my-*`-Skills: `CLAUDE.md` → „Dokumentenlandkarte“.

## Änderung → Dokument

| Änderung / Information | Datei |
|---|---|
| Überblick, Setup, Run, Env-Variablen (Doku) | `README.md`, `apps/mobile/.env.example` |
| Stack, Architektur, **Entscheidungslog** | `docs/architecture.md` |
| Tabellen/Entitäten, Schema-Änderung | `docs/data-model.md` (+ Migration) |
| Neue Migration, RLS/RPC/Policy | `supabase/README.md`, Setup-Status in `docs/current-status.md`; bei Lockerung/Security zusätzlich `docs/pre-launch-checklist.md` prüfen |
| Arbeitsregeln für Agenten | `docs/project-rules.md`, ggf. `CLAUDE.md` / `.claude/rules/` |
| Code-/UI-/Supabase-Konvention | `docs/coding-guidelines.md` |
| **Ist-Zustand**, Features, Known issues, fehlgeschlagene/übersprungene Checks | `docs/current-status.md` |
| Operative Aufgaben (Checkboxen) | `TODO.md` |
| Produktvision, Phasen, **Meilensteine**, Backlog, Roadmap-Vorschläge | `docs/product-roadmap.md` |
| Go-live-Härtung | `docs/pre-launch-checklist.md` |
| Web-Deployment (Test-URL, EAS Hosting) | `docs/deploy-web-test.md` |
| **Übergabe an den nächsten Chat**, Session-Log | `PROJECT_STATUS.md` |
| **Fehlerursachen, Fallstricke, bewährte Lösungen** | `docs/lessons-learned.md` |
| Dev-Benachrichtigungen (`/my-notification-on`) | `docs/dev-notifications.md` |
| Claude-Setup, Skill-Konvention, Übernahme in andere Projekte | `docs/claude-code-setup.md` |

## Regeln

- Keine Doku-Änderungen bei trivialen Aufgaben (Tippfehler, Styling ohne Verhaltensänderung, Refactoring ohne Verhaltensänderung).
- Kein Inhalt doppelt führen. Stattdessen verlinken. Bei Konflikt Doku ↔ Code gilt der Code: Doku korrigieren und den Widerspruch melden.
- „Last updated“ nur setzen, wenn sich Inhalt wirklich geändert hat.
- Sprache: bestehende Dateien behalten ihre Sprache (überwiegend Englisch, Produktdokus teils Deutsch). Neue Handoff-/Lessons-Einträge auf Deutsch.
