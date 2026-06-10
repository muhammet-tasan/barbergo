import { isSupabaseConfigured } from '@/services/supabase';

/** Demo/mock data only when Supabase env vars are missing (local scaffold). */
export function allowMockDataFallback(): boolean {
  return !isSupabaseConfigured();
}
