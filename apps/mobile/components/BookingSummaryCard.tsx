import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppCard } from '@/components/AppCard';
import { StatusBadge } from '@/components/StatusBadge';
import { calculateBookingTotal, formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import type { BookingStatus } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

type SummaryRow = {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

type BookingSummaryCardProps = {
  rows: SummaryRow[];
  status?: BookingStatus;
  statusLabel?: string;
  className?: string;
};

function SummaryRowItem({ label, value, highlight, icon }: SummaryRow) {
  return (
    <View className="flex-row items-start py-2.5 border-b border-brand-border/80 last:border-b-0">
      {icon ? (
        <Ionicons name={icon} size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
      ) : (
        <View className="w-4" />
      )}
      <Text className="text-brand-muted text-sm ml-2 w-[108px]">{label}</Text>
      <Text
        className={`flex-1 font-medium ${
          highlight ? 'text-brand-gold text-base' : 'text-brand-text'
        }`}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

export function BookingSummaryCard({
  rows,
  status,
  statusLabel,
  className,
}: BookingSummaryCardProps) {
  return (
    <AppCard className={className}>
      {status ? (
        <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-brand-border/80">
          <Text className="text-brand-muted text-sm">
            {statusLabel ?? 'Status'}
          </Text>
          <StatusBadge status={status} />
        </View>
      ) : null}
      {rows.map((row) => (
        <SummaryRowItem key={row.label} {...row} />
      ))}
    </AppCard>
  );
}

type BookingFormSummaryProps = {
  barberName: string;
  serviceName: string;
  durationMinutes: number;
  priceChf: number;
  className?: string;
};

/** Summary shown above the booking form. */
export function BookingFormSummaryCard({
  barberName,
  serviceName,
  durationMinutes,
  priceChf,
  className,
}: BookingFormSummaryProps) {
  const totals = calculateBookingTotal(priceChf);

  return (
    <BookingSummaryCard
      className={className}
      rows={[
        { label: 'Barber', value: barberName, icon: 'person-outline' },
        { label: 'Service', value: serviceName, icon: 'cut-outline' },
        { label: 'Dauer', value: `${durationMinutes} Min.`, icon: 'time-outline' },
        { label: 'Preis', value: formatChf(priceChf), icon: 'pricetag-outline' },
        { label: 'Servicegebühr', value: formatChf(totals.serviceFeeChf), icon: 'add-circle-outline' },
        { label: 'Gesamt', value: formatChf(totals.totalChf), highlight: true, icon: 'wallet-outline' },
      ]}
    />
  );
}

type BookingConfirmSummaryProps = {
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  address: string;
  totalChf: number;
  status?: BookingStatus;
  className?: string;
};

/** Summary on confirmation / detail screens. */
export function BookingConfirmSummaryCard({
  serviceName,
  appointmentDate,
  appointmentTime,
  address,
  totalChf,
  status = 'pending',
  className,
}: BookingConfirmSummaryProps) {
  return (
    <BookingSummaryCard
      className={className}
      status={status}
      statusLabel="Status"
      rows={[
        { label: 'Service', value: serviceName, icon: 'cut-outline' },
        { label: 'Datum', value: formatSwissDate(appointmentDate), icon: 'calendar-outline' },
        { label: 'Uhrzeit', value: appointmentTime, icon: 'time-outline' },
        { label: 'Adresse', value: address, icon: 'location-outline' },
        { label: 'Gesamt', value: formatChf(totalChf), highlight: true, icon: 'wallet-outline' },
      ]}
    />
  );
}
