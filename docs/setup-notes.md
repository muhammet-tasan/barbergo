# Setup notes — developer notifications

## Why ntfy instead of WhatsApp?

For **local developer alerts** (e.g. “Cursor finished a big task”), we use [ntfy.sh](https://ntfy.sh) rather than the WhatsApp Business API or unofficial WhatsApp bots.

### Advantages

| Benefit | Explanation |
|--------|-------------|
| **Free** | Public ntfy server is free for personal use; no billing or quotas for light dev use. |
| **Simple** | One HTTP POST from PowerShell is enough. No SDK, no OAuth dance. |
| **No API keys** | No tokens to store in `.env` or rotate. |
| **No Meta approval** | WhatsApp Business requires business verification and approved templates for automated messages. |
| **Instant push** | Messages appear on your phone within seconds via the ntfy Android app. |

### Trade-offs (keep in mind)

- Topics on the public server are **not secret** if someone guesses the name—pick a unique topic like `barbergo-muhammet`.
- Not meant for production user-facing alerts or sensitive data in the message body.
- For barbergo **end users** later, you will use proper app push (FCM, etc.)—this setup is only for **you as the developer** on your own machine.

## Topic used in this project

```
barbergo-muhammet
```

Scripts post to: `https://ntfy.sh/barbergo-muhammet`

## Cursor integration (later)

When you are ready, you can run `scripts/notify-done.ps1` automatically when an agent stops—for example via a Cursor **hook** on `stop` or `afterAgentResponse`. That way you get a phone ping after long agent runs without watching the IDE.

See the main [README.md](../README.md) for test commands and the create-hook skill in Cursor for hook file format.
