import type { Session } from '@supabase/supabase-js';

import { RESERVED_ADMIN_EMAIL } from './auth-roles';
import { getSupabaseClient } from './supabase';

export type AuthResult = {
  error?: string;
  /** True when Supabase requires e-mail confirmation before login (no session yet). */
  needsEmailConfirmation?: boolean;
};

export type RegistrationRole = 'customer' | 'barber';

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_ALREADY_REGISTERED =
  'Diese E-Mail ist bereits registriert. Bitte anmelden oder Passwort zurücksetzen.';

function mapSignUpError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('already registered') ||
    lower.includes('already been registered') ||
    lower.includes('user already registered')
  ) {
    return EMAIL_ALREADY_REGISTERED;
  }
  if (lower.includes('password') && (lower.includes('short') || lower.includes('weak'))) {
    return `Passwort zu schwach. Mindestens ${MIN_PASSWORD_LENGTH} Zeichen verwenden.`;
  }
  return 'Registrierung fehlgeschlagen. Bitte prüfe deine Angaben.';
}

function mapSignInError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'E-Mail oder Passwort ist ungültig.';
  }
  return 'E-Mail oder Passwort ist ungültig.';
}

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
    return { error: mapSignInError(error.message) };
  }

  return {};
}

export type SignUpInput = {
  email: string;
  password: string;
  displayName?: string;
  phone?: string;
  registrationRole?: RegistrationRole;
};

export async function signUpWithEmail(input: SignUpInput): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Registrierung ist derzeit nicht verfügbar.' };
  }

  const email = input.email.trim();
  if (email.toLowerCase() === RESERVED_ADMIN_EMAIL.toLowerCase()) {
    return { error: EMAIL_ALREADY_REGISTERED };
  }

  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Passwort zu schwach. Mindestens ${MIN_PASSWORD_LENGTH} Zeichen verwenden.`,
    };
  }

  const metaRole =
    input.registrationRole === 'barber' ? 'barber_pending' : 'customer';

  const { data, error } = await client.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        role: metaRole,
        display_name: input.displayName?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
      },
    },
  });

  if (error) {
    return { error: mapSignUpError(error.message) };
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
