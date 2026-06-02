import { useCallback, useEffect, useState } from 'react';

import { fetchActiveProviders } from '@/services/providers';
import type { CatalogFailureReason } from '@/services/catalog-errors';
import type { Provider } from '@/types/domain';

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [failureReason, setFailureReason] = useState<CatalogFailureReason | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await fetchActiveProviders();
    setProviders(result.providers);
    setUsingFallback(result.source === 'mock' || !!result.failureReason);
    setError(result.error);
    setFailureReason(result.failureReason);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { providers, loading, usingFallback, error, failureReason, reload };
}
