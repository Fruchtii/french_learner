import { createBrowserClient } from '@supabase/ssr';

// Database types for our tables
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  data: Record<string, any> | null; // JSONB field for flexible data
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  card_id: string; // Now references cards table instead of verb_id
  box: number;
  next_review: string;
  last_reviewed: string | null;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
  updated_at: string;
}

// Legacy types for backward compatibility with existing verb-based system
export interface LegacyStudyProgress {
  id: string;
  user_id: string;
  verb_id: string;
  tense: string;
  pronoun: string;
  box: number;
  next_review: string;
  last_reviewed: string | null;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
  updated_at: string;
}

// Create a single Supabase client for browser-side usage
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}
