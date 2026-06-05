import type { Booking } from '@/types/domain';

const HOURS_BEFORE_APPOINTMENT = 24;

/** True when pending/confirmed and at least 24h before appointment start. */
export function canCancelBooking(booking: Booking): boolean {
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    return false;
  }

  const start = parseAppointmentStart(booking.appointmentDate, booking.appointmentTime);
  if (!start) return false;

  const deadline = start.getTime() - HOURS_BEFORE_APPOINTMENT * 60 * 60 * 1000;
  return Date.now() <= deadline;
}

export function cancelBookingBlockedReason(booking: Booking): string | undefined {
  if (booking.status === 'cancelled') {
    return 'Termin ist bereits storniert.';
  }
  if (booking.status === 'completed') {
    return 'Abgeschlossene Termine können nicht storniert werden.';
  }
  if (canCancelBooking(booking)) {
    return undefined;
  }
  return 'Storno nur bis 24h vor Termin möglich.';
}

function parseAppointmentStart(date: string, time: string): Date | null {
  const normalizedTime = time.trim().length === 5 ? `${time.trim()}:00` : time.trim();
  const parsed = new Date(`${date}T${normalizedTime}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
