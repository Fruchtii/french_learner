import { create } from 'zustand';
import { getSupabase, type Card } from '@/lib/supabase';

// Leitner Box intervals (same as verb study)
const BOX_INTERVALS = {
  0: 0,                    // Immediate
  1: 1 * 60 * 1000,        // 1 minute
  2: 10 * 60 * 1000,       // 10 minutes
  3: 24 * 60 * 60 * 1000,  // 1 day (mastered)
} as const;

const MAX_BOX = 3;

export interface DeckCardProgress {
  cardId: string;
  box: number;
  nextReviewDate: number;
  lastReviewed: number | null;
  timesCorrect: number;
  timesIncorrect: number;
}

interface DeckStudyState {
  // Current deck
  deckId: string | null;
  cards: Card[];
  originalCards: Card[];

  // Progress per card (keyed by card UUID)
  cardProgress: Record<string, DeckCardProgress>;

  // Current card being studied
  currentCard: Card | null;

  // Options
  shuffleEnabled: boolean;
  isFlipped: boolean;

  // Auth
  userId: string | null;

  // Session statistics
  sessionStats: {
    correct: number;
    incorrect: number;
    total: number;
  };

  // Loading state
  loading: boolean;
  error: string | null;

  // Actions
  loadDeck: (deckId: string) => Promise<void>;
  setUser: (userId: string | null) => void;
  submitResult: (cardId: string, isCorrect: boolean) => void;
  overrideResult: (cardId: string) => void;
  selectNextCard: () => void;
  toggleShuffle: () => void;
  toggleFlip: () => void;
  restart: () => void;
  getProgress: () => { total: number; due: number; learning: number; mastered: number };
  getBoxLevel: (cardId: string) => number;
}

// localStorage helpers — keyed per deck
function getStorageKey(deckId: string): string {
  return `vokab-deck-progress-${deckId}`;
}

