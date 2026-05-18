import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { services } from '@/data/mockData';
import { getBookingById, getServiceById, updateBookingStatus } from '@/services/bookings';
import { openAddressInMaps } from '@/services/maps';
import { openCustomerWhatsApp } from '@/services/whatsapp';
import type { BookingStatus } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

const bookingStatusText: Record<BookingStatus, string> = {
  pending: 'offen',
  confirmed: 'bestätigt',
  completed: 'abgeschlossen',
  cancelled: 'storniert',
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-2 border-b border-slate-700/80">
      <Text className="text-slate-400 text-sm">{label}</Text>
      <Text className="text-white mt-0.5">{value}</Text>
    </View>
  );
}

export default function AdminBookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const initial = useMemo(() => (id ? getBookingById(id) : undefined), [id]);
  const [booking, setBooking] = useState(initial);
  const service = useMemo(
    () => (booking ? getServiceById(booking.serviceId, services) : undefined),
    [booking]
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Buchung" />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-center mb-6">Buchung nicht gefunden.</Text>
          <AppButton label="Zur Liste" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const setStatus = (status: BookingStatus) => {
    const updated = updateBookingStatus(booking.id, status);
    if (updated) setBooking({ ...updated });
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
    `Dein barbergo Termin (${service?.name ?? 'Service'}) am ${formatSwissDate(booking.appointmentDate)} um ${booking.appointmentTime} ist ${bookingStatusText[booking.status]}.`,
    '',
    `Adresse: ${booking.address}`,
    `Gesamt: ${formatChf(booking.totalChf)}`,
  ].join('\n');

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Buchungsdetails" />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <View className="mb-4">
          <StatusBadge status={booking.status} />
        </View>

        <AppCard className="mb-4">
          <DetailRow label="Kunde" value={booking.customerName} />
          <DetailRow label="Telefon" value={booking.phone} />
          <DetailRow label="Service" value={service?.name ?? '—'} />
          <DetailRow
            label="Wann"
            value={`${formatSwissDate(booking.appointmentDate)} · ${booking.appointmentTime}`}
          />
          <DetailRow label="Adresse" value={booking.address} />
          {booking.note ? <DetailRow label="Notiz" value={booking.note} /> : null}
          <DetailRow label="Gesamt" value={formatChf(booking.totalChf)} />
        </AppCard>

        <Text className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Aktionen</Text>
        <View className="gap-3 mb-6">
          <AppButton
            label="Adresse in Maps öffnen"
            variant="secondary"
            loading={actionLoading === 'maps'}
            onPress={() =>
              runAction('maps', () => openAddressInMaps(booking.address), 'Maps konnte nicht geöffnet werden.')
            }
          />
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
        </View>

        <Text className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Status</Text>
        <View className="gap-2">
          {booking.status === 'pending' ? (
            <AppButton
              label="Als bestätigt markieren"
              onPress={() => setStatus('confirmed')}
            />
          ) : null}
          {booking.status === 'confirmed' ? (
            <AppButton label="Als abgeschlossen markieren" onPress={() => setStatus('completed')} />
          ) : null}
          {booking.status !== 'cancelled' && booking.status !== 'completed' ? (
            <AppButton
              label="Buchung stornieren"
              variant="ghost"
              onPress={() => setStatus('cancelled')}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
