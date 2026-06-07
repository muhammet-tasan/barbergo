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

/** User-facing catalog error — no dev/test hints. Technical detail → console.warn in services. */
export function formatCatalogErrorMessage(
  reason: CatalogFailureReason,
  context?: { table?: string; detail?: string; missingEnv?: string[] }
): string {
  if (context?.detail) {
    console.warn('[barbergo] catalog error:', reason, context.detail);
  }

  switch (reason) {
    case 'env_missing':
      return 'Die App kann derzeit keine Live-Daten laden. Bitte versuche es später erneut.';
    case 'providers_empty':
      return 'Kein Barber verfügbar. Bitte versuche es später erneut.';
    case 'services_empty':
      return 'Keine Services verfügbar. Bitte versuche es später erneut.';
    case 'rls_denied':
      return 'Zugriff verweigert. Bitte versuche es später erneut.';
    case 'query_failed':
      return 'Daten konnten nicht geladen werden. Bitte versuche es später erneut.';
    case 'mock_provider_id':
      return 'Barber-Daten nicht verfügbar. Bitte versuche es später erneut.';
    case 'mock_service_id':
      return 'Service-Daten nicht verfügbar. Bitte versuche es später erneut.';
    default:
      return 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
  }
}

export function formatBookingIdError(providerId: string, serviceId: string): string {
  if (isMockCatalogId(providerId) || isMockCatalogId(serviceId)) {
    return 'Buchung derzeit nicht möglich. Bitte versuche es später erneut.';
  }
  if (!isValidUuid(providerId) || !isValidUuid(serviceId)) {
    return 'Ungültige Buchungsdaten. Bitte wähle Barber und Service erneut.';
  }
  return 'Buchung derzeit nicht möglich. Bitte versuche es später erneut.';
}