function loadProgressFromStorage(deckId: string): Record<string, DeckCardProgress> | null {
  try {
    const raw = localStorage.getItem(getStorageKey(deckId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveProgressToStorage(deckId: string, progress: Record<string, DeckCardProgress>): void {
  try {
    localStorage.setItem(getStorageKey(deckId), JSON.stringify(progress));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

// Initialize progress for a set of cards
function initializeProgress(cards: Card[]): Record<string, DeckCardProgress> {
  const progress: Record<string, DeckCardProgress> = {};
  const now = Date.now();
  for (const card of cards) {
    progress[card.id] = {
      cardId: card.id,
      box: 0,
      nextReviewDate: now,
      lastReviewed: null,
      timesCorrect: 0,
      timesIncorrect: 0,
    };
  }
  return progress;
}

// Shuffle array using Fisher-Yates
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useDeckStudyStore = create<DeckStudyState>((set, get) => ({
  deckId: null,
  cards: [],
  originalCards: [],
  cardProgress: {},
  currentCard: null,
  shuffleEnabled: false,
  isFlipped: false,
  userId: null,
  sessionStats: { correct: 0, incorrect: 0, total: 0 },
  loading: true,
  error: null,

  setUser: (userId) => {
    set({ userId });
  },

  loadDeck: async (deckId: string) => {
    set({ loading: true, error: null, deckId });

    try {
      const supabase = getSupabase();

      // Load cards
      const { data: cards, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('order_index');

      if (fetchError) throw fetchError;

      if (!cards || cards.length === 0) {
        set({ loading: false, error: 'This deck has no cards yet.', cards: [], originalCards: [] });
        return;
      }

      // Initialize default progress for all cards
      const defaultProgress = initializeProgress(cards);

      // Try to load existing progress
      let progress = { ...defaultProgress };

      // 1. Check localStorage
      const localProgress = loadProgressFromStorage(deckId);
      if (localProgress) {
        // Merge: keep localStorage data for known cards, add defaults for new cards
        progress = { ...defaultProgress, ...localProgress };
      }

      // 2. If logged in, load from DB (overrides localStorage)
      const { userId } = get();
      if (userId) {
        try {
          const cardIds = cards.map(c => c.id);
          const { data: dbProgress, error: dbError } = await supabase
            .from('study_progress')
            .select('*')
            .eq('user_id', userId)
            .in('card_id', cardIds);

          if (!dbError && dbProgress && dbProgress.length > 0) {
            for (const row of dbProgress) {
              progress[row.card_id] = {
                cardId: row.card_id,
                box: row.box,
                nextReviewDate: new Date(row.next_review).getTime(),
                lastReviewed: row.last_reviewed ? new Date(row.last_reviewed).getTime() : null,
                timesCorrect: row.times_correct,
                timesIncorrect: row.times_incorrect,
              };
            }
          }
        } catch {
          // DB load failed — fall through to localStorage/defaults
        }
      }

      // Save merged progress to localStorage
      saveProgressToStorage(deckId, progress);

      set({
        cards,
        originalCards: cards,
        cardProgress: progress,
        loading: false,
        sessionStats: { correct: 0, incorrect: 0, total: 0 },
      });

      // Select first card using SRS algorithm
      get().selectNextCard();
    } catch (err) {
      console.error('Error loading deck:', err);
      set({ loading: false, error: 'Failed to load cards. Please try again.' });
    }
  },

  submitResult: (cardId: string, isCorrect: boolean) => {
    const { cardProgress, sessionStats, deckId, userId } = get();
    const card = cardProgress[cardId];
    if (!card || !deckId) return;

    const now = Date.now();
    let newBox: number;
    let nextReviewDate: number;

    if (isCorrect) {
      newBox = Math.min(card.box + 1, MAX_BOX);
      nextReviewDate = now + BOX_INTERVALS[newBox as keyof typeof BOX_INTERVALS];
    } else {
      newBox = 0;
      nextReviewDate = now;
    }

    const updatedCard: DeckCardProgress = {
      ...card,
      box: newBox,
      nextReviewDate,
      lastReviewed: now,
      timesCorrect: card.timesCorrect + (isCorrect ? 1 : 0),
      timesIncorrect: card.timesIncorrect + (isCorrect ? 0 : 1),
    };

    const updatedProgress = {
      ...cardProgress,
      [cardId]: updatedCard,
    };

    set({
      cardProgress: updatedProgress,
      sessionStats: {
        correct: sessionStats.correct + (isCorrect ? 1 : 0),
        incorrect: sessionStats.incorrect + (isCorrect ? 0 : 1),
        total: sessionStats.total + 1,
      },
    });

    // Persist to localStorage
    saveProgressToStorage(deckId, updatedProgress);

    // Sync to DB if logged in (fire and forget)
    if (userId) {
      const supabase = getSupabase();
      supabase
        .from('study_progress')
        .upsert({
          user_id: userId,
          card_id: cardId,
          box: newBox,
          next_review: new Date(nextReviewDate).toISOString(),
          last_reviewed: new Date(now).toISOString(),
          times_correct: updatedCard.timesCorrect,
          times_incorrect: updatedCard.timesIncorrect,
        }, {
          onConflict: 'user_id,card_id',
        })
        .then(({ error }) => {
          if (error) console.error('Deck card sync error:', error);
        });
    }
  },

  overrideResult: (cardId: string) => {
    const { cardProgress, sessionStats, deckId, userId } = get();
    const card = cardProgress[cardId];
    if (!card || !deckId) return;

    const now = Date.now();
    // Treat as correct: move up one box from where it was before it got reset
    const newBox = Math.min(card.box + 1, MAX_BOX);
    const nextReviewDate = now + BOX_INTERVALS[newBox as keyof typeof BOX_INTERVALS];

    const updatedCard: DeckCardProgress = {
      ...card,
      box: newBox,
      nextReviewDate,
      lastReviewed: now,
      timesCorrect: card.timesCorrect + 1,
      timesIncorrect: Math.max(0, card.timesIncorrect - 1),
    };

    const updatedProgress = {
      ...cardProgress,
      [cardId]: updatedCard,
    };

    set({
      cardProgress: updatedProgress,
      sessionStats: {
        correct: sessionStats.correct + 1,
        incorrect: Math.max(0, sessionStats.incorrect - 1),
      },
    });

    // Persist
    saveProgressToStorage(deckId, updatedProgress);

    if (userId) {
      const supabase = getSupabase();
      supabase
        .from('study_progress')
        .upsert({
          user_id: userId,
          card_id: cardId,
          box: newBox,
          next_review: new Date(nextReviewDate).toISOString(),
          last_reviewed: new Date(now).toISOString(),
          times_correct: updatedCard.timesCorrect,
          times_incorrect: updatedCard.timesIncorrect,
        }, {
          onConflict: 'user_id,card_id',
        })
        .then(({ error }) => {
          if (error) console.error('Deck card sync error:', error);
        });
    }
  },

  selectNextCard: () => {
    const { cards, cardProgress, currentCard } = get();
    if (cards.length === 0) return;

    const now = Date.now();

    // Get due cards sorted by priority (lower box first, then by review date)
    const dueCards = cards
      .filter(c => {
        const prog = cardProgress[c.id];
        return prog && prog.nextReviewDate <= now;
      })
      .sort((a, b) => {
        const pa = cardProgress[a.id];
        const pb = cardProgress[b.id];
        if (pa.box !== pb.box) return pa.box - pb.box;
        return pa.nextReviewDate - pb.nextReviewDate;
      });

    let selected: Card | null = null;

    if (dueCards.length > 0) {
      // Pick randomly from top-priority cards (same box level)
      const topBox = cardProgress[dueCards[0].id].box;
      const samePriority = dueCards.filter(c => cardProgress[c.id].box === topBox);

      // Avoid showing the same card twice in a row (if possible)
      const candidates = samePriority.length > 1
        ? samePriority.filter(c => c.id !== currentCard?.id)
        : samePriority;

      selected = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      // No cards due — pick the one coming due soonest
      const sorted = [...cards].sort((a, b) => {
        const pa = cardProgress[a.id];
        const pb = cardProgress[b.id];
        if (!pa) return 1;
        if (!pb) return -1;
        return pa.nextReviewDate - pb.nextReviewDate;
      });
      selected = sorted[0];
    }

    set({ currentCard: selected });
  },

  toggleShuffle: () => {
    const { shuffleEnabled, originalCards } = get();
    const newState = !shuffleEnabled;

    if (newState) {
      set({ shuffleEnabled: true, cards: shuffleArray(originalCards) });
    } else {
      set({ shuffleEnabled: false, cards: [...originalCards] });
    }
  },

  toggleFlip: () => {
    set({ isFlipped: !get().isFlipped });
  },

  restart: () => {
    const { cards, originalCards, shuffleEnabled } = get();
    // Reset session stats, re-select first card
    set({
      sessionStats: { correct: 0, incorrect: 0, total: 0 },
      cards: shuffleEnabled ? shuffleArray(originalCards) : [...originalCards],
    });
    get().selectNextCard();
  },

  getProgress: () => {
    const { cardProgress } = get();
    const entries = Object.values(cardProgress);
    const now = Date.now();

    return {
      total: entries.length,
      due: entries.filter(c => c.nextReviewDate <= now).length,
      learning: entries.filter(c => c.box > 0 && c.box < MAX_BOX).length,
      mastered: entries.filter(c => c.box >= MAX_BOX).length,
    };
  },

  getBoxLevel: (cardId: string) => {
    const { cardProgress } = get();
    return cardProgress[cardId]?.box ?? 0;
  },
}));
