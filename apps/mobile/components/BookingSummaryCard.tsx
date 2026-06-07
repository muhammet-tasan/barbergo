import { Text, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { StatusBadge } from '@/components/StatusBadge';
import { calculateBookingTotal, formatChf } from '@/constants/pricing';
import type { BookingStatus } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

type SummaryRow = {
  label: string;
  value?: string;
  highlight?: boolean;
};

type BookingSummaryCardProps = {
  rows: SummaryRow[];
  status?: BookingStatus;
  className?: string;
};

function SummaryRowItem({ label, value = '', highlight }: SummaryRow) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-brand-border/80 last:border-b-0">
      <Text className="text-sm text-brand-muted shrink-0 mr-4">{label}</Text>
      <Text
        className={`flex-1 text-right font-medium ${
          highlight ? 'text-brand-gold text-base font-semibold' : 'text-brand-text text-sm'
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
  className,
}: BookingSummaryCardProps) {
  return (
    <AppCard className={className}>
      {status ? (
        <View className="flex-row items-center justify-between py-3 border-b border-brand-border/80">
          <Text className="text-sm text-brand-muted">Status</Text>
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
        { label: 'Barber', value: barberName },
        { label: 'Service', value: serviceName },
        { label: 'Dauer', value: `${durationMinutes} Min.` },
        { label: 'Preis', value: formatChf(priceChf) },
        { label: 'Servicegebühr', value: formatChf(totals.serviceFeeChf) },
        { label: 'Gesamt', value: formatChf(totals.totalChf), highlight: true },
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
      rows={[
        { label: 'Service', value: serviceName },
        { label: 'Datum', value: formatSwissDate(appointmentDate) },
        { label: 'Uhrzeit', value: appointmentTime },
        { label: 'Adresse', value: address },
        { label: 'Gesamt', value: formatChf(totalChf), highlight: true },
      ]}
    />
  );
}
