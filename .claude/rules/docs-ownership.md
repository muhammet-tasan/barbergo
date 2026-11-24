---
paths:
  - "docs/**"
  - "TODO.md"
  - "README.md"
  - "CLAUDE.md"
  - ".claude/**"
---

# Dokumentation: Zuständigkeiten

Jede Information hat **genau ein** Zuhause. Bestehende Abschnitte aktualisieren statt Parallel-Dokumente anzulegen. Vollständige Tabelle: `CLAUDE.md` → „Dokumentenlandkarte“ und `docs/project-rules.md`.

| Information | Datei |
|---|---|
| Überblick, Setup, Run | `README.md` |
| Stack, Architektur, **Entscheidungslog** | `docs/architecture.md` |
| Tabellen/Entitäten | `docs/data-model.md` |
| Arbeitsregeln für Agenten | `docs/project-rules.md` |
| Code-/UI-/Supabase-Standards | `docs/coding-guidelines.md` |
| **Ist-Zustand**, Known issues, Supabase-Setup-Status | `docs/current-status.md` |
| Operative Aufgaben (Checkboxen) | `TODO.md` |
| Produktvision, Phasen, Backlog | `docs/product-roadmap.md` |
| Go-live-Härtung | `docs/pre-launch-checklist.md` |
| **Übergabe an den nächsten Chat** | `docs/session-handoff.md` |
| **Erkenntnisse / Fehlerlehren** | `docs/lessons-learned.md` |
| Dev-Benachrichtigungen (`notify:on/off`) | `docs/dev-notifications.md` |
| Claude-Code-Setup, Cursor-Migration | `docs/claude-code-setup.md` |

- Keine Doku-Änderungen bei trivialen Aufgaben (Tippfehler, Styling-Kleinigkeiten ohne Verhaltensänderung).
- Kein Inhalt doppelt führen. Stattdessen verlinken.
- Sprache der Projektdokumentation: bestehende Dateien behalten ihre Sprache (überwiegend Englisch, Produktdokus teils Deutsch). Neue Handoff-/Lessons-Einträge auf Deutsch.
