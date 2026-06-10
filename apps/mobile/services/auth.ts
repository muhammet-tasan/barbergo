import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

import {
  getAuthRedirectKind,
  getAuthRedirectUrl,
  getEmailConfirmationRedirectUrl,
} from '@/services/auth-redirect';
import { classifyError, logger } from '@/utils/logger';
import { RESERVED_ADMIN_EMAIL } from './auth-roles';
import { getSupabaseClient } from './supabase';

export type AuthResult = {
  error?: string;
  needsEmailConfirmation?: boolean;
  /** False when Supabase did not queue a confirmation e-mail (e.g. redirect URL / SMTP). */
  confirmationEmailSent?: boolean;
};

export type RegistrationRole = 'customer' | 'barber';

export const MIN_PASSWORD_LENGTH = 8;

export const EMAIL_ALREADY_REGISTERED =
  'Diese E-Mail ist bereits registriert. Bitte anmelden oder Passwort zurücksetzen.';

/** Accounts older than this at signUp response time are treated as duplicates. */
const NEW_ACCOUNT_MAX_AGE_MS = 8_000;

function normalizeSignupEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Supabase obfuscated duplicate: identities array is empty. */
function isObfuscatedDuplicateSignup(user: User | null | undefined): boolean {
  if (!user) return false;
  return !user.identities || user.identities.length === 0;
}

/** signUp returned a user that already existed before this request. */
function isReusedExistingAccount(user: User | null | undefined): boolean {
  if (!user?.created_at) return false;
  return Date.now() - new Date(user.created_at).getTime() > NEW_ACCOUNT_MAX_AGE_MS;
}

function hasConfirmedEmail(user: User | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.email_confirmed_at || user.confirmed_at);
}

function isDuplicateSignupUser(user: User | null | undefined, hasSession: boolean): boolean {
  if (!user) return false;
  if (isObfuscatedDuplicateSignup(user)) return true;
  if (isReusedExistingAccount(user)) return true;
  if (hasConfirmedEmail(user) && !hasSession) return true;
  return false;
}

async function rejectDuplicateSignup(): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
  return { error: EMAIL_ALREADY_REGISTERED };
}

async function isSignupEmailTaken(
  client: SupabaseClient,
  email: string,
): Promise<boolean | null> {
  const { data, error } = await client.rpc('signup_email_taken', { p_email: email });
  if (error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes('signup_email_taken') &&
      (lower.includes('does not exist') || lower.includes('could not find'))
    ) {
      return null;
    }
    logger.warn('auth', 'signup_email_taken rpc unavailable', error);
    return null;
  }
  return Boolean(data);
}

/**
 * Fallback when migration 0013 is not applied yet.
 * Distinguishes new unconfirmed barber signups from existing accounts.
 */
async function probeDuplicateViaSignIn(
  client: SupabaseClient,
  email: string,
  password: string,
  signupUser: User | null | undefined,
): Promise<boolean> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (!error && data.session) {
    await client.auth.signOut();
    return true;
  }

  if (!error) return false;

  const lower = error.message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return true;
  }

  if (lower.includes('email not confirmed')) {
    if (isDuplicateSignupUser(signupUser, false)) return true;
  }

  return false;
}

function readSignupMetaRole(user: User | null | undefined): string | undefined {
  const role = user?.user_metadata?.role;
  return typeof role === 'string' ? role.trim() : undefined;
}

function mapSignUpError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('already registered') ||
    lower.includes('already been registered') ||
    lower.includes('user already registered') ||
    lower.includes('email address is already registered')
  ) {
    return EMAIL_ALREADY_REGISTERED;
  }
  if (lower.includes('password') && (lower.includes('short') || lower.includes('weak'))) {
    return `Passwort zu schwach. Mindestens ${MIN_PASSWORD_LENGTH} Zeichen verwenden.`;
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Zu viele Versuche. Bitte warte etwa 60 Sekunden und versuche es erneut.';
  }
  if (lower.includes('invalid') && lower.includes('email')) {
    return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  }
  if (lower.includes('signup is disabled')) {
    return 'Registrierung ist derzeit deaktiviert.';
  }
  logger.warn('auth', 'signUp failed', classifyError(message));
  return 'Registrierung fehlgeschlagen. Bitte prüfe deine Angaben.';
}

