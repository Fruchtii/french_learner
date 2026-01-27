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
  -- SUCCESS MESSAGE
  -- ============================================

  RAISE NOTICE '✅ French Verbs deck seeded successfully!';
  RAISE NOTICE '   - Deck: Essential French Irregular Verbs';
  RAISE NOTICE '   - Deck ID: %', deck_uuid;
  RAISE NOTICE '   - Total cards: 120';
  RAISE NOTICE '   - Verbs: être, avoir, aller, faire, pouvoir';
  RAISE NOTICE '   - Tenses: Présent, Passé Composé, Imparfait, Futur Simple';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Database setup complete! You can now use the application.';
END $$;
