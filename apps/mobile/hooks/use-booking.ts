import { useCallback, useEffect, useState } from 'react';

import { getBookingById } from '@/services/bookings';
import type { Booking } from '@/types/domain';

export function useBooking(id?: string) {
  const [booking, setBooking] = useState<Booking | undefined>();
  const [loading, setLoading] = useState(Boolean(id));
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async () => {
    if (!id) {
      setBooking(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await getBookingById(id);
    setBooking(result.booking);
    setUsingFallback(result.source === 'mock');
    setError(result.error);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { booking, loading, usingFallback, error, reload, setBooking };
}
