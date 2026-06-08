import type { ProfileRole, UserProfile } from '@/services/profiles';

export type UserRole = ProfileRole;

export const RESERVED_ADMIN_EMAIL = 'admin@barbergo.ch';

export type PostLoginPath =
  | '/'
  | '/admin'
  | '/barber/dashboard'
  | '/barber/pending'
  | '/customer/bookings';

export function getUserRole(profile: UserProfile | null): UserRole | null {
  return profile?.role ?? null;
}

export function isAdminRole(profile: UserProfile | null): boolean {
  return getUserRole(profile) === 'admin';
}

export function isApprovedBarberRole(profile: UserProfile | null): boolean {
  return (
    getUserRole(profile) === 'barber' && (profile?.approvalStatus ?? 'approved') === 'approved'
  );
}

export function isBarberPendingRole(profile: UserProfile | null): boolean {
  const role = getUserRole(profile);
  return role === 'barber_pending' || profile?.approvalStatus === 'pending';
}

export function isCustomerRole(profile: UserProfile | null): boolean {
  return getUserRole(profile) === 'customer';
}

/** @deprecated Use isApprovedBarberRole — never treat admin as barber backoffice. */
export function isBarberRole(profile: UserProfile | null): boolean {
  return isApprovedBarberRole(profile);
}

export function isStaffRole(profile: UserProfile | null): boolean {
  return isAdminRole(profile) || isApprovedBarberRole(profile);
}

export function getPostLoginPath(profile: UserProfile | null): PostLoginPath {
  if (isAdminRole(profile)) return '/admin';
  if (isApprovedBarberRole(profile)) return '/barber/dashboard';
  if (isBarberPendingRole(profile)) return '/barber/pending';
  if (isCustomerRole(profile)) return '/customer/bookings';
  return '/';
}

/** Meine Termine — Konto wenn eingeloggt als Kunde, sonst Geräte-Gastliste. */
export function getBookingsListPath(
  profile: UserProfile | null
): '/customer/bookings' | '/guest/bookings' {
  return isCustomerRole(profile) ? '/customer/bookings' : '/guest/bookings';
}

export function canAccessAdminArea(profile: UserProfile | null): boolean {
  return isAdminRole(profile);
}

export function canAccessBarberDashboard(profile: UserProfile | null): boolean {
  return isApprovedBarberRole(profile);
}

export function canAccessCustomerArea(profile: UserProfile | null): boolean {
  return isCustomerRole(profile);
}
