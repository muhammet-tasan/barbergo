import type { Session } from '@supabase/supabase-js';

export type UserRole = 'barber' | 'customer';

const ROLE_VALUES: UserRole[] = ['barber', 'customer'];

function parseRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return ROLE_VALUES.includes(normalized as UserRole) ? (normalized as UserRole) : null;
}

/**
 * Role from Supabase user metadata (`user_metadata.role` or `app_metadata.role`).
 * Existing barber accounts without role default to `barber` for backward compatibility.
 */
export function getUserRole(session: Session | null): UserRole | null {
  if (!session) return null;

  const fromUser = parseRole(session.user.user_metadata?.role);
  if (fromUser) return fromUser;

  const fromApp = parseRole(session.user.app_metadata?.role);
  if (fromApp) return fromApp;

  return 'barber';
}

export function isBarberRole(session: Session | null): boolean {
  return getUserRole(session) === 'barber';
}

export function isCustomerRole(session: Session | null): boolean {
  return getUserRole(session) === 'customer';
}

export function getPostLoginPath(session: Session | null): '/' | '/admin' {
  return isBarberRole(session) ? '/admin' : '/';
}
