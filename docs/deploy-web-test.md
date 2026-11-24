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

## Nicht verifiziert (offen)

- **Kein erfolgreiches Deployment in Git-Historie oder Doku belegt.** Weder `eas.json` noch ein Deploy-Skript noch ein Commit dokumentieren, wie `test-barbergo.expo.app` bisher befüllt wurde. Der Ablauf unten ist aus der Doku und der CLI abgeleitet, noch nicht live ausgeführt.
- Auf diesem Rechner ist `eas-cli` **nicht eingeloggt** und das Projekt **nicht verknüpft** (keine `projectId` in `app.json`). Erforderlich beim ersten Lauf: `! npx eas-cli login` und `npx eas-cli init` für das bestehende Projekt (Preview-Domain `test-barbergo`). Danach trägt der Skill diese Fakten hier nach.
- Wie `--environment`/EAS-Hosting-Umgebungsvariablen genutzt werden, ist für den Static-Export irrelevant (Variablen kommen aus dem lokalen Export) und nicht dokumentiert/geprüft.

## Ablauf (Kurzfassung, Details im Skill)

```bash
cd apps/mobile
npx expo export --platform web --clear      # erzeugt dist/ (gitignored)
npx eas-cli deploy --prod --dry-run         # Sicherheitsnetz, kein Upload
npx eas-cli deploy --prod --non-interactive # Ziel: https://test-barbergo.expo.app
```

Danach: HTTP 200, Entry-Bundle-Hash im ausgelieferten HTML, Logo-Asset ~243 KB. Bei Abweichung von der URL sofort stoppen.

## Sicherheitsregeln

- Nur diese URL, kein `--dev-domain`, keine Custom-Domain, kein `deploy:delete`/`deploy:alias` ohne Auftrag.
- `.env` wird nie gelesen oder ausgegeben (Deny-Regel). Nur der Supabase-**Host** aus dem Bundle wird berichtet.
- Der Skill committet und pusht nicht.
- Vor einer echten Produktivumgebung: eigenes EAS-Projekt, `docs/pre-launch-checklist.md`, eigener Skill.
