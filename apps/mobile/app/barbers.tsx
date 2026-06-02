import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DataSourceBanner } from '@/components/DataSourceBanner';
import { ProviderCard } from '@/components/ProviderCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useProviders } from '@/hooks/use-providers';

export default function BarberSelectionScreen() {
  const router = useRouter();
  const { providers, loading, usingFallback, error } = useProviders();

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
              <ProviderCard
                key={provider.id}
                provider={provider}
                onPress={() => router.push('/barber')}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
