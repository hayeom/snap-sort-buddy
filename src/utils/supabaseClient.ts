import { createClient } from '@supabase/supabase-js';

// Debug: Log all available environment variables
console.log('All environment variables:', import.meta.env);
console.log('Checking for Supabase credentials...');

// For Lovable's native Supabase integration, try these environment variable names
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.SUPABASE_URL || 
                   import.meta.env.PUBLIC_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       import.meta.env.SUPABASE_ANON_KEY || 
                       import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL found:', !!supabaseUrl, supabaseUrl?.substring(0, 20) + '...');
console.log('Supabase Key found:', !!supabaseAnonKey, supabaseAnonKey?.substring(0, 20) + '...');

// Create a dummy client if no credentials (for development)
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock client for development.');
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      upsert: () => Promise.resolve({ error: null }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export type Database = {
  public: {
    Tables: {
      capture_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          summary: string;
          category: 'news' | 'recipe' | 'shopping' | 'study' | 'misc';
          extracted_text: string;
          related_links: string[];
          date: string;
          image_url?: string;
          file_name?: string;
          file_size?: number;
          processing_status: 'pending' | 'processing' | 'completed' | 'error';
          tags?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          summary: string;
          category: 'news' | 'recipe' | 'shopping' | 'study' | 'misc';
          extracted_text: string;
          related_links: string[];
          date: string;
          image_url?: string;
          file_name?: string;
          file_size?: number;
          processing_status?: 'pending' | 'processing' | 'completed' | 'error';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          summary?: string;
          category?: 'news' | 'recipe' | 'shopping' | 'study' | 'misc';
          extracted_text?: string;
          related_links?: string[];
          date?: string;
          image_url?: string;
          file_name?: string;
          file_size?: number;
          processing_status?: 'pending' | 'processing' | 'completed' | 'error';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};