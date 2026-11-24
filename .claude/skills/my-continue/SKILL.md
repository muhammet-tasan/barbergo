---
name: my-continue
description: "[universal] Wiedereinstieg (neuer Chat, anderer PC): Kontext laden, gegen Git prüfen, genau eine nächste Aufgabe empfehlen. Startet keine Implementierung."
disable-model-invocation: true
---

# /my-continue

Wiedereinstieg unabhängig vom Chatverlauf. Dokumentpfade stehen in `CLAUDE.md` (Abschnitt „Dokumentenlandkarte“, Spalte *Rolle*). `CLAUDE.md` selbst und das Handoff sind meist schon geladen und werden nicht erneut gelesen.

## Ablauf

1. **Git** (nur Fakten): `git status -sb`, `git log --oneline -5`, `git fetch` + Abstand zu `origin/<branch>`. Uncommittete Änderungen und fremde Commits erkennen.
2. **Lesen, gezielt:** Rolle `handoff` (`PROJECT_STATUS.md`, falls nicht geladen; `▶ Aktiver Fokus` und jüngster Session-Log-Eintrag), `status`, `todo` (nur offene Punkte), `roadmap` (nur Meilenstein-Übersicht). `lessons` nur, wenn die nächste Aufgabe einen bekannten Problembereich berührt. Kein Repo-Scan, keine alten Dokumente.
3. **Widersprüche** zwischen Doku und Realität melden (Basis/Commits im Session-Log oder Aktivem Fokus ≠ Git, erledigt laut Doku aber nicht im Code, usw.). Bei Konflikt gilt Git/Code.
4. **Ausgabe** (max. ~15 Zeilen, Deutsch):
   - Letzter Fortschritt (1–3 Sätze)
   - Offene Probleme / Blocker
   - Git-Zustand
   - **Eine** empfohlene nächste Aufgabe: was, warum jetzt (entsperrt am meisten / Blocker zuerst), benötigter Input, erwartetes Ergebnis
5. Bei Widerspruch zwischen `PROJECT_STATUS.md` und Git: melden und Korrektur der Datei vorschlagen (Änderung erst nach Bestätigung).
6. Fragen „Soll ich loslegen?“. **Nicht eigenmächtig implementieren**, ausser der Prompt enthält bereits eine konkrete Aufgabe.

## Hinweise

- Kein `pull`/`checkout` ohne Freigabe. Bei „behind origin“ fast-forward vorschlagen.
- Verändert keine Dateien.
