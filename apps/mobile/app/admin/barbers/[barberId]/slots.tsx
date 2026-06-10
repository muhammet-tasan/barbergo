import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ProviderSlotCalendar } from '@/components/ProviderSlotCalendar';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { DEMO_PROVIDER_ID, fetchProfileById } from '@/services/profiles';
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
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!barberId) return;
    void (async () => {
      setLoading(true);
      const profile = await fetchProfileById(barberId);
      if (!profile?.providerId) {
        setProviderId(DEMO_PROVIDER_ID);
        setError('Diesem Barber ist kein Provider zugewiesen. Demo-Provider wird angezeigt.');
      } else {
        setProviderId(resolveBarberProviderId(profile.providerId));
        setError(undefined);
      }
      setLoading(false);
    })();
  }, [barberId]);

  if (!isAdmin) return <Redirect href="/" />;

  if (loading || !providerId) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      {error ? (
        <View className="px-4 pt-2">
          <Text className="text-warning text-sm">{error}</Text>
        </View>
      ) : null}
      <ProviderSlotCalendar
        providerId={providerId}
        title={`Buchungen · ${barberName ?? 'Barber'}`}
        onBack={() => router.push('/admin/barbers')}
        bookingDetailPath="/admin/[id]"
      />
    </SafeAreaView>
  );
}
