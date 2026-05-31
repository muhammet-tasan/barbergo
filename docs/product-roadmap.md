# barbergo — Product Roadmap / Feature Backlog

Produktvision, Feature-Prioritäten und Umsetzungsphasen. Ergänzt die technische Dokumentation — **ersetzt sie nicht**.

| Dokument | Inhalt |
|----------|--------|
| [architecture.md](./architecture.md) | Stack, Supabase, WhatsApp/Maps, was bewusst **nicht** im MVP ist |
| [data-model.md](./data-model.md) | Tabellen, Felder, Booking-Status (Single-Provider-MVP) |
| [current-status.md](./current-status.md) | Was **heute** im Code funktioniert |
| [pre-launch-checklist.md](./pre-launch-checklist.md) | Go-live-Härtung (RLS, Auth, Smoke-Tests) |
| [TODO.md](../TODO.md) | Operative Aufgaben und Checkboxen für Agenten |

**Legende Status:** `Erledigt` · `Teilweise` · `Live-MVP` · `Später`

---

## Zielbild

BarberGo ist eine mobile App für **mobile Home-Barber** (Basel & Umgebung). Kunden buchen schnell und unkompliziert; Barber verwalten Termine, Profil, Services und Verfügbarkeit.

Produktwirkung: **jung, modern, vertrauenswürdig**. Der Buchungsflow bleibt einfach; gleichzeitig soll das Datenmodell spätere Funktionen (Bewertungen, Storno, Kundenprofile) sauber tragen — ohne den MVP zu überfrachten.

---

## Produktgrundsätze (ergänzend)

Diese Punkte präzisieren **Produktziele**. Technische Umsetzung und bereits getroffene Architekturentscheidungen bleiben in [architecture.md](./architecture.md) und [data-model.md](./data-model.md).

### Gastbuchung bleibt möglich

Kunden sollen **ohne Konto** buchen können (niedrige Einstiegshürde).

**Pflichtfelder:** Name, Telefon, Service, Datum/Uhrzeit, Adresse (Hausbesuch).

**Optional:** Notiz, WhatsApp-Kontakt, Kundenkonto **nach** der Buchung anlegen.

**Sicherheit (bereits als Richtung umgesetzt):** Kein anonymer Zugriff auf alle Buchungen — siehe Migration `0003` und [supabase/README.md](../supabase/README.md). Gast-Zugriff auf **eigene** Buchung später über Booking-Access-Token (noch nicht implementiert).

### Kundenkonto vorbereiten (Datenmodell)

Für „Meine Buchungen“, Storno, Bewertungen, Historie braucht es langfristig Kundenidentität.

**Geplante Regel:**

- Gastbuchung: `customer_id` leer; Zugriff über sicheren Booking-Access-Token.
- Eingeloggter Kunde: `customer_id` gesetzt.
- Kein allgemeiner anonymer SELECT auf fremde Buchungen.

> **Hinweis:** `bookings.customer_id` und `profiles` sind in [data-model.md](./data-model.md) noch nicht im Schema — bewusst als nächster Schritt vorgesehen (siehe Phase 1).

### Barber-Login ist Pflicht

Barber-/Admin-Bereich geschützt (Supabase Auth, App-Gate `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED`). **Erledigt** im aktuellen MVP-Baseline — Details in [current-status.md](./current-status.md).

Barber sollen perspektivisch auch Profil, Services und Verfügbarkeit **selbst** pflegen (noch nicht in der App).

### Barber-Profil als Vertrauensanker

Conversion und Vertrauen hängen stark am Barber-Profil.

**Designrichtung (Produkt):** Avatar/Profilfoto, Card-artige Darstellung, kurzer Spruch, Skill-Tags, Beschreibung, Bewertungen, Servicegebiet, WhatsApp — **modern, leicht verspielt, professionell** (kein Kindermodus).

**Heute:** Statisches Profil aus Supabase/Seed; Bearbeitung und Card-Design folgen in Phase 3.

