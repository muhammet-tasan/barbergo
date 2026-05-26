import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  formatDiagnosticsForUi,
  logSupabaseCatalogDiagnostics,
  runSupabaseCatalogDiagnostics,
  type SupabaseCatalogDiagnostics,
} from '@/services/supabase-catalog-debug';
import { isMockCatalogId, isValidUuid } from '@/utils/uuid';

type SupabaseCatalogDebugPanelProps = {
  providerIdFilter?: string;
  loadedProviderId?: string | null;
};

export function SupabaseCatalogDebugPanel({
  providerIdFilter,
  loadedProviderId,
}: SupabaseCatalogDebugPanelProps) {
  const [diag, setDiag] = useState<SupabaseCatalogDiagnostics | null>(null);

  useEffect(() => {
    if (!__DEV__) return;
    let cancelled = false;
    (async () => {
      const result = await runSupabaseCatalogDiagnostics(providerIdFilter);
      if (cancelled) return;
      logSupabaseCatalogDiagnostics(result);
      setDiag(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [providerIdFilter]);

  if (!__DEV__) {
    return null;
  }

  if (!diag) {
    return (
      <View className="mb-4 rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2">
        <Text className="text-slate-400 text-xs font-mono">Supabase debug: loading…</Text>
      </View>
    );
  }

  const loadedValid = loadedProviderId
    ? isMockCatalogId(loadedProviderId)
      ? 'no (demo id)'
      : isValidUuid(loadedProviderId)
        ? 'yes (UUID)'
        : 'no (invalid shape)'
    : 'none';

  return (
    <View className="mb-4 rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2">
      <Text className="text-slate-300 text-xs font-semibold mb-1">Supabase debug</Text>
      <Text className="text-slate-400 text-xs font-mono leading-5">
        {formatDiagnosticsForUi(diag)}
        {'\n'}
        loaded provider id: {loadedValid}
      </Text>
    </View>
  );
}
