import type { RegistrationRole } from '@/services/auth';

import { getSupabaseClient } from '@/services/supabase';
import { logger } from '@/utils/logger';



export const DEMO_PROVIDER_ID = '11111111-1111-1111-1111-111111111111';



export type ProfileRole = 'customer' | 'barber' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';



export type UserProfile = {

  id: string;

  role: ProfileRole;

  displayName: string | null;

  phone: string | null;

  address: string | null;

  approvalStatus: ApprovalStatus;

  providerId: string | null;

};



export type ProfileListItem = UserProfile & {

  email?: string | null;

};



const PROFILE_SELECT_EXTENDED =

  'id, role, display_name, phone, address, approval_status, provider_id';

const PROFILE_SELECT_CORE = 'id, role, display_name, phone';



function isMissingSchemaColumnError(message?: string): boolean {

  if (!message) return false;

  const lower = message.toLowerCase();

  return lower.includes('does not exist') && lower.includes('column');

}



function isRlsRecursionError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes('infinite recursion') && lower.includes('profiles');
}

function sanitizeProfilesListError(error?: string): string | undefined {
  if (!error || isMissingSchemaColumnError(error) || isRlsRecursionError(error)) {
    return undefined;
  }
  return error;
}



function parseProfileRole(value: unknown): ProfileRole | null {

  if (value === 'customer' || value === 'barber' || value === 'admin') {

    return value;

  }

  if (value === 'barber_pending') return 'barber';

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
  address?: unknown;
  approval_status?: unknown;
  provider_id?: unknown;
}): UserProfile | null {
  const rawRole = row.role;
  const role = parseProfileRole(rawRole);
  if (!role) return null;

  let approvalStatus = parseApprovalStatus(row.approval_status);
  if (rawRole === 'barber_pending') {
    approvalStatus = 'pending';
  }

  return {
    id: row.id,
    role,
    displayName: typeof row.display_name === 'string' ? row.display_name : null,
    phone: typeof row.phone === 'string' ? row.phone : null,
    address: typeof row.address === 'string' ? row.address : null,
    approvalStatus,
    providerId: typeof row.provider_id === 'string' ? row.provider_id : null,
  };
}

async function fetchProfilesViaAdminRpc(): Promise<{ rows: unknown[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { rows: [] };

  const { data, error } = await client.rpc('list_profiles_for_admin');
  if (error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes('could not find the function') ||
      lower.includes('pgrst202') ||
      lower.includes('forbidden')
    ) {
      return { rows: [] };
    }
    return { rows: [], error: error.message };
  }
  return { rows: (data as unknown[]) ?? [] };
}



async function selectProfilesRows(

  run: (columns: string) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>

): Promise<{ rows: unknown[]; error?: string }> {

  const extended = await run(PROFILE_SELECT_EXTENDED);

  if (!extended.error) {

    return { rows: extended.data ?? [] };

  }

  if (!isMissingSchemaColumnError(extended.error.message)) {

    return { rows: [], error: extended.error.message };

  }



  const core = await run(PROFILE_SELECT_CORE);

  if (core.error) {

    return { rows: [], error: sanitizeProfilesListError(core.error.message) };

  }

  return { rows: core.data ?? [] };

}



export async function waitForUserProfile(

  userId: string,

  attempts = 6,

  delayMs = 400

): Promise<UserProfile | null> {

  for (let i = 0; i < attempts; i++) {

    const profile = await fetchUserProfile(userId);

    if (profile) return profile;

    await new Promise((resolve) => setTimeout(resolve, delayMs));

  }

  return null;

}



export async function ensureUserProfileRow(input: {
  userId: string;
  registrationRole: RegistrationRole;
  displayName: string;
  phone?: string;
  address?: string;
}): Promise<UserProfile | null> {

  const existing = await fetchUserProfile(input.userId);

  if (existing) return existing;



  const client = getSupabaseClient();

  if (!client) return null;



  const displayName = input.displayName.trim();

  const phone = input.phone?.trim() || null;
  const address = input.address?.trim() || null;

  const { error: rpcError } = await client.rpc('upsert_own_profile', {
    p_display_name: displayName,
    p_phone: phone,
    p_address: address,
  });

  if (!rpcError) {

    const profile = await fetchUserProfile(input.userId);

    if (profile) return profile;

  }



  const role = input.registrationRole === 'barber' ? 'barber' : 'customer';

  const insertPayload: Record<string, string | null> = {

    id: input.userId,

    role,

    display_name: displayName,

    phone,

  };



  const { error: insertError } = await client.from('profiles').insert(insertPayload);

  if (insertError && !insertError.message.toLowerCase().includes('duplicate')) {

    logger.warn('profiles', 'ensureUserProfileRow insert failed', insertError);

  }



  return fetchUserProfile(input.userId);

}



export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {

  const client = getSupabaseClient();

  if (!client) return null;



  const { rows, error } = await selectProfilesRows((columns) =>

    client.from('profiles').select(columns).eq('id', userId).maybeSingle().then((result) => ({

      data: result.data ? [result.data] : [],

      error: result.error,

    }))

  );



  if (error) {

    logger.warn('profiles', 'fetchUserProfile failed', error);

    return null;

  }



  const row = rows[0];

  if (!row) return null;

  return mapProfileRow(row as Parameters<typeof mapProfileRow>[0]);

}



