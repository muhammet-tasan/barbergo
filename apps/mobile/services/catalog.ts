import { services as mockServices } from '@/data/mockData';
import type { Service } from '@/types/domain';

import { getSupabaseClient, SupabaseTables } from './supabase';
import { mapService, sortServices, type ServiceRow } from './supabase-mappers';

export type ServicesLoadResult = {
  services: Service[];
  source: 'supabase' | 'mock';
  error?: string;
};

export async function fetchServices(providerId?: string): Promise<ServicesLoadResult> {
  const client = getSupabaseClient();
  if (!client) {
    const filtered = providerId
      ? mockServices.filter((s) => s.providerId === providerId)
      : mockServices;
    return { services: sortServices(filtered), source: 'mock' };
  }

  try {
    let query = client
      .from(SupabaseTables.services)
      .select('id, provider_id, name, price_chf, duration_minutes, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const rows = (data ?? []) as ServiceRow[];
    if (rows.length === 0) {
      console.warn('[barbergo] No services in Supabase — using mock services.');
      const filtered = providerId
        ? mockServices.filter((s) => s.providerId === providerId)
        : mockServices;
      return {
        services: sortServices(filtered),
        source: 'mock',
        error: 'Keine Services in der Datenbank.',
      };
    }

    return { services: sortServices(rows.map(mapService)), source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Services konnten nicht geladen werden.';
    console.warn('[barbergo] fetchServices fallback:', message);
    const filtered = providerId
      ? mockServices.filter((s) => s.providerId === providerId)
      : mockServices;
    return { services: sortServices(filtered), source: 'mock', error: message };
  }
}
