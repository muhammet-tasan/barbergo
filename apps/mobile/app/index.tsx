import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import { HomeHero } from '@/components/HomeHero';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/auth-context';
import { getBookingsListPath } from '@/services/auth-roles';

function resolveHomeVariant(
  loading: boolean,
  isAdmin: boolean,
  isBarber: boolean,
  isBarberPending: boolean,
  isCustomer: boolean
): 'guest' | 'customer' | 'barber' | 'barber_pending' | 'admin' {
  if (loading) return 'guest';
  if (isAdmin) return 'admin';
  if (isBarberPending) return 'barber_pending';
  if (isBarber) return 'barber';
  if (isCustomer) return 'customer';
  return 'guest';
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    loading,
    isAdmin,
    isBarber,
    isBarberPending,
    isCustomer,
    profile,
  } = useAuth();

  const variant = resolveHomeVariant(
    loading,
    isAdmin,
    isBarber,
    isBarberPending,
    isCustomer
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader variant="home" />

      <View className="flex-1 bg-brand-dark">
        <HomeHero
          loading={loading}
          variant={variant}
          onBook={() => router.push('/barbers')}
          onBookings={() => {
            if (isCustomer) {
              router.push('/customer/bookings' as Href);
              return;
            }
            router.push(getBookingsListPath(profile));
          }}
          onProfile={() => {
            if (isAdmin) {
              router.push('/admin/profile' as Href);
              return;
            }
            if (isCustomer) {
              router.push('/customer/profile' as Href);
              return;
            }
            if (isBarber) {
              router.push('/barber/dashboard/profile' as Href);
            }
          }}
          onAdminPage={() => router.push('/admin')}
          onAllBarbers={() => router.push('/admin/barbers' as Href)}
          onAllBookings={() => router.push('/admin/barbers' as Href)}
          onBarberSlots={() => router.push('/barber/dashboard/slots' as Href)}
        />
      </View>
    </SafeAreaView>
  );
}
