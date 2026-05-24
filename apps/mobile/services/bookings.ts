import { mockBookings } from '@/data/mockData';
import { calculateBookingTotal } from '@/constants/pricing';
import type { Booking, BookingStatus, Service } from '@/types/domain';
import { parseSwissDateToIso } from '@/utils/date';

import { isMockCatalogId, isValidUuid } from '@/utils/uuid';

import { formatBookingIdError, formatCatalogErrorMessage, getEnvConfigStatus } from './catalog-errors';
import { getSupabaseClient, SupabaseTables } from './supabase';
import { mapBooking, sortBookings, type BookingRow } from './supabase-mappers';

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

function generateMockId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
      .select(
        'id, provider_id, service_id, status, customer_name, phone, address, appointment_date, appointment_time, note, service_price_chf, service_fee_chf, total_chf, created_at, updated_at'
      )
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as BookingRow[];
    return { bookings: sortBookings(rows.map(mapBooking)), source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Buchungen konnten nicht geladen werden.';
    console.warn('[barbergo] listBookings fallback:', message);
    return { bookings: sortBookings(mockBookings), source: 'mock', error: message };
  }
}

export async function getBookingById(id: string): Promise<BookingLoadResult> {
  const client = getSupabaseClient();
  if (!client) {
    const booking = mockBookings.find((b) => b.id === id);
    return { booking, source: 'mock' };
  }

  try {
    const { data, error } = await client
      .from(SupabaseTables.bookings)
      .select(
        'id, provider_id, service_id, status, customer_name, phone, address, appointment_date, appointment_time, note, service_price_chf, service_fee_chf, total_chf, created_at, updated_at'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      const booking = mockBookings.find((b) => b.id === id);
      return { booking, source: booking ? 'mock' : 'supabase' };
    }

    return { booking: mapBooking(data as BookingRow), source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Buchung konnte nicht geladen werden.';
    console.warn('[barbergo] getBookingById fallback:', message);
    const booking = mockBookings.find((b) => b.id === id);
    return { booking, source: 'mock', error: message };
  }
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
};

function buildBookingPayload(input: CreateBookingInput) {
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
  };
}

function buildMockBooking(input: CreateBookingInput): Booking {
  const { serviceFeeChf, totalChf } = calculateBookingTotal(input.service.priceChf);
  const now = new Date().toISOString();
  const appointmentDate =
    parseSwissDateToIso(input.appointmentDate) ?? input.appointmentDate.trim();

  const booking: Booking = {
    id: generateMockId(),
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
    createdAt: now,
    updatedAt: now,
  };

  mockBookings.unshift(booking);
  return booking;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingMutationResult> {
  const client = getSupabaseClient();
  if (!client) {
    const env = getEnvConfigStatus();
    return {
      booking: buildMockBooking(input),
      source: 'mock',
      error: formatCatalogErrorMessage('env_missing', { missingEnv: env.missing }),
    };
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
    const payload = buildBookingPayload(input);
    const { data, error } = await client
      .from(SupabaseTables.bookings)
      .insert(payload)
      .select(
        'id, provider_id, service_id, status, customer_name, phone, address, appointment_date, appointment_time, note, service_price_chf, service_fee_chf, total_chf, created_at, updated_at'
      )
      .single();

    if (error) {
      throw error;
    }

    return { booking: mapBooking(data as BookingRow), source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Buchung konnte nicht gespeichert werden.';
    console.warn('[barbergo] createBooking failed:', message);
    return { source: 'mock', error: message };
  }
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
      .select(
        'id, provider_id, service_id, status, customer_name, phone, address, appointment_date, appointment_time, note, service_price_chf, service_fee_chf, total_chf, created_at, updated_at'
      )
      .single();

    if (error) {
      throw error;
    }

    return { booking: mapBooking(data as BookingRow), source: 'supabase' };
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
