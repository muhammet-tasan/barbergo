import { mockBookings } from '@/data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBookingTotal } from '@/constants/pricing';
import type { Booking, BookingStatus, Service } from '@/types/domain';
import { parseSwissDateToIso } from '@/utils/date';
import { dedupeBookingsById } from '@/utils/dedupe-bookings';
import { getBookingDisplayDateTime } from '@/utils/booking-display';

import { generateAccessToken, generateUuid, isMockCatalogId, isValidUuid } from '@/utils/uuid';
import { canCancelBooking, cancelBookingBlockedReason } from '@/utils/booking-cancel';

import {
  classifySupabaseError,
  formatBookingIdError,
  type CatalogFailureReason,
} from './catalog-errors';
import { getBookingAccessToken, saveBookingAccessToken } from './booking-tokens';
import { getSupabaseClient, SupabaseTables } from './supabase';
import { mapBooking, sortBookings, type BookingRow } from './supabase-mappers';

const BOOKING_SELECT =
  'id, provider_id, service_id, status, customer_name, phone, address, appointment_date, appointment_time, start_at, end_at, note, service_price_chf, service_fee_chf, total_chf, customer_id, created_at, updated_at';

export type DataSource = 'supabase' | 'mock';

export type BookingsLoadResult = {
  bookings: Booking[];
  source: DataSource;
  error?: string;
};

export type BookingLoadResult = {
  booking?: Booking;
  source: DataSource;
  error?: string;
};

export type BookingMutationResult = {
  booking?: Booking;
  source: DataSource;
  error?: string;
};

/** Guest bookings: anon cannot SELECT after insert (RLS 0003) — local copy for confirm + Meine Termine. */
const guestBookingCache = new Map<string, Booking>();
const GUEST_BOOKINGS_STORAGE_KEY = 'barbergo:guest-bookings';

async function persistGuestBookings(): Promise<void> {
  try {
    const payload = JSON.stringify([...guestBookingCache.values()]);
    await AsyncStorage.setItem(GUEST_BOOKINGS_STORAGE_KEY, payload);
  } catch (err) {
    console.warn('[barbergo] persistGuestBookings failed:', err);
  }
}

async function loadGuestBookingsFromStorage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_BOOKINGS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Booking[];
    if (!Array.isArray(parsed)) return;
    for (const booking of parsed) {
      if (booking?.id) {
        guestBookingCache.set(booking.id, booking);
      }
    }
  } catch (err) {
    console.warn('[barbergo] loadGuestBookingsFromStorage failed:', err);
  }
}

let guestBookingsHydrated = false;

async function ensureGuestBookingsHydrated(): Promise<void> {
  if (guestBookingsHydrated) return;
  await loadGuestBookingsFromStorage();
  guestBookingsHydrated = true;
}

function shouldCacheAsGuest(booking: Booking): boolean {
  return !booking.customerId;
}

function cacheGuestBooking(booking: Booking): void {
  if (!shouldCacheAsGuest(booking)) return;
  guestBookingCache.set(booking.id, booking);
  void persistGuestBookings();
}

async function syncBookingToLocalCache(booking: Booking): Promise<void> {
  if (!shouldCacheAsGuest(booking)) return;
  const hasToken = Boolean(booking.accessToken) || Boolean(await getBookingAccessToken(booking.id));
  if (guestBookingCache.has(booking.id) || hasToken) {
    cacheGuestBooking(booking);
  }
}

function getCachedGuestBooking(id: string): Booking | undefined {
  return guestBookingCache.get(id);
}

/** Bookings created on this device (guest flow). Refreshes status from Supabase when possible. */
export async function listLocalGuestBookings(): Promise<Booking[]> {
  await ensureGuestBookingsHydrated();
  const local = [...guestBookingCache.values()];

  const refreshed = await Promise.all(
    local.map(async (booking) => {
      const token = booking.accessToken ?? (await getBookingAccessToken(booking.id));
      if (!token) return booking;
      const fresh = await fetchGuestBookingViaRpc(booking.id, token);
      if (fresh) {
        cacheGuestBooking(fresh);
        return fresh;
      }
      return booking;
    })
  );

  return sortBookings(dedupeBookingsById(refreshed));
}

