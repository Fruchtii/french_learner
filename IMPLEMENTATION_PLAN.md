# VerbeMaître - Implementation Plan

## Current Project Structure

```
french_learner/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Global styles
│   └── data/
│       └── verbs.ts         # Verb data structure (5 sample verbs)
├── package.json
└── ...config files
```

---

## Phase 2: Authentication with Supabase

### Step 2.1: Supabase Project Setup
1. Create a Supabase project at supabase.com
2. Get the project URL and anon key
3. Create `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Step 2.2: Supabase Client Configuration
Create `src/lib/supabase.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 2.3: Database Schema
Create the following tables in Supabase:

**Table: `user_progress`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| verb_id | text | Reference to verb (e.g., "etre") |
| tense | text | "present", "passeCompose", etc. |
| pronoun | text | "je", "tu", "il", etc. |
| ease_factor | float | SRS ease factor (default 2.5) |
| interval | int | Days until next review |
| repetitions | int | Successful reviews count |
| next_review | timestamp | When to show this card next |
| last_reviewed | timestamp | Last review timestamp |
| created_at | timestamp | Creation timestamp |

**Row Level Security (RLS) Policies:**
- Users can only read/write their own progress data

### Step 2.4: Authentication Pages

**Create `src/app/login/page.tsx`:**
- Email/password sign in form
- "Sign up" link
- Social auth options (optional)
- Redirect to /learn on success

**Create `src/app/signup/page.tsx`:**
- Email/password registration
- Terms acceptance checkbox
- Redirect to /learn on success

### Step 2.5: Auth Middleware
Create `src/middleware.ts`:
- Protect `/learn/*` routes
- Redirect unauthenticated users to `/login`
- Redirect authenticated users from `/login` to `/learn`

### Step 2.6: Auth Context/Hook
Create `src/hooks/useAuth.ts`:
```typescript
// Provides: user, signIn, signUp, signOut, loading
```

---

## Phase 3: Quiz Logic with Spaced Repetition

### Step 3.1: SRS Algorithm Implementation
Create `src/lib/srs.ts`:

```typescript
interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=wrong, 5=perfect
}

interface CardProgress {
  easeFactor: number;    // Starts at 2.5
  interval: number;      // Days
  repetitions: number;   // Successful reviews
  nextReview: Date;
}

// SM-2 Algorithm (simplified)
function calculateNextReview(
  progress: CardProgress,
  quality: number
): CardProgress {
  // If quality < 3: reset (wrong answer)
  // If quality >= 3: increase interval based on ease factor
  // Adjust ease factor based on performance
}
```

**SRS Logic:**
- **Wrong answer (quality 0-2):** Reset interval to 1 day, show sooner
- **Correct answer (quality 3-5):**
  - First correct: interval = 1 day
  - Second correct: interval = 6 days
  - Subsequent: interval = previous × ease factor
- **Ease Factor adjustment:** Increases/decreases based on performance

### Step 3.2: Quiz State Management
Create `src/store/quizStore.ts` (Zustand):

```typescript
interface QuizState {
  // Current quiz session
  currentVerb: Verb | null;
  currentTense: TenseKey;
  currentPronoun: PronounKey;
  userAnswer: string;

  // Session stats
  correctCount: number;
  incorrectCount: number;
  cardsReviewed: number;

  // Actions
  startQuiz: (tense?: TenseKey) => void;
  submitAnswer: (answer: string) => void;
  nextCard: () => void;
  insertAccent: (char: string) => void;
}
```

### Step 3.3: Quiz Components

**Create `src/app/learn/page.tsx`:**
- Dashboard showing mastery % per tense
- "Practice All" and per-tense practice buttons
- Statistics overview

**Create `src/app/learn/quiz/page.tsx`:**
- Main quiz interface
- Shows verb, tense, pronoun prompt
- Input field with accent buttons
- Submit button
- Correct/incorrect feedback
- Progress indicator

