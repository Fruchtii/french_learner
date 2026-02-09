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
- **IMPORTANT REVEAL LOGIC** (DO NOT CHANGE):
  - **State 0**: Show infinitive + meaning only
  - **State 1** (First Press): Reveal ENTIRE **Présent** table (all 6 conjugations)
  - **State 2** (Second Press): Reveal ENTIRE **Passé Composé** table (Présent stays visible)
  - **State 3** (Third Press): Reveal ENTIRE **Imparfait** table (Présent + Passé Composé stay visible)
  - **State 4** (Fourth Press): Reveal ENTIRE **Futur Simple** table (all 4 tenses now visible)
  - **After State 4**: Show grading buttons ("I knew it all" / "I struggled")
- Each tense shown in a colored card with 2x3 grid of conjugations
- Progress dots indicator showing which tenses are revealed (4 dots total)
- Self-grading after all tenses revealed

**Implementation Details:**
- Uses `revealStep` state: 0 (nothing) → 1 (présent) → 2 (+passé composé) → 3 (+imparfait) → 4 (+futur)
- Tense order: `['present', 'passeCompose', 'imparfait', 'futurSimple']`
- Revealed tenses: `TENSE_ORDER.slice(0, revealStep)` - reveals one tense at a time
- Each press reveals the NEXT complete tense table, keeping previous ones visible

**Keyboard Shortcuts:**
- `Space` - Reveal next tense group (during reveal) or go to next verb (after grading)
- `Enter` - Same as Space (reveal or next)
- `1` or `←` (Left Arrow) - Mark as "I struggled" (incorrect)
- `2` or `→` (Right Arrow) - Mark as "I knew it all" (correct)

**UI Colors:**
- Présent: `from-blue-50 to-blue-100`, border `border-blue-200`
- Passé Composé: `from-green-50 to-green-100`, border `border-green-200`
- Imparfait: `from-amber-50 to-amber-100`, border `border-amber-200`
- Futur Simple: `from-rose-50 to-rose-100`, border `border-rose-200`

---

## Study Controls

### Shuffle Mode
**Available in:** Verb Conjugation Practice (`/learn`)
**Component:** `src/components/StudySession.tsx`

**Features:**
- Randomizes the order of verbs for variety
- Toggle button next to mode switcher
- Visual indicator: animated pulse effect when active
- Uses Fisher-Yates shuffling algorithm for true randomization
- Resets verb rotation when toggled on
- Returns to original order when toggled off

**UI:**
- Button with shuffle icon
- Active state: indigo background with border (`bg-indigo-100 text-indigo-700 border-indigo-300`)
- Inactive state: slate background (`bg-slate-100 text-slate-600`)

### Flip Direction
**Available in:** Custom Deck Study (`/learn/[id]`)
**Component:** `src/components/DeckStudySession.tsx`

**Features:**
- Reverses the learning direction for vocabulary cards
- Swaps which language is shown as the question vs. answer
- Example: Normal (French → German), Flipped (German → French)
- Works across all three study modes (Typing, Flashcard, ProDeck)
- Toggle button next to mode switcher
- Visual indicator: rotated icon when active

**UI:**
- Button with arrow left-right icon
- Active state: indigo background with border (`bg-indigo-100 text-indigo-700 border-indigo-300`)
- Inactive state: slate background (`bg-slate-100 text-slate-600`)
- Icon rotates 90 degrees when flipped

**Implementation:**
- Uses `isFlipped` state boolean
- Helper functions: `getQuestion()` and `getAnswer()` swap front/back based on flip state
- All card displays use these helpers to respect the flip setting

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

### Current Verbs (100 total):
The app includes 100 common French irregular verbs, including:
1. **être** - to be
2. **avoir** - to have
3. **aller** - to go
4. **faire** - to do/make
5. **pouvoir** - to be able to/can
6. **venir** - to come
7. **voir** - to see
8. **savoir** - to know
9. **vouloir** - to want
10. **devoir** - must/to have to
11. **prendre** - to take
12. **mettre** - to put
13. **dire** - to say/tell
14. **partir** - to leave
15. **sortir** - to go out
16. **tenir** - to hold
17. **boire** - to drink
18. **croire** - to believe
19. **lire** - to read
20. **écrire** - to write
...and 80 more irregular verbs

