import { defaultProvider } from '@/data/mockData';
import type { Provider } from '@/types/domain';
import { logger } from '@/utils/logger';

import {
  classifySupabaseError,
  formatCatalogErrorMessage,
  getEnvConfigStatus,
  type CatalogFailureReason,
} from './catalog-errors';
import { allowMockDataFallback } from './data-source-policy';
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
    if (allowMockDataFallback()) {
      return {
        providers: [defaultProvider],
        source: 'mock',
        failureReason: 'env_missing',
        error: formatCatalogErrorMessage('env_missing', { missingEnv: env.missing }),
      };
    }
    return {
      providers: [],
      source: 'supabase',
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
      return {
        providers: [],
        source: 'supabase',
        failureReason: 'providers_empty',
        error: formatCatalogErrorMessage('providers_empty'),
      };
    }

    return { providers: rows.map(mapProvider), source: 'supabase' };
  } catch (err) {
    const { reason, detail } = classifySupabaseError(err);
    logger.warn('providers', 'fetchActiveProviders failed', reason);
    if (allowMockDataFallback()) {
      return {
        providers: [defaultProvider],
        source: 'mock',
        failureReason: reason,
        error: formatCatalogErrorMessage(reason, { table: 'providers', detail }),
      };
    }
    return {
      providers: [],
      source: 'supabase',
      failureReason: reason,
      error: formatCatalogErrorMessage(reason, { table: 'providers', detail }),
    };
  }
}

export async function fetchProviderById(providerId: string): Promise<ProviderLoadResult> {
  const env = getEnvConfigStatus();
  const client = getSupabaseClient();

  if (!client) {
    const match = providerId === defaultProvider.id ? defaultProvider : defaultProvider;
    return {
      provider: match,
      source: 'mock',
      failureReason: 'env_missing',
      error: formatCatalogErrorMessage('env_missing', { missingEnv: env.missing }),
    };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.providers)
      .select(PROVIDER_SELECT)
      .eq('id', providerId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = data as ProviderRow | null;
    if (!row) {
      if (providerId === defaultProvider.id) {
        return { provider: defaultProvider, source: 'mock', failureReason: 'providers_empty' };
      }
      return {
        source: 'supabase',
        failureReason: 'providers_empty',
        error: 'Barber nicht gefunden.',
      };
    }

    return { provider: mapProvider(row), source: 'supabase' };
  } catch (err) {
    const { reason, detail } = classifySupabaseError(err);
    logger.warn('providers', 'fetchProviderById failed', reason);
    if (providerId === defaultProvider.id) {
      return {
        provider: defaultProvider,
        source: 'mock',
        failureReason: reason,
        error: formatCatalogErrorMessage(reason, { table: 'providers', detail }),
      };
    }
    return {
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
      logger.warn('providers', 'no active provider row', 'providers_empty');
      return {
        source: 'supabase',
        failureReason: 'providers_empty',
        error: formatCatalogErrorMessage('providers_empty'),
      };
    }

    return { provider: mapProvider(row), source: 'supabase' };
  } catch (err) {
    const { reason, detail } = classifySupabaseError(err);
    logger.warn('providers', 'fetchDefaultProvider failed', reason);
    return {
      source: 'supabase',
      failureReason: reason,
      error: formatCatalogErrorMessage(reason, { table: 'providers', detail }),
    };
  }
}
