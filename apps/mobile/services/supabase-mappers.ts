import type { Booking, BookingStatus, Provider, Service } from '@/types/domain';

export type ProviderRow = {
  id: string;
  name: string;
  description: string;
  service_area: string;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
};

export type ServiceRow = {
  id: string;
  provider_id: string;
  name: string;
  price_chf: number | string;
  duration_minutes: number;
  sort_order: number;
  is_active: boolean;
};

export type BookingRow = {
  id: string;
  provider_id: string;
  service_id: string;
  status: BookingStatus;
  customer_name: string;
  phone: string;
  address: string;
  appointment_date: string;
  appointment_time: string;
  note: string | null;
  service_price_chf: number | string;
  service_fee_chf: number | string;
  total_chf: number | string;
  customer_id?: string | null;
  access_token?: string | null;
  created_at?: string;
  updated_at?: string;
};

const BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

export function normalizeBookingStatus(value: unknown): BookingStatus {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (BOOKING_STATUSES.includes(normalized as BookingStatus)) {
      return normalized as BookingStatus;
    }
  }
  return 'pending';
}

export function mapProvider(row: ProviderRow): Provider {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    serviceArea: row.service_area,
    imageUrl: row.image_url ?? undefined,
    isActive: row.is_active,
  };
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    providerId: row.provider_id,
    name: row.name,
    priceChf: toNumber(row.price_chf),
    durationMinutes: row.duration_minutes,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    providerId: row.provider_id,
    serviceId: row.service_id,
    status: normalizeBookingStatus(row.status),
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    note: row.note ?? undefined,
    servicePriceChf: toNumber(row.service_price_chf),
    serviceFeeChf: toNumber(row.service_fee_chf),
    totalChf: toNumber(row.total_chf),
    customerId: row.customer_id ?? undefined,
    accessToken: row.access_token ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function sortBookings(bookings: Booking[]): Booking[] {
  return [...bookings].sort(
    (a, b) =>
      new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime() -
      new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime()
  );
}

export function sortServices(services: Service[]): Service[] {
  return [...services].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
