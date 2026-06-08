/**
 * Domain types — aligned with docs/data-model.md and future Supabase tables.
 */

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Provider = {
  id: string;
  name: string;
  description: string;
  serviceArea: string;
  imageUrl?: string;
  isActive?: boolean;
};

export type Service = {
  id: string;
  providerId: string;
  name: string;
  priceChf: number;
  durationMinutes: number;
  sortOrder?: number;
  isActive?: boolean;
};

export type Booking = {
  id: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  customerName: string;
  phone: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
  /** UTC ISO timestamps — preferred for display via timezone helpers */
  startAt?: string;
  endAt?: string;
  note?: string;
  servicePriceChf: number;
  serviceFeeChf: number;
  totalChf: number;
  customerId?: string;
  accessToken?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** @deprecated Use appointmentDate — kept for gradual screen migration */
export type BookingLegacy = Booking & {
  date?: string;
  time?: string;
};
