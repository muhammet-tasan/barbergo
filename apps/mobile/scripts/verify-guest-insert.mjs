/**
 * Smoke check: anon key can INSERT a pending booking (RLS 0003).
 * Run: cd apps/mobile && node scripts/verify-guest-insert.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('Missing apps/mobile/.env');
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
  console.error('Set EXPO_PUBLIC_SUPABASE_* in apps/mobile/.env');
  process.exit(1);
}

const client = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: provider, error: providerError } = await client
  .from('providers')
  .select('id')
  .eq('is_active', true)
  .limit(1)
  .maybeSingle();

if (providerError || !provider) {
  console.error('No active provider — run 0001 + seed.sql first.', providerError?.message);
  process.exit(1);
}

const { data: service, error: serviceError } = await client
  .from('services')
  .select('id, price_chf')
  .eq('provider_id', provider.id)
  .eq('is_active', true)
  .limit(1)
  .maybeSingle();

if (serviceError || !service) {
  console.error('No active service for provider.', serviceError?.message);
  process.exit(1);
}

const bookingId = randomUUID();
const { error: insertError } = await client.from('bookings').insert({
  id: bookingId,
  provider_id: provider.id,
  service_id: service.id,
  status: 'pending',
  customer_name: 'RLS Smoke Test',
  phone: '+41790000000',
  address: 'Teststrasse 1, 4051 Basel',
  appointment_date: '2099-12-31',
  appointment_time: '10:00',
  service_price_chf: service.price_chf,
  service_fee_chf: 1,
  total_chf: Number(service.price_chf) + 1,
});

if (insertError) {
  console.error('FAIL guest INSERT:', insertError.message);
  process.exit(1);
}

console.log('OK guest INSERT pending booking:', bookingId);
console.log('(Test row left in DB — delete manually in Supabase if desired.)');
