/** Shared utilities */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export { validateBookingForm, hasFormErrors } from '@/utils/validation';
export type { BookingFormFields, BookingFormErrors } from '@/utils/validation';
