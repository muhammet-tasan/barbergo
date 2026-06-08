# Supabase Auth — empfohlene Einstellungen (MVP)

## Passwort-Regeln

Die App validiert Registrierung mit **mindestens 8 Zeichen** (`MIN_PASSWORD_LENGTH` in `apps/mobile/services/auth.ts`).

Im Supabase Dashboard unter **Authentication → Providers → Email** (bzw. **Auth → Settings**):

| Einstellung | Empfehlung |
|-------------|------------|
| Minimum password length | **8** (oder **10** für stärkere Regeln) |
| Leaked password protection | Aktivieren, wenn verfügbar |
| Confirm email | Für Produktion **an**; für lokale Tests optional **aus** |

Frontend-Fehlermeldungen:

- E-Mail bereits registriert → „Diese E-Mail ist bereits registriert. Bitte anmelden oder Passwort zurücksetzen.“
- Schwaches Passwort → Hinweis auf Mindestlänge
- Ungültiger Login → „E-Mail oder Passwort ist ungültig.“

## Rollen

- Rollen leben in **`public.profiles.role`** (`customer`, `barber`, `barber_pending`, `admin`).
- **`admin@barbergo.ch`** wird **nicht** über die öffentliche Registrierung angelegt — nur manuell in Auth + Migration `0005`/`0006`.
- Öffentliche Registrierung: **Kunde** oder **Barber** (Barber → `barber_pending` bis Admin-Freigabe).

## Keine Secrets im Repo

- Keine Passwörter in Migrations oder Git.
- Nur **anon key** in der Expo-App — **niemals** Service Role Key.
