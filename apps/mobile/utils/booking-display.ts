import type { Booking } from '@/types/domain';
import { formatSwissDate } from '@/utils/date';
import {
  formatZurichDateIsoFromUtc,
  formatZurichSwissDateFromUtc,
  formatZurichTimeFromUtc,
} from '@/utils/timezone';

export type BookingDisplayDateTime = {
  dateIso: string;
  time: string;
  dateSwiss: string;
};

export function getBookingDisplayDateTime(booking: Booking): BookingDisplayDateTime {
  if (booking.startAt) {
    const dateIso = formatZurichDateIsoFromUtc(booking.startAt);
    return {
      dateIso,
      time: formatZurichTimeFromUtc(booking.startAt),
      dateSwiss: formatZurichSwissDateFromUtc(booking.startAt),
    };
  }

  return {
    dateIso: booking.appointmentDate,
    time: booking.appointmentTime,
    dateSwiss: formatSwissDate(booking.appointmentDate),
  };
}
