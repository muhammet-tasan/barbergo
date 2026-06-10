import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/constants/theme';
import { useServices } from '@/hooks/use-services';
import { getServiceById } from '@/services/bookings';
import { fetchProviderDaySchedule, type ScheduleSlot } from '@/services/schedule';
import { buildSelectableDates } from '@/services/slots';
import { getBookingDisplayDateTime } from '@/utils/booking-display';
import { formatZurichTimeFromUtc } from '@/utils/timezone';

function formatDateChip(isoDate: string): string {
  const [, m, d] = isoDate.split('-');
  const weekday = new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    weekday: 'short',
  }).format(new Date(`${isoDate}T12:00:00Z`));
  return `${weekday} ${d}.${m}.`;
}

type ProviderSlotCalendarProps = {
  providerId: string;
  title: string;
  onBack: () => void;
  bookingDetailPath?: '/barber/dashboard/[id]' | '/admin/[id]';
};

export function ProviderSlotCalendar({
  providerId,
  title,
  onBack,
  bookingDetailPath = '/barber/dashboard/[id]',
}: ProviderSlotCalendarProps) {
  const router = useRouter();
  const { services } = useServices(providerId);
  const dates = buildSelectableDates(14);
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? '');
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<ScheduleSlot | null>(null);

  const reload = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    const result = await fetchProviderDaySchedule(providerId, selectedDate);
    setSlots(result.slots);
    setError(result.error);
    setLoading(false);
  }, [providerId, selectedDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const serviceName = (serviceId?: string) =>
    serviceId ? getServiceById(serviceId, services)?.name ?? 'Service' : '—';

  return (
    <View className="flex-1 bg-brand-dark">
      <ScreenHeader title={title} onBack={onBack} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pt-3">
        {dates.map((date) => {
          const active = date === selectedDate;
          return (
            <Pressable
              key={date}
              onPress={() => setSelectedDate(date)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                active ? 'bg-brand-gold border-brand-gold' : 'border-brand-border bg-brand-surface'
              }`}
            >
              <Text className={active ? 'text-brand-dark font-semibold' : 'text-brand-text'}>
                {formatDateChip(date)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          {error ? <Text className="text-warning mb-3">{error}</Text> : null}
          {slots.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center">Keine Slots an diesem Tag.</Text>
            </AppCard>
          ) : (
            slots.map((slot) => {
              const label = `${formatZurichTimeFromUtc(slot.startAt)} – ${formatZurichTimeFromUtc(slot.endAt)}`;
              return (
                <Pressable
                  key={`${slot.startAt}-${slot.isBooked ? slot.bookingId : 'free'}`}
                  onPress={() => slot.isBooked && setSelectedBooking(slot)}
                  disabled={!slot.isBooked}
                  className="mb-2"
                >
                  <AppCard
                    className={
                      slot.isBooked
                        ? 'border-brand-gold/40'
                        : 'border-brand-border/60 opacity-70'
                    }
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-brand-text font-medium">{label}</Text>
                      <Text className="text-brand-muted text-sm">
                        {slot.isBooked ? slot.customerName ?? 'Gebucht' : 'Frei'}
                      </Text>
                    </View>
                  </AppCard>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal
        visible={selectedBooking != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-brand-dark rounded-t-2xl px-4 pt-5 pb-8 border-t border-brand-border">
            {selectedBooking ? (
              <>
                <View className="flex-row justify-between items-start mb-4">
                  <Text className="text-brand-text text-lg font-bold">Buchungsdetails</Text>
                  {selectedBooking.bookingStatus ? (
                    <StatusBadge status={selectedBooking.bookingStatus as 'confirmed'} />
                  ) : null}
                </View>
                <Text className="text-brand-muted text-sm mb-1">Kunde</Text>
                <Text className="text-brand-text mb-3">{selectedBooking.customerName ?? '—'}</Text>
                <Text className="text-brand-muted text-sm mb-1">Telefon</Text>
                <Text className="text-brand-text mb-3">{selectedBooking.phone ?? '—'}</Text>
                {selectedBooking.customerEmail ? (
                  <>
                    <Text className="text-brand-muted text-sm mb-1">E-Mail</Text>
                    <Text className="text-brand-text mb-3">{selectedBooking.customerEmail}</Text>
                  </>
                ) : null}
                <Text className="text-brand-muted text-sm mb-1">Service</Text>
                <Text className="text-brand-text mb-3">
                  {serviceName(selectedBooking.serviceId)}
                </Text>
                <Text className="text-brand-muted text-sm mb-1">Termin</Text>
                <Text className="text-brand-text mb-3">
                  {getBookingDisplayDateTime({
                    id: selectedBooking.bookingId ?? '',
                    providerId,
                    serviceId: selectedBooking.serviceId ?? '',
                    status: 'confirmed',
                    customerName: selectedBooking.customerName ?? '',
                    phone: selectedBooking.phone ?? '',
                    address: selectedBooking.address ?? '',
                    appointmentDate: '',
                    appointmentTime: '',
                    startAt: selectedBooking.startAt,
                    servicePriceChf: 0,
                    serviceFeeChf: 0,
                    totalChf: 0,
                  }).dateSwiss}{' '}
                  · {formatZurichTimeFromUtc(selectedBooking.startAt)}
                </Text>
                {selectedBooking.address ? (
                  <>
                    <Text className="text-brand-muted text-sm mb-1">Adresse</Text>
                    <Text className="text-brand-text mb-3">{selectedBooking.address}</Text>
                  </>
                ) : null}
                {selectedBooking.note ? (
                  <>
                    <Text className="text-brand-muted text-sm mb-1">Notiz</Text>
                    <Text className="text-brand-text mb-3">{selectedBooking.note}</Text>
                  </>
                ) : null}
                <AppButton
                  label="Schliessen"
                  variant="secondary"
                  onPress={() => setSelectedBooking(null)}
                />
                {selectedBooking.bookingId ? (
                  <AppButton
                    label="Vollständige Details"
                    variant="tertiary"
                    onPress={() => {
                      setSelectedBooking(null);
                      router.push({
                        pathname: bookingDetailPath,
                        params: { id: selectedBooking.bookingId! },
                      } as Href);
                    }}
                  />
                ) : null}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
