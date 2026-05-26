import type { Service } from '@/types/domain';
import { isMockCatalogId } from '@/utils/uuid';

import {
  classifySupabaseError,
  formatCatalogErrorMessage,
  getEnvConfigStatus,
  type CatalogFailureReason,
} from './catalog-errors';
import { logSupabaseCatalogDiagnostics, runSupabaseCatalogDiagnostics } from './supabase-catalog-debug';
import { getSupabaseClient, SupabaseTables } from './supabase';
import { mapService, sortServices, type ServiceRow } from './supabase-mappers';

export type ServicesLoadResult = {
  services: Service[];
  source: 'supabase' | 'mock';
  error?: string;
  failureReason?: CatalogFailureReason;
};

export async function fetchServices(providerId?: string): Promise<ServicesLoadResult> {
  const env = getEnvConfigStatus();
  const client = getSupabaseClient();

  if (!client) {
    if (__DEV__) {
      const diag = await runSupabaseCatalogDiagnostics(providerId);
      logSupabaseCatalogDiagnostics(diag);
    }
    return {
      services: [],
      source: 'mock',
      failureReason: 'env_missing',
      error: formatCatalogErrorMessage('env_missing', { missingEnv: env.missing }),
    };
  }

  if (providerId && isMockCatalogId(providerId)) {
    return {
      services: [],
      source: 'supabase',
      failureReason: 'mock_provider_id',
      error: formatCatalogErrorMessage('mock_provider_id'),
    };
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
      if (__DEV__) {
        console.warn('[barbergo] services table empty for provider', providerId ?? '(all)');
      }
      return {
        services: [],
        source: 'supabase',
        failureReason: 'services_empty',
        error: formatCatalogErrorMessage('services_empty'),
      };
    }

    return { services: sortServices(rows.map(mapService)), source: 'supabase' };
  } catch (err) {
    const { reason, detail } = classifySupabaseError(err);
    if (__DEV__) {
      console.warn('[barbergo] fetchServices failed:', detail);
    }
    return {
      services: [],
      source: 'supabase',
      failureReason: reason,
      error: formatCatalogErrorMessage(reason, { table: 'services', detail }),
    };
  }
}
