# barbergo — Logging

Zentrales Logging für die Mobile-App. Logs sind **nur für Entwicklung und Diagnose** — nie in der UI anzeigen.

## Zweck

- Einheitliche, scope-basierte Logs (`bookings`, `slots`, `auth`, …)
- Steuerung über Log-Level (lokal und in Builds)
- Automatische Redaktion sensibler Daten
- Production: nur Warnungen und Fehler (Standard)

## Log-Level

| Level | Wann | Standard |
|-------|------|----------|
| `debug` | Detaillierte Diagnose | `__DEV__` |
| `info` | Normale Abläufe | `__DEV__` |
| `warn` | Erwartbare Probleme, Fallbacks | Production |
| `error` | Unerwartete Fehler | Production |
| `silent` | Keine Ausgabe | Manuell |

Konfiguration in `apps/mobile/.env`:

```env
# Optional — debug | info | warn | error | silent
EXPO_PUBLIC_LOG_LEVEL=warn
```

Ohne Variable: **`debug` in Development**, **`warn` in Production**.

## Verwendung

```typescript
import { createLogger } from '@/utils/logger';

const log = createLogger('bookings');

log.debug('guest cache hydrated');
log.info('booking created', 'ok');
log.warn('listBookings failed', err);
log.error('unexpected persistence failure', err);
```

Fehler werden intern zu kurzen Codes normalisiert (`classifyError`) — keine Rohtexte von Supabase in der Konsole.

## Regeln

### Niemals loggen

- Access- / Refresh-Tokens, JWTs
- Passwörter
- Vollständige Telefonnummern (werden redigiert)
- Komplette Kundendaten (Name + Adresse + Telefon zusammen)
- E-Mail-Adressen (werden redigiert)

### Niemals in der UI

- Debug-Hinweise, Demo-Fallbacks, Migrationsnamen
- Technische Fehlercodes — nur kurze, deutsche Nutzertexte

### Production

- `EXPO_PUBLIC_LOG_LEVEL=warn` oder `error` empfohlen
- `silent` für besonders stille Builds möglich
- Logs ersetzen kein serverseitiges Monitoring (später: Supabase Logs / Sentry)

## Beispiele

```typescript
// Gut
log.warn('bookSlot rpc failed', err);

// Schlecht — kein Roh-PII
console.log('booking', { phone: '+41791234567', token: accessToken });
```

## Implementierung

- Quelle: `apps/mobile/utils/logger.ts`
- Migrierte Services: `bookings`, `slots`, `profiles`, `auth-roles` (weitere schrittweise)
- Legacy-Import `logger` bleibt für ältere Module kompatibel
