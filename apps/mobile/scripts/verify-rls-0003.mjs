/**
 * Smoke check: anon key must not read/update bookings when 0003 is applied.
 * Run: cd apps/mobile && node scripts/verify-rls-0003.mjs
 * Requires .env with EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('Missing apps/mobile/.env — copy from .env.example first.');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey || url.includes('YOUR_PROJECT')) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/mobile/.env');
  process.exit(1);
}

const client = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: selectData, error: selectError } = await client
  .from('bookings')
  .select('id')
  .limit(1);

if (selectError) {
  console.log('OK (anon SELECT blocked):', selectError.message);
} else if ((selectData ?? []).length === 0) {
  console.log('OK (anon SELECT returns no rows — 0003-style RLS)');
} else {
  console.warn(
    'WARN: anon can read bookings (demo RLS 0002 still active?). Row count sample:',
    selectData.length
  );
  process.exitCode = 1;
}

const fakeId = '00000000-0000-0000-0000-000000000099';
const { error: updateError } = await client
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', fakeId);

if (updateError) {
  console.log('OK (anon UPDATE blocked):', updateError.message);
} else {
  console.warn('WARN: anon UPDATE did not error — demo RLS may still allow updates');
  process.exitCode = 1;
}

console.log('RLS smoke check finished. Guest INSERT must still work via the app (manual E2E).');
