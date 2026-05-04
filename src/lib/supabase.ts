/**
 * @file Supabase client configuration.
 * Provides server-side Supabase client for storage, realtime, etc.
 * Note: Database access goes through Prisma, not Supabase client.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the Supabase client instance (lazy initialization).
 * This avoids throwing during build when env vars are not available.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

export default getSupabase;
