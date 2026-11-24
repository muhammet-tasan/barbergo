---
name: continue-project
description: Resume BarberGo work at the start of a new chat. Loads handoff, status and TODO, verifies them against git, summarizes the state and proposes the next task. Use when the user says "weiter", "continue", "wo waren wir", "project status" or "next task".
---

# /continue-project

Kontext über Chats hinweg wiederherstellen (Pendant zu TASAN `continue-project` / `project-status` / `next-task`).

## Ablauf

1. Lesen: `docs/session-handoff.md` (ist bereits über `CLAUDE.md` geladen), `TODO.md`, `docs/current-status.md` (Known issues, Next recommended tasks), bei Bedarf `docs/lessons-learned.md`.
2. **Gegenprüfen statt vertrauen:** `git status -sb`, `git log --oneline -5`, `git fetch origin` + Vergleich mit `origin/main`. Weicht der Stand vom Handoff ab (anderer Commit, unerwartete Änderungen), das Handoff als veraltet kennzeichnen.
3. Zusammenfassen (max. ~15 Zeilen, Deutsch):
   - **Phase/Stand** in 1–2 Sätzen
   - **Zuletzt erledigt**
   - **Offen / Blocker / Entscheidungen**
   - **Git-Zustand** (Branch, Abstand zu origin, uncommittete Änderungen)
4. **Nächste Aufgabe** vorschlagen: die eine mit dem grössten Hebel (entsperrt am meisten), mit Begründung, benötigten Eingaben und erwartetem Ergebnis. Nur Aufgaben aus `TODO.md` / `current-status.md` vorschlagen, ausser der User wünscht anderes.
5. Danach nachfragen „Soll ich loslegen?“. Nicht automatisch mit der Implementierung starten, ausser der User hat bereits eine konkrete Aufgabe genannt.

## Hinweise

- Keine Dateien ändern. Dieser Skill liest nur.
- Pull nie automatisch ausführen. Bei „behind origin“ den User fragen bzw. fast-forward vorschlagen.
