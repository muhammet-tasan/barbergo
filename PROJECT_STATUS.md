# BarberGo: Project Status (Projektgedächtnis)

> Wird von `CLAUDE.md` in jeden neuen Chat geladen. **Einziger Ort für den Wiedereinstiegspunkt.** Aktualisiert durch `/my-closeout` (und bei grösseren Schritten laufend). Vor Gebrauch gegen `git status` / `git log` prüfen: bei Widerspruch gilt Git, dann diese Datei korrigieren.
> Überschriften und Feldnamen nicht umbenennen, die Skills `/my-status`, `/my-continue`, `/my-next-task`, `/my-closeout` lesen sie.
> Ist-Zustand der App → `docs/current-status.md` · Aufgaben → `TODO.md` · Meilensteine → `docs/product-roadmap.md` · Erkenntnisse → `docs/lessons-learned.md`.

**Last Updated:** 2026-11-24

## ▶ Aktiver Fokus

- **Phase:** M1 (Supabase-Migrationen `0006`–`0013` anwenden und prüfen), `BLOCKED` bis `.env`/Zugang vorhanden. Parallel Tooling/Workflow-Pflege.
- **Resume-Punkt:** Claude-Code-Setup ist auf das TASAN-Trips-Modell angeglichen (Per-Task-Notifications, `PROJECT_STATUS.md`, `my-next-task`). Nächster inhaltlicher Schritt: Migrationen anwenden und per Smoke-Skripten prüfen.
- **Letzte Entscheidungen:**
  - Handoff lebt jetzt in `PROJECT_STATUS.md` (statt `docs/session-handoff.md`). Ein Ort, kein Parallel-Dokument.
  - ntfy: Standard **aus**, `/my-notification-on` gilt nur für den jeweiligen Auftrag, Auto-Reset, kein Off-Befehl. Umsetzung `.claude/hooks/notify.py` (Python, getestet mit `scripts/test-notifications.py`).
  - Web-Logos als `*-web.png`-Kopien (Originale bleiben) wegen 10-s-Ladezeit auf `test-barbergo.expo.app`.
- **Nächste Schritte (konkret):**
  1. Migrationen `0006`–`0013` auf dem gehosteten Supabase anwenden, dann `npm run verify-rls`, `verify-guest-insert`, `verify-book-slot` (in `apps/mobile`, braucht `.env`).
  2. Logo-Ladezeit auf https://test-barbergo.expo.app/ im Inkognito-Fenster prüfen (Deployment vom 2026-11-24 ist live, Logo 243 KB). Weitere Deployments: `/my-barbergo-deploy-web-test` (`docs/deploy-web-test.md`).
  3. Manuelle E2E nach `docs/e2e-checklist.md`; Supabase Auth: Redirect-URLs, Barber-Mail-Template, Passwort-Mindestlänge ≥ 8.
  4. Danach Barber-Verfügbarkeit / Blockzeiten UI (M4).

## Offene Probleme / Blocker

- Migrationen `0006`–`0013` nicht angewendet (benötigt `.env`). Meilenstein M1.
- Kein Unit-Test-Framework. QS = `tsc`, `lint`, Smoke-Skripte, manuelle E2E.
- `docs/pre-launch-checklist.md` beschreibt teils den Vor-`0003`-Zustand (beim nächsten `/my-barbergo-pre-launch` korrigieren).
- Expo-Patch-Versionen veraltet (`expo`, `expo-constants`, `expo-font`, `expo-router`), `npx expo install --check` steht aus.

## Gotchas

- Hook-Pfade nutzen `$CLAUDE_PROJECT_DIR`, der Notify-State-Pfad ist am Skriptort verankert (Sessions laufen oft in `apps/mobile`). Nicht auf relative Pfade zurückbauen.
- `.env` ist per Permission-Deny gesperrt. Env-Prüfungen nur über `.env.example`.
- Skills und Hook-Konfiguration wirken in einer laufenden Session erst nach Neustart bzw. `/hooks`-Reload.
- Notify-Hook braucht `python3` im PATH.

## Session-Log (neueste zuerst, max. 5 Einträge, Älteres steht in der Git-Historie)

### 2026-11-24 · Deployment der UI-Änderungen
- `572c2cf` gepusht und auf `test-barbergo.expo.app` deployt (Bundle `343809…`, im Browser geprüft: Logo 688×330, Buttons 686 px, dunkler Hintergrund). Export lief wegen gesperrtem `dist/` (EBUSY) in ein eigenes Verzeichnis, Deploy mit `--export-dir`.

