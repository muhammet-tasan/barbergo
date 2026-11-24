---
name: lessons-learned
description: Record or consult BarberGo lessons learned (bug root causes, gotchas, technical decisions, proven solutions) in docs/lessons-learned.md. Use after fixing a non-trivial bug, finding a surprising pitfall, or when the user says "Lesson learned" / "merk dir das". Consult it before touching areas with known pitfalls (RLS, auth redirects, booking lists, timezones).
---

# lessons-learned

Datei: `docs/lessons-learned.md`. Kurze, wiederauffindbare Einträge, neueste oben pro Bereich.

## Wann eintragen

- Fehlerursache war nicht offensichtlich oder hat Zeit gekostet
- Eine Annahme war falsch (Framework, Supabase, Expo-Verhalten)
- Eine Lösung hat sich bewährt und soll wiederverwendet werden
- Technische Entscheidung mit Begründung (Architektur-Entscheidungen gehören zusätzlich in den Entscheidungslog von `docs/architecture.md`)

**Nicht** eintragen: Triviales, einmalige Tippfehler, Dinge, die schon im Code oder in `coding-guidelines.md` stehen.

## Format

```
### <Kurztitel> (YYYY-MM-DD)
- **Bereich:** Auth | RLS/Supabase | Expo/RN | UI | Navigation | Tooling | Prozess
- **Symptom:** was sichtbar schieflief
- **Ursache:** warum
- **Lösung / Regel:** was getan wurde, bzw. was künftig gilt
- **Referenz:** Datei/Migration/Commit
```

## Ablauf

1. Datei lesen, Duplikate vermeiden. Bestehenden Eintrag erweitern statt neuen anlegen.
2. Eintrag im passenden Bereich ergänzen. Kurz, faktisch, keine Spekulation.
3. Gilt die Lehre als dauerhafte Regel, zusätzlich in `docs/coding-guidelines.md` oder `.claude/rules/` übernehmen (und im Eintrag darauf verweisen).

## Konsultieren

Vor Arbeiten in Bereichen mit bekannten Fallstricken die Datei überfliegen und relevante Einträge beachten.
