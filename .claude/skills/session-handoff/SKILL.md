---
name: session-handoff
description: Close out a BarberGo session. Updates docs/session-handoff.md, TODO.md and docs/current-status.md so a fresh Claude chat can continue seamlessly, and prepares a commit message without committing. Use at the end of a work session or when the user says "Handoff", "Feierabend", "Session beenden" or "closeout".
---

# /session-handoff

Repository als Gedächtnis: Nach diesem Skill kann ein neuer Chat ohne Rückfragen weiterarbeiten (Pendant zu TASAN `daily-project-closeout`).

## Ablauf

1. **Zustand erfassen:** `git status -sb`, `git diff --stat`, `git log --oneline -5`. Verifikation (`npx tsc --noEmit`, `npm run lint` in `apps/mobile`) ausführen, sofern Code geändert wurde, und Ergebnis notieren.
2. **`docs/session-handoff.md` überschreiben** (kein Log, immer nur der aktuelle Stand, max. ~60 Zeilen) nach der Vorlage in der Datei:
   Datum · Branch/Commit · Uncommittet · Was in dieser Session passiert ist · Aktueller Stand · Offene Probleme/Blocker · **Nächste Schritte (priorisiert)** · Entscheidungen · Gotchas · Wie weitermachen.
3. **`TODO.md`:** erledigte Punkte abhaken, neue Aufgaben ergänzen.
4. **`docs/current-status.md`:** Datum „Last updated“, Features, Known issues, Next recommended tasks, Setup-Status auf den echten Stand bringen. Bestehende Abschnitte aktualisieren, nichts duplizieren (Skill `doc-sync`).
5. **Architekturentscheidungen** in den Entscheidungslog von `docs/architecture.md` übernehmen, falls neue getroffen wurden.
6. **Lehren** (Fehlerursachen, Fallstricke, bewährte Lösungen) per Skill `lessons-learned` eintragen. Nur, wenn es wirklich etwas Neues gibt.
7. **Struktur-Check:** keine Debug-/Temp-Dateien im Working Tree, keine Secrets, `.gitignore` aktuell.
8. **Commit vorbereiten, nicht ausführen:** geänderte Dateien, wichtige Logikänderungen, Risiken (RLS/Security/Regressionen) und eine Commit-Message (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`) vorschlagen. Kein Commit, kein Push.

## Ausgabe

Kurze Tabelle: Schritt · Status · Notiz, plus Zeile „**Nächster Chat:** `/continue-project`“.
