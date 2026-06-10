import { DEMO_PROVIDER_ID } from '@/services/profiles';
import { getSupabaseClient } from '@/services/supabase';
import { logger } from '@/utils/logger';
import { isValidUuid } from '@/utils/uuid';

export type ScheduleSlot = {
  startAt: string;
  endAt: string;
  isBooked: boolean;
  bookingId?: string;
  customerName?: string;
  phone?: string;
  customerEmail?: string;
  customerId?: string;
  serviceId?: string;
  bookingStatus?: string;
  address?: string;
  note?: string;
};

type ScheduleRow = Record<string, unknown>;

function pickString(row: ScheduleRow, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function pickBool(row: ScheduleRow, ...keys: string[]): boolean {
  for (const key of keys) {
    if (row[key] === true) return true;
  }
  return false;
}

function mapScheduleRow(row: ScheduleRow): ScheduleSlot {
  return {
    startAt: pickString(row, 'slot_start', 'slotStart') ?? '',
    endAt: pickString(row, 'slot_end', 'slotEnd') ?? '',
    isBooked: pickBool(row, 'is_booked', 'isBooked'),
    bookingId: pickString(row, 'booking_id', 'bookingId'),
    customerName: pickString(row, 'customer_name', 'customerName'),
    phone: pickString(row, 'phone'),
    customerEmail: pickString(row, 'customer_email', 'customerEmail'),
    customerId: pickString(row, 'customer_id', 'customerId'),
    serviceId: pickString(row, 'service_id', 'serviceId'),
    bookingStatus: pickString(row, 'booking_status', 'bookingStatus'),
    address: pickString(row, 'address'),
    note: pickString(row, 'note'),
  };
}

export async function fetchProviderDaySchedule(
  providerId: string,
  isoDate: string
): Promise<{ slots: ScheduleSlot[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client || !isValidUuid(providerId)) {
    return { slots: [], error: 'Kalender nicht verfügbar.' };
  }

  try {
    const { data, error } = await client.rpc('get_provider_day_schedule', {
      p_provider_id: providerId,
      p_date: isoDate,
      p_step_minutes: 15,
    });

    if (error) throw error;

    const rows = (data ?? []) as ScheduleRow[];
    return { slots: rows.map(mapScheduleRow).filter((s) => s.startAt) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kalender konnte nicht geladen werden.';
    logger.warn('schedule', 'fetchProviderDaySchedule failed', err);
    return { slots: [], error: message };
  }
}

export function resolveBarberProviderId(
  profileProviderId: string | null | undefined
): string {
  return profileProviderId && isValidUuid(profileProviderId)
    ? profileProviderId
    : DEMO_PROVIDER_ID;
}
