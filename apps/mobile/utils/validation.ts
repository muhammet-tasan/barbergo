const PHONE_RE = /^(\+41|0)\d{9}$/;

export const PHONE_FORMAT_HINT = 'Format: +41 79 … oder 079 …';

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s/g, '');
}

export function validatePhoneNumber(phone: string): string | undefined {
  const trimmed = phone.trim();
  if (!isNonEmpty(trimmed)) {
    return 'Telefonnummer ist erforderlich';
  }

  const normalized = normalizePhone(trimmed);
  if (!normalized.startsWith('+41') && !normalized.startsWith('0')) {
    return 'Nummer muss mit +41 oder 0 beginnen';
  }
  if (normalized.startsWith('+41') && normalized.length !== 12) {
    return 'Nach +41 sind genau 9 Ziffern nötig (z. B. +41 79 123 45 67)';
  }
  if (normalized.startsWith('0') && normalized.length !== 10) {
    return 'Nach der führenden 0 sind genau 9 Ziffern nötig (z. B. 079 123 45 67)';
  }
  if (!PHONE_RE.test(normalized)) {
    return 'Ungültige Zeichen — nur Ziffern, Leerzeichen, +41 oder führende 0';
  }
  return undefined;
}

export type SlotBookingFormFields = {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  selectedSlotStartAt?: string;
};

export type SlotBookingFormErrors = Partial<Record<keyof SlotBookingFormFields, string>>;

export function validateSlotBookingForm(fields: SlotBookingFormFields): SlotBookingFormErrors {
  const errors: SlotBookingFormErrors = {};

  if (!isNonEmpty(fields.customerName)) {
    errors.customerName = 'Name ist erforderlich';
  }

  const phoneError = validatePhoneNumber(fields.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  if (!isNonEmpty(fields.address)) {
    errors.address = 'Adresse ist erforderlich';
  }

  if (!fields.selectedSlotStartAt) {
    errors.selectedSlotStartAt = 'Bitte Datum und Uhrzeit wählen';
  }

  return errors;
}

export function hasFormErrors(errors: SlotBookingFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** @deprecated Legacy free-text booking — use validateSlotBookingForm */
export type BookingFormFields = SlotBookingFormFields & {
  appointmentDate: string;
  appointmentTime: string;
};

export type BookingFormErrors = SlotBookingFormErrors;

export function validateBookingForm(fields: BookingFormFields): BookingFormErrors {
  return validateSlotBookingForm(fields);
}

export function isBookingFormComplete(fields: BookingFormFields): boolean {
  return !hasFormErrors(validateSlotBookingForm(fields));
}
