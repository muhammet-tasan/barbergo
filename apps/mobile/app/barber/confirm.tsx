import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { defaultProvider, services } from '@/data/mockData';
import { getBookingById, getServiceById } from '@/services/bookings';
import { openBarberWhatsAppBooking } from '@/services/whatsapp';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-slate-700/80">
      <Text className="text-slate-400">{label}</Text>
      <Text className="text-white font-medium flex-1 text-right ml-4">{value}</Text>
    </View>
  );
}

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useMemo(
    () => (bookingId ? getBookingById(bookingId) : undefined),
    [bookingId]
  );
  const service = useMemo(
    () => (booking ? getServiceById(booking.serviceId, services) : undefined),
    [booking]
  );
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  if (!booking || !service) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Confirmation" showBack={false} />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-center mb-6">Booking not found.</Text>
          <AppButton label="Back to home" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleWhatsApp = async () => {
    setWhatsappLoading(true);
    try {
      const ok = await openBarberWhatsAppBooking(booking, service.name, defaultProvider.name);
      if (!ok) {
        Alert.alert('WhatsApp', 'Could not open WhatsApp. Install the app or check the link.');
      }
    } finally {
      setWhatsappLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Booking confirmed" showBack={false} />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <View className="items-center mb-6">
          <Text className="text-3xl mb-2">✓</Text>
          <Text className="text-xl font-bold text-white text-center">Request sent</Text>
          <Text className="text-slate-400 text-center mt-2 px-4">
            Your appointment is pending. Notify {defaultProvider.name} on WhatsApp to confirm faster.
          </Text>
          <View className="mt-3">
            <StatusBadge status={booking.status} />
          </View>
        </View>

        <AppCard className="mb-6">
          <DetailRow label="Service" value={service.name} />
          <DetailRow label="Date" value={booking.appointmentDate} />
          <DetailRow label="Time" value={booking.appointmentTime} />
          <DetailRow label="Address" value={booking.address} />
          <DetailRow label="Total" value={formatChf(booking.totalChf)} />
        </AppCard>

        <View className="gap-3">
          <AppButton
            label="Send via WhatsApp"
            onPress={handleWhatsApp}
            loading={whatsappLoading}
          />
          <AppButton
            label="Done"
            variant="secondary"
            onPress={() => router.replace('/')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
