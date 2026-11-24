---
name: goal
description: Work hands-off toward a concrete goal while push notifications are on. Invoking /goal enables notify:on for this session (via the UserPromptSubmit hook). Use when the user wants to step away and be pinged when Claude needs input or finishes.
disable-model-invocation: true
---

# /goal

Ein konkretes Ziel weitgehend selbstständig verfolgen, während Benachrichtigungen aktiv sind (ntfy, Topic `barbergo-muhammet`).

## Benachrichtigungen

`/goal` schaltet `notify:on` für **diese Session** automatisch ein. Das erledigt der `UserPromptSubmit`-Hook (`.claude/hooks/notify-toggle.ps1`), noch bevor dieser Skill läuft. Ausschalten jederzeit mit `notify:off` in einem normalen Prompt. Details: `docs/dev-notifications.md`.

**Selbst keine Pings senden.** Die Hooks `Notification` und `Stop` erledigen das. Eigene Aufrufe von `scripts/notify-*.ps1` würden doppelte Pings erzeugen.

## Ablauf

1. Ziel aus den Argumenten übernehmen. Fehlt es, in 1–2 Sätzen erfragen.
2. Ziel und Randbedingungen kurz zurückspiegeln, dann loslegen.
3. Gemäss `.claude/rules/workflow.md` autonom arbeiten, verifizieren (`tsc`, `lint`) und nur bei echten Blockern anhalten (Zugangsdaten, sicherheitskritisch, destruktiv, grosse Architekturentscheidung).
4. Am Ende die Abschlusszusammenfassung (Dateien, Codeänderungen, Entscheidungen) und bei Bedarf `doc-sync` / `session-handoff`.
