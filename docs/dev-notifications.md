# Dev-Benachrichtigungen (ntfy) für Claude Code

Optionale Handy-Pushes über [ntfy.sh](https://ntfy.sh), Topic **`barbergo-muhammet`** (in der ntfy-App abonnieren), damit du das Terminal verlassen kannst. Nicht zu verwechseln mit den End-User-Pushes der App (`docs/push-notifications.md`).

Portiert aus dem bewährten System von **TASAN Media Trips** (gleiches Verhalten, gleiche Dateistruktur). Abweichung: **PowerShell statt Bash+Python**, damit unter Windows keine Python-Abhängigkeit nötig ist und die vorhandenen `scripts/notify-*.ps1` wiederverwendet werden.

## Bedienung

| Aktion | Wie |
|---|---|
| Einschalten (nur diese Session) | `notify:on` irgendwo in einem normalen Prompt, **oder** `/goal` |
| Ausschalten | `notify:off` irgendwo in einem normalen Prompt |
| Standard | **AUS**. Ohne Einschalten wird nichts gesendet |

Bei Wirkung erscheint im Chat „BarberGo: Benachrichtigungen AN/AUS“. Kommen beide Wörter in einem Prompt vor, gilt das **letzte**.

## Was einen Ping auslöst

- **Claude wartet auf dich** (Hook `Notification`, nur `permission_prompt`, `idle_prompt`, `elicitation_dialog`): „Claude braucht deine Eingabe/Freigabe“.
- **Auftrag beendet** (Hook `Stop`): „Auftrag beendet“. `Stop` feuert auch bei `/clear`, `/resume`, `/compact`, dort ist ein Zusatz-Ping normal.
- Sonst **nichts**: kein Ping pro Tool-Aufruf, keine `auth_success`-Meldungen.

Nachrichten sind feste, kurze Texte mit Titel „BarberGo“. **Nie** Prompt-, Datei- oder Tool-Inhalte.

## Keine doppelten Pings

1. Claude ruft `scripts/notify-*.ps1` **nicht** mehr selbst auf (früher Cursor-Pflicht, jetzt ersetzt durch Hooks, siehe `.claude/rules/workflow.md`).
2. Der Ping-Hook sendet dieselbe Art (`notify`/`complete`) nicht zweimal innerhalb von 10 s pro Session.

## Technik

| Datei | Aufgabe |
|---|---|
| `.claude/settings.json` | Verdrahtet `UserPromptSubmit`, `Notification`, `Stop` (Pfade via `$CLAUDE_PROJECT_DIR`) |
| `.claude/hooks/notify-toggle.ps1` | Erkennt `notify:on`/`notify:off`/`/goal`, legt `.claude/notify-state/<session_id>` an bzw. entfernt es |
| `.claude/hooks/notify-ping.ps1` | Sendet nur, wenn die State-Datei existiert. Dedupe über `<session_id>.last`. Timeout 5 s, Fehler werden verschluckt, Exit-Code immer 0 |
| `scripts/notify-custom.ps1` | Eigentlicher ntfy-Versand (Parameter `-Title`, `-TimeoutSec`, `-Quiet`). Topic per Env `BARBERGO_NTFY_TOPIC` überschreibbar |
| `scripts/notify-done.ps1` | Manueller „fertig“-Ping |

`.claude/notify-state/` ist gitignored. Der Zustand ist pro Session, parallele Sessions beeinflussen sich nicht.

## Manuell testen

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "Test"
```

## Bekannte Einschränkungen

1. Das Topic ist öffentlich erratbar (ntfy.sh ohne Zugriffsschutz). Es werden nur feste, nicht sensible Texte gesendet. Bei Bedarf Topic wechseln (`BARBERGO_NTFY_TOPIC`, Default in `scripts/notify-custom.ps1`) und neu abonnieren.
2. Neue/geänderte Hook-Konfiguration wirkt in einer **bereits laufenden** Session erst nach `/hooks` (Reload) oder Neustart.
3. Der Versand braucht Internet. Offline passiert still nichts.
4. Nur ntfy-Push aufs Handy, kein lokaler Windows-Toast (wie im TASAN-Original).
