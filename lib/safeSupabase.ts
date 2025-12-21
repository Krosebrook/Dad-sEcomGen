import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

let supabaseInstance: SupabaseClient<Database> | null = null;
let initializationError: Error | null = null;

function initializeSupabase(): SupabaseClient<Database> | null {
  if (supabaseInstance) return supabaseInstance;
  if (initializationError) return null;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      const error = new Error('Missing Supabase environment variables');
      console.error('Supabase initialization failed:', error.message);
      initializationError = error;
      return null;
    }

    if (!supabaseUrl.startsWith('https://')) {
      const error = new Error('Invalid Supabase URL format');
      console.error('Supabase initialization failed:', error.message);
      initializationError = error;
      return null;
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Supabase initialization error:', error);
    initializationError = error as Error;
    return null;
  }
}

export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance && !initializationError) {
    initializeSupabase();
  }

  if (!supabaseInstance) {
    throw new Error(
      `Supabase initialization failed: ${initializationError?.message || 'Unknown error'}`
    );
  }

  return supabaseInstance;
}

export const supabase = getSupabase();

export function hasSupabase(): boolean {
  return supabaseInstance !== null;
}

export function getSupabaseError(): Error | null {
  return initializationError;
}

export type { Database };
