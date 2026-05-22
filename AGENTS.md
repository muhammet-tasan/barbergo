# barbergo — agent instructions

All Cursor agent work in this repository must follow **`docs/project-rules.md`**, **`docs/coding-guidelines.md`**, and **`docs/architecture.md`**.

- **MVP backend:** Supabase (use mock data until credentials exist).
- **Not active MVP:** Spring Boot, n8n, Coolify.
- **App language:** German for visible mobile UI copy, validation messages, and WhatsApp messages.

Project rules are enforced via **`.cursor/rules/barbergo-project.mdc`** (`alwaysApply: true`).

After every **major implementation step**, include in the response:

1. Summary of changed files  
2. Important code changes (beginner-friendly)  
3. Brief architecture decisions  

Before stopping, update **`TODO.md`** and **`docs/current-status.md`**, mark completed tasks, and add next recommended tasks.

Then run the PowerShell notification scripts under `scripts/` from the repo root (see project rules).
