# Push-Benachrichtigungen — Barber-Registrierung

## Übersicht

Wenn ein neuer Barber sich registriert (`role = barber`, `approval_status = pending`), erhält der Admin eine **Expo Push Notification**.

Komponenten:

| Teil | Pfad |
|------|------|
| Edge Function | `supabase/functions/notify-new-barber/index.ts` |
| Token-Tabelle | `admin_push_tokens` (Migration `0007`) |
| Mobile Registrierung | `notifyNewBarberRegistration()` nach Barber-Signup |
| Admin Token | `registerAdminPushToken()` beim Admin-Login |

## Deployment

1. Migration **`0007_barber_approval_push_schedule.sql`** anwenden.
2. Edge Function deployen:
   ```bash
   supabase functions deploy notify-new-barber
   ```
3. Secrets in Supabase (Function nutzt automatisch `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).
4. Optional: DB-Trigger via `pg_net` — in der Migration konfigurierbar mit:
   - `app.notify_new_barber_url`
   - `app.notify_new_barber_secret`

Die App ruft die Function zusätzlich direkt nach erfolgreicher Barber-Registrierung auf (Fallback).

## Expo Push Token (Admin)

- Admin meldet sich auf **physischem Gerät** oder **Expo Go** an.
- Push-Berechtigung erlauben.
- Token wird in `admin_push_tokens` gespeichert.

Für Production: EAS `projectId` in `app.config.js` unter `extra.eas.projectId` setzen.

## Test-Anleitung

1. Als **`admin@barbergo.ch`** auf Gerät/Expo Go anmelden (Push-Berechtigung erlauben).
2. Prüfen: Zeile in `admin_push_tokens` für die Admin-`user_id`.
3. Neuen Barber-Account registrieren (Rolle Barber).
4. Prüfen: `profiles` — `role = barber`, `approval_status = pending`.
5. Admin erhält Push: **„Neue Barber-Registrierung“** mit Name/Telefon/E-Mail.
6. Push antippen → App öffnet **`/admin/pending-barbers`**.
7. Barber genehmigen oder ablehnen → `approval_status` und ggf. `provider_id` aktualisiert.

## Notification Payload

```json
{
  "title": "Neue Barber-Registrierung",
  "body": "Max Mustermann · +41 79 … · barber@example.com",
  "data": {
    "path": "/admin/pending-barbers",
    "barberId": "<uuid>"
  }
}
```

## Sicherheit

- **Service Role Key** nur in Edge Function — nie in der Expo-App.
- Nur Admins dürfen eigene Push-Tokens schreiben (RLS).
- Edge Function prüft, dass das Profil wirklich `barber` + `pending` ist.
