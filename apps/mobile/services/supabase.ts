/**
 * Supabase client — prepared for MVP integration.
 *
 * TODO (when Supabase project is ready):
 * 1. Create project at https://supabase.com
 * 2. Copy Project URL + anon public key
 * 3. Copy `.env.example` → `.env` and fill values
 * 4. Run: npm install @supabase/supabase-js
 * 5. Uncomment createClient below and implement repositories in services/bookings.ts etc.
 * 6. Apply SQL from docs/data-model.md in Supabase SQL editor
 * 7. Enable Row Level Security before production
 *
 * Until configured, the app uses mock data from `@/data/mockData`.
 */

// TODO: npm install @supabase/supabase-js
// import { createClient, SupabaseClient } from '@supabase/supabase-js';

// import type { Database } from '@/types/supabase'; // optional: generate with supabase gen types

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when both public env vars are set (safe to attempt live queries). */
export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}

/**
 * Returns a Supabase client when env vars exist, otherwise null.
 * Callers should fall back to mock data when null.
 */
export function getSupabaseClient(): null /* | SupabaseClient<Database> */ {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // TODO: uncomment after installing @supabase/supabase-js
  // return createClient(supabaseUrl, supabaseAnonKey, {
  //   auth: {
  //     persistSession: true,
  //     autoRefreshToken: true,
  //   },
  // });

  console.warn(
    '[barbergo] Supabase env vars are set but client is not initialized. Install @supabase/supabase-js and uncomment getSupabaseClient().'
  );
  return null;
}

/** Table names — keep in sync with docs/data-model.md */
export const SupabaseTables = {
  providers: 'providers',
  services: 'services',
  bookings: 'bookings',
} as const;
