import { Text, View } from 'react-native';

import { normalizeBookingStatus } from '@/services/supabase-mappers';
import type { BookingStatus } from '@/types/domain';

const statusConfig: Record<
  BookingStatus,
  { label: string; container: string; text: string }
> = {
  pending: {
    label: 'Offen',
    container: 'bg-warning/10 border-warning/40',
    text: 'text-warning',
  },
  confirmed: {
    label: 'Bestätigt',
    container: 'bg-success/10 border-success/40',
    text: 'text-success',
  },
  completed: {
    label: 'Abgeschlossen',
    container: 'bg-brand-surfaceLight/50 border-brand-border/80',
    text: 'text-brand-text',
  },
  cancelled: {
    label: 'Storniert',
    container: 'bg-error/10 border-error/40',
    text: 'text-error',
  },
};

type StatusBadgeProps = {
  status: BookingStatus | string | undefined | null;
};

/** Compact informational status chip — never used as a button. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = normalizeBookingStatus(status);
  const config = statusConfig[normalized];

  return (
    <View
      className={`h-[26px] shrink-0 self-start rounded-full border px-2.5 items-center justify-center ${config.container}`}
    >
      <Text className={`text-[11px] font-medium leading-none ${config.text}`}>{config.label}</Text>
    </View>
  );
}
