# Supabase Auth — empfohlene Einstellungen (MVP)

## Passwort-Regeln

Die App validiert Registrierung mit **mindestens 8 Zeichen** (`MIN_PASSWORD_LENGTH` in `apps/mobile/services/auth.ts`).

Im Supabase Dashboard unter **Authentication → Providers → Email**:

| Einstellung | Empfehlung |
|-------------|------------|
| Minimum password length | **8** (oder **10** für stärkere Regeln) |
| Leaked password protection | Aktivieren, wenn verfügbar |
| **Confirm email** | **Ein** — Barber erhalten Bestätigungs-Mail; Kunden werden per Migration **0011** automatisch bestätigt |

## Kunde vs. Barber (E-Mail-Bestätigung)

Supabase erlaubt nur **eine** globale „Confirm email“-Einstellung.

| Rolle | Verhalten |
|-------|-----------|
| **Kunde** | Migration `0011_auto_confirm_customer_email.sql` setzt `email_confirmed_at` beim Signup → sofortige Anmeldung möglich |
| **Barber** | Erhält Supabase-Bestätigungs-Mail (Template: `docs/supabase-email-templates/confirm-signup-barber.html`) → nach Klick anmelden → Freigabe im BarberGo-Hub |

**0011 im SQL Editor ausführen**, wenn Kunden ohne E-Mail-Klick registriert werden sollen.

## Doppelte E-Mail bei Registrierung

Vor `signUp` prüft die App die RPC **`signup_email_taken`** (Migration **`0013`**). Ohne 0013 greifen Client-Fallbacks (Supabase-`identities`, `created_at`, Login-Probe).

**0013 im SQL Editor ausführen**, damit Barber-Registrierung mit bestehender E-Mail zuverlässig blockiert wird.

## Rate Limits („Zu viele Versuche“)


Supabase begrenzt Sign-up-/Sign-in-Anfragen pro IP (typisch **ca. 60 Sekunden** Sperre nach mehreren schnellen Versuchen).

Die App vermeidet ein **zweites** `signIn` direkt nach `signUp` für Barber (Confirm-Mail-Pfad) — das reduziert Rate-Limit-Fehler.

Tipp bei Fehlermeldung: **~60 Sekunden warten** oder **anmelden**, falls das Konto schon angelegt wurde.

## Rollen

- Rollen leben in **`public.profiles.role`** (`customer`, `barber`, `admin`).
- Öffentliche Registrierung: **Kunde** oder **Barber** (Barber → `pending` bis Freigabe).

## E-Mail-Template (Barber)

Siehe [`supabase-email-templates/confirm-signup-barber.md`](./supabase-email-templates/confirm-signup-barber.md).

## Redirect-URLs (E-Mail-Bestätigung)

Zentrale Logik: `apps/mobile/services/auth-redirect.ts` → `getAuthRedirectUrl()`.

| Umgebung | `emailRedirectTo` (automatisch) |
|----------|----------------------------------|
| Native Dev/Prod Build | `barbergo://auth/callback` |
| Expo Go | `exp://<LAN-IP>:8081/--/auth/callback` |
| Web (localhost) | `http://localhost:8081/auth/callback` |
| Web (deployed) | `{origin}/auth/callback` |

**Supabase → Authentication → URL Configuration → Redirect URLs** (alle erlauben):

- `barbergo://auth/callback`
- `barbergo://**`
- `http://localhost:8081/auth/callback`
- `exp://**`

Optional: `EXPO_PUBLIC_AUTH_REDIRECT_URL` in `.env` überschreibt die automatische Wahl (nur wenn nötig).

Beim Barber-Signup erscheint in der Metro-Konsole: `[barbergo] emailRedirectTo: …` — konkrete Expo-Go-URL ggf. zusätzlich eintragen.

Nach Redirect-Änderung: **neu registrieren** (alte Mails behalten den alten `redirect_to`).

## Keine Secrets im Repo

- Keine Passwörter in Migrations oder Git.
- Nur **anon key** in der Expo-App — **niemals** Service Role Key.
