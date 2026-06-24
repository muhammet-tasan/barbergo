import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/constants/theme';
import { useServices } from '@/hooks/use-services';
import { getServiceById } from '@/services/bookings';
import { fetchProviderDaySchedule, type ScheduleSlot } from '@/services/schedule';
import { buildSelectableDates } from '@/services/slots';
import type { BookingStatus } from '@/types/domain';
import { getBookingDisplayDateTime } from '@/utils/booking-display';
import { formatZurichTimeFromUtc, todayZurichIso, ZURICH_TZ } from '@/utils/timezone';

const DAY_CHIP_WIDTH = 76;
const DAY_CHIP_HEIGHT = 72;
const DAY_STRIP_HEIGHT = DAY_CHIP_HEIGHT + 16;

type DayChipParts = {
  weekday: string;
  dayNum: string;
  month: string;
};

function parseDayChipParts(isoDate: string): DayChipParts {
  const anchor = new Date(`${isoDate}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat('de-CH', {
    timeZone: ZURICH_TZ,
    weekday: 'short',
  })
    .format(anchor)
    .replace(/\.$/, '');
  const dayNum = new Intl.DateTimeFormat('de-CH', {
    timeZone: ZURICH_TZ,
    day: 'numeric',
  }).format(anchor);
  const month = new Intl.DateTimeFormat('de-CH', {
    timeZone: ZURICH_TZ,
    month: 'short',
  })
    .format(anchor)
    .replace(/\.$/, '');
  return { weekday, dayNum, month };
}

function formatDaySummary(isoDate: string): string {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: ZURICH_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

function formatSlotCounts(booked: number, free: number): string {
  const bookingLabel = booked === 1 ? '1 Buchung' : `${booked} Buchungen`;
  const freeLabel = free === 1 ? '1 freier Slot' : `${free} freie Slots`;
  return `${bookingLabel} · ${freeLabel}`;
}

type ScheduleDayChipProps = {
  isoDate: string;
  active: boolean;
  isToday: boolean;
  onPress: () => void;
};

function ScheduleDayChip({ isoDate, active, isToday, onPress }: ScheduleDayChipProps) {
  const { weekday, dayNum, month } = parseDayChipParts(isoDate);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`mr-2 rounded-xl border items-center justify-center ${
        active ? 'bg-brand-gold border-brand-gold' : 'bg-brand-surface border-brand-border/80'
      }`}
      style={{ width: DAY_CHIP_WIDTH, height: DAY_CHIP_HEIGHT }}
    >
      <Text
        className={`text-[11px] font-medium ${active ? 'text-brand-dark/80' : 'text-brand-muted'}`}
      >
        {weekday}
      </Text>
      <Text
        className={`text-xl font-bold leading-7 ${active ? 'text-brand-dark' : 'text-brand-text'}`}
      >
        {dayNum}
      </Text>
      <Text className={`text-[10px] ${active ? 'text-brand-dark/70' : 'text-brand-muted'}`}>
        {isToday ? 'Heute' : month}
      </Text>
    </Pressable>
  );
}

type SlotRowProps = {
  slot: ScheduleSlot;
  onPressBooked: () => void;
};

function SlotRow({ slot, onPressBooked }: SlotRowProps) {
  const label = `${formatZurichTimeFromUtc(slot.startAt)} – ${formatZurichTimeFromUtc(slot.endAt)}`;

  if (!slot.isBooked) {
    return (
      <View
        className="flex-row items-center justify-between rounded-xl border border-brand-border/50 bg-brand-surface/40 px-3"
        style={{ minHeight: 52, marginBottom: 8 }}
      >
        <Text className="text-brand-muted text-sm font-medium">{label}</Text>
        <Text className="text-brand-muted/80 text-xs">Frei</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPressBooked}
      className="active:opacity-85"
      style={{ marginBottom: 10 }}
    >
      <View
        className="flex-row items-center justify-between rounded-xl border border-brand-gold/45 bg-brand-surface px-3"
        style={{ minHeight: 56 }}
      >
        <Text className="text-brand-text text-sm font-semibold flex-1 pr-2">{label}</Text>
        <View className="items-end shrink-0 max-w-[48%]">
          <Text className="text-brand-text text-sm font-medium mb-1" numberOfLines={1}>
            {slot.customerName ?? 'Gebucht'}
          </Text>
          {slot.bookingStatus ? (
            <StatusBadge status={slot.bookingStatus as BookingStatus} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

type ProviderSlotCalendarProps = {
  providerId: string;
  title: string;
  subtitle?: string;
  onBack: () => void;
  bookingDetailPath?: '/barber/dashboard/[id]' | '/admin/[id]';
};

export function ProviderSlotCalendar({
  providerId,
  title,
  subtitle,
  onBack,
  bookingDetailPath = '/barber/dashboard/[id]',
}: ProviderSlotCalendarProps) {
  const router = useRouter();
  const { services } = useServices(providerId);
  const dates = buildSelectableDates(14);
  const todayIso = todayZurichIso();
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

  const { bookedCount, freeCount } = useMemo(() => {
    let booked = 0;
    let free = 0;
    for (const slot of slots) {
      if (slot.isBooked) booked += 1;
      else free += 1;
    }
    return { bookedCount: booked, freeCount: free };
  }, [slots]);

  const serviceName = (serviceId?: string) =>
    serviceId ? getServiceById(serviceId, services)?.name ?? 'Service' : '—';

  return (
    <View className="flex-1 bg-brand-dark">
      <ScreenHeader title={title} subtitle={subtitle} onBack={onBack} />

      <View style={{ height: DAY_STRIP_HEIGHT }} className="justify-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
        >
          {dates.map((date) => (
            <ScheduleDayChip
              key={date}
              isoDate={date}
              active={date === selectedDate}
              isToday={date === todayIso}
              onPress={() => setSelectedDate(date)}
            />
          ))}
        </ScrollView>
      </View>

      {selectedDate ? (
        <View className="px-4 pb-2 pt-0 border-b border-brand-border/40">
          <Text className="text-brand-text text-sm font-medium">
            {formatDaySummary(selectedDate)}
          </Text>
          {!loading && slots.length > 0 ? (
            <Text className="text-brand-muted text-xs mt-0.5">
              {formatSlotCounts(bookedCount, freeCount)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        >
          {error ? <Text className="text-error text-sm mb-2">{error}</Text> : null}

          {slots.length === 0 ? (
            <View className="rounded-xl border border-brand-border/60 bg-brand-surface px-4 py-6">
              <Text className="text-brand-muted text-center text-sm">
                Keine Slots an diesem Tag.
              </Text>
            </View>
          ) : (
            <>
              {bookedCount === 0 ? (
                <Text className="text-brand-muted text-sm mb-2">
                  Keine Buchungen an diesem Tag.
                </Text>
              ) : null}

              {slots.map((slot) => (
                <SlotRow
                  key={`${slot.startAt}-${slot.isBooked ? slot.bookingId : 'free'}`}
                  slot={slot}
                  onPressBooked={() => setSelectedBooking(slot)}
                />
              ))}

              {freeCount > 0 ? (
                <Text className="text-brand-muted/80 text-xs text-center mt-3 leading-5">
                  Freie Slots werden Kunden zur Buchung angezeigt.
                </Text>
              ) : null}
            </>
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
          <View className="bg-brand-dark rounded-t-2xl px-4 pt-5 pb-8 border-t border-brand-border w-full">
            {selectedBooking ? (
              <>
                <View className="flex-row justify-between items-start mb-4">
                  <Text className="text-brand-text text-lg font-bold">Buchungsdetails</Text>
                  {selectedBooking.bookingStatus ? (
                    <StatusBadge status={selectedBooking.bookingStatus as BookingStatus} />
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
