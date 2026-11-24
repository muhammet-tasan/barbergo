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
