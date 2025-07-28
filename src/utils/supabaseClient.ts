import { createClient } from '@supabase/supabase-js';

// For Lovable's native Supabase integration, try these environment variable names
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.SUPABASE_URL || 
                   import.meta.env.PUBLIC_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       import.meta.env.SUPABASE_ANON_KEY || 
                       import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Available env vars:', Object.keys(import.meta.env));
  throw new Error(`Supabase URL and Anon Key are required. Got URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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