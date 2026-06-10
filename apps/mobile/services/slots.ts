import { calculateBookingTotal } from '@/constants/pricing';
import type { Service } from '@/types/domain';
import { addDaysIso, todayZurichIso, zurichLocalDateTimeToUtc } from '@/utils/timezone';
import { logger } from '@/utils/logger';
import { generateAccessToken, generateUuid, isValidUuid } from '@/utils/uuid';

import { allowMockDataFallback } from './data-source-policy';
import { getSupabaseClient } from './supabase';

export type TimeSlot = {
  startAt: string;
  endAt: string;
};

type SlotRow = Record<string, unknown>;

function mapSlotRow(row: SlotRow): TimeSlot | null {
  const start =
    typeof row.slot_start === 'string'
      ? row.slot_start
      : typeof row.slotStart === 'string'
        ? row.slotStart
        : null;
  const end =
    typeof row.slot_end === 'string'
      ? row.slot_end
      : typeof row.slotEnd === 'string'
        ? row.slotEnd
        : null;
  if (!start || !end) return null;
  return { startAt: start, endAt: end };
}

/** Standard-Arbeitszeiten Basel, wenn RPC leer ist oder Verfügbarkeit noch nicht gepflegt wurde. */
function defaultBusinessSlotsForDate(isoDate: string, service: Service): TimeSlot[] {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zurich',
    weekday: 'short',
  })
    .formatToParts(new Date(`${isoDate}T12:00:00Z`))
    .find((p) => p.type === 'weekday')?.value;

  if (weekday === 'Sun') return [];

  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 17; hour++) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const startAt = zurichLocalDateTimeToUtc(isoDate, time);
      const endAt = new Date(
        new Date(startAt).getTime() + service.durationMinutes * 60_000
      ).toISOString();
      slots.push({ startAt, endAt });
    }
  }
  return slots;
}

export async function fetchAvailableSlots(
  providerId: string,
  service: Service,
  isoDate: string
): Promise<{ slots: TimeSlot[]; source: 'supabase' | 'mock'; error?: string }> {
  const client = getSupabaseClient();
  const useMock = allowMockDataFallback();

  if (!client || !isValidUuid(providerId) || !isValidUuid(service.id)) {
    if (!useMock) {
      const fallback = defaultBusinessSlotsForDate(isoDate, service);
      if (fallback.length > 0) {
        return { slots: fallback, source: 'supabase' };
      }
      return { slots: [], source: 'supabase', error: 'Termine konnten nicht geladen werden.' };
    }
    return { slots: defaultBusinessSlotsForDate(isoDate, service), source: 'mock' };
  }

  try {
    const { data, error } = await client.rpc('get_available_slots', {
      p_provider_id: providerId,
      p_service_id: service.id,
      p_date: isoDate,
    });

    if (error) throw error;

    const rows = (data ?? []) as SlotRow[];
    const slots = rows.map(mapSlotRow).filter((s): s is TimeSlot => s != null);

    if (slots.length > 0) {
      return { slots, source: 'supabase' };
    }

    const fallback = defaultBusinessSlotsForDate(isoDate, service);
    return { slots: fallback, source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Slots konnten nicht geladen werden.';
    logger.warn('slots', 'fetchAvailableSlots failed', err);

    const fallback = defaultBusinessSlotsForDate(isoDate, service);
    if (fallback.length > 0) {
      return { slots: fallback, source: 'supabase' };
    }

    if (useMock) {
      return { slots: fallback, source: 'mock' };
    }
    return { slots: [], source: 'supabase', error: message };
  }
}

export function buildSelectableDates(daysAhead = 14): string[] {
  const start = todayZurichIso();
  return Array.from({ length: daysAhead }, (_, i) => addDaysIso(start, i));
}

export type BookSlotInput = {
  providerId: string;
  service: Service;
  startAt: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  customerId?: string;
};

export type BookSlotResult = {
  bookingId?: string;
  accessToken?: string;
  error?: string;
  source: 'supabase' | 'mock';
};

function mapSlotRpcError(message: string): string {
  const upper = message.toUpperCase();
  if (upper.includes('SLOT_TAKEN')) {
    return 'Dieser Termin ist nicht mehr verfügbar. Bitte wähle einen anderen Slot.';
  }
  if (upper.includes('SLOT_BLOCKED')) {
    return 'Dieser Zeitraum ist blockiert. Bitte wähle einen anderen Termin.';
  }
  if (upper.includes('SERVICE_NOT_FOUND')) {
    return 'Der gewählte Service ist nicht verfügbar.';
  }
  if (upper.includes('COULD NOT FIND THE FUNCTION') || upper.includes('PGRST202')) {
    return 'SLOT_RPC_MISSING';
  }
  if (upper.includes('START_AT') && upper.includes('DOES NOT EXIST')) {
    return 'SLOT_RPC_MISSING';
  }
  return 'BOOKING_SAVE_FAILED';
}

export async function bookSlot(input: BookSlotInput): Promise<BookSlotResult> {
  const client = getSupabaseClient();
  const useMock = allowMockDataFallback();
  const isGuest = !input.customerId;
  const accessToken = isGuest ? generateAccessToken() : undefined;

  if (!client || !isValidUuid(input.providerId) || !isValidUuid(input.service.id)) {
    if (!useMock) {
      return {
        error: 'Buchung ist derzeit nicht verfügbar. Server nicht erreichbar.',
        source: 'supabase',
      };
    }
    return {
      bookingId: `booking-${generateUuid()}`,
      accessToken,
      source: 'mock',
    };
  }

  try {
    const { data, error } = await client.rpc('book_slot', {
      p_provider_id: input.providerId,
      p_service_id: input.service.id,
      p_start_at: input.startAt,
      p_customer_name: input.customerName.trim(),
      p_phone: input.phone.trim(),
      p_address: input.address.trim(),
      p_note: input.note?.trim() || null,
      p_customer_id: input.customerId ?? null,
      p_access_token: accessToken ?? null,
    });

    if (error) throw error;

    const bookingId = typeof data === 'string' ? data : String(data);
    return { bookingId, accessToken, source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('slots', 'bookSlot failed', err);
    return { error: mapSlotRpcError(message), source: 'supabase' };
  }
}

export function estimateSlotTotalChf(service: Service): number {
  return calculateBookingTotal(service.priceChf).totalChf;
}
