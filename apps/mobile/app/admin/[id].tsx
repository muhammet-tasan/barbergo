import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { ActionSection } from '@/components/ActionSection';
import { AppButton } from '@/components/AppButton';
import { BookingSummaryCard } from '@/components/BookingSummaryCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusTransitionActions } from '@/components/StatusTransitionActions';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useBooking } from '@/hooks/use-booking';
import { useServices } from '@/hooks/use-services';
import { getServiceById, updateBookingStatus } from '@/services/bookings';
import { openAddressInMaps } from '@/services/maps';
import { openCustomerWhatsApp } from '@/services/whatsapp';
import type { BookingStatus } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

export default function AdminBookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading: sessionLoading } = useAuth();
  const { booking, loading, setBooking } = useBooking(id);
  const { services, loading: servicesLoading } = useServices();
  const service = useMemo(
    () => (booking ? getServiceById(booking.serviceId, services) : undefined),
    [booking, services]
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  if (sessionLoading || loading || servicesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Buchungsdetails" />
        <View className="flex-1 items-center justify-center bg-brand-dark">
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Buchungsdetails" />
        <View className="flex-1 px-6 justify-center bg-brand-dark">
          <Text className="text-brand-text text-center mb-4">Bitte zuerst anmelden.</Text>
          <AppButton label="Zum Login" onPress={() => router.replace('/login')} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Buchung" />
        <View className="flex-1 px-6 justify-center bg-brand-dark">
          <Text className="text-brand-text text-center mb-6">Buchung nicht gefunden.</Text>
          <AppButton label="Zur Liste" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const setStatus = async (status: BookingStatus) => {
    setStatusLoading(true);
    try {
      const result = await updateBookingStatus(booking.id, status);
      if (!result.booking) {
        Alert.alert('Fehler', result.error ?? 'Status konnte nicht aktualisiert werden.');
        return;
      }
      if (result.source === 'mock' && result.error) {
        console.warn('[barbergo] updateBookingStatus offline:', result.error);
      }
      setBooking(result.booking);
    } finally {
      setStatusLoading(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert(
      'Buchung stornieren',
      `Möchtest du die Buchung von ${booking.customerName} wirklich stornieren?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Stornieren', style: 'destructive', onPress: () => setStatus('cancelled') },
      ]
    );
  };

  const runAction = async (key: string, fn: () => Promise<boolean>, errorMsg: string) => {
    setActionLoading(key);
    try {
      const ok = await fn();
      if (!ok) Alert.alert('Fehler', errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const customerMessage = [
    `Hallo ${booking.customerName},`,
    '',
    `Dein barbergo Termin (${service?.name ?? 'Service'}) am ${formatSwissDate(booking.appointmentDate)} um ${booking.appointmentTime}.`,
    '',
    `Adresse: ${booking.address}`,
    `Gesamt: ${formatChf(booking.totalChf)}`,
  ].join('\n');

  const summaryRows = [
    { label: 'Kunde', value: booking.customerName },
    { label: 'Telefon', value: booking.phone },
    { label: 'Service', value: service?.name ?? '—' },
    {
      label: 'Wann',
      value: `${formatSwissDate(booking.appointmentDate)} · ${booking.appointmentTime}`,
    },
    { label: 'Adresse', value: booking.address },
    ...(booking.note ? [{ label: 'Notiz', value: booking.note }] : []),
    { label: 'Gesamt', value: formatChf(booking.totalChf), highlight: true },
  ];

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Buchungsdetails" />
      <ScrollView
        className="flex-1 bg-brand-dark"
        contentContainerClassName="px-4 pt-4 pb-8"
      >
        <SectionHeader title="Buchungsübersicht" />
        <BookingSummaryCard className="mb-2" rows={summaryRows} status={booking.status} />

        <ActionSection title="Kontakt & Navigation" className="mb-2">
          <AppButton
            label="Kunde per WhatsApp anschreiben"
            variant="secondary"
            loading={actionLoading === 'whatsapp'}
            onPress={() =>
              runAction(
                'whatsapp',
                () => openCustomerWhatsApp(booking.phone, customerMessage),
                'WhatsApp konnte nicht geöffnet werden.'
              )
            }
          />
          <AppButton
            label="Adresse in Maps öffnen"
            variant="secondary"
            loading={actionLoading === 'maps'}
            onPress={() =>
              runAction('maps', () => openAddressInMaps(booking.address), 'Maps konnte nicht geöffnet werden.')
            }
          />
        </ActionSection>

        <ActionSection title="Status ändern" className="mb-2">
          <StatusTransitionActions
            currentStatus={booking.status}
            loading={statusLoading}
            onTransition={setStatus}
          />
        </ActionSection>

        {canCancel ? (
          <ActionSection title="Gefährliche Aktion">
            <AppButton
              label="Buchung stornieren"
              variant="danger"
              loading={statusLoading}
              onPress={confirmCancel}
            />
          </ActionSection>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
