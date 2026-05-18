import { mockBookings } from '@/data/mockData';
import { calculateBookingTotal } from '@/constants/pricing';
import type { Booking, BookingStatus, Service } from '@/types/domain';

function generateId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listBookings(): Booking[] {
  return [...mockBookings].sort(
    (a, b) =>
      new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime() -
      new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime()
  );
}

export function getBookingById(id: string): Booking | undefined {
  return mockBookings.find((b) => b.id === id);
}

export function getServiceById(serviceId: string, services: Service[]): Service | undefined {
  return services.find((s) => s.id === serviceId);
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

export function createBooking(input: CreateBookingInput): Booking {
  const { serviceFeeChf, totalChf } = calculateBookingTotal(input.service.priceChf);
  const now = new Date().toISOString();

  const booking: Booking = {
    id: generateId(),
    providerId: input.providerId,
    serviceId: input.service.id,
    status: 'pending',
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    appointmentDate: input.appointmentDate.trim(),
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

export function updateBookingStatus(id: string, status: BookingStatus): Booking | undefined {
  const booking = mockBookings.find((b) => b.id === id);
  if (!booking) return undefined;
  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  return booking;
}
