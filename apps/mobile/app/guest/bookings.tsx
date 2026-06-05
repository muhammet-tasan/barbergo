import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { BookingListCard } from '@/components/BookingListCard';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useServices } from '@/hooks/use-services';
import {
  cancelBookingBlockedReason,
  cancelGuestBooking,
  getServiceById,
  listLocalGuestBookings,
} from '@/services/bookings';
import type { Booking } from '@/types/domain';
import { showUserMessage } from '@/utils/show-message';

export default function GuestBookingsScreen() {
  const router = useRouter();
  const { services } = useServices();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setBookings(await listLocalGuestBookings());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const handleCancel = async (booking: Booking) => {
    const blocked = cancelBookingBlockedReason(booking);
    if (blocked) {
      showUserMessage('Storno nicht möglich', blocked);
      return;
    }

    setCancellingId(booking.id);
    try {
      const result = await cancelGuestBooking(booking.id);
      if (result.error || !result.booking) {
        showUserMessage('Fehler', result.error ?? 'Storno fehlgeschlagen.');
        return;
      }
      await reload();
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Meine Termine" onBack={() => router.replace('/')} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          <Text className="text-brand-muted mb-4 leading-5">
            Du siehst hier deine Buchungen. Mit einem Konto kannst du sie auf allen Geräten
            verwalten.
          </Text>

          <View className="mb-6">
            <AppButton
              label="Konto erstellen"
              variant="secondary"
              onPress={() => router.push('/register')}
            />
          </View>

          {bookings.length === 0 ? (
            <EmptyState
              title="Noch keine Termine"
              actionLabel="Termin buchen"
              onAction={() => router.push('/barbers')}
            />
          ) : (
            bookings.map((booking) => {
              const service = getServiceById(booking.serviceId, services);
              return (
                <BookingListCard
                  key={booking.id}
                  booking={booking}
                  serviceName={service?.name ?? 'Service'}
                  onViewDetails={() =>
                    router.push({
                      pathname: '/barber/confirm',
                      params: {
                        bookingId: booking.id,
                        serviceName: service?.name ?? 'Service',
                      },
                    })
                  }
                  onCancel={() => handleCancel(booking)}
                  cancelling={cancellingId === booking.id}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
