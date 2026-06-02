import { defaultProvider } from '@/data/mockData';
import type { Provider } from '@/types/domain';

import {
  classifySupabaseError,
  formatCatalogErrorMessage,
  getEnvConfigStatus,
  type CatalogFailureReason,
} from './catalog-errors';
import { getSupabaseClient, SupabaseTables } from './supabase';
import { mapProvider, type ProviderRow } from './supabase-mappers';

export type ProviderLoadResult = {
  provider?: Provider;
  source: 'supabase' | 'mock';
  error?: string;
  failureReason?: CatalogFailureReason;
};

export type ProvidersLoadResult = {
  providers: Provider[];
  source: 'supabase' | 'mock';
  error?: string;
  failureReason?: CatalogFailureReason;
};

const PROVIDER_SELECT =
  'id, name, description, service_area, image_url, is_active, created_at' as const;

export async function fetchActiveProviders(): Promise<ProvidersLoadResult> {
  const env = getEnvConfigStatus();
  const client = getSupabaseClient();

  if (!client) {
    return {
      providers: [defaultProvider],
      source: 'mock',
      failureReason: 'env_missing',
      error: formatCatalogErrorMessage('env_missing', { missingEnv: env.missing }),
    };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.providers)
      .select(PROVIDER_SELECT)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as ProviderRow[];
    if (rows.length === 0) {
      if (__DEV__) {
        console.warn('[barbergo] providers table empty — using demo provider list');
      }
      return {
        providers: [defaultProvider],
        source: 'mock',
        failureReason: 'providers_empty',
        error: formatCatalogErrorMessage('providers_empty'),
      };
    }

    return { providers: rows.map(mapProvider), source: 'supabase' };
  } catch (err) {
    const { reason, detail } = classifySupabaseError(err);
    if (__DEV__) {
      console.warn('[barbergo] fetchActiveProviders failed:', detail);
    }
    return {
      providers: [defaultProvider],
      source: 'mock',
      failureReason: reason,
      error: formatCatalogErrorMessage(reason, { table: 'providers', detail }),
    };
  }
}

export async function fetchDefaultProvider(): Promise<ProviderLoadResult> {
  const env = getEnvConfigStatus();
  const client = getSupabaseClient();

  if (!client) {
    return {
      source: 'mock',
      failureReason: 'env_missing',
      error: formatCatalogErrorMessage('env_missing', { missingEnv: env.missing }),
    };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.providers)
      .select(PROVIDER_SELECT)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      throw error;
    }

    const row = data?.[0] as ProviderRow | undefined;
    if (!row) {
      if (__DEV__) {
        console.warn('[barbergo] providers table empty or no active row');
      }
      return {
        source: 'supabase',
        failureReason: 'providers_empty',
        error: formatCatalogErrorMessage('providers_empty'),
      };
    }

    return { provider: mapProvider(row), source: 'supabase' };
  } catch (err) {
    const { reason, detail } = classifySupabaseError(err);
    if (__DEV__) {
      console.warn('[barbergo] fetchDefaultProvider failed:', detail);
    }
    return {
      source: 'supabase',
      failureReason: reason,
      error: formatCatalogErrorMessage(reason, { table: 'providers', detail }),
    };
  }
}