### 2026-11-24 · Web-UI: Desktop-Spalte, Header, Hintergrund, Ladeverhalten
- `AppShell` (max. 720 px, `layout.maxContentWidth`) für Web, `app/+html.tsx` (dunkler Hintergrund, `theme-color`, `100dvh`), `ScreenHeader` stapelt Text unter die Buttons, wenn er nicht daneben passt (gemessen, Home und Unterseiten), Home-Text bei 320 px nicht mehr abgeschnitten.
- Ladeverhalten: Header-Auth-Buttons und Home-Gast-Buttons ohne Spinner (hängen nur an der Session). Spinner nur noch, wenn ein angemeldeter Nutzer sein Profil lädt. Restursache für „langsam“: Bundle 2,9 MB (742 KB gzip), die Seite ist erst nach Download und Hydration bedienbar.
- Lokal gegen den statischen Export in 320/375 px und Desktop geprüft. **Nicht deployt** (live ist weiterhin der Stand vom Logo-Fix).
- Zweite Nachbesserung: Titel links direkt neben dem Zurück-Pfeil (statt zentriert), nach unten gerutschter Text zentriert; Startseite nutzt die volle Breite (Logo, Titel, Buttons), Logo-Web-Kopie auf den sichtbaren Bereich zugeschnitten (960×460, 333 KB, Original bleibt), „Meine Termine": Leerzustand ohne Button (Gast und Kunde). Klick auf „Termin buchen" und „Meine Termine" im lokalen Export geprüft.
- Nachbesserung nach Test auf dem Handy: Header einheitlich (Bar-Zeile 52 px, Buttons auf Höhe des Zurück-Pfeils, Titel echt mittig, Text darunter mit mehr Abstand), Startseite scrollbar (`ScrollView`, Logo wird seitlich beschnitten statt zu scrollen), nativer Root-Hintergrund dunkel (`AppShell` auch auf iOS/Android, sonst weiss unter der SafeArea/beim Überscrollen).

### 2026-11-24 · Logo-Bug auf der Web-App behoben (echte Ursache)
- Das Logo fehlte beim ersten Laden, weil `useWindowDimensions()` beim statischen Export 0 liefert (`width: 0px` im HTML, React korrigiert das beim Hydrieren nicht). Fix: `hooks/use-window-width.ts`, genutzt in `HomeHero`. Lokal gegen `dist/` und live auf `test-barbergo.expo.app` im Browser bestätigt (Logo 560×373). Die PNG-Verkleinerung bleibt sinnvoll, war aber nicht die Ursache. Skill prüft jetzt die gerenderte Grösse. Details `docs/lessons-learned.md`.

### 2026-11-24 · Web-Deployment Test live
- `/my-barbergo-deploy-web-test` angelegt und erstmals durchlaufen: Deployment auf `https://test-barbergo.expo.app` erfolgreich und verifiziert. `--prod` nötig (Preview-Subdomain zeigt nur das Production-Deployment, EAS-Slot, nicht BarberGo-Produktion).
- Projekt per Expo-API ermittelt: `@mmt-tsn/barbergo` (`d3f89ea0-af77-4891-976d-c2aae38e3bdb`, einziges Projekt, Dev-Domain `test-barbergo`), per `eas init --id` verknüpft, `projectId` in `app.json`. `app.config.js` behält jetzt `app.json`-`extra`. Neue Skripte `export:web`, `deploy:web:test`. Details `docs/deploy-web-test.md`.

### 2026-11-24 · Setup-Angleichung an TASAN Trips
- Übernommen aus TASAN Trips: `notify.py` + Tests, Skills `my-notification-on`/`my-next-task`, Projektgedächtnis `PROJECT_STATUS.md` mit Session-Log. Details und Abgrenzung: `docs/claude-code-setup.md`. Getestet: `scripts/test-notifications.py` (alle bestanden), Hook-Befehl aus `apps/mobile` simuliert, Skills statisch geprüft (noch nicht in frischer Session ausgeführt).
- Entfallen: `notify:on/off`, PowerShell-Hooks `notify-toggle.ps1`/`notify-ping.ps1`, `docs/session-handoff.md`.
- Angepasst: BarberGo-Dokumentenlandkarte (Rolle `handoff` → `PROJECT_STATUS.md`) und deutschsprachige Skills bleiben; keine videospezifischen Inhalte übernommen.

### 2026-11-24 · Web-Logo-Performance
- Vermutete (nicht alleinige) Ursache für spätes Logo: 2,2-MB-PNG (~10 s). Teilfix: `logo-transparent-web.png` (243 KB), `barbergo-wordmark-transparent-web.png` (50 KB), `transition`/`priority` bei `expo-image`. Commit `b5ae123`, Deployment steht aus.

### 2026-11-24 · Skill-Konsolidierung
- Skills auf `my-*` reduziert, Roadmap-Meilensteine M1–M7 (`docs/product-roadmap.md`), Doku-Landkarte mit Spalte *Rolle*. Commit `340829b`.
