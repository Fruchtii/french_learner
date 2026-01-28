-- ===========================================
-- SYNC PROFILES & FIX PUBLIC ACCESS
-- ===========================================
-- This script fixes Foreign Key Violation errors (23503) by:
-- 1. Backfilling existing users into the profiles table
-- 2. Ensuring the auto-sync trigger works
-- 3. Fixing RLS policies for public profile viewing

-- ============================================
-- STEP 1: BACKFILL EXISTING USERS
-- ============================================

-- Insert all users from auth.users into public.profiles
-- This fixes the immediate problem for existing users
INSERT INTO public.profiles (id, email, display_name, avatar_url, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name', email),
  raw_user_meta_data->>'avatar_url',
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
  updated_at = NOW();

-- ============================================
-- STEP 2: VERIFY/CREATE AUTO-SYNC TRIGGER
-- ============================================

-- Drop existing trigger if it exists (to recreate cleanly)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function to auto-create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to run on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 3: FIX PROFILES RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone (authenticated + unauthenticated) can view all profiles
-- This is needed to show author names on public decks
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- UPDATE: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: Users can only insert their own profile
-- Note: This is usually handled by the trigger, but this policy allows manual inserts
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 4: VERIFY FOREIGN KEY CONSTRAINTS
-- ============================================

-- Verify that the decks.created_by foreign key exists
DO $$
DECLARE
  fk_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'decks'
      AND constraint_name LIKE '%created_by%'
  ) INTO fk_exists;

  IF fk_exists THEN
    RAISE NOTICE '✅ Foreign key constraint on decks.created_by exists';
  ELSE
    RAISE WARNING '⚠️  Foreign key constraint on decks.created_by is missing';
    RAISE NOTICE '   Run: ALTER TABLE decks ADD CONSTRAINT decks_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;';
  END IF;
END $$;

-- ============================================
-- STEP 5: SUCCESS MESSAGE & VERIFICATION
-- ============================================

DO $$
DECLARE
  profile_count INTEGER;
  auth_user_count INTEGER;
  policy_count INTEGER;
  trigger_exists BOOLEAN;
BEGIN
  -- Count profiles
  SELECT COUNT(*) INTO profile_count FROM public.profiles;

  -- Count auth users
  SELECT COUNT(*) INTO auth_user_count FROM auth.users;

  -- Count RLS policies on profiles
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'profiles';

  -- Check if trigger exists
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) INTO trigger_exists;

  RAISE NOTICE '';
  RAISE NOTICE '✅ PROFILES SYNC COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - Profiles in database: %', profile_count;
  RAISE NOTICE '   - Auth users: %', auth_user_count;
  RAISE NOTICE '   - RLS policies on profiles: %', policy_count;
  RAISE NOTICE '   - Auto-sync trigger active: %', CASE WHEN trigger_exists THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE '';

  IF profile_count = auth_user_count THEN
    RAISE NOTICE '✨ All users are synced!';
  ELSE
    RAISE WARNING '⚠️  User count mismatch - some profiles may be missing';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Try creating a deck again - error 23503 should be fixed';
  RAISE NOTICE '   2. If you still get errors, sign out and sign back in';
  RAISE NOTICE '   3. New signups will automatically create profiles';
END $$;

-- ============================================
-- OPTIONAL: LIST CURRENT PROFILES
-- ============================================

-- Uncomment to see all synced profiles:
-- SELECT id, email, display_name, created_at FROM public.profiles ORDER BY created_at DESC;
