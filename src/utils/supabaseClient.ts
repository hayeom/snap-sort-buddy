import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required');
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