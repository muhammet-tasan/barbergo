import { getSupabaseClient } from '@/services/supabase';

export type ProfileRole = 'customer' | 'barber' | 'admin' | 'barber_pending';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type UserProfile = {
  id: string;
  role: ProfileRole;
  displayName: string | null;
  phone: string | null;
  approvalStatus: ApprovalStatus;
  providerId: string | null;
};

export type ProfileListItem = UserProfile & {
  email?: string | null;
};

function parseProfileRole(value: unknown): ProfileRole | null {
  if (
    value === 'customer' ||
    value === 'barber' ||
    value === 'admin' ||
    value === 'barber_pending'
  ) {
    return value;
  }
  return null;
}

function parseApprovalStatus(value: unknown): ApprovalStatus {
  if (value === 'pending' || value === 'rejected') return value;
  return 'approved';
}

function mapProfileRow(row: {
  id: string;
  role: unknown;
  display_name: unknown;
  phone: unknown;
  approval_status?: unknown;
  provider_id?: unknown;
}): UserProfile | null {
  const role = parseProfileRole(row.role);
  if (!role) return null;

  return {
    id: row.id,
    role,
    displayName: typeof row.display_name === 'string' ? row.display_name : null,
    phone: typeof row.phone === 'string' ? row.phone : null,
    approvalStatus: parseApprovalStatus(row.approval_status),
    providerId: typeof row.provider_id === 'string' ? row.provider_id : null,
  };
}

const PROFILE_SELECT = 'id, role, display_name, phone, approval_status, provider_id';

/** Load role and contact fields from public.profiles — authoritative for app + RLS. */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[barbergo] fetchUserProfile:', error.message);
    return null;
  }

  if (!data) return null;
  return mapProfileRow(data as Parameters<typeof mapProfileRow>[0]);
}

export async function updateOwnProfile(input: {
  userId: string;
  displayName: string;
  phone: string;
}): Promise<{ error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { error: 'Profil konnte nicht gespeichert werden.' };

  const { error } = await client
    .from('profiles')
    .update({
      display_name: input.displayName.trim(),
      phone: input.phone.trim(),
    })
    .eq('id', input.userId);

  if (error) return { error: error.message };
  return {};
}

export async function listAllProfiles(): Promise<{
  profiles: ProfileListItem[];
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { profiles: [], error: 'Nicht verfügbar.' };

  const { data, error } = await client.from('profiles').select(PROFILE_SELECT).order('role');

  if (error) return { profiles: [], error: error.message };

  const profiles = (data ?? [])
    .map((row) => mapProfileRow(row as Parameters<typeof mapProfileRow>[0]))
    .filter((p): p is UserProfile => p != null);

  return { profiles };
}

export async function listPendingBarbers(): Promise<{
  profiles: UserProfile[];
  error?: string;
}> {
  const result = await listAllProfiles();
  return {
    profiles: result.profiles.filter(
      (p) => p.role === 'barber_pending' && p.approvalStatus === 'pending'
    ),
    error: result.error,
  };
}

export async function setBarberApproval(
  profileId: string,
  approval: 'approved' | 'rejected'
): Promise<{ error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { error: 'Nicht verfügbar.' };

  const { error } = await client
    .from('profiles')
    .update({
      role: approval === 'approved' ? 'barber' : 'barber_pending',
      approval_status: approval,
    })
    .eq('id', profileId);

  if (error) return { error: error.message };
  return {};
}
