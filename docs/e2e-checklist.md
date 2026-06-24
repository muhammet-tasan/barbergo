# barbergo — Manuelle E2E-Checkliste

Abhakbare Testliste für den **bestehenden MVP-Stand** vor neuen Features oder Go-live.

**Voraussetzungen**

- `apps/mobile/.env` mit gültigen `EXPO_PUBLIC_SUPABASE_*` (für Live-Tests)
- Migrationen **`0001`**, **`seed.sql`**, **`0003`–`0006`** (mindestens) auf Hosted Supabase
- Expo: `cd apps/mobile && npx expo start -c`
- Optional automatisch: `npm run verify-rls`, `npm run verify-guest-insert`, `npm run verify-book-slot`

**Legende:** `[ ]` offen · `[x]` bestanden · `[!]` fehlgeschlagen (Notiz unten)

---

## Automatische Smoke-Checks (Terminal)

| # | Check | Befehl | Ergebnis |
|---|--------|--------|----------|
| S1 | Anon darf Buchungen nicht lesen/updaten | `npm run verify-rls` | [ ] |
| S2 | Gast-INSERT (pending/Legacy) erlaubt | `npm run verify-guest-insert` | [ ] |
| S3 | Slot-RPC + Doppelbuchung blockiert | `npm run verify-book-slot` | [ ] |

---

## 1. Gast bucht Slot

**Ziel:** Anonymer Kunde kann einen freien Termin buchen.

- [ ] App als Gast öffnen (nicht eingeloggt)
- [ ] Startseite → **Termin buchen** → Barber wählen → Service wählen
- [ ] Datum-Chip wählen → freien Slot im Grid antippen
- [ ] Formular ausfüllen (Name, Telefon +41/079, Adresse) → buchen
- [ ] Bestätigungsseite erscheint mit Buchungsdetails
- [ ] Status in Supabase (optional): `confirmed`, `start_at`/`end_at` gesetzt

**Notizen:**

---

## 2. Gleicher Slot wird nochmals gebucht und korrekt blockiert

**Ziel:** `book_slot` verhindert Doppelbelegung (`SLOT_TAKEN` o. ä.).

- [ ] Flow aus Test 1 wiederholen **mit demselben Barber, Service, Datum und Uhrzeit**
- [ ] Slot ist im Grid nicht mehr wählbar **oder** Buchung schlägt mit verständlicher Meldung fehl (z. B. „nicht mehr verfügbar“)
- [ ] Optional: `npm run verify-book-slot` zeigt `OK (second book_slot blocked: SLOT_TAKEN)`

**Notizen:**

---

## 3. Gastbuchung erscheint in „Meine Termine“ ohne Duplikat

**Ziel:** Lokaler Gast-Cache + Dedupe — keine doppelte Zeile.

- [ ] Nach Gastbuchung (Test 1): **Meine Termine** / Gast-Buchungsliste öffnen
- [ ] Genau **eine** Zeile für die Buchung sichtbar
- [ ] Optional: Konto registrieren/einloggen → Liste erneut prüfen → weiterhin **kein Duplikat** derselben Buchung

**Notizen:**

---

## 4. Kunde bucht Slot

**Ziel:** Eingeloggter Kunde mit Rolle `customer`.

- [ ] Unter `/register` als **Kunde** registrieren oder mit Testkonto einloggen
- [ ] Slot-Buchung wie in Test 1 durchführen
- [ ] Bestätigung erscheint; Buchung hat `customer_id` in Supabase (optional prüfen)

**Notizen:**

---

## 5. Kunde storniert Buchung

**Ziel:** Eigene Buchung kann storniert werden.

- [ ] Als Kunde **Meine Termine** öffnen
- [ ] Buchung aus Test 4 wählen → **Stornieren**
- [ ] Status wechselt zu `cancelled` (UI + optional Supabase)
- [ ] Stornierte Buchung erscheint nicht mehr als aktiver Termin (oder klar als storniert)

**Notizen:**

---

## 6. Admin sieht alle Buchungen

**Ziel:** Admin-Hub und globale Buchungsliste.

- [ ] Als `admin@barbergo.ch` (oder Admin-Testuser) unter `/login` anmelden
- [ ] Startseite → **Admin-Bereich** oder **Alle Buchungen**
- [ ] `/admin/bookings` zeigt Buchungen aller Barber (inkl. Tests 1 und 4, sofern nicht storniert)
- [ ] Filter-Tabs und Detailansicht funktionieren (Maps/WhatsApp-Links optional testen)

**Notizen:**

---

## 7. Barber registriert sich und bleibt `barber_pending`

**Ziel:** Barber-Signup ohne sofortigen Dashboard-Zugang.

- [ ] Abmelden → `/register` → Rolle **Barber** wählen
- [ ] Registrierung abschliessen (E-Mail-Bestätigung je nach Supabase-Einstellung)
- [ ] Nach Login: Weiterleitung auf Wartescreen `/barber/pending` (nicht Dashboard)
- [ ] In Supabase: `profiles.role = barber_pending`, `approval_status = pending`

**Notizen:**

---

## 8. Admin genehmigt Barber

**Ziel:** Freigabe durch Admin.

- [ ] Als Admin `/admin` → **Barber-Freigaben** (`/admin/pending-barbers`)
- [ ] Pending-Barber aus Test 7 sichtbar
- [ ] **Genehmigen** — Profil wird `role = barber`, `approval_status = approved`

**Notizen:**

---

## 9. Barber sieht danach nur eigene Buchungen

**Ziel:** RLS + Barber-Dashboard.

- [ ] Als genehmigter Barber einloggen → `/barber/dashboard`
- [ ] **Meine Buchungen** — nur Buchungen des eigenen Providers
- [ ] Keine Buchungen fremder Barber; Admin-Liste nicht erreichbar ohne Admin-Rolle

**Notizen:**

---

## 10. Offline / fehlende Env zeigt Demo-Mock-Verhalten klar an

**Ziel:** App bleibt demo-fähig ohne Supabase.

- [ ] `.env` umbenennen/leeren **oder** ungültige URL setzen → Expo neu starten
- [ ] Banner/Hinweis auf Offline- oder Demo-Daten sichtbar (z. B. Admin-Liste, Bestätigung)
- [ ] Buchungsflow läuft mit Mock-Daten durch (ohne echte DB-Zeile)
- [ ] `.env` wiederherstellen → Live-Modus kehrt zurück

**Notizen:**

---

## Fehlerprotokoll

| Datum | Tester | Flow # | Kurzbeschreibung | Schwere |
|-------|--------|--------|------------------|---------|
| | | | | |

---

## Referenzen

- [current-status.md](./current-status.md) — was im Code existiert
- [pre-launch-checklist.md](./pre-launch-checklist.md) — vor öffentlichem Release
- [supabase/README.md](../supabase/README.md) — Migrationen und Smoke-Skripte
