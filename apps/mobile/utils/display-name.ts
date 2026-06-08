import type { UserProfile } from '@/services/profiles';
import type { Session } from '@supabase/supabase-js';

/** First name or display name for greetings (German UI). Prefers public.profiles. */
export function getDisplayName(
  session: Session | null,
  profile?: UserProfile | null
): string | undefined {
  if (!session) return undefined;

  const fromProfile = profile?.displayName?.trim();
  if (fromProfile) {
    return fromProfile.split(/\s+/)[0];
  }

  const emailLocal = session.user.email?.split('@')[0]?.trim();
  if (emailLocal) return emailLocal;

  return undefined;
}