export async function updateOwnProfile(input: {

  userId: string;

  displayName: string;

  phone: string;

  address?: string;

  roleHint?: ProfileRole;

}): Promise<{ error?: string }> {

  const client = getSupabaseClient();

  if (!client) return { error: 'Profil konnte nicht gespeichert werden.' };



  const displayName = input.displayName.trim();

  const phone = input.phone.trim() || null;

  const address = input.address?.trim() || null;



  const { error: rpcError } = await client.rpc('upsert_own_profile', {

    p_display_name: displayName,

    p_phone: phone,

    p_address: address,

  });



  if (!rpcError) return {};



  const payloads = [

    { display_name: displayName, phone, address },

    { display_name: displayName, phone },

  ];



  for (const payload of payloads) {

    const { data, error } = await client

      .from('profiles')

      .update(payload)

      .eq('id', input.userId)

      .select('id')

      .maybeSingle();



    if (error) {

      if (isMissingSchemaColumnError(error.message)) continue;

      return { error: error.message };

    }

    if (data) return {};

  }



  if (input.roleHint === 'admin' && rpcError) {
    const { error: adminInsertError } = await client.from('profiles').upsert(
      {
        id: input.userId,
        role: 'admin',
        display_name: displayName,
        phone,
        ...(address ? { address } : {}),
      },
      { onConflict: 'id' }
    );
    if (!adminInsertError) return {};
    if (!isMissingSchemaColumnError(adminInsertError.message)) {
      return { error: adminInsertError.message };
    }
  }

  if (input.roleHint !== 'admin') {
    const ensured = await ensureUserProfileRow({

      userId: input.userId,

      registrationRole: input.roleHint === 'barber' ? 'barber' : 'customer',

      displayName,

      phone: phone ?? undefined,

    });



    if (ensured) {

      const { error: retryError } = await client

        .from('profiles')

        .update({ display_name: displayName, phone, ...(address ? { address } : {}) })

        .eq('id', input.userId);

      if (!retryError) return {};

      if (!isMissingSchemaColumnError(retryError.message)) {

        return { error: retryError.message };

      }

      const { error: minimalRetry } = await client

        .from('profiles')

        .update({ display_name: displayName, phone })

        .eq('id', input.userId);

      if (!minimalRetry) return {};

      return { error: minimalRetry.message };

    }

  }



  return {

    error:

      'Profil konnte nicht gespeichert werden. Bitte Migration 0005/0008/0009 in Supabase ausführen.',

  };

}



export async function fetchProfileById(userId: string): Promise<UserProfile | null> {

  return fetchUserProfile(userId);

}



export async function listCustomerProfiles(): Promise<{

  profiles: ProfileListItem[];

  error?: string;

}> {

  const result = await listAllProfiles();

  return {

    profiles: result.profiles.filter((p) => p.role === 'customer'),

    error: result.error,

  };

}



export async function listAllProfiles(): Promise<{
  profiles: ProfileListItem[];
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { profiles: [], error: 'Nicht verfügbar.' };

  const adminRpc = await fetchProfilesViaAdminRpc();
  const rpcMissing = adminRpc.error?.toLowerCase().includes('could not find the function')
    || adminRpc.error?.toLowerCase().includes('pgrst202');

  if (!rpcMissing) {
    const profiles = adminRpc.rows
      .map((row) => mapProfileRow(row as Parameters<typeof mapProfileRow>[0]))
      .filter((p): p is UserProfile => p != null);
    return { profiles, error: sanitizeProfilesListError(adminRpc.error) };
  }

  const { rows, error } = await selectProfilesRows((columns) =>
    client.from('profiles').select(columns).order('role')
  );

  const profiles = rows
    .map((row) => mapProfileRow(row as Parameters<typeof mapProfileRow>[0]))
    .filter((p): p is UserProfile => p != null);

  return { profiles, error: sanitizeProfilesListError(error) };
}



export async function listBarberProfiles(): Promise<{

  profiles: UserProfile[];

  error?: string;

}> {

  const result = await listAllProfiles();

  return {

    profiles: result.profiles.filter((p) => p.role === 'barber'),

    error: result.error,

  };

}



export async function listPendingBarbers(): Promise<{

  profiles: UserProfile[];

  error?: string;

}> {

  const result = await listAllProfiles();

  return {

    profiles: result.profiles.filter((p) => {
      if (p.role !== 'barber') return false;
      if (p.approvalStatus === 'rejected') return false;
      if (p.approvalStatus === 'pending') return true;
      return !p.providerId;
    }),

    error: result.error,

  };

}



export async function setBarberApproval(

  profileId: string,

  approval: 'approved' | 'rejected'

): Promise<{ error?: string }> {

  const client = getSupabaseClient();

  if (!client) return { error: 'Nicht verfügbar.' };



  const { error } = await client.rpc('approve_barber_profile', {

    p_profile_id: profileId,

    p_approval: approval,

  });



  if (error) return { error: error.message };

  return {};

}

