import type { SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/** Expo Router route — no leading slash (used with Linking.createURL). */
export const AUTH_CALLBACK_PATH = 'auth/callback';

export const NATIVE_AUTH_SCHEME = 'barbergo';
export const NATIVE_AUTH_REDIRECT = `${NATIVE_AUTH_SCHEME}://${AUTH_CALLBACK_PATH}`;
export const LOCAL_WEB_AUTH_REDIRECT = `http://localhost:8081/${AUTH_CALLBACK_PATH}`;

export type AuthRedirectKind =
  | 'override'
  | 'web-local'
  | 'web-origin'
  | 'expo-go'
  | 'native-deep-link';

function readEnvOverride(): string | undefined {
  const value =
    process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim() ||
    (Constants.expoConfig?.extra?.EXPO_PUBLIC_AUTH_REDIRECT_URL as string | undefined)?.trim();
  return value || undefined;
}

function readEmailRedirectOverride(): string | undefined {
  const value =
    process.env.EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL?.trim() ||
    (Constants.expoConfig?.extra?.EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL as string | undefined)?.trim();
  return value || undefined;
}

function isHttpUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/** True when running inside the Expo Go app (not a dev/production build). */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export function getAuthRedirectKind(): AuthRedirectKind {
  if (readEnvOverride()) return 'override';

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'web-local';
    }
    return 'web-origin';
  }

  if (isExpoGo()) return 'expo-go';
  return 'native-deep-link';
}

/**
 * Redirect URL for Supabase confirmation e-mails.
 *
 * Default (native): `barbergo://` / `exp://` — Supabase liefert Mails zuverlässig; Link öffnet die App.
 * Web-Registrierung: HTTP-Callback im Browser.
 *
 * Nur für Browser-Tests am PC: `EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL=http://localhost:8081/auth/callback`
 * (nicht als globaler Default — kann Mail-Zustellung von der App aus blockieren).
 */
export function getEmailConfirmationRedirectUrl(): string {
  const emailOverride = readEmailRedirectOverride();
  if (emailOverride) return emailOverride;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin.replace(/\/$/, '');
      return `${origin}/${AUTH_CALLBACK_PATH}`;
    }
    return LOCAL_WEB_AUTH_REDIRECT;
  }

  return Linking.createURL(AUTH_CALLBACK_PATH);
}

/**
 * In-app OAuth / magic-link redirect (may use deep links).
 * For sign-up confirmation e-mails use {@link getEmailConfirmationRedirectUrl} instead.
 */
export function getAuthRedirectUrl(): string {
  const override = readEnvOverride();
  if (override) return override;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin.replace(/\/$/, '');
      return `${origin}/${AUTH_CALLBACK_PATH}`;
    }
    return LOCAL_WEB_AUTH_REDIRECT;
  }

  return Linking.createURL(AUTH_CALLBACK_PATH);
}

/**
 * Suggested Supabase → Authentication → URL Configuration → Redirect URLs.
 * Add `exp://**` (or your concrete Expo Go URL from dev logs) for LAN testing.
 */
export function getSupabaseAllowedRedirectUrls(): string[] {
  const urls = new Set<string>([
    NATIVE_AUTH_REDIRECT,
    LOCAL_WEB_AUTH_REDIRECT,
    `${NATIVE_AUTH_SCHEME}://**`,
    'exp://**',
  ]);

  const override = readEnvOverride();
  if (override) urls.add(override);

  try {
    urls.add(getAuthRedirectUrl());
    urls.add(getEmailConfirmationRedirectUrl());
  } catch {
    // Safe during tooling / static analysis
  }

  return [...urls];
}

/** True when the URL carries Supabase auth tokens (after e-mail confirmation). */
export function urlHasAuthCallbackParams(url: string): boolean {
  const params = new URLSearchParams(
    url.includes('?') ? url.split('?')[1]?.split('#')[0] ?? '' : '',
  );
  const hash = url.includes('#') ? url.split('#').slice(1).join('#') : '';
  const hashParams = new URLSearchParams(hash);
  const keys = ['access_token', 'refresh_token', 'code', 'error', 'error_description'];
  return keys.some((key) => params.has(key) || hashParams.has(key));
}

type AuthCallbackSessionResult = {
  ok: boolean;
  error?: string;
};

function parseCallbackParams(url: string): URLSearchParams {
  const hash = url.includes('#') ? url.split('#').slice(1).join('#') : '';
  const query = url.includes('?') ? url.split('?')[1]?.split('#')[0] ?? '' : '';
  const merged = new URLSearchParams(query);
  const hashParams = new URLSearchParams(hash);
  hashParams.forEach((value, key) => merged.set(key, value));
  return merged;
}

/**
 * Completes Supabase auth after e-mail confirmation when the app opens a callback URL.
 * Works for web hash tokens, native deep links (`barbergo://`), and Expo Go (`exp://`).
 */
export async function completeAuthSessionFromCallbackUrl(
  client: SupabaseClient,
  url: string | null | undefined,
): Promise<AuthCallbackSessionResult> {
  if (!url) return { ok: false };

  const params = parseCallbackParams(url);
  const authError = params.get('error_description') ?? params.get('error');
  if (authError) {
    return { ok: false, error: authError };
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const code = params.get('code');
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  return { ok: false };
}
