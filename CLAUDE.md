# BarberGo

Mobile Barber-Buchungs-MVP (Hausbesuche, Basel/Schweiz). Kunden buchen Slots, Barber/Admin verwalten Termine. Kommunikation nur über WhatsApp- und Google-Maps-Deeplinks.

## Stack (MVP, unverändert)

Expo · React Native · TypeScript · Expo Router · NativeWind · **Supabase** (Postgres, Auth, RPC, RLS). Monorepo: `apps/mobile/` (App), `supabase/` (Migrationen, Seed, Functions), `docs/`, `scripts/`, `backend/` (nur Platzhalter).

**Nicht bauen ohne ausdrücklichen Auftrag:** Spring Boot, n8n, Coolify, Zahlungen, Admin-Web. Nur dokumentieren.

## Nicht verhandelbar

- **Sichtbare App-Texte, Validierungen, WhatsApp-Texte: Deutsch.**
- Supabase-Zugriff nur über `apps/mobile/services/`. Nie `service_role` in der App, `.env` weder lesen noch committen.
- Rollen aus `public.profiles.role`, RLS bleibt streng (`0003` Baseline). Go-live-Härtung: `docs/pre-launch-checklist.md` (Skill `pre-launch`).
- Bestehende Logik nicht grundlos umbauen. Kleine, lauffähige Schritte.
- **Nie automatisch committen oder pushen.**
- Expo SDK 54: vor Expo-Code die versionierten Docs prüfen (`apps/mobile/AGENTS.md`).

## Wie ich arbeite

Autonom mit sinnvollen Defaults, Rückfrage nur bei sicherheitskritischem, destruktivem, grundlegend architektonischem oder Zugangsdaten-Bedarf (`.claude/rules/workflow.md`). Nach Änderungen verifizieren (`npx tsc --noEmit`, `npm run lint` in `apps/mobile`) und Fehler selbst beheben. Nach grösseren Schritten: Dateien, Codeänderungen, Architekturentscheidungen, Testhinweise, Commit-Vorschlag.

## Dokumentenlandkarte (jede Information hat ein Zuhause)

| Thema | Datei |
|---|---|
| Überblick, Setup | `README.md` |
| Architektur + **Entscheidungslog** | `docs/architecture.md` · Entitäten `docs/data-model.md` |
| Arbeitsregeln · Code-Standards | `docs/project-rules.md` · `docs/coding-guidelines.md` |
| **Aktueller Stand**, Known issues | `docs/current-status.md` |
| Offene Aufgaben | `TODO.md` |
| Roadmap / Produkt | `docs/product-roadmap.md` |
| Go-live | `docs/pre-launch-checklist.md` |
| **Session-Handoff** | `docs/session-handoff.md` |
| **Lessons Learned** | `docs/lessons-learned.md` |
| Dev-Pings, Claude-Setup | `docs/dev-notifications.md` · `docs/claude-code-setup.md` |

Modulare Regeln (greifen pfadabhängig): `.claude/rules/` (`workflow`, `mobile-code`, `supabase-security`, `pre-launch`, `docs-ownership`).

## Skills (Slash-Commands)

| Skill | Zweck |
|---|---|
| `/continue-project` | Neuer Chat: Handoff + Status + Git prüfen, nächste Aufgabe vorschlagen |
| `/session-handoff` | Session beenden: Handoff, TODO, Status aktualisieren, Commit vorbereiten |
| `/doc-sync` | Nach relevanten Änderungen die zuständige Doku aktualisieren |
| `/barbergo-review` | Qualitäts-/Architektur-/Security-Check inkl. `tsc` + `lint` |
| `/lessons-learned` | Erkenntnisse in `docs/lessons-learned.md` festhalten/nachschlagen |
| `/pre-launch` | Go-live-Härtung prüfen (ersetzt Cursor-Regel `pre-launch.mdc`) |
| `/goal` | Ziel hands-off verfolgen, schaltet `notify:on` ein |

## Benachrichtigungen (ntfy, Hooks)

- Tippe `notify:on` in einen Prompt: Pings **an** (nur diese Session). `notify:off`: **aus**. Standard: aus. `/goal` schaltet ebenfalls ein.
- Ping bei **Task fertig** („Auftrag beendet“) und wenn **Claude auf dich wartet** (Freigabe/Entscheidung). Sonst nichts.
- Automatisch über Hooks (`.claude/settings.json`). **Skripte `scripts/notify-*.ps1` nie selbst aufrufen** (doppelte Pings). Details: `docs/dev-notifications.md`.

## Aktueller Stand

@docs/session-handoff.md