---

## Feature Backlog

### A. Kundenfunktionen

| # | Feature | Status | Kurz |
|---|---------|--------|------|
| 1 | Gastbuchung ohne Login | **Erledigt** | Anon INSERT `pending`; siehe Buchungsflow in App |
| 2 | Kunden-Login / Registrierung | **Live-MVP** | `profiles` + Rolle `customer`; RLS pro Kunde |
| 3 | Meine Buchungen | **Live-MVP** | Über `customer_id` oder Gast-Access-Token |
| 4 | Termin stornieren | **Live-MVP** | Eigene Buchung; Status → `cancelled`; optional 24h-Frist |
| 5 | Termin verschieben | **Später** | Verfügbarkeit + Konfliktlogik |
| 6 | Buchungsbestätigung | **Erledigt** | Bestätigungs-Screen + WhatsApp-Deeplink |
| 7 | WhatsApp-Kontakt zum Barber | **Erledigt** | Deeplink, kein eigener Chat ([architecture.md](./architecture.md)) |
| 8 | Push / Erinnerungen | **Später** | Expo/FCM; siehe Future roadmap in [TODO.md](../TODO.md) |

### B. Barber-Funktionen

| # | Feature | Status | Kurz |
|---|---------|--------|------|
| 9 | Barber-Login | **Erledigt** | `/admin/login`, Auth-Gate |
| 10 | Barber-Dashboard | **Teilweise** | Liste + Detail; Kalender/Tagesansicht fehlt |
| 11 | Buchungsstatus ändern | **Erledigt** | `pending` / `confirmed` / `completed` / `cancelled` |
| 12 | Tages-/Kalenderansicht | **Live-MVP** | Termine pro Tag/Woche |
| 13 | Barber-Profil bearbeiten | **Live-MVP** | Name, Motto, Tags, Servicegebiet, WhatsApp |
| 14 | Arbeitszeiten / Verfügbarkeit | **Live-MVP** | Slots, Pausen, freie Tage, Max/Tag |
| 15 | Services verwalten | **Live-MVP** | CRUD in App (heute: Seed/DB, read-only in UI) |

### C. Vertrauen & Marketing

| # | Feature | Status | Kurz |
|---|---------|--------|------|
| 16 | Bewertungen | **Live-MVP** | Nur nach `completed`; Gast via Access-Token |
| 17 | Bewertungsdurchschnitt auf Profil | **Live-MVP** | Sterne + Anzahl |
| 18 | Profilfoto / Avatar | **Live-MVP** | Fallback-Avatar wenn kein Bild |
| 19 | Modernes Barber-Profil (Card-UI) | **Teilweise** | Basis-Screen da; Card/Motto/Tags geplant |
| 20 | Vorher/Nachher-Bilder | **Später** | Storage + Moderation |
| 21 | Verifizierter-Barber-Badge | **Später** | z. B. Verifiziert, Top Barber |

### D. Mobile-Home-spezifisch

| # | Feature | Status | Kurz |
|---|---------|--------|------|
| 22 | Adresseingabe Kunde | **Erledigt** | Pflichtfeld im Buchungsformular |
| 23 | Servicegebiet prüfen | **Live-MVP** | MVP: Text + einfache PLZ/Ort-Regel; später Distanz |
| 24 | Google Maps / Route | **Erledigt** | Deeplink für Barber ([architecture.md](./architecture.md)) |
| 25 | Anfahrtskosten / Mindestpreis | **Später** | Preis- + Distanzlogik |
| 26 | Hinweise Hausbesuch-Regeln | **Live-MVP** | Beleuchtung, Steckdose, Storno-Hinweis |

### E. Sicherheit & Datenmodell

