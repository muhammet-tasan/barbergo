import { useCallback, useEffect, useState } from 'react';

import { fetchServices } from '@/services/catalog';
import type { CatalogFailureReason } from '@/services/catalog-errors';
import type { Service } from '@/types/domain';
import { isMockCatalogId } from '@/utils/uuid';

export function useServices(providerId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [failureReason, setFailureReason] = useState<CatalogFailureReason | undefined>();

  const reload = useCallback(async () => {
    if (providerId !== undefined && isMockCatalogId(providerId)) {
      setServices([]);
      setUsingFallback(true);
      setFailureReason('mock_provider_id');
      setError(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await fetchServices(providerId);
    setServices(result.services);
    setUsingFallback(result.source === 'mock' || !!result.failureReason);
    setError(result.error);
    setFailureReason(result.failureReason);
    setLoading(false);
  }, [providerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { services, loading, usingFallback, error, failureReason, reload };
}
