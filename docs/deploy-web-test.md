# Web-Deployment Testumgebung (EAS Hosting)

Ziel-URL: **https://test-barbergo.expo.app/**. Ausgeführt über den Skill `/my-barbergo-deploy-web-test` (nur auf expliziten Aufruf). Es gibt aktuell **keine** BarberGo-Produktivumgebung, diese Seite ist die einzige Web-Instanz.

## Verifizierter Stand (2026-11-24)

| Punkt | Befund | Quelle |
|---|---|---|
| Hosting | Expo/EAS Hosting, Static Export (`app.json` → `web.output: "static"`) | `apps/mobile/app.json`, Expo-Doku |
| `--prod` nötig? | **Ja.** `<name>.expo.app` (ohne `--`) ist die Preview-Subdomain des Projekts und liefert nur das **Production-Deployment** aus. Ohne `--prod` entsteht nur ein unveränderliches Deployment auf `<name>--<id>.expo.app`. `--alias x` ergibt `<name>--x.expo.app`. | docs.expo.dev → EAS Hosting → *Deployments and aliases*, `eas deploy --help` (eas-cli 27.11.0) |
| Bedeutung von „Production“ | Nur der EAS-Slot des Projekts. Sie ist **nicht** die BarberGo-Produktivumgebung. Eine spätere echte Produktion bekommt ein eigenes EAS-Projekt/eine eigene Domain und einen eigenen Skill. | Entscheidung 2026-11-24 |
| Env-Variablen | `EXPO_PUBLIC_*` werden beim `expo export` aus `apps/mobile/.env` in den Bundle eingebettet (`app.config.js` zusätzlich in `extra`). Es gibt nur eine `.env`, sie ist die Test-Konfiguration. Zusätzliche `.env.production*`/`.env.local` würden beim Export Vorrang bekommen und blockieren den Skill. | `apps/mobile/app.config.js`, Skill Schritt 1 |
| EAS-CLI | `npx --yes eas-cli` (27.11.0) läuft. Ein kaputter npx-Cache (`is-wsl`) wurde beseitigt, siehe `docs/lessons-learned.md`. | Test 2026-11-24 |

## Recherche zur Historie (2026-11-24)

- Erstes Deployment laut User am **2026-08-28** (`eas deploy` in `apps/mobile`, danach feste Subdomain `test-barbergo` eingerichtet). Passt zum `Last-Modified: Fri, 28 Aug 2026 09:14:39 GMT` der ausgelieferten Seite.
- Im Repo ist davon **nichts** versioniert: kein Commit zwischen 2026-06-24 und 2026-11-24, keine `eas.json`, kein `deploy`-Skript in `package.json` (auch nicht in früheren Commits), keine `projectId` in `app.json`. Das Deployment lief also aus dem Working Tree, die Verknüpfung nur lokal (jetzt versioniert, siehe oben).
- Das früher geplante `npm run deploy:web:prod` existierte nie im Git. Wiederhergestellt als **`npm run deploy:web:test`** (Name bewusst `test`, weil es die Testumgebung ist und keine BarberGo-Produktion).
- Login-Stand: `npx eas-cli whoami` zeigt Account `mmt-tsn` (Owner) und Team `mmt-tsns-team` (Owner).

## Projekt-Verknüpfung (verifiziert 2026-11-24)

- EAS-Projekt **`@mmt-tsn/barbergo`**, ID `d3f89ea0-af77-4891-976d-c2aae38e3bdb`, Dev-Domain (`devDomainName`) = **`test-barbergo`**. Es ist das **einzige** Projekt in den Accounts `mmt-tsn` und `mmt-tsns-team` (Team: 0 Projekte). Ermittelt per Expo-GraphQL-API mit der lokalen Anmeldung (read-only).
- Einziges früheres Deployment: `wu3ssgl5lk` vom 2026-08-28 09:17 UTC (Production, kein Alias).
- Verknüpfung per `npx eas-cli init --id <ID> --non-interactive` (legt **kein** neues Projekt an). Die ID steht jetzt in `apps/mobile/app.json` → `expo.extra.eas.projectId` und wird versioniert. `app.config.js` übernimmt `app.json`-`extra` (vorher überschrieben, dadurch wäre die ID im aufgelösten Config verloren gegangen). Nebeneffekt: Push-Token-Code (`services/push-notifications.ts`) findet die `projectId` jetzt ebenfalls.
- **Erster Lauf des Prozesses 2026-11-24** erfolgreich: Export, `deploy --prod --dry-run`, `deploy --prod --non-interactive` → Production URL `https://test-barbergo.expo.app`, Deployment-URL `https://test-barbergo--vbag03yf95.expo.app`. Geprüft: HTTP 200, Entry-Bundle-Hash `entry-6b74b8c4cc545f76f832e2fa70fe7aeb.js` identisch zu `dist/`, Logo `logo-transparent-web.*.png` 243 KB in 0,5 s. Supabase-Host im Bundle: `wsnzfqxyupxzlsvzzhxw.supabase.co`.

## Nicht verifiziert (offen)

- Der Skill verwendet `--non-interactive`: ein Fehlschlag im Dry-Run oder eine abweichende Production-URL bricht ab. Nicht live getestet ist der Abbruchpfad bei falscher URL.
- Der Expo-Cli-Befehl `eas init --id` meldete nach dem Schreiben der ID `Cannot read properties of undefined (reading 'projectId')` (wegen der dynamischen `app.config.js`). Die ID wurde trotzdem korrekt in `app.json` geschrieben, `eas project:info` löst das Projekt auf.
- Wie `--environment`/EAS-Hosting-Umgebungsvariablen genutzt werden, ist für den Static-Export irrelevant (Variablen kommen aus dem lokalen Export) und nicht dokumentiert/geprüft.

## Ablauf (Kurzfassung, Details im Skill)

```bash
cd apps/mobile
npm run export:web                          # = expo export --platform web --clear, erzeugt dist/ (gitignored)
npx eas-cli deploy --prod --dry-run         # Sicherheitsnetz, kein Upload
npx eas-cli deploy --prod --non-interactive # Ziel: https://test-barbergo.expo.app
# manuell in einem Schritt (mit Rückfragen): npm run deploy:web:test
```

Danach: HTTP 200, Entry-Bundle-Hash im ausgelieferten HTML, Logo-Asset ~243 KB. Bei Abweichung von der URL sofort stoppen.

## Sicherheitsregeln

- Nur diese URL, kein `--dev-domain`, keine Custom-Domain, kein `deploy:delete`/`deploy:alias` ohne Auftrag.
- `.env` wird nie gelesen oder ausgegeben (Deny-Regel). Nur der Supabase-**Host** aus dem Bundle wird berichtet.
- Der Skill committet und pusht nicht.
- Vor einer echten Produktivumgebung: eigenes EAS-Projekt, `docs/pre-launch-checklist.md`, eigener Skill.
