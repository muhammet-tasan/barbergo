# Claude-Code-Setup

Wie dieses Repo für Claude Code konfiguriert ist, die Skill-Namenskonvention und wie die universellen Skills in andere Projekte übernommen werden.

## Struktur

```
CLAUDE.md                  # kompakter Einstieg + Dokumentenlandkarte (Spalte "Rolle"), lädt docs/session-handoff.md
AGENTS.md                  # nur Verweis auf CLAUDE.md (für Tools, die AGENTS.md lesen)
apps/mobile/CLAUDE.md      # Mobile-spezifisch (Expo SDK 54, Befehle), importiert apps/mobile/AGENTS.md
.claude/
  settings.json            # Permissions + Notify-Hooks (geteilt, committed)
  settings.local.json      # persönliche Overrides (gitignored)
  hooks/                   # notify.py (per-Auftrag ntfy-Pings)
  rules/                   # workflow, mobile-code, supabase-security, pre-launch, docs-ownership
  skills/                  # my-continue, my-status, my-next-task, my-closeout, my-list-commands, my-notification-on (universell)
                           # my-barbergo-review, my-barbergo-pre-launch, my-barbergo-deploy-web-test (projektspezifisch)
```

Regeln ohne `paths:`-Frontmatter (`workflow.md`, `docs-ownership.md`) laden immer. Die übrigen greifen, wenn Claude passende Dateien liest. Alle Skills sind `disable-model-invocation: true` (nur manuell, ihre Beschreibung belegt keinen Kontext).

## Namenskonvention (für alle Projekte)

| Art | Schema | Beispiel | `description` beginnt mit |
|---|---|---|---|
| Universell | `my-<funktion>` | `my-closeout` | `[universal]` |
| Projektspezifisch | `my-<projekt>-<funktion>` | `my-barbergo-review` | `[<Projekt>]` |

Kleinbuchstaben, Bindestriche. Ordner `.claude/skills/<name>/SKILL.md`, Frontmatter `name` = Ordnername. Das `my-`-Präfix trennt eigene Commands von Claude-Code-Built-ins. `/my-list-commands` liest Name/Beschreibung per Grep, neue Skills erscheinen automatisch (gruppiert nach dem Tag).

## Konvention: Wo finden universelle Skills die Dokumente?

In `CLAUDE.md` → „Dokumentenlandkarte“ trägt die Spalte **Rolle** die Schlüssel `status`, `todo`, `roadmap`, `handoff`, `lessons`, `checks`. Die Skills lesen nur diese Tabelle. Ohne Eintrag gelten die Defaults `docs/ROADMAP.md`, `docs/current-status.md`, `TODO.md`, `docs/lessons-learned.md`, `PROJECT_STATUS.md`. Fehlende Dateien werden gemeldet, nicht stillschweigend angelegt. Keine weitere Konfigurationsdatei.

BarberGo-Besonderheit: Rolle `roadmap` = `docs/product-roadmap.md` (nicht `ROADMAP.md`), weil das Dokument bereits existiert und den Zweck erfüllt.

## Universelle Skills in ein anderes Projekt übernehmen

1. Ordner `my-continue`, `my-status`, `my-closeout`, `my-list-commands` aus `.claude/skills/` ins Zielprojekt kopieren. Alternativ global nach `~/.claude/skills/` (dann in jedem Projekt verfügbar).
2. Im Ziel-`CLAUDE.md` die Dokumentenlandkarte mit der Spalte **Rolle** anlegen (Vorlage: dieses Repo) und die Zeile **Checks** mit den Verifikationsbefehlen füllen.
3. Fehlende Dokumente (`status`, `todo`, `roadmap`, `handoff`, `lessons`) anlegen. Roadmap mit Meilensteinen im Status-Vokabular `PLANNED · IN PROGRESS · BLOCKED · DONE`, Handoff als überschreibbarer Ist-Zustand.
4. Optional `docs-ownership`-Regel (Änderung → Dokument) und den Abschnitt „Dokumentation automatisch pflegen“ aus `CLAUDE.md` übernehmen.

Mindestanforderungen: Git-Repository, `CLAUDE.md` mit Dokumentenlandkarte, mindestens `status`, `todo` und `handoff`. Die Skills enthalten keine absoluten Pfade, keine Projektlogik und keine OS-spezifischen Befehle (nur Git und die Checks aus `CLAUDE.md`). Neue projektspezifische Skills: `my-<projekt>-<funktion>`.

## Mehrere PCs

Versioniert (`git clone`/`pull` genügt): `CLAUDE.md`, `.claude/settings.json`, `.claude/rules/`, `.claude/skills/`, `.claude/hooks/`, `scripts/`, `docs/`. Lokal und nicht versioniert (`.gitignore`): `.claude/settings.local.json`, `.claude/notify-state/`, `.claude/scheduled_tasks.lock`, `.env*`. Globale Einstellungen in `~/.claude/` werden vom Repo nie verändert. Nach dem Pull auf dem anderen PC: neue Claude-Session starten, `/my-continue`.

## Cursor → Claude Code (Migration, erledigt)

