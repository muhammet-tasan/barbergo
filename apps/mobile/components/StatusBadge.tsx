import { Text, View } from 'react-native';

import type { BookingStatus } from '@/types/domain';

const statusConfig: Record<
  BookingStatus,
  { label: string; container: string; text: string }
> = {
  pending: {
    label: 'Offen',
    container: 'bg-warning/20 border-warning',
    text: 'text-warning',
  },
  confirmed: {
    label: 'Bestätigt',
    container: 'bg-success/20 border-success',
    text: 'text-success',
  },
  completed: {
    label: 'Abgeschlossen',
    container: 'bg-brand-surfaceLight/60 border-brand-muted',
    text: 'text-brand-muted',
  },
  cancelled: {
    label: 'Storniert',
    container: 'bg-error/20 border-error',
    text: 'text-error',
  },
};

type StatusBadgeProps = {
  status: BookingStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View className={`self-start rounded-full border px-3 py-0.5 ${config.container}`}>
      <Text className={`text-xs font-medium ${config.text}`}>{config.label}</Text>
    </View>
  );
}
