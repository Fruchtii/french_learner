-- ===========================================
-- SEED FRENCH VERBS - Public Deck with Cards
-- ===========================================
-- This script creates the Essential French Irregular Verbs deck
-- Run this AFTER schema_reset.sql

-- ============================================
-- PART 1: CREATE FRENCH VERBS DECK
-- ============================================

-- Insert public French Verbs deck (created_by is NULL for system deck)
-- Supabase will auto-generate the UUID
INSERT INTO decks (title, description, created_by, is_public)
VALUES (
  'Essential French Irregular Verbs',
  'Master the most common French irregular verbs across 4 essential tenses: Présent, Passé Composé, Imparfait, and Futur Simple. Perfect for beginners and intermediate learners.',
  NULL, -- System deck, no owner
  true -- Public for everyone
)
RETURNING id;

-- Store the deck ID in a variable for use in card inserts
-- Note: In Supabase SQL Editor, we use DO blocks with variables

DO $$
DECLARE
  deck_uuid UUID;
BEGIN
  -- Get the ID of the deck we just created
  SELECT id INTO deck_uuid
  FROM decks
  WHERE title = 'Essential French Irregular Verbs'
  ORDER BY created_at DESC
  LIMIT 1;

  -- ============================================
  -- PART 2: INSERT CARDS - ÊTRE (TO BE)
  -- ============================================

  -- être - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'être - Présent - je', 'suis', '{"verb_id": "etre", "tense": "present", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 1),
    (deck_uuid, 'être - Présent - tu', 'es', '{"verb_id": "etre", "tense": "present", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 2),
    (deck_uuid, 'être - Présent - il', 'est', '{"verb_id": "etre", "tense": "present", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 3),
    (deck_uuid, 'être - Présent - nous', 'sommes', '{"verb_id": "etre", "tense": "present", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 4),
    (deck_uuid, 'être - Présent - vous', 'êtes', '{"verb_id": "etre", "tense": "present", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 5),
    (deck_uuid, 'être - Présent - ils', 'sont', '{"verb_id": "etre", "tense": "present", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 6);

  -- être - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'être - Passé Composé - je', 'ai été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 7),
    (deck_uuid, 'être - Passé Composé - tu', 'as été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 8),
    (deck_uuid, 'être - Passé Composé - il', 'a été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 9),
    (deck_uuid, 'être - Passé Composé - nous', 'avons été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 10),
    (deck_uuid, 'être - Passé Composé - vous', 'avez été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 11),
    (deck_uuid, 'être - Passé Composé - ils', 'ont été', '{"verb_id": "etre", "tense": "passeCompose", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 12);

  -- être - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'être - Imparfait - je', 'étais', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 13),
    (deck_uuid, 'être - Imparfait - tu', 'étais', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 14),
    (deck_uuid, 'être - Imparfait - il', 'était', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 15),
    (deck_uuid, 'être - Imparfait - nous', 'étions', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 16),
    (deck_uuid, 'être - Imparfait - vous', 'étiez', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 17),
    (deck_uuid, 'être - Imparfait - ils', 'étaient', '{"verb_id": "etre", "tense": "imparfait", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 18);

  -- être - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'être - Futur Simple - je', 'serai', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb, 19),
    (deck_uuid, 'être - Futur Simple - tu', 'seras', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "tu", "infinitive": "être", "english": "to be"}'::jsonb, 20),
    (deck_uuid, 'être - Futur Simple - il', 'sera', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "il", "infinitive": "être", "english": "to be"}'::jsonb, 21),
    (deck_uuid, 'être - Futur Simple - nous', 'serons', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "nous", "infinitive": "être", "english": "to be"}'::jsonb, 22),
    (deck_uuid, 'être - Futur Simple - vous', 'serez', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "vous", "infinitive": "être", "english": "to be"}'::jsonb, 23),
    (deck_uuid, 'être - Futur Simple - ils', 'seront', '{"verb_id": "etre", "tense": "futurSimple", "pronoun": "ils", "infinitive": "être", "english": "to be"}'::jsonb, 24);

  -- ============================================
  -- PART 3: INSERT CARDS - AVOIR (TO HAVE)
  -- ============================================

  -- avoir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'avoir - Présent - je', 'ai', '{"verb_id": "avoir", "tense": "present", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 25),
    (deck_uuid, 'avoir - Présent - tu', 'as', '{"verb_id": "avoir", "tense": "present", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 26),
    (deck_uuid, 'avoir - Présent - il', 'a', '{"verb_id": "avoir", "tense": "present", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 27),
    (deck_uuid, 'avoir - Présent - nous', 'avons', '{"verb_id": "avoir", "tense": "present", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 28),
    (deck_uuid, 'avoir - Présent - vous', 'avez', '{"verb_id": "avoir", "tense": "present", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 29),
    (deck_uuid, 'avoir - Présent - ils', 'ont', '{"verb_id": "avoir", "tense": "present", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 30);

  -- avoir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'avoir - Passé Composé - je', 'ai eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 31),
    (deck_uuid, 'avoir - Passé Composé - tu', 'as eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 32),
    (deck_uuid, 'avoir - Passé Composé - il', 'a eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 33),
    (deck_uuid, 'avoir - Passé Composé - nous', 'avons eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 34),
    (deck_uuid, 'avoir - Passé Composé - vous', 'avez eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 35),
    (deck_uuid, 'avoir - Passé Composé - ils', 'ont eu', '{"verb_id": "avoir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 36);

  -- avoir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'avoir - Imparfait - je', 'avais', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 37),
    (deck_uuid, 'avoir - Imparfait - tu', 'avais', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 38),
    (deck_uuid, 'avoir - Imparfait - il', 'avait', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 39),
    (deck_uuid, 'avoir - Imparfait - nous', 'avions', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 40),
    (deck_uuid, 'avoir - Imparfait - vous', 'aviez', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 41),
    (deck_uuid, 'avoir - Imparfait - ils', 'avaient', '{"verb_id": "avoir", "tense": "imparfait", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 42);

  -- avoir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'avoir - Futur Simple - je', 'aurai', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "je", "infinitive": "avoir", "english": "to have"}'::jsonb, 43),
    (deck_uuid, 'avoir - Futur Simple - tu', 'auras', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "avoir", "english": "to have"}'::jsonb, 44),
    (deck_uuid, 'avoir - Futur Simple - il', 'aura', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "il", "infinitive": "avoir", "english": "to have"}'::jsonb, 45),
    (deck_uuid, 'avoir - Futur Simple - nous', 'aurons', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "avoir", "english": "to have"}'::jsonb, 46),
    (deck_uuid, 'avoir - Futur Simple - vous', 'aurez', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "avoir", "english": "to have"}'::jsonb, 47),
    (deck_uuid, 'avoir - Futur Simple - ils', 'auront', '{"verb_id": "avoir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "avoir", "english": "to have"}'::jsonb, 48);

  -- ============================================
  -- PART 4: INSERT CARDS - ALLER (TO GO)
  -- ============================================

  -- aller - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'aller - Présent - je', 'vais', '{"verb_id": "aller", "tense": "present", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 49),
    (deck_uuid, 'aller - Présent - tu', 'vas', '{"verb_id": "aller", "tense": "present", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 50),
    (deck_uuid, 'aller - Présent - il', 'va', '{"verb_id": "aller", "tense": "present", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 51),
    (deck_uuid, 'aller - Présent - nous', 'allons', '{"verb_id": "aller", "tense": "present", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 52),
    (deck_uuid, 'aller - Présent - vous', 'allez', '{"verb_id": "aller", "tense": "present", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 53),
    (deck_uuid, 'aller - Présent - ils', 'vont', '{"verb_id": "aller", "tense": "present", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 54);

  -- aller - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'aller - Passé Composé - je', 'suis allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 55),
    (deck_uuid, 'aller - Passé Composé - tu', 'es allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 56),
    (deck_uuid, 'aller - Passé Composé - il', 'est allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 57),
    (deck_uuid, 'aller - Passé Composé - nous', 'sommes allés', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 58),
    (deck_uuid, 'aller - Passé Composé - vous', 'êtes allé', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 59),
    (deck_uuid, 'aller - Passé Composé - ils', 'sont allés', '{"verb_id": "aller", "tense": "passeCompose", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 60);

  -- aller - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'aller - Imparfait - je', 'allais', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 61),
    (deck_uuid, 'aller - Imparfait - tu', 'allais', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 62),
    (deck_uuid, 'aller - Imparfait - il', 'allait', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 63),
    (deck_uuid, 'aller - Imparfait - nous', 'allions', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 64),
    (deck_uuid, 'aller - Imparfait - vous', 'alliez', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 65),
    (deck_uuid, 'aller - Imparfait - ils', 'allaient', '{"verb_id": "aller", "tense": "imparfait", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 66);

  -- aller - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'aller - Futur Simple - je', 'irai', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "je", "infinitive": "aller", "english": "to go"}'::jsonb, 67),
    (deck_uuid, 'aller - Futur Simple - tu', 'iras', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "tu", "infinitive": "aller", "english": "to go"}'::jsonb, 68),
    (deck_uuid, 'aller - Futur Simple - il', 'ira', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "il", "infinitive": "aller", "english": "to go"}'::jsonb, 69),
    (deck_uuid, 'aller - Futur Simple - nous', 'irons', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "nous", "infinitive": "aller", "english": "to go"}'::jsonb, 70),
    (deck_uuid, 'aller - Futur Simple - vous', 'irez', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "vous", "infinitive": "aller", "english": "to go"}'::jsonb, 71),
    (deck_uuid, 'aller - Futur Simple - ils', 'iront', '{"verb_id": "aller", "tense": "futurSimple", "pronoun": "ils", "infinitive": "aller", "english": "to go"}'::jsonb, 72);

  -- ============================================
  -- PART 5: INSERT CARDS - FAIRE (TO DO/MAKE)
  -- ============================================

  -- faire - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'faire - Présent - je', 'fais', '{"verb_id": "faire", "tense": "present", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 73),
    (deck_uuid, 'faire - Présent - tu', 'fais', '{"verb_id": "faire", "tense": "present", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 74),
    (deck_uuid, 'faire - Présent - il', 'fait', '{"verb_id": "faire", "tense": "present", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 75),
    (deck_uuid, 'faire - Présent - nous', 'faisons', '{"verb_id": "faire", "tense": "present", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 76),
    (deck_uuid, 'faire - Présent - vous', 'faites', '{"verb_id": "faire", "tense": "present", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 77),
    (deck_uuid, 'faire - Présent - ils', 'font', '{"verb_id": "faire", "tense": "present", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 78);

  -- faire - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'faire - Passé Composé - je', 'ai fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 79),
    (deck_uuid, 'faire - Passé Composé - tu', 'as fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 80),
    (deck_uuid, 'faire - Passé Composé - il', 'a fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 81),
    (deck_uuid, 'faire - Passé Composé - nous', 'avons fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 82),
    (deck_uuid, 'faire - Passé Composé - vous', 'avez fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 83),
    (deck_uuid, 'faire - Passé Composé - ils', 'ont fait', '{"verb_id": "faire", "tense": "passeCompose", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 84);

  -- faire - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'faire - Imparfait - je', 'faisais', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 85),
    (deck_uuid, 'faire - Imparfait - tu', 'faisais', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 86),
    (deck_uuid, 'faire - Imparfait - il', 'faisait', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 87),
    (deck_uuid, 'faire - Imparfait - nous', 'faisions', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 88),
    (deck_uuid, 'faire - Imparfait - vous', 'faisiez', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 89),
    (deck_uuid, 'faire - Imparfait - ils', 'faisaient', '{"verb_id": "faire", "tense": "imparfait", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 90);

  -- faire - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'faire - Futur Simple - je', 'ferai', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "je", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 91),
    (deck_uuid, 'faire - Futur Simple - tu', 'feras', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "tu", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 92),
    (deck_uuid, 'faire - Futur Simple - il', 'fera', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "il", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 93),
    (deck_uuid, 'faire - Futur Simple - nous', 'ferons', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "nous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 94),
    (deck_uuid, 'faire - Futur Simple - vous', 'ferez', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "vous", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 95),
    (deck_uuid, 'faire - Futur Simple - ils', 'feront', '{"verb_id": "faire", "tense": "futurSimple", "pronoun": "ils", "infinitive": "faire", "english": "to do / to make"}'::jsonb, 96);

  -- ============================================
  -- PART 6: INSERT CARDS - POUVOIR (CAN/TO BE ABLE TO)
  -- ============================================

  -- pouvoir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'pouvoir - Présent - je', 'peux', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 97),
    (deck_uuid, 'pouvoir - Présent - tu', 'peux', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 98),
    (deck_uuid, 'pouvoir - Présent - il', 'peut', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 99),
    (deck_uuid, 'pouvoir - Présent - nous', 'pouvons', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 100),
    (deck_uuid, 'pouvoir - Présent - vous', 'pouvez', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 101),
    (deck_uuid, 'pouvoir - Présent - ils', 'peuvent', '{"verb_id": "pouvoir", "tense": "present", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 102);

  -- pouvoir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'pouvoir - Passé Composé - je', 'ai pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 103),
    (deck_uuid, 'pouvoir - Passé Composé - tu', 'as pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 104),
    (deck_uuid, 'pouvoir - Passé Composé - il', 'a pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 105),
    (deck_uuid, 'pouvoir - Passé Composé - nous', 'avons pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 106),
    (deck_uuid, 'pouvoir - Passé Composé - vous', 'avez pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 107),
    (deck_uuid, 'pouvoir - Passé Composé - ils', 'ont pu', '{"verb_id": "pouvoir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 108);

  -- pouvoir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'pouvoir - Imparfait - je', 'pouvais', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 109),
    (deck_uuid, 'pouvoir - Imparfait - tu', 'pouvais', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 110),
    (deck_uuid, 'pouvoir - Imparfait - il', 'pouvait', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 111),
    (deck_uuid, 'pouvoir - Imparfait - nous', 'pouvions', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 112),
    (deck_uuid, 'pouvoir - Imparfait - vous', 'pouviez', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 113),
    (deck_uuid, 'pouvoir - Imparfait - ils', 'pouvaient', '{"verb_id": "pouvoir", "tense": "imparfait", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 114);

  -- pouvoir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'pouvoir - Futur Simple - je', 'pourrai', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "je", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 115),
    (deck_uuid, 'pouvoir - Futur Simple - tu', 'pourras', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 116),
    (deck_uuid, 'pouvoir - Futur Simple - il', 'pourra', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "il", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 117),
    (deck_uuid, 'pouvoir - Futur Simple - nous', 'pourrons', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 118),
    (deck_uuid, 'pouvoir - Futur Simple - vous', 'pourrez', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 119),
    (deck_uuid, 'pouvoir - Futur Simple - ils', 'pourront', '{"verb_id": "pouvoir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "pouvoir", "english": "to be able to / can"}'::jsonb, 120);

  -- ============================================
  -- PART 7: INSERT CARDS - VENIR (TO COME)
  -- ============================================

  -- venir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'venir - Présent - je', 'viens', '{"verb_id": "venir", "tense": "present", "pronoun": "je", "infinitive": "venir", "english": "to come"}'::jsonb, 121),
    (deck_uuid, 'venir - Présent - tu', 'viens', '{"verb_id": "venir", "tense": "present", "pronoun": "tu", "infinitive": "venir", "english": "to come"}'::jsonb, 122),
    (deck_uuid, 'venir - Présent - il', 'vient', '{"verb_id": "venir", "tense": "present", "pronoun": "il", "infinitive": "venir", "english": "to come"}'::jsonb, 123),
    (deck_uuid, 'venir - Présent - nous', 'venons', '{"verb_id": "venir", "tense": "present", "pronoun": "nous", "infinitive": "venir", "english": "to come"}'::jsonb, 124),
    (deck_uuid, 'venir - Présent - vous', 'venez', '{"verb_id": "venir", "tense": "present", "pronoun": "vous", "infinitive": "venir", "english": "to come"}'::jsonb, 125),
    (deck_uuid, 'venir - Présent - ils', 'viennent', '{"verb_id": "venir", "tense": "present", "pronoun": "ils", "infinitive": "venir", "english": "to come"}'::jsonb, 126);

  -- venir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'venir - Passé Composé - je', 'suis venu', '{"verb_id": "venir", "tense": "passeCompose", "pronoun": "je", "infinitive": "venir", "english": "to come"}'::jsonb, 127),
    (deck_uuid, 'venir - Passé Composé - tu', 'es venu', '{"verb_id": "venir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "venir", "english": "to come"}'::jsonb, 128),
    (deck_uuid, 'venir - Passé Composé - il', 'est venu', '{"verb_id": "venir", "tense": "passeCompose", "pronoun": "il", "infinitive": "venir", "english": "to come"}'::jsonb, 129),
    (deck_uuid, 'venir - Passé Composé - nous', 'sommes venus', '{"verb_id": "venir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "venir", "english": "to come"}'::jsonb, 130),
    (deck_uuid, 'venir - Passé Composé - vous', 'êtes venu', '{"verb_id": "venir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "venir", "english": "to come"}'::jsonb, 131),
    (deck_uuid, 'venir - Passé Composé - ils', 'sont venus', '{"verb_id": "venir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "venir", "english": "to come"}'::jsonb, 132);

  -- venir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'venir - Imparfait - je', 'venais', '{"verb_id": "venir", "tense": "imparfait", "pronoun": "je", "infinitive": "venir", "english": "to come"}'::jsonb, 133),
    (deck_uuid, 'venir - Imparfait - tu', 'venais', '{"verb_id": "venir", "tense": "imparfait", "pronoun": "tu", "infinitive": "venir", "english": "to come"}'::jsonb, 134),
    (deck_uuid, 'venir - Imparfait - il', 'venait', '{"verb_id": "venir", "tense": "imparfait", "pronoun": "il", "infinitive": "venir", "english": "to come"}'::jsonb, 135),
    (deck_uuid, 'venir - Imparfait - nous', 'venions', '{"verb_id": "venir", "tense": "imparfait", "pronoun": "nous", "infinitive": "venir", "english": "to come"}'::jsonb, 136),
    (deck_uuid, 'venir - Imparfait - vous', 'veniez', '{"verb_id": "venir", "tense": "imparfait", "pronoun": "vous", "infinitive": "venir", "english": "to come"}'::jsonb, 137),
    (deck_uuid, 'venir - Imparfait - ils', 'venaient', '{"verb_id": "venir", "tense": "imparfait", "pronoun": "ils", "infinitive": "venir", "english": "to come"}'::jsonb, 138);

  -- venir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'venir - Futur Simple - je', 'viendrai', '{"verb_id": "venir", "tense": "futurSimple", "pronoun": "je", "infinitive": "venir", "english": "to come"}'::jsonb, 139),
    (deck_uuid, 'venir - Futur Simple - tu', 'viendras', '{"verb_id": "venir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "venir", "english": "to come"}'::jsonb, 140),
    (deck_uuid, 'venir - Futur Simple - il', 'viendra', '{"verb_id": "venir", "tense": "futurSimple", "pronoun": "il", "infinitive": "venir", "english": "to come"}'::jsonb, 141),
    (deck_uuid, 'venir - Futur Simple - nous', 'viendrons', '{"verb_id": "venir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "venir", "english": "to come"}'::jsonb, 142),
    (deck_uuid, 'venir - Futur Simple - vous', 'viendrez', '{"verb_id": "venir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "venir", "english": "to come"}'::jsonb, 143),
    (deck_uuid, 'venir - Futur Simple - ils', 'viendront', '{"verb_id": "venir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "venir", "english": "to come"}'::jsonb, 144);

  -- ============================================
  -- PART 8: INSERT CARDS - VOIR (TO SEE)
  -- ============================================

  -- voir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'voir - Présent - je', 'vois', '{"verb_id": "voir", "tense": "present", "pronoun": "je", "infinitive": "voir", "english": "to see"}'::jsonb, 145),
    (deck_uuid, 'voir - Présent - tu', 'vois', '{"verb_id": "voir", "tense": "present", "pronoun": "tu", "infinitive": "voir", "english": "to see"}'::jsonb, 146),
    (deck_uuid, 'voir - Présent - il', 'voit', '{"verb_id": "voir", "tense": "present", "pronoun": "il", "infinitive": "voir", "english": "to see"}'::jsonb, 147),
    (deck_uuid, 'voir - Présent - nous', 'voyons', '{"verb_id": "voir", "tense": "present", "pronoun": "nous", "infinitive": "voir", "english": "to see"}'::jsonb, 148),
    (deck_uuid, 'voir - Présent - vous', 'voyez', '{"verb_id": "voir", "tense": "present", "pronoun": "vous", "infinitive": "voir", "english": "to see"}'::jsonb, 149),
    (deck_uuid, 'voir - Présent - ils', 'voient', '{"verb_id": "voir", "tense": "present", "pronoun": "ils", "infinitive": "voir", "english": "to see"}'::jsonb, 150);

  -- voir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'voir - Passé Composé - je', 'ai vu', '{"verb_id": "voir", "tense": "passeCompose", "pronoun": "je", "infinitive": "voir", "english": "to see"}'::jsonb, 151),
    (deck_uuid, 'voir - Passé Composé - tu', 'as vu', '{"verb_id": "voir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "voir", "english": "to see"}'::jsonb, 152),
    (deck_uuid, 'voir - Passé Composé - il', 'a vu', '{"verb_id": "voir", "tense": "passeCompose", "pronoun": "il", "infinitive": "voir", "english": "to see"}'::jsonb, 153),
    (deck_uuid, 'voir - Passé Composé - nous', 'avons vu', '{"verb_id": "voir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "voir", "english": "to see"}'::jsonb, 154),
    (deck_uuid, 'voir - Passé Composé - vous', 'avez vu', '{"verb_id": "voir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "voir", "english": "to see"}'::jsonb, 155),
    (deck_uuid, 'voir - Passé Composé - ils', 'ont vu', '{"verb_id": "voir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "voir", "english": "to see"}'::jsonb, 156);

  -- voir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'voir - Imparfait - je', 'voyais', '{"verb_id": "voir", "tense": "imparfait", "pronoun": "je", "infinitive": "voir", "english": "to see"}'::jsonb, 157),
    (deck_uuid, 'voir - Imparfait - tu', 'voyais', '{"verb_id": "voir", "tense": "imparfait", "pronoun": "tu", "infinitive": "voir", "english": "to see"}'::jsonb, 158),
    (deck_uuid, 'voir - Imparfait - il', 'voyait', '{"verb_id": "voir", "tense": "imparfait", "pronoun": "il", "infinitive": "voir", "english": "to see"}'::jsonb, 159),
    (deck_uuid, 'voir - Imparfait - nous', 'voyions', '{"verb_id": "voir", "tense": "imparfait", "pronoun": "nous", "infinitive": "voir", "english": "to see"}'::jsonb, 160),
    (deck_uuid, 'voir - Imparfait - vous', 'voyiez', '{"verb_id": "voir", "tense": "imparfait", "pronoun": "vous", "infinitive": "voir", "english": "to see"}'::jsonb, 161),
    (deck_uuid, 'voir - Imparfait - ils', 'voyaient', '{"verb_id": "voir", "tense": "imparfait", "pronoun": "ils", "infinitive": "voir", "english": "to see"}'::jsonb, 162);

  -- voir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'voir - Futur Simple - je', 'verrai', '{"verb_id": "voir", "tense": "futurSimple", "pronoun": "je", "infinitive": "voir", "english": "to see"}'::jsonb, 163),
    (deck_uuid, 'voir - Futur Simple - tu', 'verras', '{"verb_id": "voir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "voir", "english": "to see"}'::jsonb, 164),
    (deck_uuid, 'voir - Futur Simple - il', 'verra', '{"verb_id": "voir", "tense": "futurSimple", "pronoun": "il", "infinitive": "voir", "english": "to see"}'::jsonb, 165),
    (deck_uuid, 'voir - Futur Simple - nous', 'verrons', '{"verb_id": "voir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "voir", "english": "to see"}'::jsonb, 166),
    (deck_uuid, 'voir - Futur Simple - vous', 'verrez', '{"verb_id": "voir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "voir", "english": "to see"}'::jsonb, 167),
    (deck_uuid, 'voir - Futur Simple - ils', 'verront', '{"verb_id": "voir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "voir", "english": "to see"}'::jsonb, 168);

  -- ============================================
  -- PART 9: INSERT CARDS - SAVOIR (TO KNOW)
  -- ============================================

  -- savoir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'savoir - Présent - je', 'sais', '{"verb_id": "savoir", "tense": "present", "pronoun": "je", "infinitive": "savoir", "english": "to know"}'::jsonb, 169),
    (deck_uuid, 'savoir - Présent - tu', 'sais', '{"verb_id": "savoir", "tense": "present", "pronoun": "tu", "infinitive": "savoir", "english": "to know"}'::jsonb, 170),
    (deck_uuid, 'savoir - Présent - il', 'sait', '{"verb_id": "savoir", "tense": "present", "pronoun": "il", "infinitive": "savoir", "english": "to know"}'::jsonb, 171),
    (deck_uuid, 'savoir - Présent - nous', 'savons', '{"verb_id": "savoir", "tense": "present", "pronoun": "nous", "infinitive": "savoir", "english": "to know"}'::jsonb, 172),
    (deck_uuid, 'savoir - Présent - vous', 'savez', '{"verb_id": "savoir", "tense": "present", "pronoun": "vous", "infinitive": "savoir", "english": "to know"}'::jsonb, 173),
    (deck_uuid, 'savoir - Présent - ils', 'savent', '{"verb_id": "savoir", "tense": "present", "pronoun": "ils", "infinitive": "savoir", "english": "to know"}'::jsonb, 174);

  -- savoir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'savoir - Passé Composé - je', 'ai su', '{"verb_id": "savoir", "tense": "passeCompose", "pronoun": "je", "infinitive": "savoir", "english": "to know"}'::jsonb, 175),
    (deck_uuid, 'savoir - Passé Composé - tu', 'as su', '{"verb_id": "savoir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "savoir", "english": "to know"}'::jsonb, 176),
    (deck_uuid, 'savoir - Passé Composé - il', 'a su', '{"verb_id": "savoir", "tense": "passeCompose", "pronoun": "il", "infinitive": "savoir", "english": "to know"}'::jsonb, 177),
    (deck_uuid, 'savoir - Passé Composé - nous', 'avons su', '{"verb_id": "savoir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "savoir", "english": "to know"}'::jsonb, 178),
    (deck_uuid, 'savoir - Passé Composé - vous', 'avez su', '{"verb_id": "savoir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "savoir", "english": "to know"}'::jsonb, 179),
    (deck_uuid, 'savoir - Passé Composé - ils', 'ont su', '{"verb_id": "savoir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "savoir", "english": "to know"}'::jsonb, 180);

  -- savoir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'savoir - Imparfait - je', 'savais', '{"verb_id": "savoir", "tense": "imparfait", "pronoun": "je", "infinitive": "savoir", "english": "to know"}'::jsonb, 181),
    (deck_uuid, 'savoir - Imparfait - tu', 'savais', '{"verb_id": "savoir", "tense": "imparfait", "pronoun": "tu", "infinitive": "savoir", "english": "to know"}'::jsonb, 182),
    (deck_uuid, 'savoir - Imparfait - il', 'savait', '{"verb_id": "savoir", "tense": "imparfait", "pronoun": "il", "infinitive": "savoir", "english": "to know"}'::jsonb, 183),
    (deck_uuid, 'savoir - Imparfait - nous', 'savions', '{"verb_id": "savoir", "tense": "imparfait", "pronoun": "nous", "infinitive": "savoir", "english": "to know"}'::jsonb, 184),
    (deck_uuid, 'savoir - Imparfait - vous', 'saviez', '{"verb_id": "savoir", "tense": "imparfait", "pronoun": "vous", "infinitive": "savoir", "english": "to know"}'::jsonb, 185),
    (deck_uuid, 'savoir - Imparfait - ils', 'savaient', '{"verb_id": "savoir", "tense": "imparfait", "pronoun": "ils", "infinitive": "savoir", "english": "to know"}'::jsonb, 186);

  -- savoir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'savoir - Futur Simple - je', 'saurai', '{"verb_id": "savoir", "tense": "futurSimple", "pronoun": "je", "infinitive": "savoir", "english": "to know"}'::jsonb, 187),
    (deck_uuid, 'savoir - Futur Simple - tu', 'sauras', '{"verb_id": "savoir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "savoir", "english": "to know"}'::jsonb, 188),
    (deck_uuid, 'savoir - Futur Simple - il', 'saura', '{"verb_id": "savoir", "tense": "futurSimple", "pronoun": "il", "infinitive": "savoir", "english": "to know"}'::jsonb, 189),
    (deck_uuid, 'savoir - Futur Simple - nous', 'saurons', '{"verb_id": "savoir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "savoir", "english": "to know"}'::jsonb, 190),
    (deck_uuid, 'savoir - Futur Simple - vous', 'saurez', '{"verb_id": "savoir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "savoir", "english": "to know"}'::jsonb, 191),
    (deck_uuid, 'savoir - Futur Simple - ils', 'sauront', '{"verb_id": "savoir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "savoir", "english": "to know"}'::jsonb, 192);

  -- ============================================
  -- PART 10: INSERT CARDS - VOULOIR (TO WANT)
  -- ============================================

  -- vouloir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'vouloir - Présent - je', 'veux', '{"verb_id": "vouloir", "tense": "present", "pronoun": "je", "infinitive": "vouloir", "english": "to want"}'::jsonb, 193),
    (deck_uuid, 'vouloir - Présent - tu', 'veux', '{"verb_id": "vouloir", "tense": "present", "pronoun": "tu", "infinitive": "vouloir", "english": "to want"}'::jsonb, 194),
    (deck_uuid, 'vouloir - Présent - il', 'veut', '{"verb_id": "vouloir", "tense": "present", "pronoun": "il", "infinitive": "vouloir", "english": "to want"}'::jsonb, 195),
    (deck_uuid, 'vouloir - Présent - nous', 'voulons', '{"verb_id": "vouloir", "tense": "present", "pronoun": "nous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 196),
    (deck_uuid, 'vouloir - Présent - vous', 'voulez', '{"verb_id": "vouloir", "tense": "present", "pronoun": "vous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 197),
    (deck_uuid, 'vouloir - Présent - ils', 'veulent', '{"verb_id": "vouloir", "tense": "present", "pronoun": "ils", "infinitive": "vouloir", "english": "to want"}'::jsonb, 198);

  -- vouloir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'vouloir - Passé Composé - je', 'ai voulu', '{"verb_id": "vouloir", "tense": "passeCompose", "pronoun": "je", "infinitive": "vouloir", "english": "to want"}'::jsonb, 199),
    (deck_uuid, 'vouloir - Passé Composé - tu', 'as voulu', '{"verb_id": "vouloir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "vouloir", "english": "to want"}'::jsonb, 200),
    (deck_uuid, 'vouloir - Passé Composé - il', 'a voulu', '{"verb_id": "vouloir", "tense": "passeCompose", "pronoun": "il", "infinitive": "vouloir", "english": "to want"}'::jsonb, 201),
    (deck_uuid, 'vouloir - Passé Composé - nous', 'avons voulu', '{"verb_id": "vouloir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 202),
    (deck_uuid, 'vouloir - Passé Composé - vous', 'avez voulu', '{"verb_id": "vouloir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 203),
    (deck_uuid, 'vouloir - Passé Composé - ils', 'ont voulu', '{"verb_id": "vouloir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "vouloir", "english": "to want"}'::jsonb, 204);

  -- vouloir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'vouloir - Imparfait - je', 'voulais', '{"verb_id": "vouloir", "tense": "imparfait", "pronoun": "je", "infinitive": "vouloir", "english": "to want"}'::jsonb, 205),
    (deck_uuid, 'vouloir - Imparfait - tu', 'voulais', '{"verb_id": "vouloir", "tense": "imparfait", "pronoun": "tu", "infinitive": "vouloir", "english": "to want"}'::jsonb, 206),
    (deck_uuid, 'vouloir - Imparfait - il', 'voulait', '{"verb_id": "vouloir", "tense": "imparfait", "pronoun": "il", "infinitive": "vouloir", "english": "to want"}'::jsonb, 207),
    (deck_uuid, 'vouloir - Imparfait - nous', 'voulions', '{"verb_id": "vouloir", "tense": "imparfait", "pronoun": "nous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 208),
    (deck_uuid, 'vouloir - Imparfait - vous', 'vouliez', '{"verb_id": "vouloir", "tense": "imparfait", "pronoun": "vous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 209),
    (deck_uuid, 'vouloir - Imparfait - ils', 'voulaient', '{"verb_id": "vouloir", "tense": "imparfait", "pronoun": "ils", "infinitive": "vouloir", "english": "to want"}'::jsonb, 210);

  -- vouloir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'vouloir - Futur Simple - je', 'voudrai', '{"verb_id": "vouloir", "tense": "futurSimple", "pronoun": "je", "infinitive": "vouloir", "english": "to want"}'::jsonb, 211),
    (deck_uuid, 'vouloir - Futur Simple - tu', 'voudras', '{"verb_id": "vouloir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "vouloir", "english": "to want"}'::jsonb, 212),
    (deck_uuid, 'vouloir - Futur Simple - il', 'voudra', '{"verb_id": "vouloir", "tense": "futurSimple", "pronoun": "il", "infinitive": "vouloir", "english": "to want"}'::jsonb, 213),
    (deck_uuid, 'vouloir - Futur Simple - nous', 'voudrons', '{"verb_id": "vouloir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 214),
    (deck_uuid, 'vouloir - Futur Simple - vous', 'voudrez', '{"verb_id": "vouloir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "vouloir", "english": "to want"}'::jsonb, 215),
    (deck_uuid, 'vouloir - Futur Simple - ils', 'voudront', '{"verb_id": "vouloir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "vouloir", "english": "to want"}'::jsonb, 216);

  -- ============================================
  -- PART 11: INSERT CARDS - DEVOIR (MUST/TO HAVE TO)
  -- ============================================

  -- devoir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'devoir - Présent - je', 'dois', '{"verb_id": "devoir", "tense": "present", "pronoun": "je", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 217),
    (deck_uuid, 'devoir - Présent - tu', 'dois', '{"verb_id": "devoir", "tense": "present", "pronoun": "tu", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 218),
    (deck_uuid, 'devoir - Présent - il', 'doit', '{"verb_id": "devoir", "tense": "present", "pronoun": "il", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 219),
    (deck_uuid, 'devoir - Présent - nous', 'devons', '{"verb_id": "devoir", "tense": "present", "pronoun": "nous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 220),
    (deck_uuid, 'devoir - Présent - vous', 'devez', '{"verb_id": "devoir", "tense": "present", "pronoun": "vous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 221),
    (deck_uuid, 'devoir - Présent - ils', 'doivent', '{"verb_id": "devoir", "tense": "present", "pronoun": "ils", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 222);

  -- devoir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'devoir - Passé Composé - je', 'ai dû', '{"verb_id": "devoir", "tense": "passeCompose", "pronoun": "je", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 223),
    (deck_uuid, 'devoir - Passé Composé - tu', 'as dû', '{"verb_id": "devoir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 224),
    (deck_uuid, 'devoir - Passé Composé - il', 'a dû', '{"verb_id": "devoir", "tense": "passeCompose", "pronoun": "il", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 225),
    (deck_uuid, 'devoir - Passé Composé - nous', 'avons dû', '{"verb_id": "devoir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 226),
    (deck_uuid, 'devoir - Passé Composé - vous', 'avez dû', '{"verb_id": "devoir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 227),
    (deck_uuid, 'devoir - Passé Composé - ils', 'ont dû', '{"verb_id": "devoir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 228);

  -- devoir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'devoir - Imparfait - je', 'devais', '{"verb_id": "devoir", "tense": "imparfait", "pronoun": "je", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 229),
    (deck_uuid, 'devoir - Imparfait - tu', 'devais', '{"verb_id": "devoir", "tense": "imparfait", "pronoun": "tu", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 230),
    (deck_uuid, 'devoir - Imparfait - il', 'devait', '{"verb_id": "devoir", "tense": "imparfait", "pronoun": "il", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 231),
    (deck_uuid, 'devoir - Imparfait - nous', 'devions', '{"verb_id": "devoir", "tense": "imparfait", "pronoun": "nous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 232),
    (deck_uuid, 'devoir - Imparfait - vous', 'deviez', '{"verb_id": "devoir", "tense": "imparfait", "pronoun": "vous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 233),
    (deck_uuid, 'devoir - Imparfait - ils', 'devaient', '{"verb_id": "devoir", "tense": "imparfait", "pronoun": "ils", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 234);

  -- devoir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'devoir - Futur Simple - je', 'devrai', '{"verb_id": "devoir", "tense": "futurSimple", "pronoun": "je", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 235),
    (deck_uuid, 'devoir - Futur Simple - tu', 'devras', '{"verb_id": "devoir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 236),
    (deck_uuid, 'devoir - Futur Simple - il', 'devra', '{"verb_id": "devoir", "tense": "futurSimple", "pronoun": "il", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 237),
    (deck_uuid, 'devoir - Futur Simple - nous', 'devrons', '{"verb_id": "devoir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 238),
    (deck_uuid, 'devoir - Futur Simple - vous', 'devrez', '{"verb_id": "devoir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 239),
    (deck_uuid, 'devoir - Futur Simple - ils', 'devront', '{"verb_id": "devoir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "devoir", "english": "must / to have to"}'::jsonb, 240);

  -- ============================================
  -- PART 12: INSERT CARDS - PRENDRE (TO TAKE)
  -- ============================================

  -- prendre - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'prendre - Présent - je', 'prends', '{"verb_id": "prendre", "tense": "present", "pronoun": "je", "infinitive": "prendre", "english": "to take"}'::jsonb, 241),
    (deck_uuid, 'prendre - Présent - tu', 'prends', '{"verb_id": "prendre", "tense": "present", "pronoun": "tu", "infinitive": "prendre", "english": "to take"}'::jsonb, 242),
    (deck_uuid, 'prendre - Présent - il', 'prend', '{"verb_id": "prendre", "tense": "present", "pronoun": "il", "infinitive": "prendre", "english": "to take"}'::jsonb, 243),
    (deck_uuid, 'prendre - Présent - nous', 'prenons', '{"verb_id": "prendre", "tense": "present", "pronoun": "nous", "infinitive": "prendre", "english": "to take"}'::jsonb, 244),
    (deck_uuid, 'prendre - Présent - vous', 'prenez', '{"verb_id": "prendre", "tense": "present", "pronoun": "vous", "infinitive": "prendre", "english": "to take"}'::jsonb, 245),
    (deck_uuid, 'prendre - Présent - ils', 'prennent', '{"verb_id": "prendre", "tense": "present", "pronoun": "ils", "infinitive": "prendre", "english": "to take"}'::jsonb, 246);

  -- prendre - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'prendre - Passé Composé - je', 'ai pris', '{"verb_id": "prendre", "tense": "passeCompose", "pronoun": "je", "infinitive": "prendre", "english": "to take"}'::jsonb, 247),
    (deck_uuid, 'prendre - Passé Composé - tu', 'as pris', '{"verb_id": "prendre", "tense": "passeCompose", "pronoun": "tu", "infinitive": "prendre", "english": "to take"}'::jsonb, 248),
    (deck_uuid, 'prendre - Passé Composé - il', 'a pris', '{"verb_id": "prendre", "tense": "passeCompose", "pronoun": "il", "infinitive": "prendre", "english": "to take"}'::jsonb, 249),
    (deck_uuid, 'prendre - Passé Composé - nous', 'avons pris', '{"verb_id": "prendre", "tense": "passeCompose", "pronoun": "nous", "infinitive": "prendre", "english": "to take"}'::jsonb, 250),
    (deck_uuid, 'prendre - Passé Composé - vous', 'avez pris', '{"verb_id": "prendre", "tense": "passeCompose", "pronoun": "vous", "infinitive": "prendre", "english": "to take"}'::jsonb, 251),
    (deck_uuid, 'prendre - Passé Composé - ils', 'ont pris', '{"verb_id": "prendre", "tense": "passeCompose", "pronoun": "ils", "infinitive": "prendre", "english": "to take"}'::jsonb, 252);

  -- prendre - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'prendre - Imparfait - je', 'prenais', '{"verb_id": "prendre", "tense": "imparfait", "pronoun": "je", "infinitive": "prendre", "english": "to take"}'::jsonb, 253),
    (deck_uuid, 'prendre - Imparfait - tu', 'prenais', '{"verb_id": "prendre", "tense": "imparfait", "pronoun": "tu", "infinitive": "prendre", "english": "to take"}'::jsonb, 254),
    (deck_uuid, 'prendre - Imparfait - il', 'prenait', '{"verb_id": "prendre", "tense": "imparfait", "pronoun": "il", "infinitive": "prendre", "english": "to take"}'::jsonb, 255),
    (deck_uuid, 'prendre - Imparfait - nous', 'prenions', '{"verb_id": "prendre", "tense": "imparfait", "pronoun": "nous", "infinitive": "prendre", "english": "to take"}'::jsonb, 256),
    (deck_uuid, 'prendre - Imparfait - vous', 'preniez', '{"verb_id": "prendre", "tense": "imparfait", "pronoun": "vous", "infinitive": "prendre", "english": "to take"}'::jsonb, 257),
    (deck_uuid, 'prendre - Imparfait - ils', 'prenaient', '{"verb_id": "prendre", "tense": "imparfait", "pronoun": "ils", "infinitive": "prendre", "english": "to take"}'::jsonb, 258);

  -- prendre - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'prendre - Futur Simple - je', 'prendrai', '{"verb_id": "prendre", "tense": "futurSimple", "pronoun": "je", "infinitive": "prendre", "english": "to take"}'::jsonb, 259),
    (deck_uuid, 'prendre - Futur Simple - tu', 'prendras', '{"verb_id": "prendre", "tense": "futurSimple", "pronoun": "tu", "infinitive": "prendre", "english": "to take"}'::jsonb, 260),
    (deck_uuid, 'prendre - Futur Simple - il', 'prendra', '{"verb_id": "prendre", "tense": "futurSimple", "pronoun": "il", "infinitive": "prendre", "english": "to take"}'::jsonb, 261),
    (deck_uuid, 'prendre - Futur Simple - nous', 'prendrons', '{"verb_id": "prendre", "tense": "futurSimple", "pronoun": "nous", "infinitive": "prendre", "english": "to take"}'::jsonb, 262),
    (deck_uuid, 'prendre - Futur Simple - vous', 'prendrez', '{"verb_id": "prendre", "tense": "futurSimple", "pronoun": "vous", "infinitive": "prendre", "english": "to take"}'::jsonb, 263),
    (deck_uuid, 'prendre - Futur Simple - ils', 'prendront', '{"verb_id": "prendre", "tense": "futurSimple", "pronoun": "ils", "infinitive": "prendre", "english": "to take"}'::jsonb, 264);

  -- ============================================
  -- PART 13: INSERT CARDS - METTRE (TO PUT)
  -- ============================================

  -- mettre - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'mettre - Présent - je', 'mets', '{"verb_id": "mettre", "tense": "present", "pronoun": "je", "infinitive": "mettre", "english": "to put"}'::jsonb, 265),
    (deck_uuid, 'mettre - Présent - tu', 'mets', '{"verb_id": "mettre", "tense": "present", "pronoun": "tu", "infinitive": "mettre", "english": "to put"}'::jsonb, 266),
    (deck_uuid, 'mettre - Présent - il', 'met', '{"verb_id": "mettre", "tense": "present", "pronoun": "il", "infinitive": "mettre", "english": "to put"}'::jsonb, 267),
    (deck_uuid, 'mettre - Présent - nous', 'mettons', '{"verb_id": "mettre", "tense": "present", "pronoun": "nous", "infinitive": "mettre", "english": "to put"}'::jsonb, 268),
    (deck_uuid, 'mettre - Présent - vous', 'mettez', '{"verb_id": "mettre", "tense": "present", "pronoun": "vous", "infinitive": "mettre", "english": "to put"}'::jsonb, 269),
    (deck_uuid, 'mettre - Présent - ils', 'mettent', '{"verb_id": "mettre", "tense": "present", "pronoun": "ils", "infinitive": "mettre", "english": "to put"}'::jsonb, 270);

  -- mettre - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'mettre - Passé Composé - je', 'ai mis', '{"verb_id": "mettre", "tense": "passeCompose", "pronoun": "je", "infinitive": "mettre", "english": "to put"}'::jsonb, 271),
    (deck_uuid, 'mettre - Passé Composé - tu', 'as mis', '{"verb_id": "mettre", "tense": "passeCompose", "pronoun": "tu", "infinitive": "mettre", "english": "to put"}'::jsonb, 272),
    (deck_uuid, 'mettre - Passé Composé - il', 'a mis', '{"verb_id": "mettre", "tense": "passeCompose", "pronoun": "il", "infinitive": "mettre", "english": "to put"}'::jsonb, 273),
    (deck_uuid, 'mettre - Passé Composé - nous', 'avons mis', '{"verb_id": "mettre", "tense": "passeCompose", "pronoun": "nous", "infinitive": "mettre", "english": "to put"}'::jsonb, 274),
    (deck_uuid, 'mettre - Passé Composé - vous', 'avez mis', '{"verb_id": "mettre", "tense": "passeCompose", "pronoun": "vous", "infinitive": "mettre", "english": "to put"}'::jsonb, 275),
    (deck_uuid, 'mettre - Passé Composé - ils', 'ont mis', '{"verb_id": "mettre", "tense": "passeCompose", "pronoun": "ils", "infinitive": "mettre", "english": "to put"}'::jsonb, 276);

  -- mettre - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'mettre - Imparfait - je', 'mettais', '{"verb_id": "mettre", "tense": "imparfait", "pronoun": "je", "infinitive": "mettre", "english": "to put"}'::jsonb, 277),
    (deck_uuid, 'mettre - Imparfait - tu', 'mettais', '{"verb_id": "mettre", "tense": "imparfait", "pronoun": "tu", "infinitive": "mettre", "english": "to put"}'::jsonb, 278),
    (deck_uuid, 'mettre - Imparfait - il', 'mettait', '{"verb_id": "mettre", "tense": "imparfait", "pronoun": "il", "infinitive": "mettre", "english": "to put"}'::jsonb, 279),
    (deck_uuid, 'mettre - Imparfait - nous', 'mettions', '{"verb_id": "mettre", "tense": "imparfait", "pronoun": "nous", "infinitive": "mettre", "english": "to put"}'::jsonb, 280),
    (deck_uuid, 'mettre - Imparfait - vous', 'mettiez', '{"verb_id": "mettre", "tense": "imparfait", "pronoun": "vous", "infinitive": "mettre", "english": "to put"}'::jsonb, 281),
    (deck_uuid, 'mettre - Imparfait - ils', 'mettaient', '{"verb_id": "mettre", "tense": "imparfait", "pronoun": "ils", "infinitive": "mettre", "english": "to put"}'::jsonb, 282);

  -- mettre - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'mettre - Futur Simple - je', 'mettrai', '{"verb_id": "mettre", "tense": "futurSimple", "pronoun": "je", "infinitive": "mettre", "english": "to put"}'::jsonb, 283),
    (deck_uuid, 'mettre - Futur Simple - tu', 'mettras', '{"verb_id": "mettre", "tense": "futurSimple", "pronoun": "tu", "infinitive": "mettre", "english": "to put"}'::jsonb, 284),
    (deck_uuid, 'mettre - Futur Simple - il', 'mettra', '{"verb_id": "mettre", "tense": "futurSimple", "pronoun": "il", "infinitive": "mettre", "english": "to put"}'::jsonb, 285),
    (deck_uuid, 'mettre - Futur Simple - nous', 'mettrons', '{"verb_id": "mettre", "tense": "futurSimple", "pronoun": "nous", "infinitive": "mettre", "english": "to put"}'::jsonb, 286),
    (deck_uuid, 'mettre - Futur Simple - vous', 'mettrez', '{"verb_id": "mettre", "tense": "futurSimple", "pronoun": "vous", "infinitive": "mettre", "english": "to put"}'::jsonb, 287),
    (deck_uuid, 'mettre - Futur Simple - ils', 'mettront', '{"verb_id": "mettre", "tense": "futurSimple", "pronoun": "ils", "infinitive": "mettre", "english": "to put"}'::jsonb, 288);

  -- ============================================
  -- PART 14: INSERT CARDS - DIRE (TO SAY/TELL)
  -- ============================================

  -- dire - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'dire - Présent - je', 'dis', '{"verb_id": "dire", "tense": "present", "pronoun": "je", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 289),
    (deck_uuid, 'dire - Présent - tu', 'dis', '{"verb_id": "dire", "tense": "present", "pronoun": "tu", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 290),
    (deck_uuid, 'dire - Présent - il', 'dit', '{"verb_id": "dire", "tense": "present", "pronoun": "il", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 291),
    (deck_uuid, 'dire - Présent - nous', 'disons', '{"verb_id": "dire", "tense": "present", "pronoun": "nous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 292),
    (deck_uuid, 'dire - Présent - vous', 'dites', '{"verb_id": "dire", "tense": "present", "pronoun": "vous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 293),
    (deck_uuid, 'dire - Présent - ils', 'disent', '{"verb_id": "dire", "tense": "present", "pronoun": "ils", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 294);

  -- dire - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'dire - Passé Composé - je', 'ai dit', '{"verb_id": "dire", "tense": "passeCompose", "pronoun": "je", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 295),
    (deck_uuid, 'dire - Passé Composé - tu', 'as dit', '{"verb_id": "dire", "tense": "passeCompose", "pronoun": "tu", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 296),
    (deck_uuid, 'dire - Passé Composé - il', 'a dit', '{"verb_id": "dire", "tense": "passeCompose", "pronoun": "il", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 297),
    (deck_uuid, 'dire - Passé Composé - nous', 'avons dit', '{"verb_id": "dire", "tense": "passeCompose", "pronoun": "nous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 298),
    (deck_uuid, 'dire - Passé Composé - vous', 'avez dit', '{"verb_id": "dire", "tense": "passeCompose", "pronoun": "vous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 299),
    (deck_uuid, 'dire - Passé Composé - ils', 'ont dit', '{"verb_id": "dire", "tense": "passeCompose", "pronoun": "ils", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 300);

  -- dire - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'dire - Imparfait - je', 'disais', '{"verb_id": "dire", "tense": "imparfait", "pronoun": "je", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 301),
    (deck_uuid, 'dire - Imparfait - tu', 'disais', '{"verb_id": "dire", "tense": "imparfait", "pronoun": "tu", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 302),
    (deck_uuid, 'dire - Imparfait - il', 'disait', '{"verb_id": "dire", "tense": "imparfait", "pronoun": "il", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 303),
    (deck_uuid, 'dire - Imparfait - nous', 'disions', '{"verb_id": "dire", "tense": "imparfait", "pronoun": "nous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 304),
    (deck_uuid, 'dire - Imparfait - vous', 'disiez', '{"verb_id": "dire", "tense": "imparfait", "pronoun": "vous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 305),
    (deck_uuid, 'dire - Imparfait - ils', 'disaient', '{"verb_id": "dire", "tense": "imparfait", "pronoun": "ils", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 306);

  -- dire - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'dire - Futur Simple - je', 'dirai', '{"verb_id": "dire", "tense": "futurSimple", "pronoun": "je", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 307),
    (deck_uuid, 'dire - Futur Simple - tu', 'diras', '{"verb_id": "dire", "tense": "futurSimple", "pronoun": "tu", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 308),
    (deck_uuid, 'dire - Futur Simple - il', 'dira', '{"verb_id": "dire", "tense": "futurSimple", "pronoun": "il", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 309),
    (deck_uuid, 'dire - Futur Simple - nous', 'dirons', '{"verb_id": "dire", "tense": "futurSimple", "pronoun": "nous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 310),
    (deck_uuid, 'dire - Futur Simple - vous', 'direz', '{"verb_id": "dire", "tense": "futurSimple", "pronoun": "vous", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 311),
    (deck_uuid, 'dire - Futur Simple - ils', 'diront', '{"verb_id": "dire", "tense": "futurSimple", "pronoun": "ils", "infinitive": "dire", "english": "to say / to tell"}'::jsonb, 312);

  -- ============================================
  -- PART 15: INSERT CARDS - PARTIR (TO LEAVE)
  -- ============================================

  -- partir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'partir - Présent - je', 'pars', '{"verb_id": "partir", "tense": "present", "pronoun": "je", "infinitive": "partir", "english": "to leave"}'::jsonb, 313),
    (deck_uuid, 'partir - Présent - tu', 'pars', '{"verb_id": "partir", "tense": "present", "pronoun": "tu", "infinitive": "partir", "english": "to leave"}'::jsonb, 314),
    (deck_uuid, 'partir - Présent - il', 'part', '{"verb_id": "partir", "tense": "present", "pronoun": "il", "infinitive": "partir", "english": "to leave"}'::jsonb, 315),
    (deck_uuid, 'partir - Présent - nous', 'partons', '{"verb_id": "partir", "tense": "present", "pronoun": "nous", "infinitive": "partir", "english": "to leave"}'::jsonb, 316),
    (deck_uuid, 'partir - Présent - vous', 'partez', '{"verb_id": "partir", "tense": "present", "pronoun": "vous", "infinitive": "partir", "english": "to leave"}'::jsonb, 317),
    (deck_uuid, 'partir - Présent - ils', 'partent', '{"verb_id": "partir", "tense": "present", "pronoun": "ils", "infinitive": "partir", "english": "to leave"}'::jsonb, 318);

  -- partir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'partir - Passé Composé - je', 'suis parti', '{"verb_id": "partir", "tense": "passeCompose", "pronoun": "je", "infinitive": "partir", "english": "to leave"}'::jsonb, 319),
    (deck_uuid, 'partir - Passé Composé - tu', 'es parti', '{"verb_id": "partir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "partir", "english": "to leave"}'::jsonb, 320),
    (deck_uuid, 'partir - Passé Composé - il', 'est parti', '{"verb_id": "partir", "tense": "passeCompose", "pronoun": "il", "infinitive": "partir", "english": "to leave"}'::jsonb, 321),
    (deck_uuid, 'partir - Passé Composé - nous', 'sommes partis', '{"verb_id": "partir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "partir", "english": "to leave"}'::jsonb, 322),
    (deck_uuid, 'partir - Passé Composé - vous', 'êtes parti', '{"verb_id": "partir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "partir", "english": "to leave"}'::jsonb, 323),
    (deck_uuid, 'partir - Passé Composé - ils', 'sont partis', '{"verb_id": "partir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "partir", "english": "to leave"}'::jsonb, 324);

  -- partir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'partir - Imparfait - je', 'partais', '{"verb_id": "partir", "tense": "imparfait", "pronoun": "je", "infinitive": "partir", "english": "to leave"}'::jsonb, 325),
    (deck_uuid, 'partir - Imparfait - tu', 'partais', '{"verb_id": "partir", "tense": "imparfait", "pronoun": "tu", "infinitive": "partir", "english": "to leave"}'::jsonb, 326),
    (deck_uuid, 'partir - Imparfait - il', 'partait', '{"verb_id": "partir", "tense": "imparfait", "pronoun": "il", "infinitive": "partir", "english": "to leave"}'::jsonb, 327),
    (deck_uuid, 'partir - Imparfait - nous', 'partions', '{"verb_id": "partir", "tense": "imparfait", "pronoun": "nous", "infinitive": "partir", "english": "to leave"}'::jsonb, 328),
    (deck_uuid, 'partir - Imparfait - vous', 'partiez', '{"verb_id": "partir", "tense": "imparfait", "pronoun": "vous", "infinitive": "partir", "english": "to leave"}'::jsonb, 329),
    (deck_uuid, 'partir - Imparfait - ils', 'partaient', '{"verb_id": "partir", "tense": "imparfait", "pronoun": "ils", "infinitive": "partir", "english": "to leave"}'::jsonb, 330);

  -- partir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'partir - Futur Simple - je', 'partirai', '{"verb_id": "partir", "tense": "futurSimple", "pronoun": "je", "infinitive": "partir", "english": "to leave"}'::jsonb, 331),
    (deck_uuid, 'partir - Futur Simple - tu', 'partiras', '{"verb_id": "partir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "partir", "english": "to leave"}'::jsonb, 332),
    (deck_uuid, 'partir - Futur Simple - il', 'partira', '{"verb_id": "partir", "tense": "futurSimple", "pronoun": "il", "infinitive": "partir", "english": "to leave"}'::jsonb, 333),
    (deck_uuid, 'partir - Futur Simple - nous', 'partirons', '{"verb_id": "partir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "partir", "english": "to leave"}'::jsonb, 334),
    (deck_uuid, 'partir - Futur Simple - vous', 'partirez', '{"verb_id": "partir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "partir", "english": "to leave"}'::jsonb, 335),
    (deck_uuid, 'partir - Futur Simple - ils', 'partiront', '{"verb_id": "partir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "partir", "english": "to leave"}'::jsonb, 336);

  -- ============================================
  -- PART 16: INSERT CARDS - SORTIR (TO GO OUT)
  -- ============================================

  -- sortir - Présent (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'sortir - Présent - je', 'sors', '{"verb_id": "sortir", "tense": "present", "pronoun": "je", "infinitive": "sortir", "english": "to go out"}'::jsonb, 337),
    (deck_uuid, 'sortir - Présent - tu', 'sors', '{"verb_id": "sortir", "tense": "present", "pronoun": "tu", "infinitive": "sortir", "english": "to go out"}'::jsonb, 338),
    (deck_uuid, 'sortir - Présent - il', 'sort', '{"verb_id": "sortir", "tense": "present", "pronoun": "il", "infinitive": "sortir", "english": "to go out"}'::jsonb, 339),
    (deck_uuid, 'sortir - Présent - nous', 'sortons', '{"verb_id": "sortir", "tense": "present", "pronoun": "nous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 340),
    (deck_uuid, 'sortir - Présent - vous', 'sortez', '{"verb_id": "sortir", "tense": "present", "pronoun": "vous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 341),
    (deck_uuid, 'sortir - Présent - ils', 'sortent', '{"verb_id": "sortir", "tense": "present", "pronoun": "ils", "infinitive": "sortir", "english": "to go out"}'::jsonb, 342);

  -- sortir - Passé Composé (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'sortir - Passé Composé - je', 'suis sorti', '{"verb_id": "sortir", "tense": "passeCompose", "pronoun": "je", "infinitive": "sortir", "english": "to go out"}'::jsonb, 343),
    (deck_uuid, 'sortir - Passé Composé - tu', 'es sorti', '{"verb_id": "sortir", "tense": "passeCompose", "pronoun": "tu", "infinitive": "sortir", "english": "to go out"}'::jsonb, 344),
    (deck_uuid, 'sortir - Passé Composé - il', 'est sorti', '{"verb_id": "sortir", "tense": "passeCompose", "pronoun": "il", "infinitive": "sortir", "english": "to go out"}'::jsonb, 345),
    (deck_uuid, 'sortir - Passé Composé - nous', 'sommes sortis', '{"verb_id": "sortir", "tense": "passeCompose", "pronoun": "nous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 346),
    (deck_uuid, 'sortir - Passé Composé - vous', 'êtes sorti', '{"verb_id": "sortir", "tense": "passeCompose", "pronoun": "vous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 347),
    (deck_uuid, 'sortir - Passé Composé - ils', 'sont sortis', '{"verb_id": "sortir", "tense": "passeCompose", "pronoun": "ils", "infinitive": "sortir", "english": "to go out"}'::jsonb, 348);

  -- sortir - Imparfait (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'sortir - Imparfait - je', 'sortais', '{"verb_id": "sortir", "tense": "imparfait", "pronoun": "je", "infinitive": "sortir", "english": "to go out"}'::jsonb, 349),
    (deck_uuid, 'sortir - Imparfait - tu', 'sortais', '{"verb_id": "sortir", "tense": "imparfait", "pronoun": "tu", "infinitive": "sortir", "english": "to go out"}'::jsonb, 350),
    (deck_uuid, 'sortir - Imparfait - il', 'sortait', '{"verb_id": "sortir", "tense": "imparfait", "pronoun": "il", "infinitive": "sortir", "english": "to go out"}'::jsonb, 351),
    (deck_uuid, 'sortir - Imparfait - nous', 'sortions', '{"verb_id": "sortir", "tense": "imparfait", "pronoun": "nous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 352),
    (deck_uuid, 'sortir - Imparfait - vous', 'sortiez', '{"verb_id": "sortir", "tense": "imparfait", "pronoun": "vous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 353),
    (deck_uuid, 'sortir - Imparfait - ils', 'sortaient', '{"verb_id": "sortir", "tense": "imparfait", "pronoun": "ils", "infinitive": "sortir", "english": "to go out"}'::jsonb, 354);

  -- sortir - Futur Simple (6 cards)
  INSERT INTO cards (deck_id, front, back, data, order_index) VALUES
    (deck_uuid, 'sortir - Futur Simple - je', 'sortirai', '{"verb_id": "sortir", "tense": "futurSimple", "pronoun": "je", "infinitive": "sortir", "english": "to go out"}'::jsonb, 355),
    (deck_uuid, 'sortir - Futur Simple - tu', 'sortiras', '{"verb_id": "sortir", "tense": "futurSimple", "pronoun": "tu", "infinitive": "sortir", "english": "to go out"}'::jsonb, 356),
    (deck_uuid, 'sortir - Futur Simple - il', 'sortira', '{"verb_id": "sortir", "tense": "futurSimple", "pronoun": "il", "infinitive": "sortir", "english": "to go out"}'::jsonb, 357),
    (deck_uuid, 'sortir - Futur Simple - nous', 'sortirons', '{"verb_id": "sortir", "tense": "futurSimple", "pronoun": "nous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 358),
    (deck_uuid, 'sortir - Futur Simple - vous', 'sortirez', '{"verb_id": "sortir", "tense": "futurSimple", "pronoun": "vous", "infinitive": "sortir", "english": "to go out"}'::jsonb, 359),
    (deck_uuid, 'sortir - Futur Simple - ils', 'sortiront', '{"verb_id": "sortir", "tense": "futurSimple", "pronoun": "ils", "infinitive": "sortir", "english": "to go out"}'::jsonb, 360);

  -- ============================================
  -- SUCCESS MESSAGE
  -- ============================================

  RAISE NOTICE '✅ French Verbs deck seeded successfully!';
  RAISE NOTICE '   - Deck: Essential French Irregular Verbs';
  RAISE NOTICE '   - Deck ID: %', deck_uuid;
  RAISE NOTICE '   - Total cards: 360';
  RAISE NOTICE '   - Verbs: être, avoir, aller, faire, pouvoir, venir, voir, savoir, vouloir, devoir, prendre, mettre, dire, partir, sortir';
  RAISE NOTICE '   - Tenses: Présent, Passé Composé, Imparfait, Futur Simple';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Database setup complete! You can now use the application.';
END $$;
