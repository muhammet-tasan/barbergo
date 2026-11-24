---
name: my-barbergo-deploy-web-test
description: "[BarberGo] Web-Export bauen und auf die feste Testumgebung https://test-barbergo.expo.app/ deployen (EAS Hosting), danach verifizieren. Nur Test, nie Produktiv."
disable-model-invocation: true
---

# /my-barbergo-deploy-web-test

Deployt die Expo-Web-App **ausschliesslich** auf `https://test-barbergo.expo.app/`. Nur auf expliziten Aufruf des Users. Hintergrund, verifizierte Fakten und offene Punkte: `docs/deploy-web-test.md` (zuerst lesen, falls Zweifel).

**`--prod` ist hier korrekt und nötig:** `test-barbergo.expo.app` ist die Preview-Subdomain des EAS-Projekts, und diese liefert nur das *Production-Deployment des Projekts* aus. `eas deploy` ohne `--prod` landet nur auf `test-barbergo--<id>.expo.app`. „Production“ meint hier den EAS-Slot, **nicht** die BarberGo-Produktivumgebung. Eine solche existiert noch nicht.

## Harte Regeln

- Nie auf eine andere Domain/ein anderes EAS-Projekt deployen. Wenn irgendeine Prüfung unten nicht passt: **abbrechen und melden**, nicht „trotzdem“ deployen.
- Nie `--dev-domain`, Custom-Domain, `deploy:alias` auf andere Namen, `deploy:delete` oder `--environment production` verwenden.
- `.env`/`.env.*` nie lesen oder ausgeben (Deny-Regel). Nie Secrets in Ausgaben nennen.
- Keine Pings selbst senden: Benachrichtigungen sind aus, ausser der Aufruf enthielt `/my-notification-on` (macht der Hook).
- Nicht committen oder pushen. Nur deployen.

## Ablauf (in `apps/mobile`)

1. **Konfiguration prüfen**
   - `git status -sb`: uncommittete App-Änderungen **melden** (deployt wird der Working Tree; kein Abbruch, aber im Ergebnis nennen).
   - `app.json`: `expo.slug` und `web.output === "static"`. `apps/mobile/.env` muss existieren (nur `ls`/Test auf Existenz, nicht lesen). Fehlt sie: abbrechen, User nennen, welche Variablen laut `.env.example`-Beschreibung in `docs/setup-notes.md`/`README.md` fehlen (Namen, keine Werte).
   - Variablen: Expo liest beim Export `apps/mobile/.env` und bettet `EXPO_PUBLIC_*` in den Bundle ein (`app.config.js` zusätzlich in `extra`). Das ist die Test-Konfiguration, solange es nur diese eine `.env` gibt. Existiert `.env.production`, `.env.production.local` oder `.env.local` (nur per `ls`), würde Expo sie beim Export bevorzugen: **abbrechen und melden**, damit keine fremden Werte in den Test-Build laufen.
2. **EAS vorbereiten**
   - `npx --yes eas-cli --version` (getestet mit 27.11.0). Bricht es mit `ERR_MODULE_NOT_FOUND` ab: kaputten Ordner unter `%LOCALAPPDATA%\npm-cache\_npx\<hash>` löschen (nur der im Fehler genannte Hash) und wiederholen.
   - `npx eas-cli whoami`. „Not logged in“ → **stoppen** und dem User sagen: `npx eas-cli login` in einem **normalen Terminal** ausführen (über `!` fehlt das TTY und der Login schlägt fehl), danach `/my-barbergo-deploy-web-test` erneut aufrufen. Nicht versuchen, Zugangsdaten anzufragen oder zu umgehen. Account (Stand 2026-11-24): `mmt-tsn`, Team `mmt-tsns-team`.
   - Projekt-Verknüpfung: `apps/mobile/app.json` → `expo.extra.eas.projectId` muss **`d3f89ea0-af77-4891-976d-c2aae38e3bdb`** sein (Projekt `@mmt-tsn/barbergo`, Dev-Domain `test-barbergo`, verifiziert 2026-11-24). Weicht sie ab oder fehlt sie (z. B. frischer Klon): mit `npx eas-cli init --id d3f89ea0-af77-4891-976d-c2aae38e3bdb --non-interactive` wiederherstellen (legt kein neues Projekt an). Gibt `npx eas-cli project:info` eine andere ID/`fullName` als `@mmt-tsn/barbergo` aus: **stoppen**. Ist die ID unbekannt/verloren: per Expo-GraphQL (`account.byName(...).apps` + `app.byId(...).devDomainName`) mit der lokalen Anmeldung ermitteln, bevor irgendetwas angelegt wird. **Nie** `eas init --account … --non-interactive` ohne ID (legt ein neues Projekt an, wenn `@<account>/barbergo` fehlt). Nach dem Verknüpfen ist `projectId` als Änderung an `app.json` zu melden, nicht automatisch zu committen.
