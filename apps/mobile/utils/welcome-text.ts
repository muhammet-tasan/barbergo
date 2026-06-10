import type { Session } from '@supabase/supabase-js';

import type { UserProfile } from '@/services/profiles';

const GUEST_WELCOME = 'Willkommen, geschätzter Kunde';

function readDisplayName(session: Session | null, profile: UserProfile | null): string | null {
  const fromProfile = profile?.displayName?.trim();
  if (fromProfile) return fromProfile;

  const meta = session?.user.user_metadata?.display_name;
  if (typeof meta === 'string' && meta.trim()) {
    return meta.trim();
  }

  return null;
}

export function getHeaderWelcomeText(
  session: Session | null,
  profile: UserProfile | null,
  options?: { isAdmin?: boolean }
): string {
  if (!session) {
    return GUEST_WELCOME;
  }

  if (options?.isAdmin) {
    return 'Willkommen, Admin';
  }

  const name = readDisplayName(session, profile);
  if (name) {
    return `Willkommen, ${name}`;
  }

  return GUEST_WELCOME;
}