function generateMockId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildBookingFromInput(
  id: string,
  input: CreateBookingInput,
  options?: {
    accessToken?: string;
    customerId?: string;
    timestamps?: { createdAt: string; updatedAt: string };
  }
): Booking {
  const { serviceFeeChf, totalChf } = calculateBookingTotal(input.service.priceChf);
  const now = options?.timestamps?.createdAt ?? new Date().toISOString();
  const appointmentDate =
    parseSwissDateToIso(input.appointmentDate) ?? input.appointmentDate.trim();

  return {
    id,
    providerId: input.providerId,
    serviceId: input.service.id,
    status: 'pending',
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    appointmentDate,
    appointmentTime: input.appointmentTime.trim(),
    note: input.note?.trim() || undefined,
    servicePriceChf: input.service.priceChf,
    serviceFeeChf,
    totalChf,
    customerId: options?.customerId,
    accessToken: options?.accessToken,
    createdAt: now,
    updatedAt: options?.timestamps?.updatedAt ?? now,
  };
}

export function getServiceById(serviceId: string, services: Service[]): Service | undefined {
  return services.find((s) => s.id === serviceId);
}

export async function listBookings(): Promise<BookingsLoadResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { bookings: sortBookings(mockBookings), source: 'mock' };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.bookings)
      .select(BOOKING_SELECT)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as BookingRow[];
    return {
      bookings: sortBookings(dedupeBookingsById(rows.map(mapBooking))),
      source: 'supabase',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Buchungen konnten nicht geladen werden.';
    console.warn('[barbergo] listBookings fallback:', message);
    return { bookings: sortBookings(mockBookings), source: 'mock', error: message };
  }
}

export async function getBookingById(id: string): Promise<BookingLoadResult> {
  await ensureGuestBookingsHydrated();

  const client = getSupabaseClient();
  if (!client) {
    const cached = getCachedGuestBooking(id);
    if (cached) return { booking: cached, source: 'supabase' };
    const booking = mockBookings.find((b) => b.id === id);
    return { booking, source: 'mock' };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.bookings)
      .select(BOOKING_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      const booking = mapBooking(data as BookingRow);
      if (shouldCacheAsGuest(booking)) {
        const token = await getBookingAccessToken(id);
        if (token || getCachedGuestBooking(id)) {
          cacheGuestBooking(booking);
        }
      }
      return { booking, source: 'supabase' };
    }

    const accessToken =
      getCachedGuestBooking(id)?.accessToken ?? (await getBookingAccessToken(id));
    if (accessToken) {
      const guest = await fetchGuestBookingViaRpc(id, accessToken);
      if (guest) {
        cacheGuestBooking(guest);
        return { booking: guest, source: 'supabase' };
      }
    }

    const cached = getCachedGuestBooking(id);
    if (cached) {
      return { booking: cached, source: 'supabase' };
    }

    const booking = mockBookings.find((b) => b.id === id);
    return { booking, source: booking ? 'mock' : 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Buchung konnte nicht geladen werden.';
    console.warn('[barbergo] getBookingById fallback:', message);

    const cached = getCachedGuestBooking(id);
    if (cached) {
      return { booking: cached, source: 'supabase', error: message };
    }

    const booking = mockBookings.find((b) => b.id === id);
    return { booking, source: 'mock', error: message };
  }
}

async function fetchGuestBookingViaRpc(
  bookingId: string,
  accessToken: string
): Promise<Booking | undefined> {
  const client = getSupabaseClient();
  if (!client) return undefined;

  const { data, error } = await client.rpc('get_guest_booking', {
    p_booking_id: bookingId,
    p_access_token: accessToken,
  });

  if (error || !data) {
    return undefined;
  }

  const row = (Array.isArray(data) ? data[0] : data) as BookingRow | undefined;
  return row ? mapBooking(row) : undefined;
}

export async function listCustomerBookings(): Promise<BookingsLoadResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { bookings: [], source: 'mock', error: 'Termine konnten nicht geladen werden.' };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.bookings)
      .select(BOOKING_SELECT)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as BookingRow[];
    return {
      bookings: sortBookings(dedupeBookingsById(rows.map(mapBooking))),
      source: 'supabase',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Termine konnten nicht geladen werden.';
    return { bookings: [], source: 'supabase', error: message };
  }
}

export type CreateSlotBookingInput = {
  providerId: string;
  service: Service;
  startAt: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  customerId?: string;
};

