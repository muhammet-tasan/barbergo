import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { TimeSlot } from '@/services/slots';
import { formatZurichSwissDateFromUtc, formatZurichTimeFromUtc } from '@/utils/timezone';

type SlotPickerProps = {
  dates: string[];
  selectedDate: string | null;
  onSelectDate: (isoDate: string) => void;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading?: boolean;
  error?: string;
};

function formatDateChip(isoDate: string): string {
  const [, m, d] = isoDate.split('-');
  const weekday = new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    weekday: 'short',
  }).format(new Date(`${isoDate}T12:00:00Z`));
  return `${weekday} ${d}.${m}.`;
}

export function SlotPicker({
  dates,
  selectedDate,
  onSelectDate,
  slots,
  selectedSlot,
  onSelectSlot,
  loading = false,
  error,
}: SlotPickerProps) {
  return (
    <View>
      <Text className="text-brand-muted text-sm mb-2">Datum wählen</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {dates.map((date) => {
          const active = date === selectedDate;
          return (
            <Pressable
              key={date}
              onPress={() => onSelectDate(date)}
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

      <Text className="text-brand-muted text-sm mb-2">Verfügbare Zeiten (Basel)</Text>
      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <Text className="text-warning text-sm mb-2">{error}</Text>
      ) : null}

      {!loading && slots.length === 0 ? (
        <Text className="text-brand-muted text-sm">Keine freien Termine an diesem Tag.</Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {slots.map((slot) => {
            const active = selectedSlot?.startAt === slot.startAt;
            const label = formatZurichTimeFromUtc(slot.startAt);
            return (
              <Pressable
                key={slot.startAt}
                onPress={() => onSelectSlot(slot)}
                className={`px-4 py-2 rounded-lg border min-w-[72px] items-center ${
                  active ? 'bg-brand-gold border-brand-gold' : 'border-brand-border bg-brand-surface'
                }`}
              >
                <Text className={active ? 'text-brand-dark font-semibold' : 'text-brand-text'}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {selectedSlot ? (
        <Text className="text-brand-muted text-xs mt-3">
          Gewählt: {formatZurichSwissDateFromUtc(selectedSlot.startAt)} ·{' '}
          {formatZurichTimeFromUtc(selectedSlot.startAt)} Uhr
        </Text>
      ) : null}
    </View>
  );
}
