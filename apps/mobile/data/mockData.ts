import type { Booking, Provider, Service } from '@/types/domain';

import { isSupabaseConfigured } from '@/services/supabase';

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

export const mockBookings: Booking[] = [];