### Tenses Covered (4 total):
1. **Présent**
2. **Passé Composé** (with auxiliary verbs avoir/être)
3. **Imparfait**
4. **Futur Simple**

### Total Cards: 2400
- 100 verbs × 4 tenses × 6 pronouns = 2400 unique conjugation cards

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
- Stats: "100 verbs • 4 tenses • 2400 cards"
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
- `Enter` - Alternative primary action or next card
- `1` or `←` (Left Arrow) - Grade as incorrect/forgot
- `2` or `→` (Right Arrow) - Grade as correct/knew it, or next card when not grading
- `ArrowRight` - Alternative next card navigation (when not in grading mode)

### Implementation Details:
- Uses `window.addEventListener('keydown')` for global capture
- Uses `primaryActionRef` and `gradeActionsRef` for mode-specific behavior
- Child components (TypingCard, FlashCard, ProDeck) register their actions via callbacks
- `preventDefault()` called on Space and Enter to prevent default browser behavior

### Smart Context Detection:
- Keyboard shortcuts are **disabled** when user is typing in an input field
- Uses `document.activeElement` to check if focus is on INPUT or TEXTAREA
- Safety check: `if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) return;`
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

### Features:
- Simple front/back card pairs stored in database
- ProDeck mode reveals text progressively character-by-character (instead of by tense like the verb mode)
- **Flip Direction** toggle to reverse learning direction (e.g., German → French instead of French → German)
- Works seamlessly across all three study modes
- Shuffle on deck load for variety

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
1. **Text color for correct answers** - Must stay `text-slate-900` with `text-base` size for visibility
2. **Pronoun validation logic** - Pronouns must remain optional
3. **ProDeck reveal behavior** - CRITICAL:
   - State 0: Show only infinitive + meaning
   - State 1: Reveal ENTIRE Présent (6 conjugations)
   - State 2: Reveal ENTIRE Passé Composé (Présent stays visible)
   - State 3: Reveal ENTIRE Imparfait (Présent + Passé Composé stay visible)
   - State 4: Reveal ENTIRE Futur Simple (all 4 tenses visible)
   - DO NOT reveal one conjugation at a time (always full tables)
   - Each press reveals ONE complete tense table
   - `revealStep` must be 0→1→2→3→4, with 4 being all tenses revealed
4. **Keyboard shortcuts** - Users rely on Space, Enter, and Arrow key navigation
   - Must use `document.activeElement` for INPUT/TEXTAREA detection
   - Must call `preventDefault()` on Space and Enter
   - Must work globally via window listener
5. **Dashboard verb practice card** - Keep as featured element above custom decks

### Key Files:
- `src/lib/validation.ts` - Answer validation (keep pronoun stripping)
- `src/components/ProDeck.tsx` - Tense-by-tense reveal (one tense per press, 4 steps total)
- `src/components/TypingCard.tsx` - Answer text must be `text-slate-900 text-base`
- `src/components/StudySession.tsx` - Global keyboard handler with safety checks
- `src/app/dashboard/page.tsx` - Keep verb practice card prominent
- `src/app/learn/page.tsx` - Must use StudySession directly (no deck redirect)

### Common Mistakes to Avoid:
- ❌ Don't make ProDeck reveal character-by-character (must reveal full tense tables)
- ❌ Don't reveal multiple tenses at once (each press reveals ONE tense table)
- ❌ Don't make ProDeck like DeckStudySession (verb ProDeck shows full conjugation tables)
- ❌ Don't use `e.target` for keyboard safety check (use `document.activeElement`)
- ❌ Don't forget `preventDefault()` on Space key (prevents page scroll)
- ❌ Don't make answer text lighter than `text-slate-900` in typing mode
- ❌ Don't redirect /learn to a deck (must show StudySession directly for verb practice)

---

**Last Updated:** 2026-02-09
**Version:** 1.1
