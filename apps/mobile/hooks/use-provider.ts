import { useCallback, useEffect, useState } from 'react';

import { fetchDefaultProvider } from '@/services/providers';
import type { CatalogFailureReason } from '@/services/catalog-errors';
import type { Provider } from '@/types/domain';

export function useProvider() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [failureReason, setFailureReason] = useState<CatalogFailureReason | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await fetchDefaultProvider();
    setProvider(result.provider ?? null);
    setUsingFallback(result.source === 'mock' || !!result.failureReason);
    setError(result.error);
    setFailureReason(result.failureReason);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { provider, loading, usingFallback, error, failureReason, reload };
}
