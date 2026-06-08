const PHONE_RE = /^(\+41|0)[\d\s]{8,14}$/;

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
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

  const phone = fields.phone.trim();
  if (!isNonEmpty(phone)) {
    errors.phone = 'Telefonnummer ist erforderlich';
  } else if (!PHONE_RE.test(phone.replace(/\s/g, ''))) {
    errors.phone = 'Bitte eine Schweizer Nummer verwenden (z. B. +41 79 123 45 67)';
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
