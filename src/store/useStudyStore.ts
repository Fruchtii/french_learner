import { create } from 'zustand';
import { verbs, type Verb, type TenseKey, type PronounKey, tenseNames, pronouns } from '@/data/verbs';

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
  // Progress tracking
  userProgress: Record<string, CardProgress>;

  // Current card being studied
  currentCard: CurrentCard | null;

  // Session statistics
  sessionStats: {
    cardsReviewed: number;
    correctCount: number;
    incorrectCount: number;
  };

  // Actions
  initializeCards: () => void;
  submitResult: (verbId: string, tense: TenseKey, pronoun: PronounKey, isCorrect: boolean) => void;
  getNextCard: () => CurrentCard | null;
  selectNextCard: () => void;
  resetSession: () => void;
  getProgress: () => { total: number; due: number; mastered: number; learning: number };
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

export const useStudyStore = create<StudyState>((set, get) => ({
  userProgress: {},
  currentCard: null,
  sessionStats: {
    cardsReviewed: 0,
    correctCount: 0,
    incorrectCount: 0,
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
    const { userProgress, sessionStats } = get();
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
}));
