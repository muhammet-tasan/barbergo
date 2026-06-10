import { useEffect } from 'react';
import { Platform } from 'react-native';

import { AUTH_CALLBACK_PATH, urlHasAuthCallbackParams } from '@/services/auth-redirect';

/**
 * Supabase may redirect to Site URL (e.g. `/`) instead of `/auth/callback`.
 * Forward web visitors with auth tokens to the callback screen.
 */
export function useWebAuthCallbackRedirect(): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const { pathname, search, hash } = window.location;
    const fullUrl = `${pathname}${search}${hash}`;
    if (!urlHasAuthCallbackParams(fullUrl)) return;
    if (pathname.includes(AUTH_CALLBACK_PATH)) return;

    window.location.replace(`/${AUTH_CALLBACK_PATH}${search}${hash}`);
  }, []);
}
