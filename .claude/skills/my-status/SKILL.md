---
name: my-status
description: "[universal] Kompakter Projektstatus: Phase, Meilensteine, offene Aufgaben, Risiken, Git, nächster Schritt. Nur lesen."
disable-model-invocation: true
---

# /my-status

Kurzer, aktueller Überblick. **Verändert keine Dateien.** Dokumentpfade stehen in `CLAUDE.md` (Abschnitt „Dokumentenlandkarte“, Spalte *Rolle*).

## Ablauf

1. Lesen: Rollen `status`, `roadmap` (nur Meilenstein-Übersicht), `todo` (nur offene Punkte), `handoff`. Nichts anderes laden.
2. Git: `git status -sb`, `git log --oneline -3`.
3. Doku gegen Realität prüfen (Branch/Commit im Handoff, Datum, offensichtliche Abweichungen). Veraltetes **ausdrücklich** melden.
4. Ausgeben (max. ~20 Zeilen, Stichpunkte, Deutsch):
   - **Phase / Stand**
   - **Meilensteine:** abgeschlossen · laufend · kommend (Status `PLANNED` / `IN PROGRESS` / `BLOCKED` / `DONE`)
   - **Wichtigste offene Aufgaben**
   - **Probleme / Risiken / Blocker**
   - **Git:** Branch, uncommittet, Abstand zu origin (falls bekannt)
   - **Empfohlener nächster Schritt**
