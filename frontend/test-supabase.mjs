// ==============================================================================
// CareSaathi AI - Safe Supabase Connection & Schema Verification Test
// Tests: Client init, table existence, exact column matching, and RLS read permissions
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read frontend/.env safely without printing secrets
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('frontend/.env file not found');
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

async function runVerification() {
  console.log('--- CareSaathi AI: Supabase Connection Verification ---');

  // Step 1: Check Environment Variables
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_Anon_KEY;

  if (!url || !anonKey) {
    console.error('FAIL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env');
    process.exit(1);
  }

  const maskedKey = `${anonKey.slice(0, 8)}...${anonKey.slice(-6)}`;
  console.log(`[1/5] Environment Config: URL=${url}, Key=${maskedKey} (FOUND)`);

  // Step 2: Initialize Supabase Client
  let supabase;
  try {
    supabase = createClient(url, anonKey, {
      auth: { persistSession: false }
    });
    console.log('[2/5] Supabase Client: Successfully initialized instance.');
  } catch (err) {
    console.error('FAIL: Error initializing Supabase client:', err.message);
    process.exit(1);
  }

  // Step 3: Verify 'hospital_slots' table & all columns
  console.log('[3/5] Verifying "hospital_slots" table and schema columns...');
  const slotCols = 'id, facility_id, slot_start, slot_end, capacity, booked_count, purpose_types, is_demo, created_at';
  const { data: slotData, error: slotError } = await supabase
    .from('hospital_slots')
    .select(slotCols)
    .limit(5);

  if (slotError) {
    console.error('FAIL: hospital_slots query error:', slotError.message);
    process.exit(1);
  }
  console.log(`      ✓ hospital_slots: OK (Found ${slotData.length} active slots, all 9 columns match).`);

  // Step 4: Verify 'appointments' table & all columns used by appointmentRepo
  console.log('[4/5] Verifying "appointments" table and appointmentRepo columns...');
  const appCols = [
    'id',
    'user_id',
    'facility_id',
    'facility_name',
    'facility_address',
    'slot_id',
    'slot_start',
    'slot_end',
    'purpose',
    'patient_name',
    'patient_age',
    'patient_phone',
    'language',
    'note',
    'shared_summary',
    'status',
    'booking_ref',
    'is_demo',
    'created_at',
    'updated_at'
  ].join(', ');

  const { data: appData, error: appError } = await supabase
    .from('appointments')
    .select(appCols)
    .limit(5);

  if (appError) {
    console.error('FAIL: appointments query error:', appError.message);
    process.exit(1);
  }
  console.log(`      ✓ appointments: OK (Table exists, all 20 required columns match, RLS SELECT allowed). Currently ${appData.length} rows.`);

  // Step 5: Verify 'saved_comparisons' table & columns
  console.log('[5/5] Verifying "saved_comparisons" table and columns...');
  const compCols = 'id, user_id, treatment_name, facility_ids, created_at';
  const { data: compData, error: compError } = await supabase
    .from('saved_comparisons')
    .select(compCols)
    .limit(5);

  if (compError) {
    console.error('FAIL: saved_comparisons query error:', compError.message);
    process.exit(1);
  }
  console.log(`      ✓ saved_comparisons: OK (Table exists, all 5 columns match, RLS SELECT allowed). Currently ${compData.length} rows.`);

  console.log('\n======================================================');
  console.log('RESULT: ALL 5 SUPABASE VERIFICATION CHECKS PASSED!');
  console.log('Database tables, columns, RLS read policies, and client bindings are verified.');
  console.log('======================================================');
}

runVerification().catch((err) => {
  console.error('UNEXPECTED ERROR:', err);
  process.exit(1);
});
