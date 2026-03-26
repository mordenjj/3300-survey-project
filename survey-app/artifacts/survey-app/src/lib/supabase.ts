import { createClient } from '@supabase/supabase-js';

// Access environment variables securely in Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SurveyResult = {
  id: string;
  created_at: string;
  favorite_study_place: string;
  grade_level: string;
  study_hours: string;
  study_methods: string[];
  other_study_method: string | null;
};
