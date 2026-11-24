---
name: my-closeout
description: "[universal] Tages-/Sessionabschluss: Doku, Roadmap, TODO, Lessons, Projektgedächtnis (`PROJECT_STATUS.md`) aktualisieren, Checks ausführen, Commit vorbereiten (nicht ausführen)."
disable-model-invocation: true
---

# /my-closeout

Repository als Gedächtnis: Danach kann ein neuer Chat oder anderer PC ohne Kontextverlust weitermachen. Dokumentpfade, Zuständigkeiten und Checks stehen in `CLAUDE.md` (Dokumentenlandkarte, Spalte *Rolle*, Zeile *Checks*) und `.claude/rules/docs-ownership.md`. Unterwegs bereits gepflegte Doku nicht doppelt anfassen, nur konsolidieren.

## Ablauf

1. **Erfassen:** `git status -sb`, `git diff --stat`, `git log` seit dem letzten Session-Log-Eintrag. Session-Fortschritt in wenigen Punkten zusammenfassen.
2. **TODO** (`todo`): Erledigtes abhaken (nur wenn wirklich erledigt), neue Aufgaben/Probleme aufnehmen.
3. **Roadmap** (`roadmap`): Meilenstein-Status nur ändern, wenn die Abschlusskriterien **belegt** erfüllt sind (`DONE`). Gefährdete/blockierte Meilensteine markieren. Neue Produktanforderungen oder Zieländerungen nur als **Vorschlag** eintragen, nicht beschliessen.
4. **Status** (`status`): Ist-Zustand, Known issues, Setup-Stand aktualisieren. Datum nur setzen, wenn sich Inhalt geändert hat.
5. **Lessons** (`lessons`): neue Erkenntnisse (Problem, Ursache, Lösung, Vermeidung, Relevanz für andere Projekte) eintragen, Duplikate vermeiden. Dauerhafte Regel? Prüfen, ob sie nach `CLAUDE.md`/`.claude/rules/` gehört (sparsam).
6. **Architekturentscheidungen** in das dafür zuständige Dokument (siehe docs-ownership), nur wenn neu.
7. **Workflow-Verbesserung:** wiederkehrende Reibung, unnötiger Token-/Zeitverbrauch, Skill-Verbesserung? Bei klarem Nutzen Regel/Skill anpassen und in 1 Zeile begründen. Keine neuen Skills ohne klaren Bedarf.
8. **Prüfungen** (*Checks* aus `CLAUDE.md`): ausführen, soweit Code geändert wurde. Fehler beheben oder melden. Nicht Ausgeführtes/Fehlgeschlagenes **ehrlich** nennen, nie als bestanden darstellen.
9. **Projektgedächtnis** (`handoff` = `PROJECT_STATUS.md`): `▶ Aktiver Fokus` überschreiben (Phase, Resume-Punkt, Letzte Entscheidungen, 1–4 konkrete Nächste Schritte mit Dateien/Befehlen), Blocker/Gotchas pflegen, `Last Updated` setzen und **einen** Session-Log-Eintrag oben ergänzen (Datum, Erreichtes, Architekturentscheidungen mit Begründung, Standards/Lessons als Verweis). Älteste Einträge über 5 entfernen (Git bewahrt sie). Keine Information doppelt führen, auf `docs/lessons-learned.md` verlinken.
10. **Doku-Konsistenz:** Widersprüche, doppelte Informationen, Datum/Branch/Commit in `PROJECT_STATUS.md` gegen Git prüfen. Lesetest: Könnte eine frische Session mit `/my-continue` allein aus `▶ Aktiver Fokus` weitermachen? Wenn nicht, jetzt korrigieren. Keine Secrets, keine Debug-/Temp-Dateien im Working Tree, `.gitignore` aktuell.
11. **Commit vorbereiten, nicht ausführen:** Dateien, wichtigste Änderungen, Risiken, Commit-Message (Conventional Commits). **Kein Commit/Push ohne ausdrückliche Freigabe.**

## Ausgabe (kompakt)

- Erreicht · Abgeschlossene Meilensteine · Offene Probleme
- Neue Erkenntnisse · Aktualisierte Dokumente
- Tests durchgeführt / **nicht** durchgeführt
- Empfohlene nächste Aufgabe
- Commit-bereit: ja/nein · Vorgeschlagene Commit-Message
