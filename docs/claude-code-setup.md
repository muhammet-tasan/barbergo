# Claude-Code-Setup

Wie dieses Repo für Claude Code konfiguriert ist, was aus Cursor migriert wurde und was aus **TASAN Media Trips** übernommen bzw. angepasst wurde.

## Struktur

```
CLAUDE.md                  # kompakter Einstieg, lädt docs/session-handoff.md
AGENTS.md                  # nur Verweis auf CLAUDE.md (für Tools, die AGENTS.md lesen)
apps/mobile/CLAUDE.md      # Mobile-spezifisch (Expo SDK 54, Befehle), importiert apps/mobile/AGENTS.md
.claude/
  settings.json            # Permissions + Notify-Hooks (geteilt, committed)
  settings.local.json      # persönliche Overrides (gitignored)
  hooks/                   # notify-toggle.ps1, notify-ping.ps1
  rules/                   # workflow, mobile-code, supabase-security, pre-launch, docs-ownership
  skills/                  # continue-project, session-handoff, doc-sync, barbergo-review, lessons-learned, pre-launch, goal
```

Regeln ohne `paths:`-Frontmatter (`workflow.md`) laden immer. Die übrigen greifen, wenn Claude passende Dateien liest.

## Cursor → Claude Code

| Cursor | Claude Code |
|---|---|
| `.cursor/rules/barbergo-project.mdc` (`alwaysApply`) | `CLAUDE.md` (Kern) + `.claude/rules/workflow.md`, `mobile-code.md`, `supabase-security.md`, `docs-ownership.md` |
| `.cursor/rules/pre-launch.mdc` (Beschreibung-getriggert) | Skill `pre-launch` + pfadgebundene Regel `.claude/rules/pre-launch.md` |
| `AGENTS.md` (Cursor-Agent-Anweisungen) | `CLAUDE.md`; `AGENTS.md` bleibt als dünner Verweis |
| Pflicht, nach Arbeit `scripts/notify-*.ps1` aufzurufen | Hooks + `notify:on/off` (`docs/dev-notifications.md`) |
| „Cursor needs your attention“ | `Notification`-Hook |

Der gesamte Inhalt der Cursor-Regeln ist erhalten (Semi-Autonomie, Stack, Nicht-MVP-Liste, Deutsch, Pre-Launch, Abschlusszusammenfassung, Doku-Pflichten). `docs/project-rules.md` und `docs/coding-guidelines.md` bleiben die ausführlichen Quellen.

## Aus TASAN Media Trips übernommen / angepasst

Quelle: `C:\Users\t_mum\Projekte\tasan media - trips\tasan-media-trips\.claude\` (lokal gefunden, gelesen).

| TASAN | BarberGo |
|---|---|
| `/continue-project`, `/project-status`, `/next-task` | Skill `continue-project` (zusammengelegt) |
| `/daily-project-closeout` | Skill `session-handoff` (+ `docs/session-handoff.md`, TODO/Status-Update) |
| `PROJECT_STATUS.md` als Gedächtnis | bestehende `docs/current-status.md` + `TODO.md` (keine neue Statusdatei) |
| `/goal` + Hooks `toggle.sh`, `ntfy-ping.sh` | Skill `goal` + `notify-toggle.ps1`, `notify-ping.ps1` (PowerShell, 10-s-Dedupe ergänzt, Matcher auf Entscheidungs-Benachrichtigungen) |
| `/list-commands` | entfällt, Skills sind über `/` auffindbar, Liste steht in `CLAUDE.md` |
| (nicht vorhanden) | **neu für BarberGo:** `doc-sync`, `barbergo-review`, `lessons-learned`, `pre-launch` (kein TASAN-Pendant, nach Claude-Code-Konventionen erstellt) |

TASAN nutzt `.claude/commands/`. Hier wurden die aktuellen **Skills** (`.claude/skills/<name>/SKILL.md`) verwendet, die Slash-Commands ersetzen und zusätzlich automatisch anhand der Beschreibung geladen werden können.

## Permissions (`.claude/settings.json`)

- **allow:** lesende Git-Befehle, `tsc`, `lint`, Smoke-Skripte.
- **ask:** `git add/commit/push/pull/merge/rebase/checkout/stash`, `npm install`, `expo install`, `supabase`.
- **deny:** `git reset --hard`, `git clean`, Force-Push, Lesen von `apps/mobile/.env` und `.env*`.

## Pflege

Änderungen an Konventionen: Regel in `.claude/rules/` bzw. `CLAUDE.md` anpassen und die Doku-Zuständigkeit (`CLAUDE.md` → Dokumentenlandkarte) beibehalten. Erkenntnisse: `docs/lessons-learned.md`.
