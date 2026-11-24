# BarberGo: Project Status (Projektgedächtnis)

> Wird von `CLAUDE.md` in jeden neuen Chat geladen. **Einziger Ort für den Wiedereinstiegspunkt.** Aktualisiert durch `/my-closeout` (und bei grösseren Schritten laufend). Vor Gebrauch gegen `git status` / `git log` prüfen: bei Widerspruch gilt Git, dann diese Datei korrigieren.
> Überschriften und Feldnamen nicht umbenennen, die Skills `/my-status`, `/my-continue`, `/my-next-task`, `/my-closeout` lesen sie.
> Ist-Zustand der App → `docs/current-status.md` · Aufgaben → `TODO.md` · Meilensteine → `docs/product-roadmap.md` · Erkenntnisse → `docs/lessons-learned.md`.

**Last Updated:** 2026-11-24

## ▶ Aktiver Fokus

- **Phase:** M1 (Supabase-Migrationen `0006`–`0013` anwenden und prüfen), `BLOCKED` bis `.env`/Zugang vorhanden. Web-Testumgebung und Claude-Setup sind fertig und live.
- **Resume-Punkt:** Stand `d8d8c70` auf `main` (gepusht, Working Tree sauber bis auf untracked `.vscode/`). `https://test-barbergo.expo.app/` zeigt den Stand `572c2cf` (Bundle `343809…`). Nächster inhaltlicher Schritt: Migrationen anwenden und per Smoke-Skripten prüfen.
- **Letzte Entscheidungen:**
  - Web: zentrierte Spalte max. 720 px (`AppShell`, `layout.maxContentWidth`), dunkler Hintergrund web (`app/+html.tsx`) und nativ (Root-View), Header mit einer 52-px-Bar-Zeile, Text links neben dem Zurück-Pfeil und bei Platzmangel zentriert darunter.
  - Deployment nur über `/my-barbergo-deploy-web-test` (`--prod` auf dem EAS-Projekt `@mmt-tsn/barbergo`, Domain `test-barbergo`; keine BarberGo-Produktivumgebung vorhanden).
  - Handoff liegt in `PROJECT_STATUS.md`. ntfy-Pings: Standard aus, nur per `/my-notification-on` je Auftrag.
- **Nächste Schritte (konkret):**
  1. Migrationen `0006`–`0013` auf dem gehosteten Supabase anwenden, dann `npm run verify-rls`, `verify-guest-insert`, `verify-book-slot` (in `apps/mobile`, braucht `.env`).
  2. Sichtprüfung der übrigen Screens mit dem neuen Header/der Desktop-Spalte (login, register, `barber/book`, account, admin, barber-dashboard). Bisher nur Home, `guest/bookings`, `barbers` geprüft.
  3. Manuelle E2E nach `docs/e2e-checklist.md`; Supabase Auth: Redirect-URLs, Barber-Mail-Template, Passwort-Mindestlänge ≥ 8.
  4. Danach Barber-Verfügbarkeit / Blockzeiten UI (M4). Optional vorher: Expo-Patch-Versionen (`npx expo install --check`).

## Offene Probleme / Blocker

- Migrationen `0006`–`0013` nicht angewendet (benötigt `.env`). Meilenstein M1.
- Kein Unit-Test-Framework. QS = `tsc`, `lint`, Smoke-Skripte, manuelle E2E.
- Web-Bundle 2,9 MB (742 KB gzip): Seite ist erst nach Download und Hydration bedienbar. Keine Optimierung geplant.
- `docs/pre-launch-checklist.md` beschreibt teils den Vor-`0003`-Zustand (beim nächsten `/my-barbergo-pre-launch` korrigieren).
- Expo-Patch-Versionen veraltet (`expo`, `expo-constants`, `expo-font`, `expo-router`).
- Lint: 2 bekannte Warnungen (u. a. ungenutztes `Href` in `app/guest/bookings.tsx`), `FadeOutText` ist ungenutzt.

## Gotchas

