import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/services/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setSession(null);
      setLoading(false);
      return;
    }
    const { data, error } = await client.auth.getSession();
    if (!error) setSession(data.session);
    setLoading(false);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const client = getSupabaseClient();
    if (!client) {
      setSession(null);
      setLoading(false);
      return;
    }

    reload();
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    unsub = () => data.subscription.unsubscribe();
    return () => unsub?.();
  }, [reload]);

  return { session, loading, reload };
}