export async function createSlotBooking(
  input: CreateSlotBookingInput
): Promise<BookingMutationResult> {
  const { bookSlot } = await import('./slots');
  const slotResult = await bookSlot({
    providerId: input.providerId,
    service: input.service,
    startAt: input.startAt,
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    note: input.note,
    customerId: input.customerId,
  });

  if (slotResult.error) {
    return { source: slotResult.source, error: slotResult.error };
  }

  if (!slotResult.bookingId) {
    return { source: slotResult.source, error: 'Buchung konnte nicht erstellt werden.' };
  }

  if (slotResult.source === 'mock') {
    const display = getBookingDisplayDateTime({
      id: slotResult.bookingId,
      providerId: input.providerId,
      serviceId: input.service.id,
      status: 'confirmed',
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      appointmentDate: '',
      appointmentTime: '',
      startAt: input.startAt,
      servicePriceChf: input.service.priceChf,
      serviceFeeChf: 1,
      totalChf: input.service.priceChf + 1,
      customerId: input.customerId,
    });
    const booking = buildBookingFromInput(slotResult.bookingId, {
      providerId: input.providerId,
      service: input.service,
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      appointmentDate: display.dateSwiss,
      appointmentTime: display.time,
      note: input.note,
      customerId: input.customerId,
    });
    booking.status = 'confirmed';
    booking.startAt = input.startAt;
    if (!input.customerId) {
      cacheGuestBooking(booking);
    }
    mockBookings.unshift(booking);
    return { booking, source: 'mock' };
  }

  const loaded = await getBookingById(slotResult.bookingId);
  if (!loaded.booking) {
    return { source: 'supabase', error: 'Buchung wurde erstellt, konnte aber nicht geladen werden.' };
  }

  const isGuest = !input.customerId;
  if (isGuest && slotResult.accessToken) {
    await saveBookingAccessToken(slotResult.bookingId, slotResult.accessToken);
    cacheGuestBooking({ ...loaded.booking, accessToken: slotResult.accessToken });
  }

  return { booking: loaded.booking, source: 'supabase' };
}

export type CreateBookingInput = {
  providerId: string;
  service: Service;
  customerName: string;
  phone: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
  note?: string;
  customerId?: string;
};

function buildBookingPayload(input: CreateBookingInput, options: { accessToken?: string }) {
  const { serviceFeeChf, totalChf } = calculateBookingTotal(input.service.priceChf);
  const appointmentDate =
    parseSwissDateToIso(input.appointmentDate) ?? input.appointmentDate.trim();

  return {
    provider_id: input.providerId,
    service_id: input.service.id,
    status: 'pending' as const,
    customer_name: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    appointment_date: appointmentDate,
    appointment_time: input.appointmentTime.trim(),
    note: input.note?.trim() || null,
    service_price_chf: input.service.priceChf,
    service_fee_chf: serviceFeeChf,
    total_chf: totalChf,
    customer_id: input.customerId ?? null,
    access_token: options.accessToken ?? null,
  };
}