| Cursor | Claude Code |
|---|---|
| `.cursor/rules/barbergo-project.mdc` (`alwaysApply`) | `CLAUDE.md` (Kern) + `.claude/rules/workflow.md`, `mobile-code.md`, `supabase-security.md`, `docs-ownership.md` |
| `.cursor/rules/pre-launch.mdc` | Skill `my-barbergo-pre-launch` + Regel `.claude/rules/pre-launch.md` |
| `AGENTS.md` | `CLAUDE.md`; `AGENTS.md` bleibt als dünner Verweis |
| `scripts/notify-*.ps1` nach der Arbeit | Hooks + `/my-notification-on` pro Auftrag (`docs/dev-notifications.md`) |

## Skill-Konsolidierung (TASAN Media Trips → BarberGo)

| Vorher | Jetzt |
|---|---|
| `continue-project` | `my-continue` (inkl. genau einer Empfehlung) |
| `next-task` | `my-next-task` (wieder eigener Skill, ausführlicher als die Empfehlung in `my-continue`) |
| `project-status` | `my-status` |
| `session-handoff` (TASAN: `daily-project-closeout`) | `my-closeout` |
| `list-commands` | `my-list-commands` (dynamisch statt statische Liste) |
| `doc-sync`, `lessons-learned` | entfallen als Skills: Zuordnung in `.claude/rules/docs-ownership.md`, Lessons-Format in `docs/lessons-learned.md`, Pflicht-Regel in `CLAUDE.md` |
| `barbergo-review`, `pre-launch` | `my-barbergo-review`, `my-barbergo-pre-launch` |
| `goal` | entfällt: Claude Code hat ein eingebautes `/goal`. Pings schaltet man pro Auftrag mit `/goal /my-notification-on <Bedingung>` ein (Hook `notify.py`, `/goal` allein schaltet nichts ein) |

Quelle der Vorlage: Repo `muhammet-tasan/tasan-media-trips` (`.claude/skills/my-*`, nutzt dort bereits das `my-`-Präfix).

## Permissions (`.claude/settings.json`)

- **allow:** lesende Git-Befehle, `tsc`, `lint`, Smoke-Skripte.
- **ask:** `git add/commit/push/pull/merge/rebase/checkout/stash`, `npm install`, `expo install`, `supabase`.
- **deny:** `git reset --hard`, `git clean`, Force-Push, Lesen von `apps/mobile/.env` und `.env*`.

## Pflege

Änderungen an Konventionen: Regel in `.claude/rules/` bzw. `CLAUDE.md` anpassen. Erkenntnisse: `docs/lessons-learned.md`.

## Übernahme aus TASAN Trips (2026-11-24)

Quelle: Repo `tasan-media-trips` (`.claude/hooks/notify.py`, `scripts/test-notifications.py`, Skills `my-*`, `PROJECT_STATUS.md`-Konzept).

| Standard | Status in BarberGo |
|---|---|
| Präfix `my-` für alle eigenen Skills | schon vorhanden, bleibt |
| Skills, Hooks, Settings portabel im Repo (`$CLAUDE_PROJECT_DIR`, nichts Globales) | schon vorhanden, bleibt |
| Notify-Hook `notify.py`, Standard aus, `/my-notification-on` pro Auftrag, Auto-Reset, Goal-Urteil, Mock-Tests | **übernommen**, ersetzt `notify:on/off` und die PowerShell-Hooks |
| Skills `my-notification-on`, `my-next-task` | **übernommen** (Deutsch, an BarberGo-Dokumentenlandkarte angepasst) |
| `PROJECT_STATUS.md` als Projektgedächtnis (Aktiver Fokus, Session-Log) | **übernommen**, ersetzt `docs/session-handoff.md`, Rolle `handoff` zeigt darauf |
| Closeout, Continue, Status arbeiten mit demselben Gedächtnis und prüfen gegen Git | **übernommen**, in `my-closeout`/`my-continue`/`my-status` eingearbeitet |
| Lessons Learned und Entscheidungen laufend dokumentieren | schon vorhanden (`docs/lessons-learned.md`, `docs/architecture.md`, Regel in `CLAUDE.md`), unverändert |

**Projektspezifisch angepasst (nicht 1:1):** Topic `barbergo-muhammet`, Titel „BarberGo“, Env-Präfix `BARBERGO_*`; State-Pfad am Skriptort statt relativ zum cwd; `settings.json` behält BarberGo-Permissions und sperrt zusätzlich `Write` auf den State-Ordner; Skill-Namen bleiben `my-continue`/`my-status`/`my-closeout` (statt `*-project`/`daily-*`); bestehende Dokumentenlandkarte mit Spalte *Rolle* bleibt Single Source, `PROJECT_STATUS.md` nimmt nur die Handoff-Rolle ein (Lessons, Roadmap, TODO, Status bleiben in eigenen Dateien); Session-Log auf 5 Einträge begrenzt.

**Nicht übernommen (videospezifisch):** Video-Registry, `Active Video`-Block pro Video, Remotion/CapCut-Regeln, B-Roll-/Produktionsstandards, Footage-Analyse.
