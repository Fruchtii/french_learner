import { create } from 'zustand';
import { getSupabase, type Card } from '@/lib/supabase';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Leitner Box intervals — controls long-term spacing between sessions. */
const BOX_INTERVALS = {
  0: 0,                    // Immediate
  1: 1 * 60 * 1000,        // 1 minute
  2: 10 * 60 * 1000,       // 10 minutes
  3: 24 * 60 * 60 * 1000,  // 1 day (mastered)
} as const;

const MAX_BOX = 3;

/**
 * Group mode constants.
 * GROUP_SIZE: number of cards studied together in a batch (7 is optimal for
 * working memory — see Miller's Law, "The Magical Number Seven").
 * GRADUATION_STREAK: consecutive correct answers needed within a session
 * before a card "graduates" from its group and the next group begins.
 * REVIEW_MIX_RATIO: probability of showing a graduated review card instead
 * of the current group card, creating natural within-session spacing.
 */
const GROUP_SIZE = 7;
const GRADUATION_STREAK = 2;
const REVIEW_MIX_RATIO = 0.2;

// ============================================================================
// TYPES
// ============================================================================

/** Long-term progress for a single card, persisted to localStorage and DB. */
export interface DeckCardProgress {
  cardId: string;
  box: number;
  nextReviewDate: number;
  lastReviewed: number | null;
  timesCorrect: number;
  timesIncorrect: number;
}

/**
 * Session-only progress for group mode. Tracks how a card is doing
 * within the current study session (not persisted across page loads).
 */
export interface SessionCardState {
  /** Consecutive correct answers this session. Resets to 0 on incorrect. */
  sessionStreak: number;
  /** Whether the card has been shown in the introduction phase. */
  introduced: boolean;
  /** Whether the card has reached GRADUATION_STREAK consecutive correct. */
  graduated: boolean;
  /** Total number of attempts this session. */
  attempts: number;
}

/** Progress info for the current group, used by the UI for progress bars. */
export interface GroupProgress {
  currentGroupIndex: number;
  totalGroups: number;
  groupSize: number;
  groupGraduated: number;
  groupIntroduced: number;
  totalCards: number;
  totalGraduated: number;
}

export type LearningMode = 'classic' | 'groups';

interface DeckStudyState {
  // Current deck
  deckId: string | null;
  cards: Card[];
  originalCards: Card[];

  // Progress per card (keyed by card UUID) — persisted long-term
  cardProgress: Record<string, DeckCardProgress>;

  // Current card being studied
  currentCard: Card | null;

  // Card history for "go back"
  cardHistory: Card[];

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

  // Learning mode — persisted to localStorage (global, not per-deck)
  learningMode: LearningMode;

  // Group learning state — session-only, rebuilt each time
  groups: string[][];
  currentGroupIndex: number;
  sessionCardProgress: Record<string, SessionCardState>;
  reviewPool: string[];
  introPhase: boolean;

  // Actions
  loadDeck: (deckId: string) => Promise<void>;
  setUser: (userId: string | null) => void;
  submitResult: (cardId: string, isCorrect: boolean) => void;
  overrideResult: (cardId: string) => void;
  selectNextCard: () => void;
  goBack: () => void;
  toggleShuffle: () => void;
  toggleFlip: () => void;
  restart: () => void;
  getProgress: () => { total: number; due: number; learning: number; mastered: number };
  getBoxLevel: (cardId: string) => number;

  // Group mode actions
  setLearningMode: (mode: LearningMode) => void;
  markCardIntroduced: () => void;
  getGroupProgress: () => GroupProgress | null;
  resetCurrentGroup: () => void;
  resetAll: () => void;
}

// ============================================================================
// LOCALSTORAGE HELPERS
// ============================================================================

/** Per-deck progress key. */
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

/** Global key for the learning mode preference (not per-deck). */
const LEARNING_MODE_KEY = 'vokab-learning-mode';

function loadLearningMode(): LearningMode {
  try {
    const mode = localStorage.getItem(LEARNING_MODE_KEY);
    return mode === 'classic' ? 'classic' : 'groups';
  } catch {
    return 'groups';
  }
}

