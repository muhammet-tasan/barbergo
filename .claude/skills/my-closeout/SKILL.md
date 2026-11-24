---
name: my-closeout
description: "[universal] Tages-/Sessionabschluss: Doku, Roadmap, TODO, Lessons, Handoff aktualisieren, Checks ausführen, Commit vorbereiten (nicht ausführen)."
disable-model-invocation: true
---

# /my-closeout

Repository als Gedächtnis: Danach kann ein neuer Chat oder anderer PC ohne Kontextverlust weitermachen. Dokumentpfade, Zuständigkeiten und Checks stehen in `CLAUDE.md` (Dokumentenlandkarte, Spalte *Rolle*, Zeile *Checks*) und `.claude/rules/docs-ownership.md`. Unterwegs bereits gepflegte Doku nicht doppelt anfassen, nur konsolidieren.

## Ablauf

1. **Erfassen:** `git status -sb`, `git diff --stat`, `git log` seit dem Basis-Commit des Handoffs. Session-Fortschritt in wenigen Punkten zusammenfassen.
2. **TODO** (`todo`): Erledigtes abhaken (nur wenn wirklich erledigt), neue Aufgaben/Probleme aufnehmen.
3. **Roadmap** (`roadmap`): Meilenstein-Status nur ändern, wenn die Abschlusskriterien **belegt** erfüllt sind (`DONE`). Gefährdete/blockierte Meilensteine markieren. Neue Produktanforderungen oder Zieländerungen nur als **Vorschlag** eintragen, nicht beschliessen.
4. **Status** (`status`): Ist-Zustand, Known issues, Setup-Stand aktualisieren. Datum nur setzen, wenn sich Inhalt geändert hat.
5. **Lessons** (`lessons`): neue Erkenntnisse (Problem, Ursache, Lösung, Vermeidung, Relevanz für andere Projekte) eintragen, Duplikate vermeiden. Dauerhafte Regel? Prüfen, ob sie nach `CLAUDE.md`/`.claude/rules/` gehört (sparsam).
6. **Architekturentscheidungen** in das dafür zuständige Dokument (siehe docs-ownership), nur wenn neu.
7. **Workflow-Verbesserung:** wiederkehrende Reibung, unnötiger Token-/Zeitverbrauch, Skill-Verbesserung? Bei klarem Nutzen Regel/Skill anpassen und in 1 Zeile begründen. Keine neuen Skills ohne klaren Bedarf.
8. **Prüfungen** (*Checks* aus `CLAUDE.md`): ausführen, soweit Code geändert wurde. Fehler beheben oder melden. Nicht Ausgeführtes/Fehlgeschlagenes **ehrlich** nennen, nie als bestanden darstellen.
9. **Handoff** (`handoff`): überschreiben (kein Log, kompakt, Format: siehe Datei).
10. **Doku-Konsistenz:** Widersprüche, doppelte Informationen, Datum/Branch/Commit im Handoff gegen Git prüfen. Keine Secrets, keine Debug-/Temp-Dateien im Working Tree, `.gitignore` aktuell.
11. **Commit vorbereiten, nicht ausführen:** Dateien, wichtigste Änderungen, Risiken, Commit-Message (Conventional Commits). **Kein Commit/Push ohne ausdrückliche Freigabe.**

## Ausgabe (kompakt)

- Erreicht · Abgeschlossene Meilensteine · Offene Probleme
- Neue Erkenntnisse · Aktualisierte Dokumente
- Tests durchgeführt / **nicht** durchgeführt
- Empfohlene nächste Aufgabe
- Commit-bereit: ja/nein · Vorgeschlagene Commit-Message
