# BarberGo

Mobile Barber-Buchungs-MVP (Hausbesuche, Basel/Schweiz). Kunden buchen Slots, Barber/Admin verwalten Termine. Kommunikation nur über WhatsApp- und Google-Maps-Deeplinks.

## Stack (MVP, unverändert)

Expo · React Native · TypeScript · Expo Router · NativeWind · **Supabase** (Postgres, Auth, RPC, RLS). Monorepo: `apps/mobile/` (App), `supabase/` (Migrationen, Seed, Functions), `docs/`, `scripts/`, `backend/` (nur Platzhalter).

**Nicht bauen ohne ausdrücklichen Auftrag:** Spring Boot, n8n, Coolify, Zahlungen, Admin-Web. Nur dokumentieren.

## Nicht verhandelbar

- **Sichtbare App-Texte, Validierungen, WhatsApp-Texte: Deutsch.**
- Supabase-Zugriff nur über `apps/mobile/services/`. Nie `service_role` in der App, `.env` weder lesen noch committen.
- Rollen aus `public.profiles.role`, RLS bleibt streng (`0003` Baseline). Go-live-Härtung: `docs/pre-launch-checklist.md` (`/my-barbergo-pre-launch`).
- Bestehende Logik nicht grundlos umbauen. Kleine, lauffähige Schritte.
- **Nie automatisch committen oder pushen.**
- Expo SDK 54: vor Expo-Code die versionierten Docs prüfen (`apps/mobile/AGENTS.md`).

## Wie ich arbeite

Autonom mit sinnvollen Defaults, Rückfrage nur bei sicherheitskritischem, destruktivem, grundlegend architektonischem oder Zugangsdaten-Bedarf (`.claude/rules/workflow.md`). Nach Änderungen verifizieren (*Checks* unten) und Fehler selbst beheben. Nach grösseren Schritten: Dateien, Codeänderungen, Architekturentscheidungen, Testhinweise, Commit-Vorschlag.

## Dokumentenlandkarte (jede Information hat ein Zuhause)

Die Spalte **Rolle** ist die Konvention, über die die universellen `/my-*`-Skills Dokumente finden. Fehlt ein Eintrag, gelten `docs/ROADMAP.md`, `docs/current-status.md`, `TODO.md`, `docs/lessons-learned.md`, `PROJECT_STATUS.md`. Fehlt die Datei, wird sie gemeldet, nicht stillschweigend angelegt.

| Thema | Datei | Rolle |
|---|---|---|
| Überblick, Setup | `README.md` | |
| Architektur + **Entscheidungslog** | `docs/architecture.md` · Entitäten `docs/data-model.md` | |
| Arbeitsregeln · Code-Standards | `docs/project-rules.md` · `docs/coding-guidelines.md` | |
| **Aktueller Stand**, Known issues | `docs/current-status.md` | `status` |
| Offene Aufgaben | `TODO.md` | `todo` |
| **Roadmap, Phasen, Meilensteine** | `docs/product-roadmap.md` | `roadmap` |
| Go-live | `docs/pre-launch-checklist.md` | |
| **Projektgedächtnis / Session-Handoff** (Aktiver Fokus, Session-Log) | `PROJECT_STATUS.md` | `handoff` |
| **Lessons Learned** | `docs/lessons-learned.md` | `lessons` |
| Dev-Pings, Claude-Setup | `docs/dev-notifications.md` · `docs/claude-code-setup.md` | |
| **Checks** (Verifikation) | `npx tsc --noEmit` · `npm run lint` (in `apps/mobile`) | `checks` |

Modulare Regeln (greifen pfadabhängig): `.claude/rules/` (`workflow`, `mobile-code`, `supabase-security`, `pre-launch`, `docs-ownership`). Zuordnung Änderungstyp → Dokument: `docs-ownership`.

## Dokumentation automatisch pflegen

Nicht auf den Tagesabschluss warten, eine Session kann jederzeit enden. Nach abgeschlossenen Arbeitspaketen und wichtigen Entscheidungen die zuständige Datei (Zuordnung in `docs-ownership`) selbst aktualisieren:

- Technische/Architekturentscheidungen, neue Erkenntnisse, Fehlerursachen + Lösungen (Format: Kopf von `docs/lessons-learned.md`)
- Erledigte und neu entdeckte Aufgaben, Risiken, Blocker
- Erreichte oder gefährdete Meilensteine, neue Abhängigkeiten, nötige Roadmap-Anpassung (Status nur bei belegten Abschlusskriterien auf `DONE`)
- Geänderte Projektstandards

Grenzen: keine Doku-Änderung bei Trivialem, nur Nachhaltiges festhalten, bestehende Abschnitte aktualisieren statt neue anlegen, nie dieselbe Information doppelt führen (verlinken). Neue Produktanforderungen oder Zieländerungen **nicht beschliessen**, nur als Vorschlag in der Roadmap notieren. Dauerhafte Regel? Nur wenn wirklich allgemeingültig nach `CLAUDE.md`/`.claude/rules/`, nicht für Temporäres.

## Skills (Slash-Commands)

Alle eigenen Skills beginnen mit `my-`. Universell: `my-<funktion>`. Projektspezifisch: `my-<projekt>-<funktion>` (hier `my-barbergo-`). Die `description` beginnt mit `[universal]` bzw. `[BarberGo]`. Vollständige, dynamische Liste: `/my-list-commands`. Übernahme in andere Projekte und Konvention: `docs/claude-code-setup.md`.

| Skill | Zweck |
|---|---|
| `/my-continue` | Wiedereinstieg: Git + Handoff + Status prüfen, eine nächste Aufgabe empfehlen |
| `/my-status` | Kompakter Projektstatus (nur lesen) |
| `/my-next-task` | Genau eine wirkungsvollste nächste Aufgabe bestimmen (nur lesen) |
| `/my-notification-on` | Option pro Auftrag: ntfy-Pings nur für diesen Auftrag, kombinierbar mit `/goal` |
| `/my-closeout` | Session-Abschluss: Doku, Roadmap, TODO, Lessons, Handoff, Checks, Commit vorbereiten |
| `/my-list-commands` | Eigene Skills dynamisch auflisten |
| `/my-barbergo-review` | Qualitäts-/Architektur-/Security-Review (nur berichten) |
| `/my-barbergo-pre-launch` | Go-live-Prüfung mit GO / GO mit Einschränkungen / NO-GO |

## Benachrichtigungen (ntfy, Hooks)

- Standard: **aus**, in jedem Auftrag und jeder Session. `/my-notification-on` irgendwo im Prompt schaltet Pings **nur für diesen Auftrag** an, z. B. `/goal /my-notification-on <Bedingung>`. `/goal` allein schaltet nichts ein. Reset automatisch nach Abschluss bzw. beim nächsten Prompt, es gibt keinen Off-Befehl.
- Ping bei **Auftrag fertig** („Auftrag beendet“, bei `/goal` erst wenn das Ziel erreicht ist) und wenn **Claude auf dich wartet** (Freigabe/Entscheidung). Sonst nichts.
- Läuft über Hooks (`.claude/hooks/notify.py`, `.claude/settings.json`). **Nie selbst Pings senden, `scripts/notify-*.ps1` nie aufrufen, `.claude/notify-state/` nie anfassen.** Details: `docs/dev-notifications.md`, Test: `python3 scripts/test-notifications.py`.

## Aktueller Stand

@PROJECT_STATUS.md
