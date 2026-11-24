---
name: my-notification-on
description: "[universal] Option pro Auftrag: ntfy-Push nur für diesen Auftrag, kombinierbar, z. B. \"/goal /my-notification-on <Bedingung>\". Standard ist aus, Reset automatisch."
disable-model-invocation: true
---

# /my-notification-on

Eine **Option pro Auftrag**, keine Session-Einstellung. Steht der Token `/my-notification-on` als eigenes Wort irgendwo im Prompt (z. B. `/goal /my-notification-on <Bedingung>` oder `/my-notification-on <Auftrag>`), senden die Hooks ntfy-Pushes (Topic `barbergo-muhammet`) für **genau diesen Auftrag**. Nach Abschluss oder spätestens beim nächsten Prompt ist es wieder aus. Es gibt keinen Off-Befehl.

Die Durchsetzung liegt in den Hooks (`.claude/hooks/notify.py`), nicht in diesem Text. Details: `docs/dev-notifications.md`.

## Ablauf

1. Wurde der Skill mit Argumenten aufgerufen, sind die Argumente der eigentliche Auftrag: ausführen.
2. Ohne Argumente: genau eine Zeile antworten, sonst nichts.
3. Nie selbst Benachrichtigungen senden, nie `scripts/notify-*.ps1` aufrufen, nie das Verzeichnis `.claude/notify-state/` anfassen.

## Ausgabe (ohne Argumente)

```
🔔 Benachrichtigungen sind nur für diesen Auftrag an.
```
