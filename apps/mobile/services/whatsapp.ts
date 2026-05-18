import * as Linking from 'expo-linking';

import type { Booking } from '@/types/domain';
import { formatChf } from '@/constants/pricing';

/** Barber WhatsApp — replace with real number before production */
const BARBER_WHATSAPP_E164 = '41791234567';

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

function buildBookingMessage(
  booking: Booking,
  serviceName: string,
  providerName: string
): string {
  const lines = [
    `Hi ${providerName},`,
    '',
    'New barbergo booking request:',
    `• Service: ${serviceName}`,
    `• Date: ${booking.appointmentDate}`,
    `• Time: ${booking.appointmentTime}`,
    `• Customer: ${booking.customerName}`,
    `• Phone: ${booking.phone}`,
    `• Address: ${booking.address}`,
    `• Total: ${formatChf(booking.totalChf)} (incl. ${formatChf(booking.serviceFeeChf)} fee)`,
  ];

  if (booking.note) {
    lines.push(`• Note: ${booking.note}`);
  }

  lines.push('', 'Sent via barbergo app');
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
  return openWhatsAppChat(BARBER_WHATSAPP_E164, message);
}

export async function openCustomerWhatsApp(phone: string, message: string): Promise<boolean> {
  const normalized = digitsOnly(phone);
  const withCountry =
    normalized.startsWith('41') || normalized.startsWith('0')
      ? normalized.replace(/^0/, '41')
      : normalized;
  return openWhatsAppChat(withCountry, message);
}
