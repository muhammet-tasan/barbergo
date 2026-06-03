import { Text, View } from 'react-native';

import { normalizeBookingStatus } from '@/services/supabase-mappers';
import type { BookingStatus } from '@/types/domain';

const statusConfig: Record<
  BookingStatus,
  { label: string; container: string; text: string }
> = {
  pending: {
    label: 'Offen',
    container: 'bg-brand-surface border-warning',
    text: 'text-warning',
  },
  confirmed: {
    label: 'Bestätigt',
    container: 'bg-brand-surface border-success',
    text: 'text-success',
  },
  completed: {
    label: 'Abgeschlossen',
    container: 'bg-brand-surfaceLight border-brand-border',
    text: 'text-brand-text',
  },
  cancelled: {
    label: 'Storniert',
    container: 'bg-brand-surface border-error',
    text: 'text-error',
  },
};

type StatusBadgeProps = {
  status: BookingStatus | string | undefined | null;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = normalizeBookingStatus(status);
  const config = statusConfig[normalized];

  return (
    <View className={`self-start rounded-full border px-3 py-0.5 ${config.container}`}>
      <Text className={`text-xs font-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
}
