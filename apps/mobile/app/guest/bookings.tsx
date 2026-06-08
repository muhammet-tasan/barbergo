import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { BookingListCard } from '@/components/BookingListCard';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getPostLoginPath } from '@/services/auth-roles';
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
  const { loading: authLoading, isAuthenticated, profile } = useAuth();
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

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={getPostLoginPath(profile) as Href} />;
  }

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
            Termine von diesem Gerät. Mit einem Konto kannst du sie auf allen Geräten verwalten.
          </Text>

          <SectionHeader title="Konto" />
          <AppButton
            label="Konto erstellen"
            onPress={() => router.push('/register')}
          />

          {bookings.length === 0 ? (
            <EmptyState
              title="Noch keine Termine"
              actionLabel="Termin buchen"
              onAction={() => router.push('/barbers')}
            />
          ) : (
            <>
              <SectionHeader title="Anstehende Termine" spaced />
              {bookings.map((booking) => {
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
            })}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
