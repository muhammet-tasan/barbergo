# Lessons Learned

Erkenntnisse aus Fehlern, Entscheidungen und bewährten Lösungen. Wird während der Arbeit automatisch gepflegt (siehe `CLAUDE.md`), `/my-closeout` konsolidiert. Dauerhafte Regeln zusätzlich in `docs/coding-guidelines.md` bzw. `.claude/rules/`.

**Wann eintragen:** Ursache war nicht offensichtlich oder hat Zeit gekostet · Annahme war falsch · Lösung soll wiederverwendet werden · Entscheidung mit Begründung (Architektur zusätzlich in `docs/architecture.md`). **Nicht:** Triviales, einmalige Tippfehler, schon Dokumentiertes. Vor Arbeiten in Problembereichen (RLS, Auth, Buchungslisten, Zeitzonen) diese Datei überfliegen. Duplikate vermeiden, bestehenden Eintrag erweitern.

**Format** (kurz, faktisch, neueste oben pro Bereich):

```
### <Kurztitel> (YYYY-MM-DD)
- **Bereich:** Auth | RLS/Supabase | Expo/RN | UI | Navigation | Tooling | Prozess
- **Problem:** was sichtbar schieflief
- **Ursache:** warum
- **Lösung / Regel:** was getan wurde bzw. was künftig gilt
- **Vermeidung:** wie es künftig nicht mehr passiert
- **Andere Projekte:** relevant? (ja/nein + Stichwort)
- **Referenz:** Datei/Migration/Commit
```

> Die ersten Einträge wurden bei der Claude-Code-Migration aus `docs/current-status.md`, `TODO.md` und `apps/mobile/AGENTS.md` abgeleitet (keine neuen Beobachtungen). Quellen sind jeweils genannt.

## Supabase / RLS

### RLS-Rekursion auf `profiles` (Migration `0010`)
- **Symptom:** Profil-/Rollenabfragen scheiterten bzw. Barber-Freigabe erzeugte keinen Provider.
- **Ursache:** Admin-Policies auf `profiles` fragten `profiles` selbst ab → unendliche Rekursion (Kommentar in `0010`).
- **Lösung / Regel:** Rollenprüfung über die `security definer`-Funktion `public.is_admin_user()` statt Selbst-Subselect in der Policy. Bei Policy-Änderungen auf `profiles` immer Rekursion bedenken.
- **Referenz:** `supabase/migrations/0010_fix_profiles_rls_and_barber_provider.sql`, `docs/current-status.md`

### Rollen nie aus `user_metadata`, nie Fallback auf `barber`
- **Regel:** App-Rolle stammt aus `public.profiles.role`. Unbekannt/fehlend ≠ `barber`. Nutzer dürfen `role` / `approval_status` nicht selbst ändern.
- **Referenz:** `docs/current-status.md` (Architecture decisions, RLS)

## Auth

### Redirect-URL nicht global auf localhost umschreiben
- **Regel:** Der Auth-Redirect ist umgebungsabhängig (`barbergo://` nativ, `exp://` Expo Go, HTTP Web) und wird zentral über `getAuthRedirectUrl()` gebildet. Keine globale localhost-Ersetzung in Produktion.
- **Referenz:** `apps/mobile/services/auth-redirect.ts`, `docs/supabase-auth-settings.md`

## UI / Daten

### Doppelte Termine in Listen
- **Symptom:** Buchungen erschienen doppelt (Gast-Cache + Konto).
- **Lösung / Regel:** Listen deduplizieren per Fingerprint (`utils/dedupe-bookings.ts`), lokale Gastkopie getrennt behandeln.
- **Referenz:** `docs/current-status.md`

## Tooling

### Expo-SDK-Docs immer versioniert lesen
- **Regel:** Expo ändert APIs zwischen SDKs. Vor Expo-Code die Docs der installierten Version prüfen (SDK 54).
- **Referenz:** `apps/mobile/AGENTS.md`

