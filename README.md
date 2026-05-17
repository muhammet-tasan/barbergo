# barbergo

Developer notification setup for the **barbergo** project. When Cursor finishes a larger coding task on your Windows PC, you can get a push notification on your Android phone—no backend, no API keys.

## What is ntfy?

[ntfy](https://ntfy.sh) is a free, open-source notification service. You publish a message to a **topic** (like a channel name), and any device subscribed to that topic receives a push notification. No account is required for basic use.

- Website: https://ntfy.sh  
- Public server: `https://ntfy.sh`

## Android setup

1. Install **ntfy** from the [Google Play Store](https://play.google.com/store/apps/details?id=io.heckel.ntfy) (or [F-Droid](https://f-droid.org/packages/io.heckel.ntfy/)).
2. Open the app and tap **+** to add a subscription.
3. Enter the topic name:

   ```
   barbergo-muhammet
   ```

4. Confirm. You should see the topic in your list. Leave notifications enabled for the app in Android settings.

> **Privacy note:** Anyone who knows your topic name can send messages to it. Use a unique, hard-to-guess topic (as we do here) and do not share it publicly.

## Manual test (Windows)

Open PowerShell in the project folder (`barbergo`) and run:

### Default “task finished” message

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-done.ps1
```

### Custom message

```powershell
powershell -ExecutionPolicy Bypass -File scripts/notify-custom.ps1 "Backend completed"
```

You can also test from the browser or with `curl`:

```powershell
Invoke-RestMethod -Uri "https://ntfy.sh/barbergo-muhammet" -Method Post -Body "Hello from PowerShell"
```

Within a few seconds, your phone should show the notification.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/notify-done.ps1` | Sends the standard barbergo “Cursor task finished” message |
| `scripts/notify-custom.ps1` | Sends any message you pass as the first argument |

Both scripts use only built-in PowerShell (`Invoke-RestMethod`). No Node.js or extra modules required.

## Project layout

```
barbergo/
  scripts/
    notify-done.ps1
    notify-custom.ps1
  docs/
    setup-notes.md
  README.md
```

## Project rules (Cursor)

Standards for stack, workflow, and notifications: [docs/project-rules.md](docs/project-rules.md).

They apply automatically in Agent chats via `.cursor/rules/barbergo-project.mdc` (`alwaysApply: true`).

## More details

See [docs/setup-notes.md](docs/setup-notes.md) for why we chose ntfy over WhatsApp and how this fits into Cursor workflows.
