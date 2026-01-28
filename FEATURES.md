# French Learner App - Features Documentation

## Overview
A flashcard application for learning French verb conjugations with three interactive study modes and a spaced repetition system.

---

## Study Modes

### 1. Typing Mode
**Component:** `src/components/TypingCard.tsx`

**Features:**
- Type in the correct conjugation for a given verb, tense, and pronoun
- Accent character helper buttons (é, è, ê, à, â, ù, û, ç, ô, î, ï, œ)
- Smart answer validation (pronouns are optional - see below)
- Visual feedback: green for correct, red for incorrect with shake animation
- "I was right" override button for incorrect answers
- Box level display (spaced repetition)

**Keyboard Shortcuts:**
- `Enter` - Check answer (when typing) or go to next card (after answer)
- `Space` - Go to next card (after answer is shown)

**UI Colors:**
- Answer text: `text-slate-900` (dark for visibility)
- Answer font size: `text-base`
- Correct state: green background (`bg-green-50`)
- Incorrect state: red background (`bg-red-50`)
- Border color when correct: `border-green-500`
- Border color when incorrect: `border-red-500`

---

### 2. Flashcard Mode
**Component:** `src/components/FlashCard.tsx`

**Features:**
- Traditional flashcard experience with flip reveal
- Question side shows verb, English translation, and target pronoun
- Answer side shows the correct conjugation in large text
- Self-grading: user decides if they knew it or forgot
- Box level display (spaced repetition)

**Keyboard Shortcuts:**
- `Space` - Reveal answer (when hidden) or go to next card (after grading)
- `Enter` - Go to next card (after grading)
- `1` or `←` (Left Arrow) - Mark as "I forgot" (incorrect)
- `2` or `→` (Right Arrow) - Mark as "I knew it" (correct)

**UI Colors:**
- Card gradient: teal to cyan (`from-teal-500 to-cyan-500`)
- Answer background: gradient (`from-teal-500 to-cyan-500`)
- Answer text: white, `text-3xl`

---

### 3. ProDeck Mode
**Component:** `src/components/ProDeck.tsx`

**Features:**
- Progressive reveal of ALL conjugations for a verb
- Reveals one complete tense at a time with all 6 pronouns:
  1. **Présent** (blue gradient) - all 6 conjugations
  2. **Passé Composé** (green gradient) - all 6 conjugations
  3. **Imparfait** (amber gradient) - all 6 conjugations
  4. **Futur Simple** (rose gradient) - all 6 conjugations
- Each tense shown in a colored card with 2x3 grid of conjugations
- Progress dots indicator (4 dots showing which tenses are revealed)
- Self-grading after all tenses revealed

**Keyboard Shortcuts:**
- `Space` - Reveal next tense (during reveal) or go to next verb (after grading)
- `Enter` - Go to next verb (after grading)
- `1` or `←` (Left Arrow) - Mark as "I struggled" (incorrect)
- `2` or `→` (Right Arrow) - Mark as "I knew it all" (correct)

**UI Colors:**
- Présent: `from-blue-50 to-blue-100`, border `border-blue-200`
- Passé Composé: `from-green-50 to-green-100`, border `border-green-200`
- Imparfait: `from-amber-50 to-amber-100`, border `border-amber-200`
- Futur Simple: `from-rose-50 to-rose-100`, border `border-rose-200`

---

## Answer Validation

**File:** `src/lib/validation.ts`

### Smart Pronoun Handling
The app accepts answers **with or without pronouns**. Both formats are correct:

**Examples:**
- User types: `suis` ✅
- User types: `je suis` ✅
- User types: `allons` ✅
- User types: `nous allons` ✅

The validation automatically strips pronouns from the beginning of the answer:
- `je`, `j'`, `tu`, `il`, `elle`, `on`, `nous`, `vous`, `ils`, `elles`

This makes typing faster and more flexible for learners.

---

## Spaced Repetition System

**File:** `src/store/useStudyStore.ts`

### Box System (Leitner Method)
- **Box 0**: New cards or forgotten cards (show frequently)
- **Box 1**: Getting there (show moderately)
- **Box 2**: Almost mastered (show less)
- **Box 3**: Mastered (show rarely)

### Progression Rules:
- ✅ **Correct answer**: Move up one box (max Box 3)
- ❌ **Incorrect answer**: Reset to Box 0

### Card Selection Algorithm:
Prioritizes cards that need more practice:
- 60% from Box 0 (new/forgotten)
- 25% from Box 1
- 10% from Box 2
- 5% from Box 3

---

## Verb Data

**File:** `src/data/verbs.ts`

### Current Verbs (5 total):
1. **être** - to be
2. **avoir** - to have
3. **aller** - to go
4. **faire** - to do/make
5. **pouvoir** - to be able to/can

### Tenses Covered (4 total):
1. **Présent**
2. **Passé Composé** (with auxiliary verbs avoir/être)
3. **Imparfait**
4. **Futur Simple**

### Total Cards: 120
- 5 verbs × 4 tenses × 6 pronouns = 120 unique conjugation cards

---

## Dashboard Integration

**File:** `src/app/dashboard/page.tsx`

### Verb Conjugation Practice Card
A featured card prominently displayed on the dashboard:

**Visual Design:**
- Gradient background: `from-purple-600 to-indigo-600`
- Border: `border-2 border-purple-400`
- Sparkles icon in white backdrop
- Hover effect: scales to 102%, enhanced shadow
- Animated progress bar on hover

**Content:**
- Title: "French Verb Conjugation Practice"
- Description: "Master French irregular verbs with 3 study modes"
- Stats: "5 verbs • 4 tenses • 120 cards"
- Links to: `/learn` page

**Location:** Appears above user's custom decks in the dashboard

---

## Session Statistics

**Component:** `src/components/StudySession.tsx`

### Real-time Stats Display:
- ⚡ **Cards Reviewed** (yellow icon)
- ✓ **Correct** count (green)
- ✗ **Incorrect** count (red)

### Progress Overview:
- 🕒 **Due** - cards due for review
- 📚 **Learning** - cards in boxes 0-1
- 🏆 **Mastered** - cards in boxes 2-3

---

## Global Keyboard Shortcuts

**File:** `src/components/StudySession.tsx`

The app features global keyboard handling that works across all study modes:

### Universal Shortcuts:
- `Space` - Primary action (reveal, next card, etc.)
- `Enter` - Alternative next card action
- `1` or `←` (Left Arrow) - Grade as incorrect/forgot
- `2` or `→` (Right Arrow) - Grade as correct/knew it

### Smart Context Detection:
- Keyboard shortcuts are **disabled** when user is typing in an input field
- Prevents accidental navigation while entering answers
- Shortcuts activate only when appropriate for current card state

---

## Component Architecture

### Main Components:
- **StudySession.tsx** - Main session controller with mode switcher
- **TypingCard.tsx** - Typing practice mode
- **FlashCard.tsx** - Flashcard mode
- **ProDeck.tsx** - Progressive reveal mode
- **DeckStudySession.tsx** - Custom deck study (uses same 3 modes)

### State Management:
- **useStudyStore.ts** - Zustand store for:
  - Card queue management
  - User progress tracking
  - Session statistics
  - Box level persistence

---

## Custom Decks

**File:** `src/components/DeckStudySession.tsx`

Users can create custom decks with the same three study modes:
- Typing
- Flashcard
- ProDeck

Custom decks use simple front/back cards from the database.
ProDeck mode for custom decks reveals text progressively character-by-character (instead of by tense like the verb mode).

---

## UI Theme and Colors

### Primary Colors:
- **Blue** (`blue-600`): Primary actions, typing mode
- **Teal/Cyan** (`teal-500`, `cyan-500`): Flashcard mode
- **Purple/Indigo** (`purple-600`, `indigo-600`): ProDeck mode, verb practice card

### Status Colors:
- **Green** (`green-500`, `green-600`): Correct answers, positive actions
- **Red** (`red-500`, `red-600`): Incorrect answers, negative actions
- **Amber** (`amber-600`): Learning progress, override buttons
- **Yellow** (`yellow-500`): Session activity indicator

### Text Colors (Important for Visibility):
- **Correct answers in typing mode**: `text-slate-900` (very dark) with `text-base` size
- This ensures maximum readability for students reviewing incorrect answers
- Previous color `text-slate-800` was too light

---

## Navigation

### Main Routes:
- `/` - Landing page
- `/dashboard` - User's deck collection with featured verb practice card
- `/learn` - Verb conjugation practice with hardcoded verbs (all 3 modes)
- `/learn/[id]` - Study a specific custom deck
- `/dashboard/create` - Create new custom deck
- `/dashboard/[id]/edit` - Edit existing deck

---

## Authentication

Uses Supabase Auth with the following:
- Google OAuth sign-in
- Session management
- User-specific deck ownership
- Public decks visible to all users

---

## Database Schema

### Tables:
1. **decks** - User-created flashcard decks
   - `id`, `user_id`, `title`, `description`, `is_public`, `created_at`

2. **cards** - Individual flashcards
   - `id`, `deck_id`, `front`, `back`, `order_index`, `created_at`

### Notes:
- Verb data is hardcoded in `src/data/verbs.ts` (not in database)
- Custom decks store simple front/back card pairs
- Spaced repetition progress stored in browser localStorage via Zustand persist

---

## Future Improvements

### Potential Features:
- [ ] Add more verbs to the verb database
- [ ] Add more tenses (conditionnel, subjonctif)
- [ ] Export/import deck sharing
- [ ] Audio pronunciation
- [ ] Mobile app version
- [ ] Advanced statistics and charts
- [ ] Customizable study session length
- [ ] Daily streak tracking
- [ ] Achievement badges

---

## Important Implementation Notes

### Do NOT Change:
1. **Text color for correct answers** - Must stay `text-slate-900` for visibility
2. **Pronoun validation logic** - Pronouns must remain optional
3. **ProDeck reveal behavior** - Must reveal full tense conjugation tables, not character-by-character
4. **Keyboard shortcuts** - Users rely on Space, Enter, and Arrow key navigation
5. **Dashboard verb practice card** - Keep as featured element above custom decks

### Key Files:
- `src/lib/validation.ts` - Answer validation (keep pronoun stripping)
- `src/components/ProDeck.tsx` - Tense-by-tense reveal (don't make character-based)
- `src/components/TypingCard.tsx` - Answer text color must be dark
- `src/app/dashboard/page.tsx` - Keep verb practice card prominent

---

**Last Updated:** 2026-01-28
**Version:** 1.0