- Hook-Pfade nutzen `$CLAUDE_PROJECT_DIR`, der Notify-State-Pfad ist am Skriptort verankert (Sessions laufen oft in `apps/mobile`). Nicht auf relative Pfade zurückbauen.
- `.env` ist per Permission-Deny gesperrt (auch `ls .env`, `cat .env.example` über Bash). Env-Prüfungen per `ls -a | grep`.
- Skills und Hook-Konfiguration wirken in einer laufenden Session erst nach Neustart bzw. `/hooks`-Reload. Notify-Hook braucht `python3`.
- Web-Layout nur gegen den **statischen Export** prüfen (`expo export`), nicht gegen `expo start` (Hydration, `useWindowDimensions` = 0). Ordner `dist/` nie von einem Test-Server belegen lassen, sonst `EBUSY` und `eas deploy` nimmt den alten Build (siehe Lessons).
- Auf diesem Rechner laufen evtl. noch Test-Server (Python, Ports 8099–8104). Sie lassen sich per Befehl nicht beenden (Classifier), enden spätestens beim Neustart.
- `eas deploy --export-dir` akzeptiert nur relative Pfade. `eas init --id` meldet trotz Erfolg einen Fehler (dynamische `app.config.js`), die `projectId` steht korrekt in `app.json`.

## Session-Log (neueste zuerst, max. 5 Einträge, Älteres steht in der Git-Historie)

### 2026-11-24 · Web-UI und Deployment
- Umgesetzt (`9033071`, `e3062ac`, `572c2cf`): `AppShell` (720 px), `app/+html.tsx`, Header-Layout mit Messung (Text neben Buttons oder zentriert darunter), Home volle Breite mit zugeschnittenem Logo (960×460), scrollbare Startseite, Leerzustand „Meine Termine“ ohne Button, Header-Auth-Buttons ohne Spinner. Live auf `test-barbergo.expo.app` (Bundle `343809…`), im Browser und vom User auf dem Handy bestätigt (weisse Fläche unten weg).
- Entscheidungen: Maximalbreite 720 px als Konstante; Header misst statt feste Slot-Breiten; Bilder mit grossen transparenten Rändern zuschneiden statt Layout-Hacks. Lessons: Header-`alignSelf`, nativer Root-Hintergrund, Logo-Ränder, `EBUSY`/stale `dist`. Details `docs/lessons-learned.md`, Regeln `docs/coding-guidelines.md`.

### 2026-11-24 · Logo-Bug auf der Web-App
- Ursache: `useWindowDimensions()` = 0 beim statischen Export (`width: 0px` im HTML, Hydration korrigiert das nicht). Fix `hooks/use-window-width.ts`. Zusätzlich PNG-Kopien verkleinert (`*-web.png`), `expo-image` mit `transition`/`priority`. Commits `b5ae123`, `f40073b`.

### 2026-11-24 · Web-Deployment Test
- Skill `/my-barbergo-deploy-web-test`. `--prod` nötig (Preview-Subdomain zeigt nur das Production-Deployment). Projekt per Expo-API gefunden (`@mmt-tsn/barbergo`, `d3f89ea0-af77-4891-976d-c2aae38e3bdb`) und per `eas init --id` verknüpft; `app.config.js` behält `app.json`-`extra`. Skripte `export:web`, `deploy:web:test`. Details `docs/deploy-web-test.md`.

### 2026-11-24 · Setup-Angleichung an TASAN Trips
- Übernommen: `notify.py` + Tests, Skills `my-notification-on`/`my-next-task`, `PROJECT_STATUS.md` mit Session-Log. Entfallen: `notify:on/off`, PowerShell-Hooks, `docs/session-handoff.md`. Abgrenzung: `docs/claude-code-setup.md`. Skills bisher nur statisch geprüft, `/my-closeout` ist der erste reale Lauf.

### 2026-11-24 · Skill-Konsolidierung
- Skills auf `my-*` reduziert, Roadmap-Meilensteine M1–M7 (`docs/product-roadmap.md`), Doku-Landkarte mit Spalte *Rolle*. Commit `340829b`.
