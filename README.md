# French Learner - Vocabulary & Conjugation Practice App

A Next.js flashcard application for learning French with spaced repetition, multiple study modes, and customizable vocabulary decks.

## Features

### Study Modes
- **Typing Mode**: Type the correct answer with immediate feedback
- **Flashcard Mode**: Traditional flip cards with self-grading
- **ProDeck Mode**: Progressive reveal for active recall practice

### Learning Systems
- **100 French Irregular Verbs**: Master conjugations across 4 tenses (Présent, Passé Composé, Imparfait, Futur Simple)
- **Custom Vocabulary Decks**: Create and study your own flashcard decks
- **Spaced Repetition**: Leitner box system for optimal review scheduling
- **Shuffle Mode**: Randomize verb order for variety (verb conjugation practice)
- **Flip Direction**: Reverse learning direction for vocabulary decks (e.g., German → French instead of French → German)

### Technical Stack
- **Framework**: Next.js 14 with App Router
- **UI**: React + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Authentication**: Supabase Auth (Google OAuth)

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm/bun
- Supabase account (for database and auth)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd french_learner
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/          # User dashboard and deck management
│   ├── learn/              # Study pages (verbs and custom decks)
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── StudySession.tsx    # Verb conjugation study controller
│   ├── DeckStudySession.tsx # Custom deck study controller
│   ├── TypingCard.tsx      # Typing mode component
│   ├── FlashCard.tsx       # Flashcard mode component
│   └── ProDeck.tsx         # ProDeck mode component
├── data/                   # Static data
│   └── verbs.ts            # 100 French irregular verbs
├── lib/                    # Utilities
│   ├── supabase.ts         # Supabase client
│   └── validation.ts       # Answer validation logic
└── store/                  # State management
    └── useStudyStore.ts    # Zustand store
```

## Database Schema

### Tables
- **decks**: User-created flashcard decks
- **cards**: Individual flashcards (front/back pairs)
- **profiles**: User profile information
- **study_progress**: Spaced repetition progress tracking

See `supabase-schema.sql` for full schema details.

## Key Features

### Verb Conjugation Practice
- 100 irregular French verbs
- 4 tenses × 6 pronouns = 2400 unique cards per verb set
- Smart answer validation (pronouns optional)
- Accent character helper buttons

### Custom Vocabulary Decks
- Create unlimited custom decks
- Front/back card format (supports any language pair)
- **Flip direction toggle** to reverse learning direction
- Share decks publicly or keep private
- Same 3 study modes as verb practice

### Study Controls
- **Shuffle**: Randomize verb order (available in verb practice)
- **Flip Direction**: Reverse question/answer languages (available in custom decks)
- Both controls are toggle buttons next to the mode switcher

### Keyboard Shortcuts
- `Space` or `Enter`: Primary action (reveal/submit/next)
- `1` or `←`: Mark incorrect
- `2` or `→`: Mark correct
- Works globally across all study modes

## Documentation

For detailed feature documentation, see [FEATURES.md](./FEATURES.md)

## License

MIT

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
