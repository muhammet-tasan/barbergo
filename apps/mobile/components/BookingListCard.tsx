import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { canCancelBooking } from '@/utils/booking-cancel';
import type { Booking } from '@/types/domain';
import { getBookingDisplayDateTime } from '@/utils/booking-display';

type BookingListCardProps = {
  booking: Booking;
  serviceName: string;
  onViewDetails: () => void;
  onCancel?: () => void;
  cancelling?: boolean;
};

export function BookingListCard({
  booking,
  serviceName,
  onViewDetails,
  onCancel,
  cancelling = false,
}: BookingListCardProps) {
  const display = getBookingDisplayDateTime(booking);
  const cancelAllowed = canCancelBooking(booking);
  const showCancelSection =
    (booking.status === 'pending' || booking.status === 'confirmed') && onCancel;

  return (
    <AppCard className="mb-3 p-0 overflow-hidden">
      <Pressable
        onPress={onViewDetails}
        className="p-4 active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel={`${serviceName}, Details ansehen`}
      >
        <View className="flex-row justify-between items-start gap-3">
          <Text className="text-brand-text font-semibold text-base flex-1">{serviceName}</Text>
          <StatusBadge status={booking.status} />
        </View>
        <Text className="text-brand-muted text-sm mt-1.5">
          {display.dateSwiss} · {display.time}
        </Text>
        <Text className="text-brand-gold font-semibold text-base mt-2">{formatChf(booking.totalChf)}</Text>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-brand-border/80">
          <Text className="text-brand-gold text-sm font-medium">Details ansehen</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </View>
      </Pressable>

      {showCancelSection ? (
        <View className="px-4 pb-4 pt-1">
          {cancelAllowed ? (
            <AppButton
              label="Termin stornieren"
              variant="danger"
              onPress={onCancel}
              loading={cancelling}
            />
          ) : (
            <Text className="text-brand-muted text-xs text-center">
              Storno nur bis 24h vor Termin möglich.
            </Text>
          )}
        </View>
      ) : null}
    </AppCard>
  );
}
