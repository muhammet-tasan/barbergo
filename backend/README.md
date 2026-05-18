# backend/

**Not used in the active MVP.**

barbergo uses **Supabase** (Postgres + Auth + API) from the mobile app. See:

- [docs/architecture.md](../docs/architecture.md)
- [docs/data-model.md](../docs/data-model.md)
- [apps/mobile/services/supabase.ts](../apps/mobile/services/supabase.ts)

## Optional future: Spring Boot

If business logic later exceeds what fits comfortably in Supabase (Edge Functions, RLS, triggers), you may add a Java service here for:

- complex pricing rules
- payment webhooks
- heavy reporting

Until then, keep this folder as a placeholder — **do not block MVP work on a custom server.**
