---
name: my-list-commands
description: "[universal] Zeigt alle eigenen my-* Skills dynamisch (universell und projektspezifisch getrennt). Nur lesen."
disable-model-invocation: true
---

# /my-list-commands

Übersicht aller eigenen Commands. Keine statische Liste, keine Änderungen.

## Ablauf

1. Per **Grep** (nicht per Einzel-Reads) `^(name|description):` in diesen Dateien auslesen:
   - Projekt: `.claude/skills/my-*/SKILL.md`
   - Global (nur anzeigen, nie ändern): `~/.claude/skills/my-*/SKILL.md` und `~/.claude/commands/my-*.md`
2. Gruppieren nach dem Tag am Anfang der `description`:
   - `[universal]` → **Universell**
   - `[<Projektname>]` → **Projektspezifisch** (Name = Tag)
   - ohne Tag → **Sonstige** (Hinweis: Tag in der description ergänzen)
3. Ausgabe pro Gruppe: `/name`: Zweck in einem Satz (aus der description, Tag weglassen), Deutsch, max. 1 Zeile je Skill.
4. Globale Skills nur zeigen, wenn es welche gibt, als eigene Gruppe **Global**.

## Konvention (Neuanlage)

Ordner `.claude/skills/my-<funktion>/` (universell) bzw. `my-<projekt>-<funktion>/`. `description` beginnt mit `[universal]` bzw. `[<Projekt>]`. Neue Skills erscheinen dadurch automatisch.
