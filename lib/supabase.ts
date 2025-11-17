import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ventures: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          product_idea: string;
          brand_voice: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          product_idea: string;
          brand_voice?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          product_idea?: string;
          brand_voice?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
        };
      };
      venture_data: {
        Row: {
          id: string;
          venture_id: string;
          data_type: string;
          data: any;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venture_id: string;
          data_type: string;
          data: any;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          venture_id?: string;
          data_type?: string;
          data?: any;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      venture_collaborators: {
        Row: {
          id: string;
          venture_id: string;
          user_id: string;
          role: 'owner' | 'editor' | 'viewer';
          invited_by: string;
          invited_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          venture_id: string;
          user_id: string;
          role?: 'owner' | 'editor' | 'viewer';
          invited_by: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          venture_id?: string;
          user_id?: string;
          role?: 'owner' | 'editor' | 'viewer';
          invited_by?: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
      };
      activity_log: {
        Row: {
          id: string;
          venture_id: string;
          user_id: string | null;
          action: string;
          details: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          venture_id: string;
          user_id?: string | null;
          action: string;
          details?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          venture_id?: string;
          user_id?: string | null;
          action?: string;
          details?: any;
          created_at?: string;
        };
      };
    };
  };
};