### Hook-Skripte: absolute Pfade über `$CLAUDE_PROJECT_DIR`
- **Ursache:** Das Arbeitsverzeichnis einer Claude-Session kann `apps/mobile` statt Repo-Root sein. Relative Hook-Pfade würden dann ins Leere laufen.
- **Regel:** Hook-Befehle in `.claude/settings.json` immer mit `$CLAUDE_PROJECT_DIR`.
- **Referenz:** `.claude/settings.json`, `docs/dev-notifications.md`

### Hook-State-Pfad am Skriptort verankern, nicht am cwd (2026-11-24)
- **Bereich:** Tooling
- **Problem:** `notify.py` aus TASAN Trips nutzt `.claude/notify-state` relativ zum Arbeitsverzeichnis. In BarberGo läuft eine Session oft in `apps/mobile`, der State läge dann am falschen Ort.
- **Lösung / Regel:** Default-Pfad aus `__file__` ableiten (`<repo>/.claude/notify-state`). Getestet aus `apps/mobile` heraus.
- **Andere Projekte:** ja, bei jedem Projekt mit Unterordner-Sessions (Monorepo).
- **Referenz:** `.claude/hooks/notify.py`

### Eigene Deny-Regeln greifen auch auf eigene Bash-Befehle (2026-11-24)
- **Bereich:** Tooling
- **Problem:** Ein Befehl mit dem Text des gesperrten State-Ordners im Heredoc wurde blockiert (`Bash(*notify-state/*)` matcht jeden Befehl, der den Text enthält).
- **Lösung / Regel:** Das ist gewollt (Schutz gegen Selbst-Aktivierung). Dokumentation mit dem Write-Tool schreiben bzw. Skripte als Datei ablegen und nur diese ausführen.
- **Referenz:** `.claude/settings.json`

### `npx eas-cli` bricht mit `ERR_MODULE_NOT_FOUND` (is-wsl) ab (2026-11-24)
- **Bereich:** Tooling
- **Problem:** `npx eas-cli whoami` scheiterte mit `Cannot find package ... wsl-utils ... is-wsl`.
- **Ursache:** Unvollständig installierter Eintrag im npx-Cache (`%LOCALAPPDATA%\npm-cache\_npx\<hash>`).
- **Lösung / Regel:** Nur den im Fehler genannten Hash-Ordner löschen, `npx --yes eas-cli` neu ausführen (danach 27.11.0 OK).
- **Andere Projekte:** ja, bei jedem `npx`-Tool.
- **Referenz:** `.claude/skills/my-barbergo-deploy-web-test/SKILL.md`

### `app.config.js` überschrieb `extra` und versteckte die EAS-`projectId` (2026-11-24)
- **Bereich:** Tooling
- **Problem:** `eas init --id` schrieb die `projectId` nach `app.json`, endete aber mit `Cannot read properties of undefined (reading 'projectId')`.
- **Ursache:** Die dynamische `app.config.js` setzte `extra` neu und warf damit `app.json`-`extra` (inkl. `eas.projectId`) weg.
- **Lösung / Regel:** `...appJson.expo.extra` in `extra` übernehmen. Danach löst `eas project:info` das Projekt auf.
- **Vermeidung:** Bei dynamischer Config `extra` immer mergen, nie ersetzen.
- **Andere Projekte:** ja, bei jeder `app.config.js` mit `extra`.
- **Referenz:** `apps/mobile/app.config.js`

### EAS-Projekt ohne Repo-Spur wiederfinden (2026-11-24)
- **Bereich:** Tooling
- **Problem:** Das Deployment vom 2026-08-28 lief ohne versionierte `eas.json`/`projectId`. `eas init --account … --non-interactive` hätte ein neues Projekt angelegt.
- **Lösung / Regel:** Projekte per Expo-GraphQL (`account.byName(accountName).apps(limit ≤ 50)`, `app.byId(appId).devDomainName`) mit der lokalen Anmeldung auflisten, dann `eas init --id <ID>`. Token nie ausgeben. `projectId` ist nicht geheim und gehört in `app.json`.
- **Andere Projekte:** ja.
- **Referenz:** `docs/deploy-web-test.md`