**Create `src/components/AccentKeyboard.tsx`:**
```typescript
const accents = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'î', 'ï', 'ô', 'ç', 'œ'];
// Clickable buttons to insert characters
```

**Create `src/components/ProgressRing.tsx`:**
- Circular progress indicator for mastery %

### Step 3.4: Answer Validation
Create `src/lib/validation.ts`:

```typescript
function validateAnswer(userAnswer: string, correctAnswer: string): {
  isCorrect: boolean;
  isClose: boolean;      // For accent tolerance
  normalizedUser: string;
  normalizedCorrect: string;
}

// Normalization:
// - Lowercase
// - Trim whitespace
// - Handle common accent mistakes (optional lenient mode)
```

### Step 3.5: Card Selection Algorithm
Create `src/lib/cardSelector.ts`:

```typescript
function selectNextCard(
  verbs: Verb[],
  userProgress: UserProgress[],
  selectedTense?: TenseKey
): QuizCard {
  // Priority:
  // 1. Cards past their review date (overdue)
  // 2. New cards (never reviewed)
  // 3. Cards closest to review date

  // Randomize within priority groups
}
```

---

## Phase 4: Progress Dashboard

### Step 4.1: Stats Calculation
Create `src/lib/stats.ts`:

```typescript
interface TenseStats {
  tense: TenseKey;
  totalCards: number;     // verbs × pronouns
  masteredCards: number;  // interval > 21 days
  learningCards: number;  // 0 < interval <= 21
  newCards: number;       // never reviewed
  masteryPercent: number;
}

function calculateStats(
  verbs: Verb[],
  progress: UserProgress[]
): TenseStats[];
```

### Step 4.2: Dashboard Components

**Create `src/components/MasteryChart.tsx`:**
- Bar chart showing mastery % per tense
- Color-coded (red < 30%, yellow 30-70%, green > 70%)

**Create `src/components/VerbList.tsx`:**
- Expandable list of all verbs
- Shows individual verb mastery
- Click to practice specific verb

---

## File Structure After Implementation

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── learn/
│       ├── page.tsx         # Dashboard
│       └── quiz/
│           └── page.tsx     # Quiz interface
├── components/
│   ├── AccentKeyboard.tsx
│   ├── ProgressRing.tsx
│   ├── MasteryChart.tsx
│   ├── VerbList.tsx
│   └── Navbar.tsx
├── data/
│   └── verbs.ts             # Full 100 verbs
├── hooks/
│   └── useAuth.ts
├── lib/
│   ├── supabase.ts
│   ├── srs.ts
│   ├── validation.ts
│   ├── cardSelector.ts
│   └── stats.ts
├── store/
│   └── quizStore.ts
└── middleware.ts
```

---

## Implementation Order

1. **Phase 2A:** Set up Supabase client and environment
2. **Phase 2B:** Create login/signup pages
3. **Phase 2C:** Add auth middleware and protected routes
4. **Phase 3A:** Implement SRS algorithm
5. **Phase 3B:** Create quiz store with Zustand
6. **Phase 3C:** Build quiz UI components
7. **Phase 3D:** Connect quiz to Supabase for persistence
8. **Phase 4A:** Build progress dashboard
9. **Phase 4B:** Add stats and mastery visualization
10. **Final:** Expand to full 100 verbs dataset

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | Zustand | Lightweight, simple API, no boilerplate |
| SRS Algorithm | SM-2 variant | Proven, well-documented, effective |
| Auth | Supabase Auth | Built-in, secure, easy RLS integration |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Data Fetching | React hooks + Supabase | Simple, real-time capable |

---

## Next Steps

To proceed with Phase 2 (Authentication), I need:
1. Your Supabase project URL and anon key
2. Confirmation on auth methods (email/password, social, or both)

To proceed with Phase 3 (Quiz Logic), I can start immediately with:
1. Local-only quiz (no persistence)
2. Add Supabase persistence once auth is ready
