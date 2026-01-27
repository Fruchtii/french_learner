-- ===========================================
-- SCHEMA RESET - Clean Slate Database Setup
-- ===========================================
-- This script drops existing tables and recreates them with RLS policies
-- Run this first in Supabase SQL Editor

-- ============================================
-- PART 1: DROP EXISTING TABLES
-- ============================================

-- Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS study_progress CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions if any
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================
-- PART 2: ENABLE EXTENSIONS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 3: CREATE TABLES
-- ============================================

-- Profiles table (linked to Supabase auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  data JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study progress table
CREATE TABLE study_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  box INTEGER DEFAULT 0 CHECK (box >= 0 AND box <= 3),
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  times_correct INTEGER DEFAULT 0,
  times_incorrect INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- ============================================
-- PART 4: CREATE INDEXES
-- ============================================

CREATE INDEX idx_decks_created_by ON decks(created_by);
CREATE INDEX idx_decks_public ON decks(is_public);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_order ON cards(deck_id, order_index);
CREATE INDEX idx_cards_data ON cards USING GIN (data);
CREATE INDEX idx_progress_user ON study_progress(user_id);
CREATE INDEX idx_progress_card ON study_progress(card_id);
CREATE INDEX idx_progress_review ON study_progress(user_id, next_review);

-- ============================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: PROFILES RLS POLICIES
-- ============================================

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PART 7: DECKS RLS POLICIES
-- ============================================

-- CRITICAL: Allow unauthenticated users to view public decks
CREATE POLICY "Anyone can view public decks"
  ON decks FOR SELECT
  USING (is_public = true);

CREATE POLICY "Authenticated users can view their own decks"
  ON decks FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own decks"
  ON decks FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- PART 8: CARDS RLS POLICIES
-- ============================================

-- CRITICAL: Allow unauthenticated users to view cards from public decks
CREATE POLICY "Anyone can view cards from public decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.is_public = true
    )
  );

CREATE POLICY "Users can view cards from their own decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create cards in their own decks"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their own decks"
  ON cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards in their own decks"
  ON cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

-- ============================================
-- PART 9: STUDY PROGRESS RLS POLICIES
-- ============================================

CREATE POLICY "Users can view own progress"
  ON study_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress"
  ON study_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON study_progress FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own progress"
  ON study_progress FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- PART 10: TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_progress_updated_at
  BEFORE UPDATE ON study_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 11: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Schema reset complete!';
  RAISE NOTICE '   - All tables dropped and recreated';
  RAISE NOTICE '   - RLS policies enabled';
  RAISE NOTICE '   - Triggers configured';
  RAISE NOTICE '   - Ready for seed data';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Next step: Run seed_french_verbs.sql to populate the French Verbs deck';
END $$;
