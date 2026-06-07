import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';

import { AdminBookingTabs, type AdminBookingFilter } from '@/components/AdminBookingTabs';
import { AppCard } from '@/components/AppCard';
import { DataSourceBanner } from '@/components/DataSourceBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { useBookings } from '@/hooks/use-bookings';
import { useServices } from '@/hooks/use-services';
import { getServiceById } from '@/services/bookings';
import { formatSwissDate } from '@/utils/date';

export default function AdminBookingListScreen() {
  const router = useRouter();
  const { bookings, loading, reload, usingFallback, error } = useBookings();
  const { services } = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<AdminBookingFilter>('pending');

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

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Buchungen verwalten" onBack={() => router.push('/')} />
      {loading ? (
        <View className="flex-1 items-center justify-center bg-brand-dark">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-brand-dark"
          contentContainerClassName="px-4 pt-4 pb-8"
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
          <AdminBookingTabs active={filter} onChange={setFilter} />

          {filteredBookings.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center">Keine Buchungen in dieser Kategorie.</Text>
            </AppCard>
          ) : (
            filteredBookings.map((booking) => {
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
                    <View className="flex-row justify-between items-start mb-3">
                      <Text className="text-brand-text font-semibold text-base flex-1 pr-2">
                        {booking.customerName}
                      </Text>
                      <StatusBadge status={booking.status} />
                    </View>

                    <View className="flex-row items-center mb-1.5">
                      <Ionicons name="cut-outline" size={14} color={colors.textMuted} />
                      <Text className="text-brand-muted text-sm ml-2">
                        {service?.name ?? 'Service'}
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                      <Text className="text-brand-muted text-sm ml-2">
                        {formatSwissDate(booking.appointmentDate)} · {booking.appointmentTime}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center pt-3 border-t border-brand-border/80">
                      <Text className="text-brand-gold font-semibold text-base">
                        {formatChf(booking.totalChf)}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-brand-muted text-sm font-medium">Details</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                      </View>
                    </View>
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
