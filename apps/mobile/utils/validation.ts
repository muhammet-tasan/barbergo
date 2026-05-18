import { isNonEmpty } from '@/utils/index';
import { isSwissDate } from '@/utils/date';

export type BookingFormFields = {
  customerName: string;
  phone: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
  note?: string;
};

export type BookingFormErrors = Partial<Record<keyof BookingFormFields, string>>;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_RE = /^(\+41|0)[\d\s]{8,14}$/;

export function validateBookingForm(fields: BookingFormFields): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (!isNonEmpty(fields.customerName)) {
    errors.customerName = 'Name is required';
  }

  const phone = fields.phone.trim();
  if (!isNonEmpty(phone)) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_RE.test(phone.replace(/\s/g, ''))) {
    errors.phone = 'Use a Swiss number (e.g. +41 79 123 45 67)';
  }

  if (!isNonEmpty(fields.address)) {
    errors.address = 'Address is required';
  }

  if (!isNonEmpty(fields.appointmentDate)) {
    errors.appointmentDate = 'Date is required';
  } else if (!isSwissDate(fields.appointmentDate)) {
    errors.appointmentDate = 'Use DD.MM.YYYY (e.g. 20.05.2026)';
  }

  if (!isNonEmpty(fields.appointmentTime)) {
    errors.appointmentTime = 'Time is required';
  } else if (!TIME_RE.test(fields.appointmentTime.trim())) {
    errors.appointmentTime = 'Use 24h format (e.g. 14:30)';
  }

  return errors;
}

export function hasFormErrors(errors: BookingFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
