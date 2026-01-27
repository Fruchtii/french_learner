-- ===========================================
-- VOKAB - Complete Database Repair & Migration Script
-- ===========================================
-- Run this entire script in Supabase SQL Editor to fix all issues

-- ============================================
-- PART 1: DROP AND RECREATE TABLES (CLEAN SLATE)
-- ============================================

-- Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS study_progress CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 2: CREATE TABLES
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

-- Create indexes
CREATE INDEX idx_decks_created_by ON decks(created_by);
CREATE INDEX idx_decks_public ON decks(is_public);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_order ON cards(deck_id, order_index);
CREATE INDEX idx_cards_data ON cards USING GIN (data);
CREATE INDEX idx_progress_user ON study_progress(user_id);
CREATE INDEX idx_progress_card ON study_progress(card_id);
CREATE INDEX idx_progress_review ON study_progress(user_id, next_review);

-- ============================================
-- PART 3: ROW LEVEL SECURITY (RLS) - PERMISSIVE POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- DECKS POLICIES
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

-- CARDS POLICIES
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

-- STUDY PROGRESS POLICIES
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
-- PART 4: TRIGGERS FOR UPDATED_AT
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
-- PART 5: AUTO-CREATE PROFILE ON SIGNUP
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 6: MIGRATE FRENCH VERBS TO PUBLIC DECK
-- ============================================

-- Insert public French Verbs deck (created_by is NULL for system deck)
INSERT INTO decks (id, title, description, created_by, is_public)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Essential French Irregular Verbs',
  'Master the most common French irregular verbs across 4 essential tenses: Présent, Passé Composé, Imparfait, and Futur Simple. Perfect for beginners and intermediate learners.',
  NULL, -- System deck, no owner
  true -- Public for everyone
);

-- Insert être (to be) cards - 24 cards (4 tenses × 6 pronouns)
INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', 'être - Présent - je', 'suis', '{"verb_id": "etre", "tense": "present", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 1),
  ('00000000-0000-0000-0000-000000000001', 'être - Présent - tu', 'es', '{"verb_id": "etre", "tense": "present", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 2),
  ('00000000-0000-0000-0000-000000000001', 'être - Présent - il', 'est', '{"verb_id": "etre", "tense": "present", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 3),
  ('00000000-0000-0000-0000-000000000001', 'être - Présent - nous', 'sommes', '{"verb_id": "etre", "tense": "present", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 4),
  ('00000000-0000-0000-0000-000000000001', 'être - Présent - vous', 'êtes', '{"verb_id": "etre", "tense": "present", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 5),
  ('00000000-0000-0000-0000-000000000001', 'être - Présent - ils', 'sont', '{"verb_id": "etre", "tense": "present", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 6),
  ('00000000-0000-0000-0000-000000000001', 'être - Passé Composé - je', 'ai été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 7),
  ('00000000-0000-0000-0000-000000000001', 'être - Passé Composé - tu', 'as été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 8),
  ('00000000-0000-0000-0000-000000000001', 'être - Passé Composé - il', 'a été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 9),
  ('00000000-0000-0000-0000-000000000001', 'être - Passé Composé - nous', 'avons été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 10),
  ('00000000-0000-0000-0000-000000000001', 'être - Passé Composé - vous', 'avez été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 11),
  ('00000000-0000-0000-0000-000000000001', 'être - Passé Composé - ils', 'ont été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 12),
  ('00000000-0000-0000-0000-000000000001', 'être - Imparfait - je', 'étais', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 13),
  ('00000000-0000-0000-0000-000000000001', 'être - Imparfait - tu', 'étais', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 14),
  ('00000000-0000-0000-0000-000000000001', 'être - Imparfait - il', 'était', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 15),
  ('00000000-0000-0000-0000-000000000001', 'être - Imparfait - nous', 'étions', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 16),
  ('00000000-0000-0000-0000-000000000001', 'être - Imparfait - vous', 'étiez', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 17),
  ('00000000-0000-0000-0000-000000000001', 'être - Imparfait - ils', 'étaient', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 18),
  ('00000000-0000-0000-0000-000000000001', 'être - Futur Simple - je', 'serai', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 19),
  ('00000000-0000-0000-0000-000000000001', 'être - Futur Simple - tu', 'seras', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 20),
  ('00000000-0000-0000-0000-000000000001', 'être - Futur Simple - il', 'sera', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 21),
  ('00000000-0000-0000-0000-000000000001', 'être - Futur Simple - nous', 'serons', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 22),
  ('00000000-0000-0000-0000-000000000001', 'être - Futur Simple - vous', 'serez', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 23),
  ('00000000-0000-0000-0000-000000000001', 'être - Futur Simple - ils', 'seront', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 24);

-- Insert avoir (to have) cards
INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', 'avoir - Présent - je', 'ai', '{"verb_id": "avoir", "tense": "present", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 25),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Présent - tu', 'as', '{"verb_id": "avoir", "tense": "present", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 26),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Présent - il', 'a', '{"verb_id": "avoir", "tense": "present", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 27),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Présent - nous', 'avons', '{"verb_id": "avoir", "tense": "present", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 28),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Présent - vous', 'avez', '{"verb_id": "avoir", "tense": "present", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 29),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Présent - ils', 'ont', '{"verb_id": "avoir", "tense": "present", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 30),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Passé Composé - je', 'ai eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 31),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Passé Composé - tu', 'as eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 32),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Passé Composé - il', 'a eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 33),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Passé Composé - nous', 'avons eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 34),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Passé Composé - vous', 'avez eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 35),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Passé Composé - ils', 'ont eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 36),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Imparfait - je', 'avais', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 37),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Imparfait - tu', 'avais', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 38),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Imparfait - il', 'avait', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 39),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Imparfait - nous', 'avions', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 40),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Imparfait - vous', 'aviez', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 41),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Imparfait - ils', 'avaient', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 42),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Futur Simple - je', 'aurai', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 43),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Futur Simple - tu', 'auras', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 44),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Futur Simple - il', 'aura', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 45),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Futur Simple - nous', 'aurons', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 46),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Futur Simple - vous', 'aurez', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 47),
  ('00000000-0000-0000-0000-000000000001', 'avoir - Futur Simple - ils', 'auront', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 48);

