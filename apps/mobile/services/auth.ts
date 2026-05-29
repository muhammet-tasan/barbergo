import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from './supabase';

export type AuthResult = {
  error?: string;
};

export async function getCurrentSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase ist nicht konfiguriert.' };
  }

  const { error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: 'E-Mail oder Passwort ist ungültig.' };
  }

  return {};
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase ist nicht konfiguriert. Prüfe apps/mobile/.env und starte Expo neu.' };
  }

  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: 'barbergo://auth/callback',
    },
  });

  if (error) {
    return { error: 'Login-Link konnte nicht gesendet werden.' };
  }

  return {};
}

export async function signOut(): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {};
  }

  const { error } = await client.auth.signOut();
  if (error) {
    return { error: 'Abmelden ist fehlgeschlagen.' };
  }

  return {};
}
