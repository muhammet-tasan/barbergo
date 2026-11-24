# Dev-Benachrichtigungen (ntfy) für Claude Code

Optionale Handy-Pushes über [ntfy.sh](https://ntfy.sh), Topic **`barbergo-muhammet`** (in der ntfy-App abonnieren), damit du das Terminal verlassen kannst. Nicht zu verwechseln mit den End-User-Pushes der App (`docs/push-notifications.md`).

Übernommen aus der getesteten Lösung von **TASAN Media Trips** (`.claude/hooks/notify.py`, `scripts/test-notifications.py`). Angepasst: Topic, Titel, Env-Variablen (`BARBERGO_*`) und ein am Skriptort verankerter State-Pfad (Sessions laufen oft in `apps/mobile`). Abgrenzung zu den übrigen übernommenen Standards: `docs/claude-code-setup.md`.

## Regeln (von Hooks durchgesetzt, nicht vom Prompt)

1. **Standard immer aus**, in jedem Auftrag und jeder Session.
2. **`/my-notification-on` ist eine Auftrags-Markierung.** Steht der Token als eigenes Wort irgendwo im Prompt, gibt es Pings für **genau diesen Auftrag**:
   - `/my-notification-on Mach X`
   - `/goal /my-notification-on Erledigt wenn Y`
   - `Bitte Z erledigen /my-notification-on`
3. **Nichts anderes schaltet ein:** nicht `/goal` allein, nicht `notify:on`, nicht Subagents, Hintergrund-Tasks oder Tests. In Backticks/Anführungszeichen oder an andere Zeichen gehängt zählt der Token nicht.
4. **Auto-Reset.** Nach Abschluss wird die Markierung gelöscht und bei jedem nächsten Prompt nochmals, bevor irgendetwas anderes passiert. Ein abgebrochener Auftrag wird spätestens vom nächsten Prompt oder vom Session-Ende bereinigt. **Es gibt keinen Off-Befehl**, nichts bleibt an.
5. **Pro Session und Auftrag.** Der State liegt unter `.claude/notify-state/<session_id>` und ist an die `prompt_id` des Auftrags gebunden. Parallele Sessions und fremde Aufträge lösen nie einen Ping aus.

## Was einen Ping auslöst (nur beim markierten Auftrag)

- **Auftrag beendet** (`Stop`): „Auftrag beendet“. Bei einem mehrstufigen `/goal` wartet der Hook auf das Ziel-Urteil (steht ein paar Sekunden *nach* Stop im Transcript) und pingt nur, wenn das Ziel erreicht ist oder gar kein Urteil kommt (Ziel gelöscht/abgebrochen). Zwischenrunden bleiben still.
- **Claude braucht Eingabe/Freigabe** (`Notification`): „Claude braucht deine Eingabe/Freigabe“, aber nicht für `idle_prompt` („wartet nach Abschluss“).

Feste, kurze Texte mit Titel „BarberGo“. **Nie** Prompt-, Datei- oder Tool-Inhalte.

## Technik

| Datei | Aufgabe |
|---|---|
| `.claude/hooks/notify.py` | Ein Skript, Unterbefehle `prompt\|stop\|notification\|start\|end`. Nie blockierend, Exit-Code immer 0, Fehler verschluckt |
| `.claude/settings.json` | Verdrahtet `UserPromptSubmit`, `Stop`, `Notification`, `SessionStart`, `SessionEnd` (Aufruf `python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/notify.py" <event>`). Sperrt Claudes eigenen Zugriff auf den State-Ordner (kein Selbst-Aktivieren) |
| `.claude/skills/my-notification-on/` | Skill für Autovervollständigung und Hilfetext, die Logik liegt im Hook |
| `scripts/test-notifications.py` | 47 Prüfungen gegen einen lokalen Mock-Server (keine echten Pushes) |
| `scripts/notify-custom.ps1`, `notify-done.ps1` | Nur noch **manuelle** Test-Pings des Users. Von Hooks und Claude nicht verwendet |

Overrides (Tests): `BARBERGO_NTFY_BASE`, `BARBERGO_NTFY_TOPIC`, `BARBERGO_NOTIFY_STATE_DIR`, `BARBERGO_NOTIFY_GOAL_WAIT`. Nach Änderungen am Hook: `python3 scripts/test-notifications.py`.

## Bekannte Einschränkungen

1. Der Token-Abgleich ist textuell: ein eigenständiges `/my-notification-on` irgendwo im Prompt schaltet ein, auch wenn es nur erwähnt wird.
2. Das Ziel-Urteil wird bis zu 12 s pro Goal-Runde abgewartet (kann die nächste Runde um so viel verzögern). Kommt es später, gilt der Auftrag als beendet.
3. Ein Abbruch (Escape) löst keinen Hook aus: die Markierung bleibt bis zum nächsten Prompt/Session-Ende, ist aber an die alte `prompt_id` gebunden und pingt für nichts anderes.
4. ntfy.sh-Topics haben keinen Zugriffsschutz. Es werden nur feste, nicht sensible Texte gesendet. Bei Bedarf Topic wechseln (`BARBERGO_NTFY_TOPIC`, Default in `notify.py`) und neu abonnieren.
5. Wer Shell-Zugriff hat, kann eine Markierung von Hand anlegen. Der Schutz gilt für Claudes eigene Tools.
6. Braucht `python3` im PATH. Neue/geänderte Hook-Konfiguration wirkt in einer laufenden Session erst nach `/hooks`-Reload oder Neustart. Offline passiert still nichts.
