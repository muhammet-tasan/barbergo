import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppButton, ButtonGroup } from '@/components/AppButton';
import { BookingConfirmSummaryCard } from '@/components/BookingSummaryCard';
import { DataSourceBanner } from '@/components/DataSourceBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getBookingsListPath } from '@/services/auth-roles';
import { useBooking } from '@/hooks/use-booking';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';
import { getServiceById } from '@/services/bookings';
import { openBarberWhatsAppBooking } from '@/services/whatsapp';

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { bookingId, serviceName: serviceNameParam } = useLocalSearchParams<{
    bookingId: string;
    serviceName?: string;
  }>();
  const { session } = useAuth();
  const { booking, loading: bookingLoading, usingFallback, error } = useBooking(bookingId);
  const { provider, loading: providerLoading } = useProvider(booking?.providerId);
  const { services, loading: servicesLoading } = useServices(provider?.id);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  const serviceName = useMemo(() => {
    if (!booking) return undefined;
    const fromCatalog = getServiceById(booking.serviceId, services);
    return fromCatalog?.name ?? serviceNameParam;
  }, [booking, services, serviceNameParam]);

  const loading = bookingLoading || providerLoading || servicesLoading;
  const bookingsPath = getBookingsListPath(session);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Bestätigung" />
        <View className="flex-1 items-center justify-center bg-brand-dark">
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking || !serviceName || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Bestätigung" onBack={() => router.replace('/')} />
        <View className="flex-1 px-6 justify-center bg-brand-dark">
          <Text className="text-brand-text text-center mb-6">Buchung nicht gefunden.</Text>
          <AppButton label="Zur Startseite" variant="tertiary" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleWhatsApp = async () => {
    setWhatsappLoading(true);
    try {
      const ok = await openBarberWhatsAppBooking(booking, serviceName, provider.name);
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
      <ScreenHeader title="Bestätigung" onBack={() => router.push(bookingsPath)} />
      <ScrollView
        className="flex-1 bg-brand-dark"
        contentContainerClassName="px-4 pt-4 pb-8"
      >
        <DataSourceBanner usingFallback={usingFallback} error={error} />

        <View className="items-center mb-6">
          <Ionicons name="checkmark-circle" size={56} color={colors.accent} />
          <Text className="text-xl font-bold text-brand-text text-center mt-3">Anfrage gesendet</Text>
          <Text className="text-brand-muted text-center mt-2 px-4 leading-5">
            Dein Termin wurde angefragt. Sende die Anfrage per WhatsApp, damit der Barber sie
            bestätigen kann.
          </Text>
        </View>

        <SectionHeader title="Buchungsübersicht" />
        <BookingConfirmSummaryCard
          className="mb-2"
          serviceName={serviceName}
          appointmentDate={booking.appointmentDate}
          appointmentTime={booking.appointmentTime}
          address={booking.address}
          totalChf={booking.totalChf}
          status={booking.status}
        />

        <ButtonGroup>
          <AppButton
            label="Per WhatsApp senden"
            onPress={handleWhatsApp}
            loading={whatsappLoading}
          />
          <AppButton
            label="Meine Termine ansehen"
            variant="secondary"
            onPress={() => router.push(bookingsPath)}
          />
          <AppButton
            label="Zur Startseite"
            variant="tertiary"
            onPress={() => router.push('/')}
          />
        </ButtonGroup>
      </ScrollView>
    </SafeAreaView>
  );
}
