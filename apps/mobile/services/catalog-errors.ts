import { getSupabaseEnvSnapshot } from './supabase-env';
import { isMockCatalogId, isValidUuid } from '@/utils/uuid';

/** Why catalog data (provider/services) could not be loaded from Supabase. */
export type CatalogFailureReason =
  | 'env_missing'
  | 'providers_empty'
  | 'services_empty'
  | 'rls_denied'
  | 'query_failed'
  | 'mock_provider_id'
  | 'mock_service_id';

export type EnvConfigStatus = {
  configured: boolean;
  missing: string[];
};

export function getEnvConfigStatus(): EnvConfigStatus {
  const snap = getSupabaseEnvSnapshot();
  return { configured: snap.configured, missing: snap.missing };
}

export function classifySupabaseError(err: unknown): {
  reason: CatalogFailureReason;
  detail: string;
} {
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string })?.code ?? '';

  if (
    code === '42501' ||
    /permission denied|row-level security|violates row-level security|RLS/i.test(message)
  ) {
    return { reason: 'rls_denied', detail: message };
  }

  return { reason: 'query_failed', detail: message };
}

export function formatCatalogErrorMessage(
  reason: CatalogFailureReason,
  context?: { table?: string; detail?: string; missingEnv?: string[] }
): string {
  switch (reason) {
    case 'env_missing':
      return `Supabase-Umgebung fehlt in der App (${context?.missingEnv?.join(', ') ?? 'EXPO_PUBLIC_*'}). .env liegt unter apps/mobile — danach npx expo start -c und Reload. Prüfe Debug-Box: „Supabase URL present“.`;
    case 'providers_empty':
      return 'Tabelle providers: kein aktiver Barber gefunden. Führe supabase/migrations/0001_initial_schema.sql und supabase/seed.sql im Supabase SQL Editor aus.';
    case 'services_empty':
      return 'Tabelle services: keine aktiven Services für diesen Barber. Prüfe seed.sql (provider_id muss zur Provider-UUID passen).';
    case 'rls_denied':
      return `Zugriff blockiert (RLS)${context?.table ? ` auf ${context.table}` : ''}: ${context?.detail ?? 'Keine Berechtigung für anon'}. Erlaube anon SELECT auf providers und services (Migration 0001) bzw. bookings (Migration 0002).`;
    case 'query_failed':
      return `Supabase-Abfrage fehlgeschlagen${context?.table ? ` (${context.table})` : ''}: ${context?.detail ?? 'Unbekannter Fehler'}`;
    case 'mock_provider_id':
      return 'Barber verwendet Demo-ID (z. B. provider-1) statt Supabase-UUID. Provider konnte nicht aus der Datenbank geladen werden — Fehler oben prüfen.';
    case 'mock_service_id':
      return 'Service verwendet Demo-ID (z. B. service-1) statt Supabase-UUID. Services konnten nicht aus der Datenbank geladen werden — Fehler oben prüfen.';
    default:
      return context?.detail ?? 'Unbekannter Katalogfehler';
  }
}

export function formatBookingIdError(providerId: string, serviceId: string): string {
  const parts: string[] = [];
  if (isMockCatalogId(providerId)) {
    parts.push(formatCatalogErrorMessage('mock_provider_id'));
  } else if (!isValidUuid(providerId)) {
    parts.push(`Ungültige Provider-ID: ${providerId}`);
  }
  if (isMockCatalogId(serviceId)) {
    parts.push(formatCatalogErrorMessage('mock_service_id'));
  } else if (!isValidUuid(serviceId)) {
    parts.push(`Ungültige Service-ID: ${serviceId}`);
  }
  return parts.join('\n\n');
}
