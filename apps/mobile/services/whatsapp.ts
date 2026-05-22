import * as Linking from 'expo-linking';

import type { Booking } from '@/types/domain';
import { formatChf } from '@/constants/pricing';
import { formatSwissDate } from '@/utils/date';

const DEFAULT_DEMO_BARBER_WHATSAPP_E164 = '41791234567';
const barberWhatsapp =
  process.env.EXPO_PUBLIC_WHATSAPP_PHONE ??
  process.env.EXPO_PUBLIC_BARBER_WHATSAPP ??
  DEFAULT_DEMO_BARBER_WHATSAPP_E164;

const bookingStatusLabel = {
  pending: 'offen',
  confirmed: 'bestätigt',
  completed: 'abgeschlossen',
  cancelled: 'storniert',
} as const;

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

function buildBookingMessage(
  booking: Booking,
  serviceName: string,
  providerName: string
): string {
  const lines = [
    `Hallo ${providerName},`,
    '',
    'Neue barbergo Buchungsanfrage:',
    `• Service: ${serviceName}`,
    `• Datum: ${formatSwissDate(booking.appointmentDate)}`,
    `• Uhrzeit: ${booking.appointmentTime}`,
    `• Kunde: ${booking.customerName}`,
    `• Telefon: ${booking.phone}`,
    `• Adresse: ${booking.address}`,
    `• Status: ${bookingStatusLabel[booking.status]}`,
    `• Gesamt: ${formatChf(booking.totalChf)} (inkl. ${formatChf(booking.serviceFeeChf)} Gebühr)`,
  ];

  if (booking.note) {
    lines.push(`• Notiz: ${booking.note}`);
  }

  lines.push('', 'Gesendet mit der barbergo App');
  return lines.join('\n');
}

export async function openWhatsAppChat(phoneE164: string, message?: string): Promise<boolean> {
  const phone = digitsOnly(phoneE164);
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  const url = `https://wa.me/${phone}${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    return false;
  }
  await Linking.openURL(url);
  return true;
}

export async function openBarberWhatsAppBooking(
  booking: Booking,
  serviceName: string,
  providerName: string
): Promise<boolean> {
  const message = buildBookingMessage(booking, serviceName, providerName);
  return openWhatsAppChat(barberWhatsapp, message);
}

export async function openCustomerWhatsApp(phone: string, message: string): Promise<boolean> {
  const normalized = digitsOnly(phone);
  const withCountry =
    normalized.startsWith('41') || normalized.startsWith('0')
      ? normalized.replace(/^0/, '41')
      : normalized;
  return openWhatsAppChat(withCountry, message);
}
