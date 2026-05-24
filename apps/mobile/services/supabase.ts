import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseEnvSnapshot, getSupabaseEnvVars } from './supabase-env';

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
 * Auth is disabled for MVP — no session persistence.
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
      persistSession: false,
      autoRefreshToken: false,
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
