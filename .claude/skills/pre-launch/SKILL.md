---
name: pre-launch
description: Run the BarberGo go-live hardening check (env, Supabase Auth, RLS, smoke tests). Use when the user mentions launch, go-live, production, release or public deployment. Migrated from the Cursor rule pre-launch.mdc.
---

# /pre-launch

Migriert aus `.cursor/rules/pre-launch.mdc`. Quelle der Checkliste: `docs/pre-launch-checklist.md`. **Während der normalen MVP-Entwicklung nichts ungefragt umstellen.**

## Ablauf

1. `docs/pre-launch-checklist.md`, `docs/current-status.md` (Supabase-Setup-Status) und `supabase/README.md` lesen.
2. Jeden Punkt **gegen den echten Stand prüfen** (Code, `.env.example`, Migrationen), nicht nur abhaken:
   - **Env** (`apps/mobile/.env`, ohne Werte auszugeben): `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` (in `.env.example` bereits Default); URL/Anon-Key zeigen auf das **Produktions**-Projekt; WhatsApp-Nummer ist die echte des Barbers. Nach Env-Änderung Expo neu starten (`npx expo start -c`).
   - **Auth:** Barber-/Admin-User existiert in Supabase Auth, Login getestet (`/login`, Admin `/admin`).
   - **RLS (kritisch):** anonyme Policies aus `0002_*` auf `bookings` entfernt; `0003` + folgende Migrationen (`0004`–`0013`) angewendet; anon darf nur Buchen (`insert` mit `pending` bzw. `book_slot`); Admin/Barber/Kunde sehen nur das Erlaubte; Admin **ohne** Login hat keinen Zugriff.
   - **Smoke:** `npm run verify-rls`, `verify-guest-insert`, `verify-book-slot` (benötigen konfigurierte `.env`); Kundenflow, Admin ohne/mit Login, Offline-Verhalten laut `docs/e2e-checklist.md`.
3. Ergebnis als Tabelle **bestanden / offen / nicht prüfbar** berichten, mit Verweis auf Datei oder Migration.
4. Änderungen an gehostetem Supabase oder Produktions-Env **nicht selbst ausführen**: Schritte nennen und Freigabe einholen (sicherheitskritisch).
5. Gefundene Abweichungen in `docs/current-status.md` → Known issues und `TODO.md` eintragen.

## Bekannte Doku-Abweichung

`docs/pre-launch-checklist.md` beschreibt noch den Zustand „MVP-Demo mit anon-Zugriff“, während `0003` + Auth bereits die sichere Baseline sind. Beim Durchlauf die Checkliste auf den tatsächlichen Stand korrigieren (Skill `doc-sync`), ohne Prüfpunkte zu streichen.
