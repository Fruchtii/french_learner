import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verbs, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';
import { getSupabase, type LegacyStudyProgress } from '@/lib/supabase';

// Leitner Box intervals (in milliseconds)
// Using short intervals for Box 0-2 for easy testing
const BOX_INTERVALS = {
  0: 0,                    // Immediate (just got it wrong)
  1: 1 * 60 * 1000,        // 1 minute
  2: 10 * 60 * 1000,       // 10 minutes
  3: 24 * 60 * 60 * 1000,  // 1 day (mastered)
} as const;

const MAX_BOX = 3;

// Unique ID for each card (verb + tense + pronoun combination)
export function getCardId(verbId: string, tense: TenseKey, pronoun: PronounKey): string {
  return `${verbId}-${tense}-${pronoun}`;
}

export interface CardProgress {
  verbId: string;
  tense: TenseKey;
  pronoun: PronounKey;
  box: number;
  nextReviewDate: number; // timestamp
  lastReviewed: number | null;
  timesCorrect: number;
  timesIncorrect: number;
}

export interface CurrentCard {
  verb: Verb;
  tense: TenseKey;
  pronoun: PronounKey;
  cardId: string;
}

interface StudyState {
  // User state
  userId: string | null;
  isLoggedIn: boolean;
  isSyncing: boolean;
  lastSyncError: string | null;

  // Progress tracking
  userProgress: Record<string, CardProgress>;

  // Current card being studied
  currentCard: CurrentCard | null;

  // Shuffle mode
  shuffleEnabled: boolean;
  shuffledVerbs: Verb[];

  // ProDeck verb rotation (to ensure all verbs are shown)
  proDeckVerbIndex: number;
  proDeckVerbsShown: Set<string>;

  // Session statistics
  sessionStats: {
    cardsReviewed: number;
    correctCount: number;
    incorrectCount: number;
  };

  // Actions
  setUser: (userId: string | null) => void;
  initializeCards: () => void;
  submitResult: (verbId: string, tense: TenseKey, pronoun: PronounKey, isCorrect: boolean) => void;
  getNextCard: () => CurrentCard | null;
  selectNextCard: () => void;
  selectNextVerbForProDeck: () => void;
  toggleShuffle: () => void;
  shuffleVerbs: () => void;
  resetSession: () => void;
  getProgress: () => { total: number; due: number; mastered: number; learning: number };

  // Database sync actions
  syncToDb: () => Promise<void>;
  loadFromDb: () => Promise<void>;
  syncSingleCard: (cardId: string) => Promise<void>;
}

// Generate all possible cards from verbs data
function generateAllCards(): Record<string, CardProgress> {
  const cards: Record<string, CardProgress> = {};
  const tenses: TenseKey[] = ['present', 'passeCompose', 'imparfait', 'futurSimple'];
  const pronounKeys: PronounKey[] = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

  for (const verb of verbs) {
    for (const tense of tenses) {
      for (const pronoun of pronounKeys) {
        const cardId = getCardId(verb.id, tense, pronoun);
        cards[cardId] = {
          verbId: verb.id,
          tense,
          pronoun,
          box: 0,
          nextReviewDate: Date.now(), // All cards due immediately at start
          lastReviewed: null,
          timesCorrect: 0,
          timesIncorrect: 0,
        };
      }
    }
  }

  return cards;
}

// Convert local CardProgress to database format
function toDbFormat(card: CardProgress, userId: string): Omit<LegacyStudyProgress, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    verb_id: card.verbId,
    tense: card.tense,
    pronoun: card.pronoun,
    box: card.box,
    next_review: new Date(card.nextReviewDate).toISOString(),
    last_reviewed: card.lastReviewed ? new Date(card.lastReviewed).toISOString() : null,
    times_correct: card.timesCorrect,
    times_incorrect: card.timesIncorrect,
  };
}

