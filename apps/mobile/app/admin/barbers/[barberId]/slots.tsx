import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ProviderSlotCalendar } from '@/components/ProviderSlotCalendar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { fetchProfileById } from '@/services/profiles';
import { resolveBarberProviderId } from '@/services/schedule';

export default function AdminBarberSlotsScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { barberId, barberName } = useLocalSearchParams<{
    barberId: string;
    barberName?: string;
  }>();
  const [providerId, setProviderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!barberId) return;
    void (async () => {
      setLoading(true);
      const profile = await fetchProfileById(barberId);
      if (!profile?.providerId) {
        setProviderId(null);
        setUnavailable(true);
      } else {
        setProviderId(resolveBarberProviderId(profile.providerId));
        setUnavailable(false);
      }
      setLoading(false);
    })();
  }, [barberId]);

  if (!isAdmin) return <Redirect href="/" />;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (unavailable || !providerId) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader
          title={barberName ?? 'Barber'}
          subtitle="Buchungen"
          onBack={() => router.back()}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-brand-muted text-center leading-6">
            Der Terminkalender ist nach der Freigabe verfügbar.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ProviderSlotCalendar
        providerId={providerId}
        title={barberName ?? 'Barber'}
        subtitle="Buchungen"
        onBack={() => router.back()}
        bookingDetailPath="/admin/[id]"
      />
    </SafeAreaView>
  );
}
