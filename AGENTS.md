# barbergo — agent instructions

All Cursor agent work in this repository must follow **`docs/project-rules.md`** and **`docs/architecture.md`**.

- **MVP backend:** Supabase (use mock data until credentials exist).
- **Not active MVP:** Spring Boot, n8n, Coolify.

Project rules are enforced via **`.cursor/rules/barbergo-project.mdc`** (`alwaysApply: true`).

After every **major implementation step**, include in the response:

1. Summary of changed files  
2. Important code changes (beginner-friendly)  
3. Brief architecture decisions  

Then run the PowerShell notification scripts under `scripts/` from the repo root (see project rules).
