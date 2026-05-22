import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { colors } from '@/constants/theme';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';

export default function ServiceSelectionScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { provider, loading: providerLoading } = useProvider();
  const { services, loading: servicesLoading } = useServices(provider?.id);

  const loading = providerLoading || servicesLoading;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Service auswählen" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          <Text className="text-slate-400 mb-4">
            Alle Preise in CHF. +CHF 1 Servicegebühr beim Buchen.
          </Text>

          {services.length === 0 ? (
            <Text className="text-slate-300 text-center">Keine Services verfügbar.</Text>
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedId === service.id}
                onPress={() => setSelectedId(service.id)}
              />
            ))
          )}

          <View className="mt-4">
            <AppButton
              label="Weiter zur Buchung"
              disabled={!selectedId}
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
