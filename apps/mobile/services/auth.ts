import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from './supabase';

export async function getCurrentSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithMagicLink(email: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase ist nicht konfiguriert. Prüfe apps/mobile/.env und starte Expo neu.');
  }

  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: {
      // In Expo Go / dev this is still useful for web; native deep link handling depends on platform.
      emailRedirectTo: 'barbergo://auth/callback',
    },
  });

  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

