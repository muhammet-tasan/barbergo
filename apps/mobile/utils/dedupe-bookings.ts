import type { Booking } from '@/types/domain';

import { formatZurichDateIsoFromUtc, formatZurichTimeFromUtc } from './timezone';

export function bookingFingerprint(booking: Booking): string {
  const date =
    booking.startAt != null
      ? formatZurichDateIsoFromUtc(booking.startAt)
      : booking.appointmentDate.trim();
  const time =
    booking.startAt != null
      ? formatZurichTimeFromUtc(booking.startAt)
      : booking.appointmentTime.trim();
  return `${booking.providerId}|${booking.serviceId}|${date}|${time}`;
}

/** Remove duplicate rows by id (keeps first occurrence). */
export function dedupeBookingsById(bookings: Booking[]): Booking[] {
  const seen = new Set<string>();
  const result: Booking[] = [];
  for (const booking of bookings) {
    if (seen.has(booking.id)) continue;
    seen.add(booking.id);
    result.push(booking);
  }
  return result;
}

/**
 * Merge account bookings with device-only guest cache.
 * Drops guest copies that match an account booking by id or appointment fingerprint.
 */
export function mergeCustomerBookings(account: Booking[], device: Booking[]): {
  bookings: Booking[];
  hasPreLoginDeviceBookings: boolean;
} {
  const accountDeduped = dedupeBookingsById(account);
  const accountIds = new Set(accountDeduped.map((b) => b.id));
  const accountFingerprints = new Set(accountDeduped.map(bookingFingerprint));

  const deviceOnly = dedupeBookingsById(device).filter(
    (b) =>
      !b.customerId &&
      !accountIds.has(b.id) &&
      !accountFingerprints.has(bookingFingerprint(b))
  );

  return {
    bookings: dedupeBookingsById([...accountDeduped, ...deviceOnly]),
    hasPreLoginDeviceBookings: deviceOnly.length > 0,
  };
}
