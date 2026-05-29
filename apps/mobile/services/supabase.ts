import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { getSupabaseEnvSnapshot, getSupabaseEnvVars } from './supabase-env';

/** When true, /admin requires Supabase login (see supabase/README.md). */
export function isAdminAuthRequired(): boolean {
  return process.env.EXPO_PUBLIC_ADMIN_AUTH_REQUIRED === 'true';
}

let client: SupabaseClient | null = null;
let cachedEnvKey = '';

function getEnvCacheKey(): string {
  const { url, anonKey } = getSupabaseEnvVars();
  return `${url}|${anonKey}`;
}

/** True when both public env vars are set (process.env or expo extra). */
export function isSupabaseConfigured(): boolean {
  return getSupabaseEnvSnapshot().configured;
}

/**
 * Returns a singleton Supabase client when env vars exist, otherwise null.
 * Session persistence is enabled for barber admin login.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    client = null;
    cachedEnvKey = '';
    return null;
  }

  const envKey = getEnvCacheKey();
  if (client && cachedEnvKey === envKey) {
    return client;
  }

  const { url, anonKey } = getSupabaseEnvVars();
  client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  });
  cachedEnvKey = envKey;
  return client;
}

/** Table names — keep in sync with docs/data-model.md */
export const SupabaseTables = {
  providers: 'providers',
  services: 'services',
  bookings: 'bookings',
} as const;

export type { Session };
