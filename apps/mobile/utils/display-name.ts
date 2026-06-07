import type { Session } from '@supabase/supabase-js';

/** First name or display name for greetings (German UI). */
export function getDisplayName(session: Session | null): string | undefined {
  if (!session) return undefined;

  const fromMeta = session.user.user_metadata?.display_name;
  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim().split(/\s+/)[0];
  }

  const emailLocal = session.user.email?.split('@')[0]?.trim();
  if (emailLocal) return emailLocal;

  return undefined;
}
