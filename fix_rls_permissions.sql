-- ===========================================
-- FIX RLS PERMISSIONS - Enable Authenticated User Writes
-- ===========================================
-- This script ensures authenticated users can create and manage their own content
-- Run this AFTER schema_reset.sql if deck creation is failing

-- ============================================
-- STEP 1: DROP EXISTING POLICIES (Clean Slate)
-- ============================================

-- Drop all existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view public decks" ON decks;
DROP POLICY IF EXISTS "Authenticated users can view their own decks" ON decks;
DROP POLICY IF EXISTS "Authenticated users can create decks" ON decks;
DROP POLICY IF EXISTS "Users can update own decks" ON decks;
DROP POLICY IF EXISTS "Users can delete own decks" ON decks;

DROP POLICY IF EXISTS "Anyone can view cards from public decks" ON cards;
DROP POLICY IF EXISTS "Users can view cards from their own decks" ON cards;
DROP POLICY IF EXISTS "Users can create cards in their own decks" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their own decks" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in their own decks" ON cards;

-- ============================================
-- STEP 2: CREATE DECKS RLS POLICIES
-- ============================================

-- SELECT: Anyone can view public decks (unauthenticated + authenticated)
CREATE POLICY "Anyone can view public decks"
  ON decks FOR SELECT
  USING (is_public = true);

-- SELECT: Authenticated users can view their own decks (including private)
CREATE POLICY "Authenticated users can view their own decks"
  ON decks FOR SELECT
  USING (auth.uid() = created_by);

-- INSERT: Authenticated users can create new decks
-- CRITICAL: The created_by field MUST match the user's auth.uid()
CREATE POLICY "Authenticated users can create decks"
  ON decks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- UPDATE: Users can only update their own decks
CREATE POLICY "Users can update own decks"
  ON decks FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- DELETE: Users can only delete their own decks
CREATE POLICY "Users can delete own decks"
  ON decks FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================
-- STEP 3: CREATE CARDS RLS POLICIES
-- ============================================

-- SELECT: Anyone can view cards from public decks
CREATE POLICY "Anyone can view cards from public decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.is_public = true
    )
  );

-- SELECT: Users can view cards from their own decks
CREATE POLICY "Users can view cards from their own decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

-- INSERT: Users can create cards in their own decks
-- CRITICAL: User must own the parent deck
CREATE POLICY "Users can create cards in their own decks"
  ON cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

-- UPDATE: Users can update cards in their own decks
CREATE POLICY "Users can update cards in their own decks"
  ON cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

-- DELETE: Users can delete cards in their own decks
CREATE POLICY "Users can delete cards in their own decks"
  ON cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
  );

-- ============================================
-- STEP 4: VERIFY RLS IS ENABLED
-- ============================================

-- Ensure RLS is enabled on both tables
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUCCESS MESSAGE & VERIFICATION
-- ============================================

DO $$
DECLARE
  deck_policies INTEGER;
  card_policies INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO deck_policies
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'decks';

  SELECT COUNT(*) INTO card_policies
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'cards';

  RAISE NOTICE '✅ RLS Permissions Fixed!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Policy Summary:';
  RAISE NOTICE '   - Decks: % policies active', deck_policies;
  RAISE NOTICE '   - Cards: % policies active', card_policies;
  RAISE NOTICE '';
  RAISE NOTICE '✨ Authenticated users can now:';
  RAISE NOTICE '   ✓ Create new decks (INSERT)';
  RAISE NOTICE '   ✓ Update their own decks (UPDATE)';
  RAISE NOTICE '   ✓ Delete their own decks (DELETE)';
  RAISE NOTICE '   ✓ Create cards in their decks (INSERT)';
  RAISE NOTICE '   ✓ Update cards in their decks (UPDATE)';
  RAISE NOTICE '   ✓ Delete cards in their decks (DELETE)';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Unauthenticated users can:';
  RAISE NOTICE '   ✓ View public decks (SELECT)';
  RAISE NOTICE '   ✓ View cards from public decks (SELECT)';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Try creating a deck now - it should work!';
END $$;