| # | Feature | Status | Kurz |
|---|---------|--------|------|
| 27 | RLS/Auth absichern | **Teilweise** | Baseline `0003` + Verify-Script; Go-live: [pre-launch-checklist.md](./pre-launch-checklist.md) |
| 28 | Booking-Access-Token (Gäste) | **Live-MVP** | Eigene Buchung ohne Login; kein globaler Anon-SELECT |
| 29 | `customer_id` für eingeloggte Kunden | **Live-MVP** | Nullable FK auf `profiles` / `auth.users` |
| 30 | Rollenmodell `customer` / `barber` / `admin` | **Live-MVP** | RLS + `profiles`; Multi-Barber später vorbereiten |

> **Kein Widerspruch zur Architektur:** Supabase bleibt MVP-Backend; WhatsApp/Maps bleiben Deeplinks; Spring Boot / n8n / Coolify bleiben deferred ([architecture.md](./architecture.md)).

---

## Empfohlene Live-MVP-Auswahl

Für ein **starkes Live-MVP** (über den heutigen Demo-Stand hinaus):

**Priorität:** 2, 3, 4, 12–19, 23, 26, 28–30 — plus Abschluss von **27** (hosted `0003`, E2E, Pre-Launch-Checkliste).

**Bereits im Demo-MVP:** 1, 6, 7, 9, 10 (Basis), 11, 22, 24.

**Bewusst nicht im ersten Live-MVP:** 5, 8, 20, 21, 25, 31–36.

---

## Umsetzungsphasen

Phasen bauen auf dem **bestehenden Supabase-MVP** auf. Reihenfolge kann angepasst werden, wenn Produktentscheidungen (unten) anders fallen.

### Phase 1 — Sicherheits- und Datenmodell-Basis

**Ziel:** Live-taugliche technische Grundlage.

- RLS/Auth auf hosted Supabase abschließen (`0003`, Verify-Script, Pre-Launch)
- Rollenmodell und `profiles` entwerfen
- `bookings.customer_id` + Booking-Access-Token vorbereiten
- Gastbuchung beibehalten; Admin/Barber-Bereich geschützt lassen

### Phase 2 — Kundenverwaltung (light)

- Kunden-Login / Registrierung
- „Meine Buchungen“
- Storno
- Bestätigung + Gast-Zugriff über Access-Token

### Phase 3 — Barber-Profil & Vertrauen

- Profil bearbeiten, Avatar, Card-UI, Motto, Tags, Servicegebiet
- WhatsApp-CTA im Profil

### Phase 4 — Barber-Alltag

- Tages-/Kalenderansicht
- Verfügbarkeit + Services in der App pflegen
- Statuslogik verfeinern; Route (Maps bereits da)

### Phase 5 — Bewertungen

- Bewertung nach `completed`
- Durchschnitt + Anzeige im Profil

### Phase 6 — Spätere Erweiterungen

Termin verschieben, Push, Galerie, Badges, Zahlung, Rabatte, Multi-Barber, Admin-Web, Chat — siehe auch [TODO.md](../TODO.md) (Future roadmap / automation stack).

---

## Offene Produktentscheidungen

Vor der nächsten größeren Implementierung klären:

1. Customer-Login schon ins **erste** Live-MVP?
2. Gastbuchung dauerhaft erlaubt?
3. Gast-Zugriff auf eigene Buchung per Access-Token?
4. Stornieren schon im MVP — mit welcher Frist?
5. Bewertungen schon im MVP?
6. Barber bearbeitet Profil selbst — ab wann?
7. Verfügbarkeit im MVP manuell gepflegt oder zunächst feste Slots?
8. Zuerst ein Barber — Multi-Barber nur im Datenmodell vorbereiten?
9. Zahlung offline/Bar bis Phase 6?
10. WhatsApp statt eigener Chat dauerhaft? (Architektur: **ja** für MVP)

---

## Pflege

- **Implementierungsstand:** [current-status.md](./current-status.md) und [TODO.md](../TODO.md) aktuell halten.
- **Schema-Änderungen:** zuerst [data-model.md](./data-model.md) + Migration, dann App.
- **Neue Features:** Status in den Tabellen oben anpassen; keine Duplikate in architecture.md.
