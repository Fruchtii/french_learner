# Database Setup & Repair Instructions

This guide will fix your database issues and restore the French Verbs content.

## Step 1: Run the Database Repair Script

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com/
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Repair Script**
   - Open the file `database-repair.sql` in this project
   - Copy the **entire contents** of the file
   - Paste into the Supabase SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see a success message: "✅ Database setup complete!"
   - Check the Tables section - you should see: `profiles`, `decks`, `cards`, `study_progress`

## What This Script Does

### 1. Drops & Recreates Tables
- **Clean slate approach** - removes old problematic tables
- Creates proper table structure with correct data types
- Adds all necessary indexes for performance

### 2. Sets Up Permissive RLS Policies

**Critical for your use case:**
- ✅ **Anyone (even not logged in) can VIEW public decks**
- ✅ **Anyone can VIEW cards from public decks**
- ✅ **Authenticated users can create/edit/delete their own content**

This fixes the 404 and permission errors you were getting!

### 3. Migrates French Verbs

Creates a public deck with 120 flashcards:
- **Deck ID:** `00000000-0000-0000-0000-000000000001`
- **Title:** "Essential French Irregular Verbs"
- **5 verbs:** être, avoir, aller, faire, pouvoir
- **24 cards per verb** (4 tenses × 6 pronouns)
- **Data structure:** Includes verb metadata in JSONB format

## Step 2: Verify the Database

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check deck was created
SELECT * FROM decks WHERE id = '00000000-0000-0000-0000-000000000001';

-- Count cards (should be 120)
SELECT COUNT(*) FROM cards WHERE deck_id = '00000000-0000-0000-0000-000000000001';

-- View first 10 cards
SELECT front, back, data->>'infinitive' as verb
FROM cards
WHERE deck_id = '00000000-0000-0000-0000-000000000001'
ORDER BY order_index
LIMIT 10;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

## Step 3: Test the Application

### Test Public Deck Access (No Login Required)

1. **Dashboard** - `/dashboard`
   - You should see "Essential French Irregular Verbs" deck
   - No login required to view public decks

2. **Learn Page** - `/learn/00000000-0000-0000-0000-000000000001`
   - Should load the French verbs deck
   - Study session should work immediately

### Test Deck Creation (Login Required)

1. **Sign In**
   - Use the "Sign In" button (Google or GitHub)

2. **Create New Deck** - `/dashboard/create`
   - Enter title and cards
   - Click "Save Deck"
   - Should redirect to dashboard with your new deck

## Common Issues & Solutions

### Issue: 404 when fetching decks
**Solution:** The tables didn't exist or RLS blocked access. The repair script fixes this by:
- Creating tables with proper structure
- Adding policies that allow public access to public decks

### Issue: Permission Denied (42501) when saving
**Solution:** RLS was blocking INSERT operations. The repair script adds policies that allow:
- Authenticated users to create their own decks
- Users to insert cards into their own decks

### Issue: Deck saves but cards don't appear
**Likely cause:** RLS policy blocking card reads
**Solution:** The repair script allows anyone to SELECT cards from public decks

### Issue: Can't see my own decks after creating them
**Likely cause:** `created_by` not matching `auth.uid()`
**Solution:** The updated `handleSave` function uses `getUser()` to ensure proper user ID

## Data Structure Reference

### Cards JSONB Data Field

Each card's `data` field contains:

```json
{
  "verb_id": "faire",
  "tense": "present",
  "pronoun": "nous",
  "infinitive": "faire",
  "english": "to do / to make"
}
```

This flexible structure allows:
- Simple flashcards: `{"type": "flashcard"}`
- Complex verb data: Full conjugation tables
- Future card types: Add any JSON data you need

## Next Steps

After running the repair script:

1. ✅ Public French Verbs deck is available to everyone
2. ✅ Dashboard loads and displays decks
3. ✅ Users can create and save their own decks
4. ✅ All RLS permission errors are fixed

You can now:
- Test the application without login
- Sign in and create custom decks
- Share public decks with others
- Build additional features on this solid foundation

## Troubleshooting

**If you still get errors after running the script:**

1. Check Supabase logs (Dashboard → Logs → Postgres)
2. Verify environment variables are set correctly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Clear browser cache and hard refresh (Cmd/Ctrl + Shift + R)
4. Check browser console for specific error messages
5. Review the improved error handling in DeckEditor component

**Need to start fresh?**

The repair script is **idempotent** - you can run it multiple times safely. It drops and recreates everything.

---

**Questions?** The SQL script includes detailed comments explaining each section. Check console logs for debugging information.
