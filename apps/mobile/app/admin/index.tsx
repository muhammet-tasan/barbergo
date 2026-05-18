import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { services } from '@/data/mockData';
import { listBookings, getServiceById } from '@/services/bookings';

export default function AdminBookingListScreen() {
  const router = useRouter();
  const bookings = listBookings();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Admin — bookings" onBack={() => router.replace('/')} />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <Text className="text-slate-400 mb-4">
          Demo view for the barber. Tap a booking for details, Maps, and WhatsApp.
        </Text>

        {bookings.length === 0 ? (
          <AppCard>
            <Text className="text-slate-300 text-center">
              No bookings yet. Create one via Book appointment on the home screen.
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
                    {service?.name ?? 'Service'} · {booking.appointmentDate} ·{' '}
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
    </SafeAreaView>
  );
}
