import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from './supabase';

export type AuthResult = {
  error?: string;
  /** True when Supabase requires e-mail confirmation before login (no session yet). */
  needsEmailConfirmation?: boolean;
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
    return { error: 'Anmeldung ist derzeit nicht verfügbar.' };
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

export type SignUpInput = {
  email: string;
  password: string;
  displayName?: string;
};

export async function signUpWithEmail(input: SignUpInput): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Registrierung ist derzeit nicht verfügbar.' };
  }

  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        role: 'customer',
        display_name: input.displayName?.trim() || undefined,
      },
    },
  });

  if (error) {
    return { error: 'Registrierung fehlgeschlagen. E-Mail bereits vergeben?' };
  }

  if (!data.session) {
    return { needsEmailConfirmation: true };
  }

  return {};
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Anmeldung ist derzeit nicht verfügbar.' };
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
