import { Text, View } from 'react-native';

import type { BookingStatus } from '@/types/domain';

const statusConfig: Record<
  BookingStatus,
  { label: string; container: string; text: string }
> = {
  pending: {
    label: 'Offen',
    container: 'bg-amber-900/40 border-amber-600',
    text: 'text-amber-300',
  },
  confirmed: {
    label: 'Bestätigt',
    container: 'bg-emerald-900/40 border-emerald-600',
    text: 'text-emerald-300',
  },
  completed: {
    label: 'Abgeschlossen',
    container: 'bg-slate-700/60 border-slate-500',
    text: 'text-slate-300',
  },
  cancelled: {
    label: 'Storniert',
    container: 'bg-red-900/40 border-red-600',
    text: 'text-red-300',
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