function buildMockBooking(input: CreateBookingInput): Booking {
  const booking = buildBookingFromInput(generateMockId(), input, {
    customerId: input.customerId,
  });
  mockBookings.unshift(booking);
  return booking;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingMutationResult> {
  const client = getSupabaseClient();
  if (!client) {
    const booking = buildMockBooking(input);
    if (!input.customerId) {
      cacheGuestBooking(booking);
    }
    console.warn('[barbergo] createBooking: Supabase nicht konfiguriert — Demo-Buchung lokal gespeichert.');
    return { booking, source: 'mock' };
  }

  if (isMockCatalogId(input.providerId) || isMockCatalogId(input.service.id)) {
    return {
      source: 'mock',
      error: formatBookingIdError(input.providerId, input.service.id),
    };
  }

  if (!isValidUuid(input.providerId) || !isValidUuid(input.service.id)) {
    return {
      source: 'mock',
      error: formatBookingIdError(input.providerId, input.service.id),
    };
  }

  try {
    const id = generateUuid();
    const isGuest = !input.customerId;
    const accessToken = isGuest ? generateAccessToken() : undefined;
    const payload = {
      id,
      ...buildBookingPayload(input, { accessToken }),
    };

    const { error } = await client.from(SupabaseTables.bookings).insert(payload);
    if (error) {
      throw error;
    }

    const booking = buildBookingFromInput(id, input, {
      accessToken,
      customerId: input.customerId,
    });

    if (isGuest && accessToken) {
      await saveBookingAccessToken(id, accessToken);
      cacheGuestBooking(booking);
    }

    return { booking, source: 'supabase' };
  } catch (err) {
    const classified = classifySupabaseError(err);
    const technical =
      classified.reason === 'rls_denied'
        ? `RLS denied: ${classified.detail}`
        : classified.detail || String(err);
    console.warn('[barbergo] createBooking failed:', technical);
    return {
      source: 'supabase',
      error: toUserBookingError(classified.reason, technical),
    };
  }
}

function toUserBookingError(reason: CatalogFailureReason | undefined, technical: string): string {
  if (reason === 'rls_denied') {
    return 'Die Buchung konnte nicht gespeichert werden. Bitte versuche es später erneut.';
  }
  if (technical.toLowerCase().includes('fetch') || technical.toLowerCase().includes('network')) {
    return 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.';
  }
  return 'Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.';
}

export async function cancelCustomerBooking(id: string): Promise<BookingMutationResult> {
  const cached = getCachedGuestBooking(id);
  const client = getSupabaseClient();

  if (!client) {
    const booking = mockBookings.find((b) => b.id === id) ?? cached;
    if (!booking) {
      return { source: 'mock', error: 'Buchung nicht gefunden.' };
    }
    if (!canCancelBooking(booking)) {
      return { source: 'mock', error: cancelBookingBlockedReason(booking) };
    }
    booking.status = 'cancelled';
    booking.updatedAt = new Date().toISOString();
    cacheGuestBooking(booking);
    return { booking: { ...booking }, source: 'mock' };
  }

  const existing =
    cached ??
    (await getBookingById(id)).booking ??
    mockBookings.find((b) => b.id === id);

  if (!existing) {
    return { source: 'supabase', error: 'Buchung nicht gefunden.' };
  }

  if (!canCancelBooking(existing)) {
    return { source: 'supabase', error: cancelBookingBlockedReason(existing) };
  }

  if (existing.customerId) {
    const { error } = await client
      .from(SupabaseTables.bookings)
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      return { source: 'supabase', error: error.message };
    }

    const updated = { ...existing, status: 'cancelled' as const, updatedAt: new Date().toISOString() };
    await syncBookingToLocalCache(updated);
    return { booking: updated, source: 'supabase' };
  }

  return cancelGuestBooking(id);
}

export async function cancelGuestBooking(id: string): Promise<BookingMutationResult> {
  const cached = getCachedGuestBooking(id);
  const accessToken = cached?.accessToken ?? (await getBookingAccessToken(id));

  if (!accessToken) {
    return { source: 'supabase', error: 'Zugriffstoken für diese Buchung fehlt.' };
  }

  const existing = cached ?? (await fetchGuestBookingViaRpc(id, accessToken));
  if (!existing) {
    return { source: 'supabase', error: 'Buchung nicht gefunden.' };
  }

  if (!canCancelBooking(existing)) {
    return { source: 'supabase', error: cancelBookingBlockedReason(existing) };
  }

  const client = getSupabaseClient();
  if (!client) {
    const updated = { ...existing, status: 'cancelled' as const, updatedAt: new Date().toISOString() };
    cacheGuestBooking(updated);
    return { booking: updated, source: 'mock' };
  }

  const { error } = await client.rpc('cancel_guest_booking', {
    p_booking_id: id,
    p_access_token: accessToken,
  });

  if (error) {
    return { source: 'supabase', error: error.message };
  }

  const updated = { ...existing, status: 'cancelled' as const, updatedAt: new Date().toISOString() };
  cacheGuestBooking(updated);
  return { booking: updated, source: 'supabase' };
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingMutationResult> {
  const client = getSupabaseClient();
  if (!client) {
    const booking = mockBookings.find((b) => b.id === id);
    if (!booking) {
      return { source: 'mock', error: 'Buchung nicht gefunden.' };
    }
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    return { booking: { ...booking }, source: 'mock' };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.bookings)
      .update({ status })
      .eq('id', id)
      .select(BOOKING_SELECT)
      .single();

    if (error) {
      throw error;
    }

    const booking = mapBooking(data as BookingRow);
    await syncBookingToLocalCache(booking);
    return { booking, source: 'supabase' };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Status konnte nicht aktualisiert werden.';
    console.warn('[barbergo] updateBookingStatus fallback:', message);

    const booking = mockBookings.find((b) => b.id === id);
    if (booking) {
      booking.status = status;
      booking.updatedAt = new Date().toISOString();
      return { booking: { ...booking }, source: 'mock', error: message };
    }

    return { source: 'mock', error: message };
  }
}

export { canCancelBooking, cancelBookingBlockedReason };
