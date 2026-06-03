import type { Provider } from '@/types/domain';

/** Personal quote for barber profile (no extra DB field in MVP). */
export function getProviderQuote(provider: Provider): string {
  const firstName = provider.name.trim().split(/\s+/)[0] ?? provider.name;
  return `Präzision bei Fade und Bart — ${firstName} kommt zu dir, nicht umgekehrt.`;
}

export function getProviderHeadline(provider: Provider): string {
  return `Dein Barber in ${provider.serviceArea}`;
}
