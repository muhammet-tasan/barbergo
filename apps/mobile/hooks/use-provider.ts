import { useCallback, useEffect, useState } from 'react';

import { fetchDefaultProvider } from '@/services/providers';
import type { Provider } from '@/types/domain';

export function useProvider() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await fetchDefaultProvider();
    setProvider(result.provider);
    setUsingFallback(result.source === 'mock');
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { provider, loading, usingFallback, error, reload };
}
