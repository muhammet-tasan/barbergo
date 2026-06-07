import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { BookingListCard } from '@/components/BookingListCard';
import { DataSourceBanner } from '@/components/DataSourceBanner';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useServices } from '@/hooks/use-services';
import {
  cancelBookingBlockedReason,
  cancelCustomerBooking,
  getServiceById,
  listCustomerBookings,
  listLocalGuestBookings,
} from '@/services/bookings';
import type { Booking } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

function mergeCustomerBookings(account: Booking[], device: Booking[]): {
  bookings: Booking[];
  hasPreLoginDeviceBookings: boolean;
} {
  const accountIds = new Set(account.map((b) => b.id));
  const deviceOnly = device.filter((b) => !accountIds.has(b.id));
  return {
    bookings: [...account, ...deviceOnly],
    hasPreLoginDeviceBookings: deviceOnly.length > 0,
  };
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

  const { bookings: allBookings, hasPreLoginDeviceBookings } = useMemo(
    () => mergeCustomerBookings(accountBookings, deviceBookings),
    [accountBookings, deviceBookings]
  );

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

  const openBooking = (booking: Booking, serviceName: string) => {
    router.push({
      pathname: '/barber/confirm',
      params: { bookingId: booking.id, serviceName },
    });
  };

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

          <Text className="text-brand-muted mb-4 leading-5">
            Deine Termine auf diesem Konto — auf allen Geräten verfügbar, sobald du angemeldet
            bist.
          </Text>

          {hasPreLoginDeviceBookings ? (
            <Text className="text-brand-muted text-xs mb-4 leading-5">
              Mindestens ein Termin wurde vor der Anmeldung auf diesem Gerät gebucht. Neue
              Buchungen werden automatisch deinem Konto zugeordnet.
            </Text>
          ) : null}

          {allBookings.length === 0 ? (
            <EmptyState
              title="Noch keine Termine"
              actionLabel="Termin buchen"
              onAction={() => router.push('/barbers')}
            />
          ) : (
            <>
              <SectionHeader title="Anstehende Termine" />
              {allBookings.map((booking) => {
              const service = getServiceById(booking.serviceId, services);
              const serviceName = service?.name ?? 'Service';
              return (
                <BookingListCard
                  key={booking.id}
                  booking={booking}
                  serviceName={serviceName}
                  onViewDetails={() => openBooking(booking, serviceName)}
                  onCancel={() => handleCancel(booking)}
                  cancelling={cancellingId === booking.id}
                />
              );
            })}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
