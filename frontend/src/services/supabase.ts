// ==============================================================================
// CareSaathi AI - Supabase Client Singleton
// Supports optional configuration with graceful fallback when keys are omitted.
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Supports standard VITE_SUPABASE_ANON_KEY with fallback to mixed-case VITE_SUPABASE_Anon_KEY
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as Record<string, string | undefined>).VITE_SUPABASE_Anon_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  typeof supabaseUrl === 'string' &&
  typeof supabaseAnonKey === 'string' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Validates whether the Supabase instance is reachable over the network
 */
export async function isSupabaseReachable(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('hospital_slots').select('id').limit(1);
    // If error code is 'PGRST116' or 404/network, or table not created yet, auth/connection might still work
    if (error && error.message.includes('fetch failed')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
