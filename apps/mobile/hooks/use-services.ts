import { useCallback, useEffect, useState } from 'react';

import { fetchServices } from '@/services/catalog';
import type { Service } from '@/types/domain';

export function useServices(providerId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await fetchServices(providerId);
    setServices(result.services);
    setUsingFallback(result.source === 'mock');
    setError(result.error);
    setLoading(false);
  }, [providerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { services, loading, usingFallback, error, reload };
}
