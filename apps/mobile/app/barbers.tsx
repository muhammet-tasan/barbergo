import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { BarberCard } from '@/components/BarberCard';
import { DataSourceBanner } from '@/components/DataSourceBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useProviders } from '@/hooks/use-providers';

export default function BarberSelectionScreen() {
  const router = useRouter();
  const { providers, loading, usingFallback, error } = useProviders();

  const navigateToServices = (providerId: string) => {
    router.push({
      pathname: '/barber/services',
      params: { providerId },
    });
  };

  const navigateToProfile = (providerId: string) => {
    router.push({
      pathname: '/barber',
      params: { providerId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Barber wählen" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          <DataSourceBanner usingFallback={usingFallback} error={error} />

          <Text className="text-brand-muted mb-4">
            Wähle einen Barber für deinen Hausbesuch-Termin.
          </Text>

          {providers.length === 0 ? (
            <Text className="text-brand-muted text-center">Keine Barber verfügbar.</Text>
          ) : (
            providers.map((provider) => (
              <BarberCard
                key={provider.id}
                provider={provider}
                onSelect={() => navigateToServices(provider.id)}
                onViewProfile={() => navigateToProfile(provider.id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
