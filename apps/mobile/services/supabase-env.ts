import Constants from 'expo-constants';

export type SupabaseEnvSnapshot = {
  url: string;
  anonKey: string;
  urlPresent: boolean;
  keyPresent: boolean;
  urlHost: string | null;
  keyKind: 'missing' | 'placeholder' | 'publishable' | 'jwt' | 'other';
  configured: boolean;
  missing: string[];
};

function readExtra(key: string): string {
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return extra?.[key]?.trim() ?? '';
}

function isPlaceholderUrl(url: string): boolean {
  return !url || url.includes('YOUR_PROJECT') || url === 'https://your-project.supabase.co';
}

function isPlaceholderKey(key: string): boolean {
  return !key || key === 'your-anon-key' || key === 'your_anon_key';
}

function detectKeyKind(key: string): SupabaseEnvSnapshot['keyKind'] {
  if (!key) return 'missing';
  if (isPlaceholderKey(key)) return 'placeholder';
  if (key.startsWith('sb_publishable') || key.startsWith('sb_publ')) return 'publishable';
  if (key.startsWith('eyJ')) return 'jwt';
  return 'other';
}

function parseUrlHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

/** Read Supabase env from Expo public env + app.config extra (web-safe). */
export function getSupabaseEnvSnapshot(): SupabaseEnvSnapshot {
  const url = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? readExtra('EXPO_PUBLIC_SUPABASE_URL')).trim();
  const anonKey = (
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? readExtra('EXPO_PUBLIC_SUPABASE_ANON_KEY')
  ).trim();

  const missing: string[] = [];
  if (isPlaceholderUrl(url)) missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (isPlaceholderKey(anonKey)) missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');

  return {
    url,
    anonKey,
    urlPresent: url.length > 0 && !isPlaceholderUrl(url),
    keyPresent: anonKey.length > 0 && !isPlaceholderKey(anonKey),
    urlHost: parseUrlHost(url),
    keyKind: detectKeyKind(anonKey),
    configured: missing.length === 0,
    missing,
  };
}

export function getSupabaseEnvVars(): { url: string; anonKey: string } {
  const snap = getSupabaseEnvSnapshot();
  return { url: snap.url, anonKey: snap.anonKey };
}
