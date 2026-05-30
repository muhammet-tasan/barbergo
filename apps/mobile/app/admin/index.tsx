import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
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
  const { session, signOut } = useAuth();
  const { bookings, loading, reload, usingFallback, error } = useBookings();
  const { services } = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) {
        Alert.alert('Fehler', result.error);
        return;
      }
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Admin - Buchungen" onBack={() => router.replace('/')} />
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
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-400 text-sm flex-1 mr-2" numberOfLines={1}>
                Angemeldet als {session.user.email}
              </Text>
              <Pressable onPress={handleSignOut} disabled={signingOut}>
                <Text className="text-brand-gold text-sm font-medium">
                  {signingOut ? '…' : 'Abmelden'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/admin/login')} className="mb-4">
              <Text className="text-brand-gold text-sm">Als Barber anmelden</Text>
            </Pressable>
          )}
          <Text className="text-slate-400 mb-4">
            Demo-Ansicht für den Barber. Tippe auf eine Buchung für Details, Maps und WhatsApp.
          </Text>

          {bookings.length === 0 ? (
            <AppCard>
              <Text className="text-slate-300 text-center">
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
                      <Text className="text-white font-semibold text-base flex-1">
                        {booking.customerName}
                      </Text>
                      <StatusBadge status={booking.status} />
                    </View>
                    <Text className="text-slate-400 text-sm">
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
