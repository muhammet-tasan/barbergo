import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppButton, ButtonGroup } from '@/components/AppButton';
import { BookingConfirmSummaryCard } from '@/components/BookingSummaryCard';
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
import { getBookingDisplayDateTime } from '@/utils/booking-display';

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { bookingId, serviceName: serviceNameParam } = useLocalSearchParams<{
    bookingId: string;
    serviceName?: string;
  }>();
  const { profile } = useAuth();
  const { booking, loading: bookingLoading } = useBooking(bookingId);
  const { provider, loading: providerLoading } = useProvider(booking?.providerId);
  const { services, loading: servicesLoading } = useServices(provider?.id);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  const serviceName = useMemo(() => {
    if (!booking) return undefined;
    const fromCatalog = getServiceById(booking.serviceId, services);
    return fromCatalog?.name ?? serviceNameParam;
  }, [booking, services, serviceNameParam]);

  const display = booking ? getBookingDisplayDateTime(booking) : null;
  const isConfirmed = booking?.status === 'confirmed';
  const loading = bookingLoading || providerLoading || servicesLoading;
  const bookingsPath = getBookingsListPath(profile);

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

  if (!booking || !serviceName || !provider || !display) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Bestätigung" onBack={() => router.back()} />
        <View className="flex-1 px-6 justify-center bg-brand-dark">
          <Text className="text-brand-text text-center mb-6">Buchung nicht gefunden.</Text>
          <AppButton label="Zurück" variant="secondary" onPress={() => router.back()} />
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
      <ScreenHeader title="Bestätigung" onBack={() => router.back()} />
      <ScrollView
        className="flex-1 bg-brand-dark"
        contentContainerClassName="px-4 pt-4 pb-8"
      >
        <View className="items-center mb-8">
          <Ionicons name="checkmark-circle" size={56} color={colors.accent} />
          <Text className="text-xl font-bold text-brand-text text-center mt-3">
            {isConfirmed ? 'Termin bestätigt' : 'Anfrage gesendet'}
          </Text>
          <Text className="text-brand-muted text-center mt-2 px-4 leading-5">
            {isConfirmed
              ? 'Dein Termin ist gebucht. Du findest ihn unter „Meine Termine“.'
              : 'Dein Termin wurde angefragt und wartet auf Bestätigung.'}
          </Text>
        </View>

        <SectionHeader title="Buchungsübersicht" />
        <BookingConfirmSummaryCard
          className="mb-10"
          serviceName={serviceName}
          appointmentDate={display.dateIso}
          appointmentTime={display.time}
          address={booking.address}
          totalChf={booking.totalChf}
          status={booking.status}
        />

        <ButtonGroup className="gap-6 mt-2" spaced={false}>
          <AppButton
            label="Meine Termine ansehen"
            onPress={() => router.push(bookingsPath)}
          />
          <AppButton
            label="Frage per WhatsApp"
            variant="secondary"
            onPress={handleWhatsApp}
            loading={whatsappLoading}
          />
        </ButtonGroup>
      </ScrollView>
    </SafeAreaView>
  );
}