-- Insert aller (to go) cards
INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', 'aller - Présent - je', 'vais', '{"verb_id": "aller", "tense": "present", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 49),
  ('00000000-0000-0000-0000-000000000001', 'aller - Présent - tu', 'vas', '{"verb_id": "aller", "tense": "present", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 50),
  ('00000000-0000-0000-0000-000000000001', 'aller - Présent - il', 'va', '{"verb_id": "aller", "tense": "present", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 51),
  ('00000000-0000-0000-0000-000000000001', 'aller - Présent - nous', 'allons', '{"verb_id": "aller", "tense": "present", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 52),
  ('00000000-0000-0000-0000-000000000001', 'aller - Présent - vous', 'allez', '{"verb_id": "aller", "tense": "present", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 53),
  ('00000000-0000-0000-0000-000000000001', 'aller - Présent - ils', 'vont', '{"verb_id": "aller", "tense": "present", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 54),
  ('00000000-0000-0000-0000-000000000001', 'aller - Passé Composé - je', 'suis allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 55),
  ('00000000-0000-0000-0000-000000000001', 'aller - Passé Composé - tu', 'es allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 56),
  ('00000000-0000-0000-0000-000000000001', 'aller - Passé Composé - il', 'est allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 57),
  ('00000000-0000-0000-0000-000000000001', 'aller - Passé Composé - nous', 'sommes allés', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 58),
  ('00000000-0000-0000-0000-000000000001', 'aller - Passé Composé - vous', 'êtes allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 59),
  ('00000000-0000-0000-0000-000000000001', 'aller - Passé Composé - ils', 'sont allés', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 60),
  ('00000000-0000-0000-0000-000000000001', 'aller - Imparfait - je', 'allais', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 61),
  ('00000000-0000-0000-0000-000000000001', 'aller - Imparfait - tu', 'allais', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 62),
  ('00000000-0000-0000-0000-000000000001', 'aller - Imparfait - il', 'allait', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 63),
  ('00000000-0000-0000-0000-000000000001', 'aller - Imparfait - nous', 'allions', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 64),
  ('00000000-0000-0000-0000-000000000001', 'aller - Imparfait - vous', 'alliez', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 65),
  ('00000000-0000-0000-0000-000000000001', 'aller - Imparfait - ils', 'allaient', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 66),
  ('00000000-0000-0000-0000-000000000001', 'aller - Futur Simple - je', 'irai', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 67),
  ('00000000-0000-0000-0000-000000000001', 'aller - Futur Simple - tu', 'iras', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 68),
  ('00000000-0000-0000-0000-000000000001', 'aller - Futur Simple - il', 'ira', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 69),
  ('00000000-0000-0000-0000-000000000001', 'aller - Futur Simple - nous', 'irons', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 70),
  ('00000000-0000-0000-0000-000000000001', 'aller - Futur Simple - vous', 'irez', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 71),
  ('00000000-0000-0000-0000-000000000001', 'aller - Futur Simple - ils', 'iront', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 72);

-- Insert faire (to do/make) cards
INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', 'faire - Présent - je', 'fais', '{"verb_id": "faire", "tense": "present", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 73),
  ('00000000-0000-0000-0000-000000000001', 'faire - Présent - tu', 'fais', '{"verb_id": "faire", "tense": "present", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 74),
  ('00000000-0000-0000-0000-000000000001', 'faire - Présent - il', 'fait', '{"verb_id": "faire", "tense": "present", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 75),
  ('00000000-0000-0000-0000-000000000001', 'faire - Présent - nous', 'faisons', '{"verb_id": "faire", "tense": "present", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 76),
  ('00000000-0000-0000-0000-000000000001', 'faire - Présent - vous', 'faites', '{"verb_id": "faire", "tense": "present", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 77),
  ('00000000-0000-0000-0000-000000000001', 'faire - Présent - ils', 'font', '{"verb_id": "faire", "tense": "present", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 78),
  ('00000000-0000-0000-0000-000000000001', 'faire - Passé Composé - je', 'ai fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 79),
  ('00000000-0000-0000-0000-000000000001', 'faire - Passé Composé - tu', 'as fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 80),
  ('00000000-0000-0000-0000-000000000001', 'faire - Passé Composé - il', 'a fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 81),
  ('00000000-0000-0000-0000-000000000001', 'faire - Passé Composé - nous', 'avons fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 82),
  ('00000000-0000-0000-0000-000000000001', 'faire - Passé Composé - vous', 'avez fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 83),
  ('00000000-0000-0000-0000-000000000001', 'faire - Passé Composé - ils', 'ont fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 84),
  ('00000000-0000-0000-0000-000000000001', 'faire - Imparfait - je', 'faisais', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 85),
  ('00000000-0000-0000-0000-000000000001', 'faire - Imparfait - tu', 'faisais', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 86),
  ('00000000-0000-0000-0000-000000000001', 'faire - Imparfait - il', 'faisait', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 87),
  ('00000000-0000-0000-0000-000000000001', 'faire - Imparfait - nous', 'faisions', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 88),
  ('00000000-0000-0000-0000-000000000001', 'faire - Imparfait - vous', 'faisiez', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 89),
  ('00000000-0000-0000-0000-000000000001', 'faire - Imparfait - ils', 'faisaient', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 90),
  ('00000000-0000-0000-0000-000000000001', 'faire - Futur Simple - je', 'ferai', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 91),
  ('00000000-0000-0000-0000-000000000001', 'faire - Futur Simple - tu', 'feras', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 92),
  ('00000000-0000-0000-0000-000000000001', 'faire - Futur Simple - il', 'fera', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 93),
  ('00000000-0000-0000-0000-000000000001', 'faire - Futur Simple - nous', 'ferons', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 94),
  ('00000000-0000-0000-0000-000000000001', 'faire - Futur Simple - vous', 'ferez', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 95),
  ('00000000-0000-0000-0000-000000000001', 'faire - Futur Simple - ils', 'feront', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 96);

-- Insert pouvoir (can/to be able to) cards
INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Présent - je', 'peux', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 97),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Présent - tu', 'peux', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 98),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Présent - il', 'peut', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 99),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Présent - nous', 'pouvons', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 100),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Présent - vous', 'pouvez', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 101),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Présent - ils', 'peuvent', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 102),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Passé Composé - je', 'ai pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 103),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Passé Composé - tu', 'as pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 104),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Passé Composé - il', 'a pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 105),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Passé Composé - nous', 'avons pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 106),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Passé Composé - vous', 'avez pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 107),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Passé Composé - ils', 'ont pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 108),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Imparfait - je', 'pouvais', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 109),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Imparfait - tu', 'pouvais', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 110),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Imparfait - il', 'pouvait', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 111),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Imparfait - nous', 'pouvions', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 112),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Imparfait - vous', 'pouviez', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 113),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Imparfait - ils', 'pouvaient', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 114),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Futur Simple - je', 'pourrai', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 115),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Futur Simple - tu', 'pourras', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 116),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Futur Simple - il', 'pourra', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 117),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Futur Simple - nous', 'pourrons', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 118),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Futur Simple - vous', 'pourrez', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 119),
  ('00000000-0000-0000-0000-000000000001', 'pouvoir - Futur Simple - ils', 'pourront', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 120);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '   - Tables created: profiles, decks, cards, study_progress';
  RAISE NOTICE '   - RLS policies enabled (public can view public decks)';
  RAISE NOTICE '   - French Verbs deck created with 120 cards';
  RAISE NOTICE '   - Deck ID: 00000000-0000-0000-0000-000000000001';
END $$;
