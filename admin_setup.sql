-- ===========================================
-- ADMIN ROLE SETUP & SUPER PERMISSIONS
-- ===========================================
-- This script establishes an admin role system with bypass permissions
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: ADD is_admin COLUMN TO PROFILES
-- ============================================

-- Add is_admin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;
    RAISE NOTICE '✅ Added is_admin column to profiles table';
  ELSE
    RAISE NOTICE '⚠️  is_admin column already exists';
  END IF;
END $$;

-- ============================================
-- STEP 2: SET SPECIFIC USER AS ADMIN
-- ============================================

-- Set your user as admin
UPDATE profiles
SET is_admin = true
WHERE id = 'e4c54bea-337d-4031-a114-782cccf8e729';

-- Verify admin was set
DO $$
DECLARE
  admin_count INTEGER;
  admin_email TEXT;
BEGIN
  SELECT COUNT(*), MAX(email) INTO admin_count, admin_email
  FROM profiles
  WHERE is_admin = true;

  IF admin_count > 0 THEN
    RAISE NOTICE '✅ Admin user set successfully';
    RAISE NOTICE '   Admin email: %', admin_email;
    RAISE NOTICE '   Total admins: %', admin_count;
  ELSE
    RAISE WARNING '⚠️  No admin users found - check if user ID exists in profiles table';
  END IF;
END $$;

-- ============================================
-- STEP 3: UPDATE DECKS RLS POLICIES (SUPER ADMIN)
-- ============================================

-- Drop existing policies to recreate with admin bypass
DROP POLICY IF EXISTS "Anyone can view public decks" ON decks;
DROP POLICY IF EXISTS "Authenticated users can view their own decks" ON decks;
DROP POLICY IF EXISTS "Authenticated users can create decks" ON decks;
DROP POLICY IF EXISTS "Users can update own decks" ON decks;
DROP POLICY IF EXISTS "Users can delete own decks" ON decks;

-- SELECT: Anyone can view public decks
CREATE POLICY "Anyone can view public decks"
  ON decks FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- SELECT: Admins can view all decks
CREATE POLICY "Admins can view all decks"
  ON decks FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- INSERT: Authenticated users can create decks
CREATE POLICY "Authenticated users can create decks"
  ON decks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- UPDATE: Users can update their own decks, admins can update any deck
CREATE POLICY "Users can update own decks or admins can update any"
  ON decks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- DELETE: Users can delete their own decks, admins can delete any deck
CREATE POLICY "Users can delete own decks or admins can delete any"
  ON decks FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- STEP 4: UPDATE CARDS RLS POLICIES (SUPER ADMIN)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view cards from public decks" ON cards;
DROP POLICY IF EXISTS "Users can view cards from their own decks" ON cards;
DROP POLICY IF EXISTS "Users can create cards in their own decks" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their own decks" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in their own decks" ON cards;

-- SELECT: Anyone can view cards from public decks
CREATE POLICY "Anyone can view cards from public decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.is_public = true
    )
    OR EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- INSERT: Users can create cards in their own decks, admins can create in any deck
CREATE POLICY "Users can create cards in own decks or admins in any"
  ON cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- UPDATE: Users can update cards in their own decks, admins can update any cards
CREATE POLICY "Users can update cards in own decks or admins in any"
  ON cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- DELETE: Users can delete cards in their own decks, admins can delete any cards
CREATE POLICY "Users can delete cards in own decks or admins in any"
  ON cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
        AND decks.created_by = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================
-- STEP 5: CREATE ADMIN HELPER FUNCTION
-- ============================================

-- Function to check if current user is admin (useful for app logic)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE & VERIFICATION
-- ============================================

DO $$
DECLARE
  deck_policies INTEGER;
  card_policies INTEGER;
  admin_count INTEGER;
  has_admin_column BOOLEAN;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO deck_policies
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'decks';

  SELECT COUNT(*) INTO card_policies
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'cards';

  -- Count admins
  SELECT COUNT(*) INTO admin_count
  FROM profiles
  WHERE is_admin = true;

  -- Check column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_admin'
  ) INTO has_admin_column;

  RAISE NOTICE '';
  RAISE NOTICE '✅ ADMIN SETUP COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - is_admin column exists: %', has_admin_column;
  RAISE NOTICE '   - Total admin users: %', admin_count;
  RAISE NOTICE '   - Deck policies: %', deck_policies;
  RAISE NOTICE '   - Card policies: %', card_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Admin Capabilities:';
  RAISE NOTICE '   ✓ View all decks (public + private)';
  RAISE NOTICE '   ✓ Create decks on behalf of any user';
  RAISE NOTICE '   ✓ Update any deck (change title, description, public status)';
  RAISE NOTICE '   ✓ Delete any deck';
  RAISE NOTICE '   ✓ Full access to all cards in all decks';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Regular Users:';
  RAISE NOTICE '   ✓ View public decks';
  RAISE NOTICE '   ✓ Create/update/delete their own decks';
  RAISE NOTICE '   ✓ Manage cards in their own decks';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to use! Access /admin dashboard with admin account.';
END $$;

-- Show current admins
SELECT id, email, display_name, is_admin, created_at
FROM profiles
WHERE is_admin = true
ORDER BY created_at DESC;
