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
        <ScreenHeader title="Booking" />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-center mb-6">Booking not found.</Text>
          <AppButton label="Back to list" onPress={() => router.back()} />
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
      if (!ok) Alert.alert('Error', errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const customerMessage = [
    `Hi ${booking.customerName},`,
    '',
    `Your barbergo appointment (${service?.name ?? 'service'}) on ${formatSwissDate(booking.appointmentDate)} at ${booking.appointmentTime} is ${booking.status}.`,
    '',
    `Address: ${booking.address}`,
    `Total: ${formatChf(booking.totalChf)}`,
  ].join('\n');

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Booking detail" />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <View className="mb-4">
          <StatusBadge status={booking.status} />
        </View>

        <AppCard className="mb-4">
          <DetailRow label="Customer" value={booking.customerName} />
          <DetailRow label="Phone" value={booking.phone} />
          <DetailRow label="Service" value={service?.name ?? '—'} />
          <DetailRow
            label="When"
            value={`${formatSwissDate(booking.appointmentDate)} · ${booking.appointmentTime}`}
          />
          <DetailRow label="Address" value={booking.address} />
          {booking.note ? <DetailRow label="Note" value={booking.note} /> : null}
          <DetailRow label="Total" value={formatChf(booking.totalChf)} />
        </AppCard>

        <Text className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Actions</Text>
        <View className="gap-3 mb-6">
          <AppButton
            label="Open address in Maps"
            variant="secondary"
            loading={actionLoading === 'maps'}
            onPress={() =>
              runAction('maps', () => openAddressInMaps(booking.address), 'Could not open Maps.')
            }
          />
          <AppButton
            label="Message customer on WhatsApp"
            variant="secondary"
            loading={actionLoading === 'whatsapp'}
            onPress={() =>
              runAction(
                'whatsapp',
                () => openCustomerWhatsApp(booking.phone, customerMessage),
                'Could not open WhatsApp.'
              )
            }
          />
        </View>

        <Text className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Status</Text>
        <View className="gap-2">
          {booking.status === 'pending' ? (
            <AppButton
              label="Mark confirmed"
              onPress={() => setStatus('confirmed')}
            />
          ) : null}
          {booking.status === 'confirmed' ? (
            <AppButton label="Mark completed" onPress={() => setStatus('completed')} />
          ) : null}
          {booking.status !== 'cancelled' && booking.status !== 'completed' ? (
            <AppButton
              label="Cancel booking"
              variant="ghost"
              onPress={() => setStatus('cancelled')}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
