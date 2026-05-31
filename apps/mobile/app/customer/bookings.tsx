import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useServices } from '@/hooks/use-services';
import { getServiceById, listLocalGuestBookings } from '@/services/bookings';
import type { Booking } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

export default function CustomerBookingsScreen() {
  const router = useRouter();
  const { loading: authLoading, isCustomer, session } = useAuth();
  const { services } = useServices();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const local = await listLocalGuestBookings();
    setBookings(local);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!isCustomer) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Meine Termine" onBack={() => router.replace('/')} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          <Text className="text-slate-400 mb-4">
            Angemeldet als {session?.user.email}. Buchungen von diesem Gerät und künftig alle
            Konto-Buchungen — Cloud-Sync folgt in Phase 2.
          </Text>

          {bookings.length === 0 ? (
            <AppCard>
              <Text className="text-slate-300 text-center mb-4">
                Noch keine Termine auf diesem Gerät.
              </Text>
              <AppButton label="Termin buchen" onPress={() => router.push('/barber')} />
            </AppCard>
          ) : (
            bookings.map((booking) => {
              const service = getServiceById(booking.serviceId, services);
              return (
                <Pressable
                  key={booking.id}
                  onPress={() =>
                    router.push({
                      pathname: '/barber/confirm',
                      params: {
                        bookingId: booking.id,
                        serviceName: service?.name ?? 'Service',
                      },
                    })
                  }
                  className="mb-3 active:opacity-90"
                >
                  <AppCard>
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-white font-semibold text-base flex-1">
                        {service?.name ?? 'Service'}
                      </Text>
                      <StatusBadge status={booking.status} />
                    </View>
                    <Text className="text-slate-400 text-sm">
                      {formatSwissDate(booking.appointmentDate)} · {booking.appointmentTime}
                    </Text>
                    <Text className="text-slate-400 text-sm mt-1">{booking.address}</Text>
                    <Text className="text-brand-gold font-medium mt-2">
                      {formatChf(booking.totalChf)}
                    </Text>
                  </AppCard>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