// Convert database format to local CardProgress
function fromDbFormat(dbCard: LegacyStudyProgress): CardProgress {
  return {
    verbId: dbCard.verb_id,
    tense: dbCard.tense as TenseKey,
    pronoun: dbCard.pronoun as PronounKey,
    box: dbCard.box,
    nextReviewDate: new Date(dbCard.next_review).getTime(),
    lastReviewed: dbCard.last_reviewed ? new Date(dbCard.last_reviewed).getTime() : null,
    timesCorrect: dbCard.times_correct,
    timesIncorrect: dbCard.times_incorrect,
  };
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
  userId: null,
  isLoggedIn: false,
  isSyncing: false,
  lastSyncError: null,
  userProgress: {},
  currentCard: null,
  shuffleEnabled: false,
  shuffledVerbs: [...verbs],
  proDeckVerbIndex: 0,
  proDeckVerbsShown: new Set<string>(),
  sessionStats: {
    cardsReviewed: 0,
    correctCount: 0,
    incorrectCount: 0,
  },

  // Set user (called after auth)
  setUser: (userId) => {
    set({ userId, isLoggedIn: !!userId });
  },

  // Initialize all cards with box 0
  initializeCards: () => {
    const existingProgress = get().userProgress;

    // Only initialize if empty
    if (Object.keys(existingProgress).length === 0) {
      set({ userProgress: generateAllCards() });
    }

    // Select first card
    get().selectNextCard();
  },

  // Submit answer result and update box/review date
  submitResult: (verbId, tense, pronoun, isCorrect) => {
    const cardId = getCardId(verbId, tense, pronoun);
    const { userProgress, sessionStats, isLoggedIn } = get();
    const card = userProgress[cardId];

    if (!card) return;

    const now = Date.now();
    let newBox: number;
    let nextReviewDate: number;

    if (isCorrect) {
      // Move up one box (max is MAX_BOX)
      newBox = Math.min(card.box + 1, MAX_BOX);
      // Set next review based on new box
      nextReviewDate = now + BOX_INTERVALS[newBox as keyof typeof BOX_INTERVALS];
    } else {
      // Reset to box 0
      newBox = 0;
      // Review immediately
      nextReviewDate = now;
    }

    set({
      userProgress: {
        ...userProgress,
        [cardId]: {
          ...card,
          box: newBox,
          nextReviewDate,
          lastReviewed: now,
          timesCorrect: card.timesCorrect + (isCorrect ? 1 : 0),
          timesIncorrect: card.timesIncorrect + (isCorrect ? 0 : 1),
        },
      },
      sessionStats: {
        cardsReviewed: sessionStats.cardsReviewed + 1,
        correctCount: sessionStats.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: sessionStats.incorrectCount + (isCorrect ? 0 : 1),
      },
    });

    // Sync to database if logged in (fire and forget)
    if (isLoggedIn) {
      get().syncSingleCard(cardId);
    }
  },

  // Get the next card that is due for review
  getNextCard: () => {
    const { userProgress } = get();
    const now = Date.now();

    // Get all cards that are due (nextReviewDate <= now)
    const dueCards = Object.values(userProgress)
      .filter(card => card.nextReviewDate <= now)
      .sort((a, b) => {
        // Priority: lower box first (struggling cards), then by review date
        if (a.box !== b.box) return a.box - b.box;
        return a.nextReviewDate - b.nextReviewDate;
      });

    if (dueCards.length === 0) {
      // No cards due - find the one with earliest next review
      const allCards = Object.values(userProgress).sort(
        (a, b) => a.nextReviewDate - b.nextReviewDate
      );

      if (allCards.length === 0) return null;

      // Return the card that will be due soonest
      const nextCard = allCards[0];
      const verb = verbs.find(v => v.id === nextCard.verbId);

      if (!verb) return null;

      return {
        verb,
        tense: nextCard.tense,
        pronoun: nextCard.pronoun,
        cardId: getCardId(nextCard.verbId, nextCard.tense, nextCard.pronoun),
      };
    }

    // Add some randomization among due cards with same box level
    // Pick randomly from top priority cards
    const topBox = dueCards[0].box;
    const samePriorityCards = dueCards.filter(c => c.box === topBox);
    const selectedCard = samePriorityCards[Math.floor(Math.random() * samePriorityCards.length)];

    const verb = verbs.find(v => v.id === selectedCard.verbId);

    if (!verb) return null;

    return {
      verb,
      tense: selectedCard.tense,
      pronoun: selectedCard.pronoun,
      cardId: getCardId(selectedCard.verbId, selectedCard.tense, selectedCard.pronoun),
    };
  },

  // Select and set the next card
  selectNextCard: () => {
    const nextCard = get().getNextCard();
    set({ currentCard: nextCard });
  },

  // Select next verb for ProDeck mode (cycles through all verbs)
  selectNextVerbForProDeck: () => {
    const { proDeckVerbIndex, proDeckVerbsShown, shuffleEnabled, shuffledVerbs } = get();

    // Use shuffled or original verbs based on shuffle mode
    const verbsToUse = shuffleEnabled ? shuffledVerbs : verbs;

    // Get next verb in rotation
    const nextVerb = verbsToUse[proDeckVerbIndex % verbsToUse.length];

    // Create a card for this verb (use first tense/pronoun as placeholder)
    const tenses: TenseKey[] = ['present', 'passeCompose', 'imparfait', 'futurSimple'];
    const pronouns: PronounKey[] = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

    const card: CurrentCard = {
      verb: nextVerb,
      tense: tenses[0], // Placeholder - ProDeck shows all tenses
      pronoun: pronouns[0], // Placeholder - ProDeck shows all pronouns
      cardId: getCardId(nextVerb.id, tenses[0], pronouns[0]),
    };

    // Update shown verbs set
    const newShownVerbs = new Set(proDeckVerbsShown);
    newShownVerbs.add(nextVerb.id);

    // Reset if all verbs have been shown
    if (newShownVerbs.size === verbsToUse.length) {
      newShownVerbs.clear();
    }

    set({
      currentCard: card,
      proDeckVerbIndex: proDeckVerbIndex + 1,
      proDeckVerbsShown: newShownVerbs,
    });
  },

  // Reset session statistics
  resetSession: () => {
    set({
      sessionStats: {
        cardsReviewed: 0,
        correctCount: 0,
        incorrectCount: 0,
      },
    });
  },

  // Get overall progress stats
  getProgress: () => {
    const { userProgress } = get();
    const cards = Object.values(userProgress);
    const now = Date.now();

    return {
      total: cards.length,
      due: cards.filter(c => c.nextReviewDate <= now).length,
      mastered: cards.filter(c => c.box >= MAX_BOX).length,
      learning: cards.filter(c => c.box > 0 && c.box < MAX_BOX).length,
    };
  },

  // Shuffle the verbs array using Fisher-Yates algorithm
  shuffleVerbs: () => {
    const shuffled = [...verbs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    set({
      shuffledVerbs: shuffled,
      proDeckVerbIndex: 0,
      proDeckVerbsShown: new Set<string>()
    });
  },

  // Toggle shuffle mode on/off
  toggleShuffle: () => {
    const { shuffleEnabled } = get();
    const newShuffleState = !shuffleEnabled;

    // If enabling shuffle, shuffle the verbs
    if (newShuffleState) {
      get().shuffleVerbs();
    } else {
      // If disabling, reset to original order
      set({
        shuffleEnabled: false,
        shuffledVerbs: [...verbs],
        proDeckVerbIndex: 0,
        proDeckVerbsShown: new Set<string>()
      });
      return;
    }

    set({ shuffleEnabled: newShuffleState });
  },

  // Sync all progress to database
  syncToDb: async () => {
    const { userId, userProgress, isLoggedIn } = get();

    if (!isLoggedIn || !userId) {
      console.log('Not logged in, skipping sync');
      return;
    }

    set({ isSyncing: true, lastSyncError: null });

    try {
      const supabase = getSupabase();
      const cards = Object.values(userProgress);

      // Upsert all cards in batches
      const batchSize = 50;
      for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize);
        const dbRecords = batch.map(card => toDbFormat(card, userId));

        const { error } = await supabase
          .from('study_progress')
          .upsert(dbRecords, {
            onConflict: 'user_id,verb_id,tense,pronoun',
          });

        if (error) throw error;
      }

      console.log(`Synced ${cards.length} cards to database`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown sync error';
      console.error('Sync error:', message);
      set({ lastSyncError: message });
    } finally {
      set({ isSyncing: false });
    }
  },

  // Load progress from database
  loadFromDb: async () => {
    const { userId, isLoggedIn } = get();

    if (!isLoggedIn || !userId) {
      console.log('Not logged in, using local data');
      get().initializeCards();
      return;
    }

    set({ isSyncing: true, lastSyncError: null });

    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from('study_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Convert database records to local format
        const progress: Record<string, CardProgress> = {};

        for (const dbCard of data) {
          const cardId = getCardId(dbCard.verb_id, dbCard.tense as TenseKey, dbCard.pronoun as PronounKey);
          progress[cardId] = fromDbFormat(dbCard);
        }

        // Merge with default cards (in case new verbs were added)
        const defaultCards = generateAllCards();
        const mergedProgress = { ...defaultCards, ...progress };

        set({ userProgress: mergedProgress });
        console.log(`Loaded ${data.length} cards from database`);
      } else {
        // No data in database, initialize with defaults
        set({ userProgress: generateAllCards() });
        console.log('No data in database, initialized with defaults');
      }

      // Select first card
      get().selectNextCard();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown load error';
      console.error('Load error:', message);
      set({ lastSyncError: message });
      // Fall back to local initialization
      get().initializeCards();
    } finally {
      set({ isSyncing: false });
    }
  },

  // Sync a single card to database (called after each answer)
  syncSingleCard: async (cardId) => {
    const { userId, userProgress, isLoggedIn } = get();

    if (!isLoggedIn || !userId) return;

    const card = userProgress[cardId];
    if (!card) return;

    try {
      const supabase = getSupabase();
      const dbRecord = toDbFormat(card, userId);

      const { error } = await supabase
        .from('study_progress')
        .upsert(dbRecord, {
          onConflict: 'user_id,verb_id,tense,pronoun',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Single card sync error:', error);
      // Don't set error state for single card sync failures
    }
  },
}),
    {
      name: 'vokab-verb-progress',
      partialize: (state) => ({
        userProgress: state.userProgress,
        sessionStats: state.sessionStats,
      }),
    },
  ),
);
