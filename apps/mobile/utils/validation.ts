import { isSwissDate } from '@/utils/date';

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

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
    errors.customerName = 'Name ist erforderlich';
  }

  const phone = fields.phone.trim();
  if (!isNonEmpty(phone)) {
    errors.phone = 'Telefonnummer ist erforderlich';
  } else if (!PHONE_RE.test(phone.replace(/\s/g, ''))) {
    errors.phone = 'Bitte eine Schweizer Nummer verwenden (z. B. +41 79 123 45 67)';
  }

  if (!isNonEmpty(fields.address)) {
    errors.address = 'Adresse ist erforderlich';
  }

  if (!isNonEmpty(fields.appointmentDate)) {
    errors.appointmentDate = 'Datum ist erforderlich';
  } else if (!isSwissDate(fields.appointmentDate)) {
    errors.appointmentDate = 'Bitte TT.MM.JJJJ verwenden (z. B. 20.05.2026)';
  }

  if (!isNonEmpty(fields.appointmentTime)) {
    errors.appointmentTime = 'Uhrzeit ist erforderlich';
  } else if (!TIME_RE.test(fields.appointmentTime.trim())) {
    errors.appointmentTime = 'Bitte 24h-Format verwenden (z. B. 14:30)';
  }

  return errors;
}

export function hasFormErrors(errors: BookingFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** True when all required booking fields are filled (no validation messages). */
export function isBookingFormComplete(fields: BookingFormFields): boolean {
  return !hasFormErrors(validateBookingForm(fields));
}