3. **Export**
   - `npm run export:web` (= `expo export --platform web --clear`, erzeugt `dist/`, gitignored). Fehler analysieren (häufig fehlende Pakete → `npm install`, siehe `docs/lessons-learned.md`) und beheben, dann wiederholen.
   - **Schlägt der Export mit `EBUSY ... rmdir dist` fehl, ist `dist/` noch der ALTE Build** (ein Prozess, meist ein lokaler Test-Server, sperrt den Ordner). Dann **nie** `eas deploy` ohne weiteres ausführen (es meldet nur „exported N hours ago“). Stattdessen in ein neues Verzeichnis exportieren (`npx expo export --platform web --clear --output-dir <dir>`) und mit `--export-dir <relativer Pfad von apps/mobile>` deployen (absolute Pfade akzeptiert die CLI nicht). Im Dry-Run darf kein „exported … ago“ stehen.
   - Prüfen: `dist/index.html` und `dist/_expo/static/js/web/entry-*.js` existieren. Im Entry-Bundle muss ein Supabase-Host (`https://<ref>.supabase.co`) vorkommen und `EXPO_PUBLIC_SUPABASE_ANON_KEY` darf nicht als `undefined` eingebettet sein. Den **Host** (nicht den Key) im Ergebnis nennen. Fehlt er: abbrechen (Test-Variablen nicht gesetzt).
4. **Dry-Run (Sicherheitsnetz)**
   - `npx eas-cli deploy --prod --dry-run`. Hier erscheint kein Deployment. Prüfen, dass es das erwartete Projekt anspricht und nicht nach einem neuen Projekt/einer neuen Domain fragt. Fragt es danach, abbrechen.
5. **Deployment**
   - `npx eas-cli deploy --prod --non-interactive` (ohne `--dev-domain`, ohne `--alias`).
   - Aus der Ausgabe die Production-URL lesen. **Sie muss exakt `https://test-barbergo.expo.app` sein.** Weicht sie ab: sofort melden, nichts weiter tun (kein `deploy:delete` ohne Auftrag), User entscheidet.
6. **Verifizieren**
   - `curl -sI https://test-barbergo.expo.app/` → HTTP 200.
   - Hash des Entry-Bundles aus `dist/` ( `entry-<hash>.js` ) muss im ausgelieferten HTML (`curl -s https://test-barbergo.expo.app/ | grep -o 'entry-[a-f0-9]*\.js'`) vorkommen. Das CDN stellt erfahrungsgemäss erst nach ca. 20-40 s um (alter Hash, `Age:`-Header): bis zu 3-mal im Abstand von 20 s wiederholen, dann als Fehler melden. Die Deployment-URL (`test-barbergo--<id>.expo.app`) zeigt die neue Version sofort.
   - **Gerenderte Grösse (Pflicht bei UI-Änderungen):** `https://test-barbergo.expo.app/` mit den Chrome-Tools frisch öffnen (`mcp__claude-in-chrome__*`), per JavaScript `document.querySelector('img')` prüfen: `naturalWidth > 0` **und** `clientWidth > 0` (Home-Logo erwartet bei Desktop ca. 688×330, volle Spaltenbreite minus Rand), Screenshot ansehen. HTTP 200 der Bilddatei allein reicht nicht (Hydration-Falle, siehe `docs/lessons-learned.md`). Kein Chrome verfügbar: im Ergebnis als nicht geprüft ausweisen.
   - Assets: Logo-Pfad aus dem Bundle (`/assets/assets/images/logo-transparent-web.*.png`) per `curl -sI` auf 200 und `Content-Length` prüfen (erwartet ca. 333 KB, nicht 2,2 MB).
7. **Fehleranalyse:** Bei jedem Fehler Ursache per Ausgabe/Logs eingrenzen, beheben, falls im Rahmen (Cache, fehlende Pakete, kaputter npx-Cache, fehlender Export). Nicht behebbar oder sicherheits-/kontorelevant (Login, falsches Projekt, Domain): melden, nicht raten. Neue Erkenntnis in `docs/lessons-learned.md` und bei geändertem Ablauf `docs/deploy-web-test.md` eintragen.

## Abschlussausgabe (kurz, Deutsch)

- Ergebnis: ✅ deployt und verifiziert / ❌ abgebrochen bei Schritt N + Grund
- URL, Datum/Uhrzeit, Supabase-Host (ohne Key), Bundle-Hash
- Uncommittete Änderungen, die mit deployt wurden (ja/nein, welche)
- Warnungen / offene Punkte (z. B. neu entstandenes `projectId` in `app.json`)
- Falls bei Schritt 7 Doku geändert wurde: Dateien nennen. Kein Commit ohne Auftrag.
