import { getSupabaseEnvSnapshot } from './supabase-env';
import { getSupabaseClient, SupabaseTables } from './supabase';
import { isValidUuid } from '@/utils/uuid';

export type SupabaseCatalogDiagnostics = {
  env: ReturnType<typeof getSupabaseEnvSnapshot>;
  clientCreated: boolean;
  providers: { count: number; error: string | null; firstId: string | null };
  services: { count: number; error: string | null; firstId: string | null };
  providerIdFilter?: string;
  providerIdFilterValid: boolean;
  usesMockProviderId: boolean;
};

export async function runSupabaseCatalogDiagnostics(
  providerIdFilter?: string
): Promise<SupabaseCatalogDiagnostics> {
  const env = getSupabaseEnvSnapshot();
  const client = getSupabaseClient();
  const filterValid = providerIdFilter ? isValidUuid(providerIdFilter) : true;

  const result: SupabaseCatalogDiagnostics = {
    env,
    clientCreated: !!client,
    providers: { count: 0, error: null, firstId: null },
    services: { count: 0, error: null, firstId: null },
    providerIdFilter,
    providerIdFilterValid: filterValid,
    usesMockProviderId: providerIdFilter === 'provider-1' || providerIdFilter?.startsWith('provider-'),
  };

  if (!client) {
    result.providers.error = 'Supabase client not created (env missing in app bundle)';
    result.services.error = result.providers.error;
    return result;
  }

  const providersRes = await client
    .from(SupabaseTables.providers)
    .select('id, name, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(5);

  result.providers.error = providersRes.error?.message ?? null;
  result.providers.count = providersRes.data?.length ?? 0;
  result.providers.firstId = providersRes.data?.[0]?.id ?? null;

  let servicesQuery = client
    .from(SupabaseTables.services)
    .select('id, provider_id, name, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(10);

  if (providerIdFilter && filterValid) {
    servicesQuery = servicesQuery.eq('provider_id', providerIdFilter);
  }

  const servicesRes = await servicesQuery;
  result.services.error = servicesRes.error?.message ?? null;
  result.services.count = servicesRes.data?.length ?? 0;
  result.services.firstId = servicesRes.data?.[0]?.id ?? null;

  return result;
}

export function logSupabaseCatalogDiagnostics(diag: SupabaseCatalogDiagnostics): void {
  console.log('[barbergo] Supabase catalog diagnostics', {
    supabaseUrlPresent: diag.env.urlPresent ? 'yes' : 'no',
    supabaseUrlHost: diag.env.urlHost,
    anonKeyPresent: diag.env.keyPresent ? 'yes' : 'no',
    anonKeyKind: diag.env.keyKind,
    clientCreated: diag.clientCreated ? 'yes' : 'no',
    providersQueryCount: diag.providers.count,
    providersQueryError: diag.providers.error,
    providersFirstId: diag.providers.firstId,
    servicesQueryCount: diag.services.count,
    servicesQueryError: diag.services.error,
    servicesFirstId: diag.services.firstId,
    providerIdFilter: diag.providerIdFilter ?? '(none)',
    providerIdFilterValid: diag.providerIdFilterValid ? 'yes' : 'no',
    usesMockProviderId: diag.usesMockProviderId ? 'yes' : 'no',
  });
}

export function formatDiagnosticsForUi(diag: SupabaseCatalogDiagnostics): string {
  const lines = [
    `Supabase URL present: ${diag.env.urlPresent ? 'yes' : 'no'}${diag.env.urlHost ? ` (${diag.env.urlHost})` : ''}`,
    `Anon key present: ${diag.env.keyPresent ? 'yes' : 'no'} (${diag.env.keyKind})`,
    `Client created: ${diag.clientCreated ? 'yes' : 'no'}`,
    `providers query count: ${diag.providers.count}${diag.providers.error ? ` — ERROR: ${diag.providers.error}` : ''}`,
    `services query count: ${diag.services.count}${diag.services.error ? ` — ERROR: ${diag.services.error}` : ''}`,
    `provider filter: ${diag.providerIdFilter ?? '(none)'} (valid UUID: ${diag.providerIdFilterValid ? 'yes' : 'no'})`,
    `mock provider-1 in route: ${diag.usesMockProviderId ? 'yes' : 'no'}`,
  ];
  if (diag.providers.firstId) {
    lines.push(`providers first id: ${diag.providers.firstId}`);
  }
  if (diag.services.firstId) {
    lines.push(`services first id: ${diag.services.firstId}`);
  }
  return lines.join('\n');
}
