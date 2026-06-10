import type { RegistrationRole } from '@/services/auth';
import type { ProfileRole, UserProfile } from '@/services/profiles';

export type UserRole = ProfileRole;

export function readRegistrationRoleFromMetadata(
  metadata?: Record<string, unknown> | null
): RegistrationRole | null {
  const role = metadata?.role;
  if (role === 'barber') return 'barber';
  if (role === 'customer') return 'customer';
  return null;
}

export const RESERVED_ADMIN_EMAIL = 'admin@barbergo.ch';

export type PostLoginPath = '/' | '/admin' | '/barber/dashboard' | '/customer/bookings';

export function getUserRole(profile: UserProfile | null): UserRole | null {
  return profile?.role ?? null;
}

export function isReservedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === RESERVED_ADMIN_EMAIL.toLowerCase();
}

export function isAdminRole(
  profile: UserProfile | null,
  email?: string | null
): boolean {
  if (getUserRole(profile) === 'admin') return true;
  return isReservedAdminEmail(email);
}

export function isApprovedBarberRole(profile: UserProfile | null): boolean {
  if (getUserRole(profile) !== 'barber') return false;
  if (profile?.approvalStatus === 'rejected' || profile?.approvalStatus === 'pending') {
    return false;
  }
  return Boolean(profile?.providerId) || profile?.approvalStatus === 'approved';
}

export function isBarberPendingRole(
  profile: UserProfile | null,
  metadata?: Record<string, unknown> | null
): boolean {
  if (getUserRole(profile) === 'barber') {
    if (profile?.approvalStatus === 'pending') return true;
    if (profile?.approvalStatus === 'rejected') return false;
    if (profile?.providerId) return false;
    return true;
  }
  return readRegistrationRoleFromMetadata(metadata) === 'barber' && profile === null;
}

export function isCustomerRole(profile: UserProfile | null): boolean {
  return getUserRole(profile) === 'customer';
}

export function isBarberRole(profile: UserProfile | null): boolean {
  return isApprovedBarberRole(profile);
}

export function isStaffRole(profile: UserProfile | null): boolean {
  return isAdminRole(profile) || isApprovedBarberRole(profile);
}

export function getPostLoginPath(
  profile: UserProfile | null,
  email?: string | null,
  options?: { registrationRole?: RegistrationRole; metadata?: Record<string, unknown> | null }
): PostLoginPath {
  if (isAdminRole(profile, email)) return '/admin';
  if (isApprovedBarberRole(profile)) return '/barber/dashboard';
  if (options?.registrationRole === 'barber') return '/';
  if (isBarberPendingRole(profile, options?.metadata)) return '/';
  if (isCustomerRole(profile)) return '/customer/bookings';
  return '/';
}

export function getBookingsListPath(
  profile: UserProfile | null
): '/customer/bookings' | '/guest/bookings' {
  return isCustomerRole(profile) ? '/customer/bookings' : '/guest/bookings';
}

export function canAccessAdminArea(
  profile: UserProfile | null,
  email?: string | null
): boolean {
  return isAdminRole(profile, email);
}

export function canAccessBarberDashboard(profile: UserProfile | null): boolean {
  return isApprovedBarberRole(profile);
}

export function canAccessCustomerArea(profile: UserProfile | null): boolean {
  return isCustomerRole(profile);
}
