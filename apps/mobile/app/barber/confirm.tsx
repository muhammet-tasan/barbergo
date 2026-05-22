import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { useBooking } from '@/hooks/use-booking';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';
import { getServiceById } from '@/services/bookings';
import { openBarberWhatsAppBooking } from '@/services/whatsapp';
import { formatSwissDate } from '@/utils/date';

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
  const { booking, loading: bookingLoading } = useBooking(bookingId);
  const { provider, loading: providerLoading } = useProvider();
  const { services, loading: servicesLoading } = useServices(provider?.id);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  const service = useMemo(
    () => (booking ? getServiceById(booking.serviceId, services) : undefined),
    [booking, services]
  );

  const loading = bookingLoading || providerLoading || servicesLoading;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!booking || !service || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Bestätigung" showBack={false} />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-center mb-6">Buchung nicht gefunden.</Text>
          <AppButton label="Zur Startseite" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleWhatsApp = async () => {
    setWhatsappLoading(true);
    try {
      const ok = await openBarberWhatsAppBooking(booking, service.name, provider.name);
      if (!ok) {
        Alert.alert(
          'WhatsApp',
          'WhatsApp konnte nicht geöffnet werden. Bitte installiere die App oder prüfe den Link.'
        );
      }
    } finally {
      setWhatsappLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Buchung bestätigt" showBack={false} />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <View className="items-center mb-6">
          <Text className="text-3xl mb-2">✓</Text>
          <Text className="text-xl font-bold text-white text-center">Anfrage gesendet</Text>
          <Text className="text-slate-400 text-center mt-2 px-4">
            Dein Termin ist angefragt. Schreibe {provider.name} auf WhatsApp, damit er schneller
            bestätigen kann.
          </Text>
          <View className="mt-3">
            <StatusBadge status={booking.status} />
          </View>
        </View>

        <AppCard className="mb-6">
          <DetailRow label="Service" value={service.name} />
          <DetailRow label="Datum" value={formatSwissDate(booking.appointmentDate)} />
          <DetailRow label="Uhrzeit" value={booking.appointmentTime} />
          <DetailRow label="Adresse" value={booking.address} />
          <DetailRow label="Gesamt" value={formatChf(booking.totalChf)} />
        </AppCard>

        <View className="gap-3">
          <AppButton
            label="Per WhatsApp senden"
            onPress={handleWhatsApp}
            loading={whatsappLoading}
          />
          <AppButton label="Fertig" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
