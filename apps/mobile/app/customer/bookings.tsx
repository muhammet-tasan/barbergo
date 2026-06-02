import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DataSourceBanner } from '@/components/DataSourceBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useServices } from '@/hooks/use-services';
import {
  cancelBookingBlockedReason,
  cancelCustomerBooking,
  canCancelBooking,
  getServiceById,
  listCustomerBookings,
  listLocalGuestBookings,
} from '@/services/bookings';
import type { Booking } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

function BookingCard({
  booking,
  serviceName,
  onOpen,
  onCancel,
  cancelling,
}: {
  booking: Booking;
  serviceName: string;
  onOpen: () => void;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const cancelAllowed = canCancelBooking(booking);

  return (
    <AppCard className="mb-3">
      <Pressable onPress={onOpen} className="active:opacity-90">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-brand-text font-semibold text-base flex-1">{serviceName}</Text>
          <StatusBadge status={booking.status} />
        </View>
        <Text className="text-brand-muted text-sm">
          {formatSwissDate(booking.appointmentDate)} · {booking.appointmentTime}
        </Text>
        <Text className="text-brand-muted text-sm mt-1">{booking.address}</Text>
        <Text className="text-brand-gold font-medium mt-2">{formatChf(booking.totalChf)}</Text>
      </Pressable>
      {booking.status === 'pending' || booking.status === 'confirmed' ? (
        <View className="mt-3 pt-3 border-t border-brand-border">
          <AppButton
            label="Termin stornieren"
            variant="secondary"
            onPress={onCancel}
            loading={cancelling}
            disabled={!cancelAllowed}
          />
          {!cancelAllowed ? (
            <Text className="text-brand-muted text-xs mt-2">{cancelBookingBlockedReason(booking)}</Text>
          ) : null}
        </View>
      ) : null}
    </AppCard>
  );
}

export default function CustomerBookingsScreen() {
  const router = useRouter();
  const { loading: authLoading, isCustomer } = useAuth();
  const { services } = useServices();
  const [accountBookings, setAccountBookings] = useState<Booking[]>([]);
  const [deviceBookings, setDeviceBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [customerResult, local] = await Promise.all([
      listCustomerBookings(),
      listLocalGuestBookings(),
    ]);
    setAccountBookings(customerResult.bookings);
    setDeviceBookings(local.filter((booking) => !booking.customerId));
    setUsingFallback(customerResult.source === 'mock');
    setError(customerResult.error);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const handleCancel = (booking: Booking) => {
    const blocked = cancelBookingBlockedReason(booking);
    if (blocked) {
      Alert.alert('Storno nicht möglich', blocked);
      return;
    }

    Alert.alert(
      'Termin stornieren',
      `Möchtest du den Termin am ${formatSwissDate(booking.appointmentDate)} wirklich stornieren?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Stornieren',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              const result = await cancelCustomerBooking(booking.id);
              if (result.error || !result.booking) {
                Alert.alert('Fehler', result.error ?? 'Storno fehlgeschlagen.');
                return;
              }
              await reload();
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

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

  const hasAny = accountBookings.length > 0 || deviceBookings.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Meine Termine" onBack={() => router.replace('/')} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          <DataSourceBanner usingFallback={usingFallback} error={error} />

          {!hasAny ? (
            <AppCard>
              <Text className="text-brand-muted text-center mb-4">Noch keine Termine.</Text>
              <AppButton label="Termin buchen" onPress={() => router.push('/barbers')} />
            </AppCard>
          ) : null}

          {accountBookings.length > 0 ? (
            <>
              <Text className="text-brand-text font-semibold mb-3">Dein Konto</Text>
              {accountBookings.map((booking) => {
                const service = getServiceById(booking.serviceId, services);
                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    serviceName={service?.name ?? 'Service'}
                    cancelling={cancellingId === booking.id}
                    onOpen={() =>
                      router.push({
                        pathname: '/barber/confirm',
                        params: { bookingId: booking.id, serviceName: service?.name ?? 'Service' },
                      })
                    }
                    onCancel={() => handleCancel(booking)}
                  />
                );
              })}
            </>
          ) : null}

          {deviceBookings.length > 0 ? (
            <>
              <Text className="text-brand-text font-semibold mb-3 mt-4">Von diesem Gerät (Gast)</Text>
              <Text className="text-brand-muted text-xs mb-3">
                Gastbuchungen ohne Konto — nur auf diesem Gerät sichtbar.
              </Text>
              {deviceBookings.map((booking) => {
                const service = getServiceById(booking.serviceId, services);
                return (
                  <BookingCard
                    key={`local-${booking.id}`}
                    booking={booking}
                    serviceName={service?.name ?? 'Service'}
                    cancelling={cancellingId === booking.id}
                    onOpen={() =>
                      router.push({
                        pathname: '/barber/confirm',
                        params: { bookingId: booking.id, serviceName: service?.name ?? 'Service' },
                      })
                    }
                    onCancel={() => handleCancel(booking)}
                  />
                );
              })}
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
