---
name: my-next-task
description: "[universal] Genau eine wirkungsvollste nächste Aufgabe bestimmen (aus Aktivem Fokus, TODO, Roadmap), mit Begründung. Nur lesen."
disable-model-invocation: true
---

# /my-next-task

Die eine Aufgabe mit der grössten Wirkung auf nachfolgende Arbeit. **Verändert keine Dateien**, startet keine Implementierung. Dokumentpfade stehen in `CLAUDE.md` (Dokumentenlandkarte, Spalte *Rolle*).

## Ablauf

1. Lesen: Rolle `handoff` (`PROJECT_STATUS.md` → `▶ Aktiver Fokus`, dort stehen die Kandidaten unter *Nächste Schritte*), danach `todo` (nur offene Punkte) und `roadmap` (nur Meilenstein-Übersicht, `BLOCKED`/`IN PROGRESS` zuerst). Sonst nichts.
2. Gegen Git prüfen (`git log --oneline -5`, `git status -sb`). Widerspruch zwischen Aktivem Fokus und Git melden, Git gilt.
3. Auswahl: Blocker vor Features, was am meisten nachgelagerte Arbeit entsperrt, vor Einzelthemen. Nichts vorschlagen, was weder in den Dokumenten steht noch daraus folgt.
4. Falls die Aufgabe `.env`, Zugangsdaten oder eine Freigabe braucht (z. B. Migrationen anwenden), das als benötigten Input nennen.

## Ausgabe (Deutsch, kompakt)

```
## Nächste Aufgabe

**Was:** <Titel>
**Warum jetzt:** <was es entsperrt / welcher Blocker>
**Benötigt:** <Input, Zugang, Freigabe oder "nichts">
**Ergebnis:** <was geliefert wird>
**Aufwand:** <grob>

Soll ich loslegen?
```
