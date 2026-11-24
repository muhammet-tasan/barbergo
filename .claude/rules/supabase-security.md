---
paths:
  - "supabase/**"
  - "apps/mobile/services/**"
  - "apps/mobile/contexts/**"
  - "apps/mobile/.env.example"
---

# Supabase, Auth und Sicherheit

Details: `docs/coding-guidelines.md` (Supabase), `docs/data-model.md`, `supabase/README.md`, `docs/pre-launch-checklist.md`.

- **Mobile darf nur** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_WHATSAPP_PHONE` (optional Legacy `EXPO_PUBLIC_BARBER_WHATSAPP`) nutzen. **Nie** `service_role`-Key in der App oder im Git.
- Secrets nur in `apps/mobile/.env` (gitignored); Vorlage `.env.example`. **`.env` nicht lesen oder ausgeben.**
- Supabase-Client ausschliesslich in `services/supabase.ts` (Singleton, env-basiert). Zeilen-Mapping (snake_case → Domain) in `services/supabase-mappers.ts`.
- Lesepfad bei Fehler: Mock-Fallback bzw. klarer Fehler, immer loggen. Schreibpfad bei Fehler: Nutzer warnen, nie still scheitern. Ein Fallback-Pfad im Service, nicht pro Screen.
- **Rollen** kommen aus `public.profiles.role` (`customer`, `barber`, `barber_pending`, `admin`), nie aus `user_metadata`. Nie auf `barber` zurückfallen. Nutzer dürfen `role` / `approval_status` nicht selbst ändern.
- **RLS ist Pflicht:** Admin alles, Barber nur eigene Provider-Daten, Kunde nur eigene Buchungen. Kein anonymer SELECT/UPDATE auf fremde Buchungen. `0002_*` (anon MVP-Policies) ist **nicht** für Produktion; `0003` ist die sichere Baseline.
- Migrationen: neue, fortlaufend nummerierte Datei in `supabase/migrations/`, idempotent (`if not exists`, `drop policy if exists`), bestehende Migrationen nicht umschreiben. Anschliessend `supabase/README.md` und die „Supabase setup status“-Tabelle in `docs/current-status.md` aktualisieren.
- Migrationen oder Policies, die Zugriff **lockern**, sowie Anwenden auf gehostetes Supabase: erst nachfragen (sicherheitskritisch).
- Temporäre Sicherheitsvereinfachungen nie verstecken: in `docs/current-status.md` dokumentieren und per `TODO`-Kommentar markieren.
