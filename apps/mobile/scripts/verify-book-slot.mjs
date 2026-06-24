/**
 * Smoke check: get_available_slots + book_slot RPC; second book must fail (SLOT_TAKEN).
 * Run: cd apps/mobile && node scripts/verify-book-slot.mjs
 * Requires .env with EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.
 * Requires migration 0006+ (slot RPCs + barber_weekly_availability seed).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

const SLOT_TAKEN_RE = /SLOT_TAKEN/i;
const RPC_MISSING_RE = /COULD NOT FIND THE FUNCTION|PGRST202|42883/i;

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('FAIL: Missing apps/mobile/.env — copy from .env.example first.');
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

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

/** Next calendar dates (YYYY-MM-DD) starting tomorrow, up to maxDays. */
function* upcomingDates(maxDays = 21) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 1);
  for (let i = 0; i < maxDays; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    yield d.toISOString().slice(0, 10);
  }
}

/** ISO weekday 1=Mon … 7=Sun in Europe/Zurich for a YYYY-MM-DD date. */
function zurichIsoWeekday(isoDate) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zurich',
    weekday: 'short',
  })
    .formatToParts(new Date(`${isoDate}T12:00:00Z`))
    .find((p) => p.type === 'weekday')?.value;
  const map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return map[weekday] ?? 0;
}

function isSlotTakenError(error) {
  const parts = [error?.message, error?.details, error?.hint, error?.code]
    .filter(Boolean)
    .join(' ');
  return SLOT_TAKEN_RE.test(parts);
}

function isRpcMissingError(error) {
  const parts = [error?.message, error?.details, error?.hint, error?.code]
    .filter(Boolean)
    .join(' ');
  return RPC_MISSING_RE.test(parts);
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey || url.includes('YOUR_PROJECT')) {
  fail('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/mobile/.env');
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
  fail(
    'No active provider — register a barber in the app and approve as admin (/admin/pending-barbers), or use seed.sql for demo only.'
  );
}

const { data: service, error: serviceError } = await client
  .from('services')
  .select('id')
  .eq('provider_id', provider.id)
  .eq('is_active', true)
  .limit(1)
  .maybeSingle();

if (serviceError || !service) {
  fail(`No active service for provider. ${serviceError?.message ?? ''}`.trim());
}

let chosenDate = null;
let chosenSlot = null;

for (const isoDate of upcomingDates(28)) {
  if (zurichIsoWeekday(isoDate) === 7) continue;

  const { data, error } = await client.rpc('get_available_slots', {
    p_provider_id: provider.id,
    p_service_id: service.id,
    p_date: isoDate,
  });

  if (error) {
    if (isRpcMissingError(error)) {
      fail(
        `get_available_slots RPC missing — apply migration 0006_slots_roles_profiles.sql. ${error.message}`
      );
    }
    fail(`get_available_slots failed for ${isoDate}: ${error.message}`);
  }

  const slots = Array.isArray(data) ? data : [];
  if (slots.length === 0) continue;

  const first = slots[0];
  const slotStart =
    typeof first?.slot_start === 'string'
      ? first.slot_start
      : typeof first?.slotStart === 'string'
        ? first.slotStart
        : null;

  if (!slotStart) {
    fail(`Unexpected slot row shape on ${isoDate}: ${JSON.stringify(first)}`);
  }

  chosenDate = isoDate;
  chosenSlot = slotStart;
  break;
}

if (!chosenDate || !chosenSlot) {
  fail(
    'No available slots in the next 28 days — check 0006 migration and barber_weekly_availability seed.'
  );
}

ok(`get_available_slots reachable — ${chosenDate}, first slot ${chosenSlot}`);

const accessToken = randomUUID().replace(/-/g, '');
const bookPayload = {
  p_provider_id: provider.id,
  p_service_id: service.id,
  p_start_at: chosenSlot,
  p_customer_name: 'Slot Smoke Test',
  p_phone: '+41790000001',
  p_address: 'Teststrasse 2, 4051 Basel',
  p_note: null,
  p_customer_id: null,
  p_access_token: accessToken,
};

const { data: bookingId, error: bookError } = await client.rpc('book_slot', bookPayload);

if (bookError) {
  if (isRpcMissingError(bookError)) {
    fail(`book_slot RPC missing — apply migration 0006. ${bookError.message}`);
  }
  fail(`book_slot failed on first attempt: ${bookError.message}`);
}

if (!bookingId) {
  fail('book_slot returned no booking id on first attempt');
}

ok(`book_slot created booking ${bookingId}`);

const { data: secondId, error: secondError } = await client.rpc('book_slot', {
  ...bookPayload,
  p_customer_name: 'Slot Smoke Test Duplicate',
  p_access_token: randomUUID().replace(/-/g, ''),
});

if (!secondError) {
  if (secondId) {
    fail(`second book_slot succeeded unexpectedly (booking ${secondId}) — overlap check broken`);
  }
  fail('second book_slot returned no error and no id — expected SLOT_TAKEN');
}

if (isSlotTakenError(secondError)) {
  ok(`second book_slot blocked: SLOT_TAKEN (${secondError.message})`);
} else {
  const msg = [secondError.message, secondError.details, secondError.hint]
    .filter(Boolean)
    .join(' — ');
  fail(`second book_slot error is not SLOT_TAKEN: ${msg}`);
}

console.log(
  `Slot smoke check finished. Test booking ${bookingId} left in DB — cancel/delete manually if desired.`
);
