import { useCallback, useEffect, useState } from 'react';

import { listBookings } from '@/services/bookings';
import type { Booking } from '@/types/domain';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    const result = await listBookings();
    setBookings(result.bookings);
    setUsingFallback(result.source === 'mock');
    setError(result.error);
    if (!silent) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { bookings, loading, usingFallback, error, reload };
}
