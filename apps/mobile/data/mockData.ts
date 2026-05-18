import type { Booking, Provider, Service } from '@/types/domain';

import { isSupabaseConfigured } from '@/services/supabase';
import { calculateBookingTotal } from '@/constants/pricing';

/**
 * Mock data — used until Supabase env vars are configured.
 * Replace reads with Supabase queries in services/ when live.
 */
export const useMockData = !isSupabaseConfigured();

export const defaultProvider: Provider = {
  id: 'provider-1',
  name: 'Muhammet',
  description: 'Mobile barber — professional cuts at your home in Basel.',
  serviceArea: 'Basel & surroundings',
  isActive: true,
};

export const services: Service[] = [
  {
    id: 'service-1',
    providerId: defaultProvider.id,
    name: "Men's haircut",
    priceChf: 45,
    durationMinutes: 30,
    sortOrder: 1,
  },
  {
    id: 'service-2',
    providerId: defaultProvider.id,
    name: 'Beard trim',
    priceChf: 25,
    durationMinutes: 20,
    sortOrder: 2,
  },
  {
    id: 'service-3',
    providerId: defaultProvider.id,
    name: 'Haircut + beard',
    priceChf: 60,
    durationMinutes: 45,
    sortOrder: 3,
  },
  {
    id: 'service-4',
    providerId: defaultProvider.id,
    name: 'Kids haircut',
    priceChf: 35,
    durationMinutes: 25,
    sortOrder: 4,
  },
];

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const haircutTotal = calculateBookingTotal(services[0].priceChf);
const comboTotal = calculateBookingTotal(services[2].priceChf);

export const mockBookings: Booking[] = [
  {
    id: 'booking-demo-1',
    providerId: defaultProvider.id,
    serviceId: services[0].id,
    status: 'pending',
    customerName: 'Luca Meier',
    phone: '+41 79 123 45 67',
    address: 'Musterstrasse 12, 4051 Basel',
    appointmentDate: tomorrow,
    appointmentTime: '14:30',
    note: 'Please ring twice.',
    servicePriceChf: services[0].priceChf,
    serviceFeeChf: haircutTotal.serviceFeeChf,
    totalChf: haircutTotal.totalChf,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'booking-demo-2',
    providerId: defaultProvider.id,
    serviceId: services[2].id,
    status: 'confirmed',
    customerName: 'Arben Krasniqi',
    phone: '+41 76 555 22 11',
    address: 'Clarastrasse 20, 4058 Basel',
    appointmentDate: nextWeek,
    appointmentTime: '18:00',
    servicePriceChf: services[2].priceChf,
    serviceFeeChf: comboTotal.serviceFeeChf,
    totalChf: comboTotal.totalChf,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
