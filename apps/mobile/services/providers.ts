import { defaultProvider } from '@/data/mockData';
import type { Provider } from '@/types/domain';

import { getSupabaseClient, SupabaseTables } from './supabase';
import { mapProvider, type ProviderRow } from './supabase-mappers';

export type ProviderLoadResult = {
  provider: Provider;
  source: 'supabase' | 'mock';
  error?: string;
};

export async function fetchDefaultProvider(): Promise<ProviderLoadResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { provider: defaultProvider, source: 'mock' };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.providers)
      .select('id, name, description, service_area, image_url, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      throw error;
    }

    const row = data?.[0] as ProviderRow | undefined;
    if (!row) {
      console.warn('[barbergo] No active provider in Supabase — using mock provider.');
      return { provider: defaultProvider, source: 'mock', error: 'Kein aktiver Barber in der Datenbank.' };
    }

    return { provider: mapProvider(row), source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Provider konnte nicht geladen werden.';
    console.warn('[barbergo] fetchDefaultProvider fallback:', message);
    return { provider: defaultProvider, source: 'mock', error: message };
  }
}
