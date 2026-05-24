import { formatCatalogErrorMessage, getEnvConfigStatus } from '@/services/catalog-errors';
import { isMockCatalogId } from '@/utils/uuid';
import type { Provider } from '@/types/domain';

/** Pick the most helpful catalog error for the UI (root cause first). */
export function resolveCatalogDisplayError(
  provider: Provider | null | undefined,
  providerError?: string,
  servicesError?: string
): string | undefined {
  const env = getEnvConfigStatus();
  if (!env.configured) {
    return formatCatalogErrorMessage('env_missing', { missingEnv: env.missing });
  }

  if (providerError) {
    return providerError;
  }

  if (provider && isMockCatalogId(provider.id)) {
    return formatCatalogErrorMessage('mock_provider_id');
  }

  return servicesError;
}
