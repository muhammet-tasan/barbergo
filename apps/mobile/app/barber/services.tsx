import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { SupabaseCatalogDebugPanel } from '@/components/SupabaseCatalogDebugPanel';
import { colors } from '@/constants/theme';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';
import { isValidUuid } from '@/utils/uuid';
import { resolveCatalogDisplayError } from '@/utils/catalog-error-display';

export default function ServiceSelectionScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { provider, loading: providerLoading, error: providerError } = useProvider();
  const providerIdForServices =
    provider && isValidUuid(provider.id) ? provider.id : undefined;
  const { services, loading: servicesLoading, error: servicesError } =
    useServices(providerIdForServices);

  const loading = providerLoading || servicesLoading;
  const catalogError = resolveCatalogDisplayError(provider, providerError, servicesError);

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Service auswählen" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          <SupabaseCatalogDebugPanel
            providerIdFilter={providerIdForServices}
            loadedProviderId={provider?.id}
          />

          {catalogError ? (
            <View className="mb-4 rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3">
              <Text className="text-red-200 font-semibold">Supabase-Daten fehlen</Text>
              <Text className="text-red-100/90 text-sm mt-1">{catalogError}</Text>
            </View>
          ) : null}

          <Text className="text-slate-400 mb-4">
            Alle Preise in CHF. +CHF 1 Servicegebühr beim Buchen.
          </Text>

          {!catalogError && services.length === 0 ? (
            <Text className="text-slate-300 text-center">Keine Services verfügbar.</Text>
          ) : !catalogError ? (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedId === service.id}
                onPress={() => setSelectedId(service.id)}
              />
            ))
          ) : null}

          <View className="mt-4">
            <AppButton
              label="Weiter zur Buchung"
              disabled={!selectedId || !!catalogError}
              onPress={() =>
                router.push({
                  pathname: '/barber/book',
                  params: { serviceId: selectedId! },
                })
              }
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
