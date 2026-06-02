import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppCard } from '@/components/AppCard';
import { DataSourceBanner } from '@/components/DataSourceBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/hooks/use-bookings';
import { useServices } from '@/hooks/use-services';
import { getServiceById } from '@/services/bookings';
import { formatSwissDate } from '@/utils/date';

export default function AdminBookingListScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { bookings, loading, reload, usingFallback, error } = useBookings();
  const { services } = useServices();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  }, [reload]);

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Buchungen verwalten" onBack={() => router.replace('/')} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerClassName="pb-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          <DataSourceBanner usingFallback={usingFallback} error={error} />
          {session ? (
            <Text className="text-brand-muted text-sm mb-4" numberOfLines={1}>
              Angemeldet als {session.user.email}
            </Text>
          ) : null}
          <Text className="text-brand-muted mb-4">
            Barber-Bereich: Buchungen verwalten, Status ändern, Maps und WhatsApp.
          </Text>

          {bookings.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center">
                Noch keine Buchungen.
              </Text>
            </AppCard>
          ) : (
            bookings.map((booking) => {
              const service = getServiceById(booking.serviceId, services);
              return (
                <Pressable
                  key={booking.id}
                  onPress={() =>
                    router.push({
                      pathname: '/admin/[id]',
                      params: { id: booking.id },
                    })
                  }
                  className="mb-3 active:opacity-90"
                >
                  <AppCard>
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-brand-text font-semibold text-base flex-1">
                        {booking.customerName}
                      </Text>
                      <StatusBadge status={booking.status} />
                    </View>
                    <Text className="text-brand-muted text-sm">
                      {service?.name ?? 'Service'} · {formatSwissDate(booking.appointmentDate)} ·{' '}
                      {booking.appointmentTime}
                    </Text>
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