function mapResendError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Zu viele Versuche. Bitte warte etwa 60 Sekunden und versuche es erneut.';
  }
  if (lower.includes('already confirmed') || lower.includes('email address is already confirmed')) {
    return 'Deine E-Mail ist bereits bestätigt. Du kannst dich jetzt anmelden.';
  }
  logger.warn('auth', 'resend confirmation failed', classifyError(message));
  return 'Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.';
}

function mapSignInError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Zu viele Anmeldeversuche. Bitte warte etwa 60 Sekunden und versuche es erneut.';
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'E-Mail oder Passwort ist ungültig.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Bitte bestätige zuerst deine E-Mail — prüfe dein Postfach (auch Spam).';
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
    email: normalizeSignupEmail(email),
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
  address?: string;
  registrationRole?: RegistrationRole;
};

export async function signUpWithEmail(input: SignUpInput): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Registrierung ist derzeit nicht verfügbar.' };
  }

  const email = normalizeSignupEmail(input.email);
  if (email === RESERVED_ADMIN_EMAIL.toLowerCase()) {
    return { error: EMAIL_ALREADY_REGISTERED };
  }

  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Passwort zu schwach. Mindestens ${MIN_PASSWORD_LENGTH} Zeichen verwenden.`,
    };
  }

  const emailTaken = await isSignupEmailTaken(client, email);
  if (emailTaken === true) {
    return rejectDuplicateSignup();
  }

  await client.auth.signOut();

  const isBarber = input.registrationRole === 'barber';
  const metaRole = isBarber ? 'barber' : 'customer';

  const emailRedirectTo = getEmailConfirmationRedirectUrl();
  logger.debug('auth', 'signup email redirect', getAuthRedirectKind());

  const { data, error } = await client.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        role: metaRole,
        display_name: input.displayName?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        address: input.address?.trim() || undefined,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    return { error: mapSignUpError(error.message) };
  }

  if (isDuplicateSignupUser(data.user, Boolean(data.session))) {
    return rejectDuplicateSignup();
  }

  if (isBarber) {
    if (data.session) {
      return rejectDuplicateSignup();
    }

    const existingRole = readSignupMetaRole(data.user);
    if (existingRole && existingRole !== 'barber') {
      return rejectDuplicateSignup();
    }

    if (emailTaken === null) {
      const duplicate = await probeDuplicateViaSignIn(
        client,
        email,
        input.password,
        data.user,
      );
      if (duplicate) {
        return rejectDuplicateSignup();
      }
    }

    return {
      needsEmailConfirmation: true,
      confirmationEmailSent: Boolean(data.user?.confirmation_sent_at),
    };
  }

  if (data.session) {
    if (isReusedExistingAccount(data.user)) {
      return rejectDuplicateSignup();
    }
    return {};
  }

  const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (!signInError && signInData.session) {
    if (isReusedExistingAccount(data.user)) {
      return rejectDuplicateSignup();
    }
    return {};
  }

  if (signInError) {
    if (isDuplicateSignupUser(data.user, false)) {
      return rejectDuplicateSignup();
    }
    return { error: mapSignUpError(signInError.message) };
  }

  return {
    error: 'Registrierung konnte nicht abgeschlossen werden. Bitte versuche es erneut.',
  };
}

export async function resendSignupConfirmation(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Registrierung ist derzeit nicht verfügbar.' };
  }

  const normalized = normalizeSignupEmail(email);
  if (!normalized) {
    return { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
  }

  const { error } = await client.auth.resend({
    type: 'signup',
    email: normalized,
    options: {
      emailRedirectTo: getEmailConfirmationRedirectUrl(),
    },
  });

  if (error) {
    return { error: mapResendError(error.message) };
  }

  return { confirmationEmailSent: true };
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Anmeldung ist derzeit nicht verfügbar.' };
  }

  const { error } = await client.auth.signInWithOtp({
    email: normalizeSignupEmail(email),
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
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

export function isRegistrationRoleMismatch(
  session: Session,
  expectedRole: RegistrationRole
): boolean {
  const metaRole = readSignupMetaRole(session.user);
  if (!metaRole) return false;
  if (expectedRole === 'barber') return metaRole !== 'barber';
  return metaRole !== 'customer';
}