function saveLearningMode(mode: LearningMode): void {
  try {
    localStorage.setItem(LEARNING_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Initialize Leitner progress for a set of cards (all start at box 0). */
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

/** Fisher-Yates shuffle (returns new array, doesn't mutate). */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Build learning groups from the card list, sorted by priority.
 *
 * Sorting order:
 *  1. Lower Leitner box first (new/struggling cards get studied first)
 *  2. Higher timesIncorrect first (cards the user struggles with)
 *  3. Oldest lastReviewed first (cards not seen in a while)
 *
 * Cards are then split into batches of GROUP_SIZE (7).
 * Example: 23 cards → groups of [7, 7, 7, 2].
 */
function buildGroups(cards: Card[], cardProgress: Record<string, DeckCardProgress>): string[][] {
  const sorted = [...cards].sort((a, b) => {
    const pa = cardProgress[a.id];
    const pb = cardProgress[b.id];
    if (!pa || !pb) return 0;

    // Box level ascending (lower = higher priority)
    if (pa.box !== pb.box) return pa.box - pb.box;
    // More errors = higher priority
    if (pa.timesIncorrect !== pb.timesIncorrect) return pb.timesIncorrect - pa.timesIncorrect;
    // Older reviews first
    return (pa.lastReviewed ?? 0) - (pb.lastReviewed ?? 0);
  });

  const groups: string[][] = [];
  for (let i = 0; i < sorted.length; i += GROUP_SIZE) {
    groups.push(sorted.slice(i, i + GROUP_SIZE).map(c => c.id));
  }
  return groups;
}

/** Create blank session state for a list of card IDs. */
function initSessionProgress(cardIds: string[]): Record<string, SessionCardState> {
  const progress: Record<string, SessionCardState> = {};
  for (const id of cardIds) {
    progress[id] = {
      sessionStreak: 0,
      introduced: false,
      graduated: false,
      attempts: 0,
    };
  }
  return progress;
}

/** Initialize group state from cards + progress. */
function buildGroupState(cards: Card[], cardProgress: Record<string, DeckCardProgress>) {
  const groups = buildGroups(cards, cardProgress);
  const allCardIds = groups.flat();
  return {
    groups,
    currentGroupIndex: 0,
    sessionCardProgress: initSessionProgress(allCardIds),
    reviewPool: [] as string[],
    introPhase: false,
  };
}

// ============================================================================
// STORE
// ============================================================================

export const useDeckStudyStore = create<DeckStudyState>((set, get) => ({
  deckId: null,
  cards: [],
  originalCards: [],
  cardProgress: {},
  currentCard: null,
  cardHistory: [],
  shuffleEnabled: false,
  isFlipped: false,
  userId: null,
  sessionStats: { correct: 0, incorrect: 0, total: 0 },
  loading: true,
  error: null,

  // Learning mode — loaded from localStorage, defaults to 'groups'
  learningMode: loadLearningMode(),

  // Group learning state — session-only
  groups: [],
  currentGroupIndex: 0,
  sessionCardProgress: {},
  reviewPool: [],
  introPhase: false,

  // --------------------------------------------------------------------------
  // AUTH
  // --------------------------------------------------------------------------

  setUser: (userId) => {
    set({ userId });
  },

  // --------------------------------------------------------------------------
  // LEARNING MODE
  // --------------------------------------------------------------------------

  /**
   * Switch between 'classic' (standard SRS) and 'groups' (round-based).
   * Persists the choice to localStorage and re-initialises the session.
   */
  setLearningMode: (mode: LearningMode) => {
    saveLearningMode(mode);
    set({ learningMode: mode });

    const { cards, cardProgress } = get();
    if (cards.length === 0) return;

    if (mode === 'groups') {
      set(buildGroupState(cards, cardProgress));
    } else {
      // Clear group state when switching to classic
      set({
        groups: [],
        currentGroupIndex: 0,
        sessionCardProgress: {},
        reviewPool: [],
        introPhase: false,
      });
    }
    get().selectNextCard();
  },

  // --------------------------------------------------------------------------
  // LOAD DECK
  // --------------------------------------------------------------------------

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
        progress = { ...defaultProgress, ...localProgress };
      }

      // 2. If logged in, load from DB (overrides localStorage)
      const { userId } = get();
      if (userId) {
        try {
          const cardIds = cards.map((c: Card) => c.id);
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

      // Initialize group state if in group mode
      if (get().learningMode === 'groups') {
        set(buildGroupState(cards, progress));
      }

      // Select first card
      get().selectNextCard();
    } catch (err) {
      console.error('Error loading deck:', err);
      set({ loading: false, error: 'Failed to load cards. Please try again.' });
    }
  },

  // --------------------------------------------------------------------------
  // SUBMIT RESULT
  // --------------------------------------------------------------------------

  /**
   * Record the result of answering a card.
   * Updates Leitner box (long-term) and, if in group mode, session streak.
   */
  submitResult: (cardId: string, isCorrect: boolean) => {
    const { cardProgress, sessionStats, deckId, userId, learningMode, sessionCardProgress } = get();
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

    const stateUpdate: Partial<DeckStudyState> = {
      cardProgress: updatedProgress,
      sessionStats: {
        correct: sessionStats.correct + (isCorrect ? 1 : 0),
        incorrect: sessionStats.incorrect + (isCorrect ? 0 : 1),
        total: sessionStats.total + 1,
      },
    };

    // Group mode: update session progress (streak tracking)
    if (learningMode === 'groups') {
      const sessionProg = sessionCardProgress[cardId];
      if (sessionProg) {
        const newStreak = isCorrect ? sessionProg.sessionStreak + 1 : 0;
        const updated: SessionCardState = {
          ...sessionProg,
          attempts: sessionProg.attempts + 1,
          sessionStreak: newStreak,
          // Once graduated, stay graduated (even if a review card is answered
          // wrong later — graduation means "proved knowledge in this session").
          graduated: newStreak >= GRADUATION_STREAK || sessionProg.graduated,
        };
        stateUpdate.sessionCardProgress = {
          ...sessionCardProgress,
          [cardId]: updated,
        };
      }
    }

    set(stateUpdate as DeckStudyState);

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
        .then(({ error: syncErr }: { error: unknown }) => {
          if (syncErr) console.error('Deck card sync error:', syncErr);
        });
    }
  },

  // --------------------------------------------------------------------------
  // OVERRIDE RESULT
  // --------------------------------------------------------------------------

  /**
   * User says "I was right" — treat the last incorrect answer as correct.
   * Also updates session streak in group mode (sets to 1, conservative).
   */
  overrideResult: (cardId: string) => {
    const { cardProgress, sessionStats, deckId, userId, learningMode, sessionCardProgress } = get();
    const card = cardProgress[cardId];
    if (!card || !deckId) return;

    const now = Date.now();
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

    const stateUpdate: Partial<DeckStudyState> = {
      cardProgress: updatedProgress,
      sessionStats: {
        correct: sessionStats.correct + 1,
        incorrect: Math.max(0, sessionStats.incorrect - 1),
        total: sessionStats.total,
      },
    };

    // Group mode: count the override as 1 correct (conservative)
    if (learningMode === 'groups') {
      const sessionProg = sessionCardProgress[cardId];
      if (sessionProg) {
        const updated: SessionCardState = {
          ...sessionProg,
          sessionStreak: 1,
          graduated: 1 >= GRADUATION_STREAK,
        };
        stateUpdate.sessionCardProgress = {
          ...sessionCardProgress,
          [cardId]: updated,
        };
      }
    }

    set(stateUpdate as DeckStudyState);
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
        .then(({ error: syncErr }: { error: unknown }) => {
          if (syncErr) console.error('Deck card sync error:', syncErr);
        });
    }
  },

  // --------------------------------------------------------------------------
  // SELECT NEXT CARD
  // --------------------------------------------------------------------------

  /**
   * Dispatches to the correct card-selection algorithm based on learningMode.
   *
   * Classic mode: standard Leitner SRS — picks from all due cards by box level.
   * Group mode:   round-based — works through groups of 7, intro → test → graduate.
   */
  selectNextCard: () => {
    const state = get();
    const { learningMode, cards, cardProgress, currentCard } = state;

    if (cards.length === 0) return;

    if (learningMode === 'groups') {
      // =====================================================================
      // GROUP MODE — Round-based learning algorithm
      //
      // Each group of 7 cards goes through two phases:
      //   Phase 1 (Introduction): show each card as a flashcard (both sides)
      //     so the user sees the answer before being tested.
      //   Phase 2 (Testing): cycle through the group in the user's chosen
      //     study mode. Cards need GRADUATION_STREAK (2) consecutive correct
      //     answers to "graduate". Wrong answers reset the streak.
      //
      // Once all cards graduate, the group's cards move to the reviewPool
      // and the next group starts. ~20% of testing cards are randomly pulled
      // from the review pool, creating within-session spaced repetition.
      //
      // Uses a loop (not recursion) to advance through completed groups so
      // all state changes are applied in a single set() call.
      // =====================================================================

      let { groups, currentGroupIndex, sessionCardProgress, reviewPool } = state;

      if (groups.length === 0) return;

      // Loop: advance past any fully-graduated groups until we find work
      while (currentGroupIndex < groups.length) {
        const currentGroup = groups[currentGroupIndex];

        // --- Phase 1: Introduction ---
        // Show un-introduced cards one by one (both sides visible)
        const unintroduced = currentGroup.filter(id => !sessionCardProgress[id]?.introduced);
        if (unintroduced.length > 0) {
          const cardId = unintroduced[0];
          const card = cards.find(c => c.id === cardId);
          const newHistory = currentCard
            ? [...state.cardHistory, currentCard]
            : state.cardHistory;
          set({
            currentCard: card ?? null,
            introPhase: true,
            cardHistory: newHistory,
            currentGroupIndex,
            reviewPool,
            sessionCardProgress,
          });
          return;
        }

        // --- Phase 2: Testing ---
        // Find cards that haven't graduated yet
        const activeCards = currentGroup.filter(id => !sessionCardProgress[id]?.graduated);

        if (activeCards.length > 0) {
          // Pick a card for testing
          const showReview = reviewPool.length > 0 && Math.random() < REVIEW_MIX_RATIO;
          let selectedId: string;

          if (showReview) {
            // Pick random from review pool, avoiding current card
            const reviewCandidates = reviewPool.filter(id => id !== currentCard?.id);
            selectedId = reviewCandidates.length > 0
              ? reviewCandidates[Math.floor(Math.random() * reviewCandidates.length)]
              : reviewPool[Math.floor(Math.random() * reviewPool.length)];
          } else {
            // Pick from active cards, prioritising lowest session streak
            const sorted = [...activeCards].sort((a, b) => {
              const sa = sessionCardProgress[a]?.sessionStreak ?? 0;
              const sb = sessionCardProgress[b]?.sessionStreak ?? 0;
              return sa - sb;
            });

            // Avoid showing the same card back-to-back
            const candidates = sorted.length > 1
              ? sorted.filter(id => id !== currentCard?.id)
              : sorted;

            // Pick randomly from the lowest-streak tier
            const topStreak = sessionCardProgress[candidates[0]]?.sessionStreak ?? 0;
            const topCandidates = candidates.filter(id =>
              (sessionCardProgress[id]?.sessionStreak ?? 0) === topStreak
            );

            selectedId = topCandidates[Math.floor(Math.random() * topCandidates.length)];
          }

          const card = cards.find(c => c.id === selectedId);
          const newHistory = currentCard
            ? [...state.cardHistory, currentCard]
            : state.cardHistory;
          set({
            currentCard: card ?? null,
            introPhase: false,
            cardHistory: newHistory,
            currentGroupIndex,
            reviewPool,
            sessionCardProgress,
          });
          return;
        }

        // All cards in this group graduated → advance to next group
        reviewPool = [...reviewPool, ...currentGroup];
        currentGroupIndex++;

        // Ensure session progress exists for the new group's cards
        if (currentGroupIndex < groups.length) {
          sessionCardProgress = { ...sessionCardProgress };
          for (const id of groups[currentGroupIndex]) {
            if (!sessionCardProgress[id]) {
              sessionCardProgress[id] = { sessionStreak: 0, introduced: false, graduated: false, attempts: 0 };
            }
          }
        }
        // Loop continues — will enter Phase 1 for the new group
      }

      // All groups complete — session done
      set({
        currentCard: null,
        introPhase: false,
        currentGroupIndex,
        reviewPool,
        sessionCardProgress,
      });

    } else {
      // =====================================================================
      // CLASSIC MODE — Standard Leitner SRS
      //
      // Picks the highest-priority due card (lowest box, oldest review date).
      // If no cards are due, picks the one coming due soonest.
      // =====================================================================

      const now = Date.now();

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
        const topBox = cardProgress[dueCards[0].id].box;
        const samePriority = dueCards.filter(c => cardProgress[c.id].box === topBox);
        const candidates = samePriority.length > 1
          ? samePriority.filter(c => c.id !== currentCard?.id)
          : samePriority;
        selected = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const sorted = [...cards].sort((a, b) => {
          const pa = cardProgress[a.id];
          const pb = cardProgress[b.id];
          if (!pa) return 1;
          if (!pb) return -1;
          return pa.nextReviewDate - pb.nextReviewDate;
        });
        selected = sorted[0];
      }

      const newHistory = currentCard ? [...get().cardHistory, currentCard] : get().cardHistory;
      set({ currentCard: selected, cardHistory: newHistory });
    }
  },

  // --------------------------------------------------------------------------
  // MARK CARD INTRODUCED (group mode)
  // --------------------------------------------------------------------------

  /**
   * Mark the current card as "introduced" — the user has seen both sides.
   * Then advance to the next card (either the next intro or start testing).
   */
  markCardIntroduced: () => {
    const { currentCard, sessionCardProgress } = get();
    if (!currentCard) return;

    set({
      sessionCardProgress: {
        ...sessionCardProgress,
        [currentCard.id]: {
          ...(sessionCardProgress[currentCard.id] ?? {
            sessionStreak: 0,
            graduated: false,
            attempts: 0,
          }),
          introduced: true,
        },
      },
    });

    get().selectNextCard();
  },

  // --------------------------------------------------------------------------
  // GROUP PROGRESS (for UI)
  // --------------------------------------------------------------------------

  /**
   * Returns progress info for the current group, or null if not in group mode.
   */
  getGroupProgress: () => {
    const { groups, currentGroupIndex, sessionCardProgress, cards, learningMode } = get();
    if (learningMode !== 'groups' || groups.length === 0) return null;

    const currentGroup = groups[currentGroupIndex] ?? [];
    const graduated = currentGroup.filter(id => sessionCardProgress[id]?.graduated).length;
    const introduced = currentGroup.filter(id => sessionCardProgress[id]?.introduced).length;
    const totalGraduated = Object.values(sessionCardProgress).filter(s => s.graduated).length;

    return {
      currentGroupIndex,
      totalGroups: groups.length,
      groupSize: currentGroup.length,
      groupGraduated: graduated,
      groupIntroduced: introduced,
      totalCards: cards.length,
      totalGraduated,
    };
  },

  // --------------------------------------------------------------------------
  // GO BACK
  // --------------------------------------------------------------------------

  goBack: () => {
    const { cardHistory } = get();
    if (cardHistory.length === 0) return;
    const prevCard = cardHistory[cardHistory.length - 1];
    set({
      currentCard: prevCard,
      cardHistory: cardHistory.slice(0, -1),
    });
  },

  // --------------------------------------------------------------------------
  // TOGGLES
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // RESTART / RESET
  // --------------------------------------------------------------------------

  /**
   * Restart the session. Resets session stats and, if in group mode,
   * rebuilds groups from current Leitner progress.
   */
  restart: () => {
    const { originalCards, shuffleEnabled, learningMode, cardProgress } = get();
    const newCards = shuffleEnabled ? shuffleArray(originalCards) : [...originalCards];

    set({
      sessionStats: { correct: 0, incorrect: 0, total: 0 },
      cards: newCards,
      cardHistory: [],
    });

    if (learningMode === 'groups') {
      set(buildGroupState(newCards, cardProgress));
    }

    get().selectNextCard();
  },

  /**
   * Reset just the current group — re-introduce all cards and reset streaks
   * within this group. Other groups and the review pool are unaffected.
   */
  resetCurrentGroup: () => {
    const { groups, currentGroupIndex, sessionCardProgress } = get();
    if (groups.length === 0 || currentGroupIndex >= groups.length) return;

    const currentGroup = groups[currentGroupIndex];
    const newSessionProg = { ...sessionCardProgress };

    for (const id of currentGroup) {
      newSessionProg[id] = {
        sessionStreak: 0,
        introduced: false,
        graduated: false,
        attempts: 0,
      };
    }

    set({
      sessionCardProgress: newSessionProg,
      introPhase: false,
      cardHistory: [],
    });

    get().selectNextCard();
  },

  /**
   * Reset the entire session — rebuild all groups from scratch, clear the
   * review pool, and reset session stats. Leitner progress is NOT affected.
   */
  resetAll: () => {
    const { originalCards, shuffleEnabled, learningMode, cardProgress } = get();
    const newCards = shuffleEnabled ? shuffleArray(originalCards) : [...originalCards];

    set({
      sessionStats: { correct: 0, incorrect: 0, total: 0 },
      cards: newCards,
      cardHistory: [],
    });

    if (learningMode === 'groups') {
      set(buildGroupState(newCards, cardProgress));
    } else {
      set({
        groups: [],
        currentGroupIndex: 0,
        sessionCardProgress: {},
        reviewPool: [],
        introPhase: false,
      });
    }

    get().selectNextCard();
  },

  // --------------------------------------------------------------------------
  // PROGRESS HELPERS
  // --------------------------------------------------------------------------

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
