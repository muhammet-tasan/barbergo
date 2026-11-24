---
paths:
  - "apps/mobile/.env.example"
  - "apps/mobile/app.config.js"
  - "apps/mobile/app.json"
  - "supabase/migrations/**"
  - "docs/pre-launch-checklist.md"
---

# Vor dem Go-live (Produktionsreife)

Vollständige Checkliste: `docs/pre-launch-checklist.md`. Für einen kompletten Durchlauf `/my-barbergo-pre-launch` verwenden.

- Wer Env-, Auth- oder RLS-Dateien ändert: prüfen, ob die Änderung die Checkliste berührt, und den Nutzer darauf hinweisen.
- Bei Stichworten wie „go live“, „production“, „launch“, „release“, „öffentlich“ die Checkliste proaktiv durchgehen und erinnern.
- Go-live-Härtung **nicht** während der normalen MVP-Entwicklung ungefragt durchsetzen.
- `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` ist in `.env.example` bereits Default. Im Produktions-`.env` verifizieren, nie auf `false` für Release.
- Anonyme Admin-Zugriffe auf `bookings` (aus `0002_*`) müssen entfernt sein; anon darf höchstens `insert` mit `status = pending` (bzw. `book_slot`).
