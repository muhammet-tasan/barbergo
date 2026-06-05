import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ProviderMiniHeader } from '@/components/ProviderMiniHeader';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { colors } from '@/constants/theme';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';
import { isValidUuid } from '@/utils/uuid';
import { resolveCatalogDisplayError } from '@/utils/catalog-error-display';

export default function ServiceSelectionScreen() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams<{ providerId?: string }>();
  const { provider, loading: providerLoading, error: providerError } = useProvider(providerId);
  const providerIdForServices =
    provider && isValidUuid(provider.id) ? provider.id : undefined;
  const { services, loading: servicesLoading, error: servicesError } =
    useServices(providerIdForServices);

  const loading = providerLoading || servicesLoading;
  const catalogError = resolveCatalogDisplayError(provider, providerError, servicesError);

  const goToProfile = () => {
    if (!provider) return;
    router.push({
      pathname: '/barber',
      params: { providerId: provider.id },
    });
  };

  const goToBooking = (serviceId: string) => {
    if (!provider) return;
    router.push({
      pathname: '/barber/book',
      params: { providerId: provider.id, serviceId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Service auswählen" />
      {loading ? (
        <View className="flex-1 items-center justify-center bg-brand-dark">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-brand-dark"
          contentContainerClassName="px-4 pt-4 pb-8"
        >
          {provider ? (
            <ProviderMiniHeader provider={provider} onViewProfile={goToProfile} />
          ) : null}

          {catalogError ? (
            <View className="mb-4 rounded-xl border border-error/60 bg-error/10 px-4 py-3">
              <Text className="text-error font-semibold">Daten nicht verfügbar</Text>
              <Text className="text-error/90 text-sm mt-1">{catalogError}</Text>
            </View>
          ) : null}

          <Text className="text-brand-muted text-sm mb-4">
            Alle Preise in CHF, inkl. MwSt.
          </Text>

          {!catalogError && services.length === 0 ? (
            <Text className="text-brand-muted text-center">Keine Services verfügbar.</Text>
          ) : !catalogError ? (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => goToBooking(service.id)}
              />
            ))
          ) : null}

          <View className="mt-2" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
