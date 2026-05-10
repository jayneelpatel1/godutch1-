/**
 * @file Supabase client initialization module.
 * @description Creates and exports the Supabase client instance using environment variables.
 *              Throws at module import time if required env vars are missing.
 *
 * @exports supabase — The Supabase client used for all database operations
 *
 * @see https://supabase.com/docs/reference/javascript/initializing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
