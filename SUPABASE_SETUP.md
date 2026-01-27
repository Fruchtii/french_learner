# Vokab - Supabase Setup Guide

This guide will walk you through setting up Supabase for the Vokab multi-deck learning platform.

## Step 1: Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Where to find these values:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ `profiles` table (linked to Supabase auth)
- ✅ `decks` table (for organizing cards)
- ✅ `cards` table (with flexible JSONB data field)
- ✅ `study_progress` table (Leitner box progress tracking)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers for `updated_at` timestamps
- ✅ Auto-profile creation on user signup

## Step 3: Enable Authentication Providers

### Enable Google OAuth:

1. Go to **Authentication** → **Providers** in Supabase
2. Find **Google** and click **Enable**
3. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret** to Supabase
4. Click **Save**

### Enable GitHub OAuth:

1. Go to **Authentication** → **Providers** in Supabase
2. Find **GitHub** and click **Enable**
3. You'll need to create a GitHub OAuth app:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **New OAuth App**
   - Set Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret** to Supabase
4. Click **Save**

## Step 4: Create Sample Data (Optional)

After you sign up for the first time, you can create a sample deck:

1. Find your user ID:
   ```sql
   SELECT id FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. Copy your user ID and run this SQL (replace `YOUR_USER_ID`):

```sql
-- Insert sample French Verbs deck
INSERT INTO decks (id, title, description, created_by, is_public)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'French Irregular Verbs',
  'Master the 100 most common French irregular verbs across 4 essential tenses.',
  'YOUR_USER_ID', -- Replace with your actual user ID
  true
);

-- Sample card 1: être (simple)
INSERT INTO cards (deck_id, front, back, data, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'être - Présent - je',
  'suis',
  '{"verb_id": "etre", "tense": "present", "pronoun": "je", "infinitive": "être", "english": "to be"}'::jsonb,
  1
);

-- Sample card 2: avoir (complex)
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
    "english": "to have"
  }'::jsonb,
  2
);

-- Sample card 3: faire
INSERT INTO cards (deck_id, front, back, data, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'faire - Présent - ils',
  'font',
  '{"verb_id": "faire", "tense": "present", "pronoun": "ils", "infinitive": "faire", "english": "to do/make"}'::jsonb,
  3
);
```

## Step 5: Start the App

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and:
1. Click **Sign In** in the header
2. Choose Google or GitHub to authenticate
3. You'll be redirected to the Dashboard
4. You should see your sample deck (if you created it)

## Architecture Overview

### Database Structure

```
auth.users (Supabase managed)
    ↓
profiles (your app)
    ↓
decks (created by users)
    ↓
cards (belong to decks, with JSONB data field)
    ↓
study_progress (tracks user progress per card)
```

### JSONB Data Field

The `cards.data` field is a flexible JSONB column that allows you to store:

**Simple flashcards:**
```json
{
  "category": "vocabulary",
  "difficulty": "easy"
}
```

**Complex verb conjugations:**
```json
{
  "verb_id": "avoir",
  "tense": "present",
  "pronoun": "je",
  "infinitive": "avoir",
  "english": "to have",
  "conjugation_table": {
    "present": {"je": "ai", "tu": "as", ...},
    "passeCompose": {"je": "ai eu", "tu": "as eu", ...}
  }
}
```

This flexibility means you can add new card types without changing the schema!

### Study Progress (Leitner System)

Cards progress through boxes 0-3:
- **Box 0**: Due immediately (new or incorrect)
- **Box 1**: Review in 1 minute
- **Box 2**: Review in 10 minutes
- **Box 3**: Review in 1 day (mastered)

## Troubleshooting

### "No decks yet" on Dashboard
- Make sure you're signed in
- Check that you created sample data with your correct user ID
- Verify RLS policies are enabled (run the schema again if needed)

### Authentication not working
- Double-check your `.env.local` has the correct Supabase credentials
- Verify OAuth providers are enabled in Supabase
- Check that redirect URLs match your Supabase project URL

### Can't see other users' public decks
- This is expected! RLS policies only show:
  - Your own decks (public or private)
  - Other users' public decks
- To test, create a public deck and sign in with a different account

## Next Steps

Now that your authentication and database are working, you can:

1. **Build the Deck Creator UI** - Allow users to create and edit decks
2. **Migrate Legacy Verbs** - Convert your existing verb data to the new deck/card structure
3. **Add Deck Sharing** - Let users share decks with a public link
4. **Implement Search** - Add deck discovery and search functionality
5. **Add Card Import/Export** - Allow bulk card creation from CSV/JSON

## Helpful SQL Queries

**View all decks with card counts:**
```sql
SELECT d.*, COUNT(c.id) as card_count
FROM decks d
LEFT JOIN cards c ON c.deck_id = d.id
GROUP BY d.id
ORDER BY d.created_at DESC;
```

**View user progress:**
```sql
SELECT sp.*, c.front, c.back
FROM study_progress sp
JOIN cards c ON c.id = sp.card_id
WHERE sp.user_id = 'YOUR_USER_ID'
ORDER BY sp.next_review;
```

**Find cards due for review:**
```sql
SELECT c.*, sp.box, sp.next_review
FROM cards c
JOIN study_progress sp ON sp.card_id = c.id
WHERE sp.user_id = 'YOUR_USER_ID'
  AND sp.next_review <= NOW()
ORDER BY sp.box, sp.next_review;
```

---

**Questions or issues?** Check the Supabase docs at [supabase.com/docs](https://supabase.com/docs)
