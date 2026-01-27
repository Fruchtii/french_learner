-- ===========================================
-- VOKAB - Multi-Deck Learning Platform Schema
-- ===========================================
-- Run this SQL in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. PROFILES TABLE
-- ===========================================
-- Links to Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles are created on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ===========================================
-- 2. DECKS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_decks_created_by ON decks(created_by);
CREATE INDEX IF NOT EXISTS idx_decks_public ON decks(is_public);

-- RLS Policies for decks
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public decks or their own decks"
  ON decks FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own decks"
  ON decks FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  USING (created_by = auth.uid());

-- ===========================================
-- 3. CARDS TABLE
-- ===========================================
-- Flexible card structure with JSONB data field
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  data JSONB, -- Flexible field for complex data (verb conjugations, etc.)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_order ON cards(deck_id, order_index);
CREATE INDEX IF NOT EXISTS idx_cards_data ON cards USING GIN (data);

-- RLS Policies for cards
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cards from accessible decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND (decks.is_public = true OR decks.created_by = auth.uid())
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

-- ===========================================
-- 4. STUDY_PROGRESS TABLE
-- ===========================================
-- Tracks user progress through cards using Leitner system
CREATE TABLE IF NOT EXISTS study_progress (
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

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_progress_user ON study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_card ON study_progress(card_id);
CREATE INDEX IF NOT EXISTS idx_progress_review ON study_progress(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_progress_box ON study_progress(user_id, box);

-- RLS Policies for study_progress
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON study_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own progress"
  ON study_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
  ON study_progress FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own progress"
  ON study_progress FOR DELETE
  USING (user_id = auth.uid());

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================
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

-- ===========================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ===========================================
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

-- ===========================================
-- SAMPLE DATA: French Verbs Deck
-- ===========================================
-- Note: You'll need to replace 'YOUR_USER_ID' with your actual user ID
-- after you sign up. You can find your user ID by running:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Insert sample deck (uncomment and replace YOUR_USER_ID after signup)
/*
INSERT INTO decks (id, title, description, created_by, is_public)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'French Irregular Verbs',
  'Master the 100 most common French irregular verbs across 4 essential tenses: Présent, Passé Composé, Imparfait, and Futur Simple.',
  'YOUR_USER_ID', -- Replace with your actual user ID
  true
);

-- Sample cards for French verbs
-- Example 1: être (to be) - simple flashcard
INSERT INTO cards (deck_id, front, back, data, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'être - Présent - je',
  'suis',
  '{"verb_id": "etre", "tense": "present", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb,
  1
);

-- Example 2: avoir (to have) - complex data
INSERT INTO cards (deck_id, front, back, data, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'avoir - Passé Composé - nous',
  'avons eu',
  '{
    "verb_id": "avoir",
    "tense": "passeCompose",
    "pronoun": "nous",
    "infinitive": "avoir",
    "english": "to have",
    "conjugation_table": {
      "present": {"je": "ai", "tu": "as", "il": "a", "nous": "avons", "vous": "avez", "ils": "ont"},
      "passeCompose": {"je": "ai eu", "tu": "as eu", "il": "a eu", "nous": "avons eu", "vous": "avez eu", "ils": "ont eu"}
    }
  }'::jsonb,
  2
);
*/

-- ===========================================
-- HELPFUL QUERIES
-- ===========================================

-- Get all decks with card count
-- SELECT d.*, COUNT(c.id) as card_count
-- FROM decks d
-- LEFT JOIN cards c ON c.deck_id = d.id
-- GROUP BY d.id
-- ORDER BY d.created_at DESC;

-- Get user progress for a specific deck
-- SELECT sp.*, c.front, c.back
-- FROM study_progress sp
-- JOIN cards c ON c.id = sp.card_id
-- WHERE sp.user_id = 'YOUR_USER_ID'
--   AND c.deck_id = 'DECK_ID'
-- ORDER BY sp.next_review;

-- Get cards due for review
-- SELECT c.*, sp.box, sp.next_review
-- FROM cards c
-- JOIN study_progress sp ON sp.card_id = c.id
-- WHERE sp.user_id = 'YOUR_USER_ID'
--   AND sp.next_review <= NOW()
-- ORDER BY sp.box, sp.next_review;
