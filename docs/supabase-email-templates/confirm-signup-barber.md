# Supabase E-Mail: Barber Registrierung bestätigen



## Einrichtung im Dashboard



1. **Authentication → Providers → Email** → Confirm email = **Ein**

2. **Authentication → Email Templates** → **Confirm signup** → HTML aus `confirm-signup-barber.html`

3. **Authentication → URL Configuration** → Redirect URLs (alle eintragen):



| URL | Wann |

|-----|------|

| `barbergo://auth/callback` | Dev Build / Produktion (native App) |

| `barbergo://**` | Wildcard für native Deep Links |

| `http://localhost:8081/auth/callback` | Lokale Web-Entwicklung (`expo start --web`) |

| `exp://**` | Expo Go auf dem Gerät (LAN-IP variiert) |



**Site URL:** `http://localhost:8081` (lokal) oder produktive Web-URL. Für «Send confirmation mail» im Dashboard reicht die Site URL — Redirect URLs separat (siehe Tabelle).



Die App wählt `emailRedirectTo` automatisch über `getAuthRedirectUrl()` in `apps/mobile/services/auth-redirect.ts` — **kein** globales Ersetzen von `barbergo://` durch localhost.



### Optional: feste Redirect-URL



Nur bei Bedarf in `apps/mobile/.env`:



```env

# EXPO_PUBLIC_AUTH_REDIRECT_URL=…

```



Ohne diese Variable:



| Umgebung | Redirect |

|----------|----------|

| Native Dev/Prod Build | `barbergo://auth/callback` |

| Expo Go | `exp://<LAN-IP>:8081/--/auth/callback` (Metro-Log beim Signup) |

| Web localhost | `http://localhost:8081/auth/callback` |

| Web deployed | `{origin}/auth/callback` |



## Betreff



```

BarberGo — Bitte bestätige deine E-Mail

```



## Ablauf



1. Barber registriert sich in der App (gleiche Umgebung wie späterer Mail-Klick)

2. Supabase sendet Mail mit `redirect_to` = automatisch gewählte URL

3. Nach Klick: App oder Web öffnet `/auth/callback` → „E-Mail bestätigt“



## Testen



### Lokal (Web)



1. `cd apps/mobile && npx expo start --web`

2. Redirect `http://localhost:8081/auth/callback` in Supabase

3. Barber registrieren → Mail → Button → „E-Mail bestätigt“



### Native / Expo Go



1. Dev Build oder Expo Go auf dem Gerät

2. Barber registrieren → in Metro-Log: `[barbergo] emailRedirectTo: …`

3. Diese URL (oder `exp://**` / `barbergo://auth/callback`) in Supabase Redirect URLs

4. Mail auf dem **Gerät** öffnen → App springt auf Bestätigungs-Screen



## E-Mail-Adresse im Template

Die Adresse wird **nicht** angezeigt (vermeidet Gmail-`mailto`-Auto-Links). Text: „deine registrierte E-Mail-Adresse“.

## Mails kommen nicht an?

**Häufige Ursache nach Umstellung auf localhost:** Wenn in `.env` steht  
`EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL=http://localhost:8081/...` **ohne** laufende Web-App, kann Supabase Mails nicht zuverlässig zustellen.

**Fix:** Diese Zeile aus `apps/mobile/.env` **entfernen** oder auskommentieren → App nutzt wieder `barbergo://auth/callback` → Mails sollten wieder ankommen.

App neu starten: `npx expo start -c`

## Link in der E-Mail öffnet nicht / leere Seite?

**Ursache:** `barbergo://` im **Desktop-Browser** (Gmail im PC) → leere Seite.

**Lösung:** Link auf dem **Handy** mit installierter BarberGo-App öffnen — dann springt die App auf Bestätigung.

**Optional Browser-Test am PC:** Nur dann in `.env` setzen:
`EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL=http://localhost:8081/auth/callback` und `npx expo start --web` laufen lassen.

## Keine E-Mail erhalten?

| Prüfpunkt | Aktion |
|-----------|--------|
| **Confirm email** | Authentication → Providers → Email → **Ein** |
| **Redirect URLs** | `barbergo://auth/callback`, `http://localhost:8081/auth/callback`, `exp://**` eintragen |
| **SMTP** | Authentication → SMTP → eigenen Anbieter (Resend, SendGrid, …) — Standard-Mail von Supabase ist limitiert und landet oft im Spam |
| **Auth Logs** | Authentication → Logs → Fehler beim Versand? |
| **Spam-Ordner** | Gmail/Outlook prüfen |
| **App** | Nach Barber-Registrierung: **«Bestätigungs-E-Mail erneut senden»** |
| **Manuell (nur Dev)** | Authentication → Users → User wählen → **Confirm user** |

**Hinweis:** `profiles.approval_status = pending` bedeutet Barber-Freigabe — das ist unabhängig von der E-Mail-Bestätigung in `auth.users`.

