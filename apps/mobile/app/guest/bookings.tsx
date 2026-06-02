import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { useServices } from '@/hooks/use-services';
import {
  cancelBookingBlockedReason,
  cancelGuestBooking,
  canCancelBooking,
  getServiceById,
  listLocalGuestBookings,
} from '@/services/bookings';
import type { Booking } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';
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
          <Text className="text-brand-muted mb-4">
            Gastbuchungen von diesem Gerät. Für alle Geräte und Storno: Konto unter „Anmelden“ in
            der Kopfzeile erstellen.
          </Text>

          {bookings.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center mb-4">Noch keine Termine auf diesem Gerät.</Text>
              <AppButton label="Termin buchen" onPress={() => router.push('/barbers')} />
            </AppCard>
          ) : (
            bookings.map((booking) => {
              const service = getServiceById(booking.serviceId, services);
              const cancelAllowed = canCancelBooking(booking);
              return (
                <AppCard key={booking.id} className="mb-3">
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/barber/confirm',
                        params: {
                          bookingId: booking.id,
                          serviceName: service?.name ?? 'Service',
                        },
                      })
                    }
                    className="active:opacity-90"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-brand-text font-semibold text-base flex-1">
                        {service?.name ?? 'Service'}
                      </Text>
                      <StatusBadge status={booking.status} />
                    </View>
                    <Text className="text-brand-muted text-sm">
                      {formatSwissDate(booking.appointmentDate)} · {booking.appointmentTime}
                    </Text>
                    <Text className="text-brand-gold font-medium mt-2">{formatChf(booking.totalChf)}</Text>
                  </Pressable>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <View className="mt-3 pt-3 border-t border-brand-border">
                      <AppButton
                        label="Termin stornieren"
                        variant="secondary"
                        loading={cancellingId === booking.id}
                        disabled={!cancelAllowed}
                        onPress={() => handleCancel(booking)}
                      />
                      {!cancelAllowed ? (
                        <Text className="text-brand-muted text-xs mt-2">
                          {cancelBookingBlockedReason(booking)}
                        </Text>
                      ) : null}
                    </View>
                  )}
                </AppCard>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
