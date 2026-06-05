import { Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatChf } from '@/constants/pricing';
import { canCancelBooking } from '@/utils/booking-cancel';
import type { Booking } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';

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
  const cancelAllowed = canCancelBooking(booking);
  const showCancelSection =
    (booking.status === 'pending' || booking.status === 'confirmed') && onCancel;

  return (
    <AppCard className="mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-brand-text font-semibold text-base flex-1 pr-2">{serviceName}</Text>
        <StatusBadge status={booking.status} />
      </View>
      <Text className="text-brand-muted text-sm">
        {formatSwissDate(booking.appointmentDate)} · {booking.appointmentTime}
      </Text>
      <Text className="text-brand-gold font-semibold text-base mt-2">{formatChf(booking.totalChf)}</Text>

      <View className="mt-4 pt-3 border-t border-brand-border">
        <AppButton label="Details ansehen" variant="secondary" onPress={onViewDetails} />
      </View>

      {showCancelSection ? (
        <View className="mt-3">
          {cancelAllowed ? (
            <AppButton
              label="Termin stornieren"
              variant="ghost"
              onPress={onCancel}
              loading={cancelling}
            />
          ) : (
            <Text className="text-brand-muted text-xs text-center mt-1">
              Storno nur bis 24h vor Termin möglich.
            </Text>
          )}
        </View>
      ) : null}
    </AppCard>
  );
}
