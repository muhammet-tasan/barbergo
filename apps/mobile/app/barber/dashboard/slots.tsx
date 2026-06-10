import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';

import { ProviderSlotCalendar } from '@/components/ProviderSlotCalendar';
import { useAuth } from '@/contexts/auth-context';
import { resolveBarberProviderId } from '@/services/schedule';

export default function BarberSlotsScreen() {
  const router = useRouter();
  const { isBarber, profile } = useAuth();
  const providerId = resolveBarberProviderId(profile?.providerId);

  if (!isBarber) return <Redirect href="/login" />;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ProviderSlotCalendar
        providerId={providerId}
        title="Alle Buchungen"
        onBack={() => router.push('/barber/dashboard')}
        bookingDetailPath="/barber/dashboard/[id]"
      />
    </SafeAreaView>
  );
}
