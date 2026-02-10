'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Check, X, Zap, Clock, Keyboard, Sparkles, Layers, Shuffle, Trophy, Filter } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import { getSupabase } from '@/lib/supabase';
import TypingCard from './TypingCard';
import FlashCard from './FlashCard';
import ProDeck from './ProDeck';

export type StudyMode = 'typing' | 'flashcard' | 'prodeck';

const TENSE_OPTIONS = [
  { key: 'all', label: 'All Tenses' },
  { key: 'present', label: 'Présent' },
  { key: 'passeCompose', label: 'Passé Composé' },
  { key: 'imparfait', label: 'Imparfait' },
  { key: 'futurSimple', label: 'Futur Simple' },
] as const;

interface StudySessionProps {
  initialMode?: StudyMode;
}

// Type for grading actions
interface GradeActions {
  gradeCorrect: () => void;
  gradeIncorrect: () => void;
}

export default function StudySession({ initialMode = 'typing' }: StudySessionProps) {
  const [mode, setMode] = useState<StudyMode>(initialMode);
  const [readyForNext, setReadyForNext] = useState(false);
  const [tenseFilter, setTenseFilter] = useState<string>('all');
  const [showTenseFilter, setShowTenseFilter] = useState(false);

  // Ref to store the current primary action (set by child components)
  const primaryActionRef = useRef<(() => void) | null>(null);

  // Ref to store grading actions (set by child components when in grading state)
  const gradeActionsRef = useRef<GradeActions | null>(null);

  const {
    currentCard,
    sessionStats,
    userProgress,
    shuffleEnabled,
    setUser,
    initializeCards,
    submitResult,
    selectNextCard,
    selectNextVerbForProDeck,
    toggleShuffle,
    getProgress,
    loadFromDb,
    setTenseFilter: setStoreTenseFilter,
  } = useStudyStore();

  // Handle ready for next callback from card components
  const handleReadyForNext = useCallback((ready: boolean) => {
    setReadyForNext(ready);
  }, []);

  // Handle primary action registration from child components
  const handlePrimaryAction = useCallback((action: () => void) => {
    primaryActionRef.current = action;
  }, []);

  // Handle grading actions registration from child components
  const handleGradeActions = useCallback((actions: GradeActions | null) => {
    gradeActionsRef.current = actions;
  }, []);

  // Mode-aware next card function
  const selectModeAppropriateCard = useCallback(() => {
    if (mode === 'prodeck') {
      selectNextVerbForProDeck();
    } else {
      selectNextCard();
    }
  }, [mode, selectNextCard, selectNextVerbForProDeck]);

  // Global keyboard handler - window-level for reliability
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CRITICAL: Strictly ignore keyboard shortcuts when typing in INPUT/TEXTAREA
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
        return; // User is typing - don't interfere
      }

      // Handle Spacebar - Primary action for each mode
      if (e.key === ' ') {
        e.preventDefault(); // Prevent page scroll

        // Use primaryActionRef if set by child component
        if (primaryActionRef.current) {
          primaryActionRef.current();
        } else if (readyForNext) {
          // Fallback: if ready for next, go to next card
          selectModeAppropriateCard();
          setReadyForNext(false);
        }
      }

      // Handle Enter key - Next card or primary action
      if (e.key === 'Enter') {
        e.preventDefault();

        // Use primaryActionRef if set, otherwise go to next if ready
        if (primaryActionRef.current) {
          primaryActionRef.current();
        } else if (readyForNext) {
          selectModeAppropriateCard();
          setReadyForNext(false);
        }
      }

      // Handle grading shortcuts (1/2 or Arrow keys)
      if (gradeActionsRef.current) {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          gradeActionsRef.current.gradeIncorrect();
        } else if (e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          gradeActionsRef.current.gradeCorrect();
        }
      }

      // ArrowRight as alternative next (when no grading active)
      if (e.key === 'ArrowRight' && !gradeActionsRef.current && readyForNext) {
        e.preventDefault();
        selectModeAppropriateCard();
        setReadyForNext(false);
      }
    };

    // Attach to window for global keyboard handling
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readyForNext, selectModeAppropriateCard]);

  // Initialize: check auth, load progress from DB, then initialize cards
  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user.id);
      }
      initializeCards();
      if (session?.user) {
        await loadFromDb();
        // Re-select card after loading DB progress
        selectNextCard();
      }
    }
    init();
  }, []);

  // When switching to ProDeck mode, select appropriate verb
  useEffect(() => {
    if (mode === 'prodeck' && currentCard) {
      // Make sure we're showing a verb for ProDeck
      selectNextVerbForProDeck();
    }
  }, [mode]); // Only run when mode changes

  // Reset actions when mode or card changes
  useEffect(() => {
    primaryActionRef.current = null;
    gradeActionsRef.current = null;
  }, [mode, currentCard?.cardId]);

  // Get current card's box level
  const boxLevel = currentCard
    ? userProgress[currentCard.cardId]?.box ?? 0
    : 0;

  // Get progress stats
  const progress = getProgress();

  // Handle answer submission
  const handleSubmit = (isCorrect: boolean) => {
    if (!currentCard) return;
    submitResult(currentCard.verb.id, currentCard.tense, currentCard.pronoun, isCorrect);
  };

  // Handle override (correct a wrong answer)
  const handleOverride = () => {
    if (!currentCard) return;
    submitResult(currentCard.verb.id, currentCard.tense, currentCard.pronoun, true);
  };

  // Handle skip (no result recorded)
  const handleSkip = () => {
    selectModeAppropriateCard();
  };

  // Handle next card
  const handleNext = () => {
    selectModeAppropriateCard();
  };

  // Session complete / all mastered state
  if (!currentCard && Object.keys(userProgress).length > 0) {
    const allMastered = progress.mastered === progress.total;
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="vk-card shadow-green-200/50 border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {allMastered ? 'All Cards Mastered!' : 'No Cards Due'}
          </h3>
          <p className="text-slate-600 mb-2">
            {allMastered
              ? 'Amazing work! You\'ve mastered all the cards in this set.'
              : 'You\'re all caught up. Come back later when more cards are due for review.'}
          </p>
          <div className="flex justify-center gap-4 mb-6 text-sm">
            <span className="text-green-600 font-semibold">{progress.mastered} mastered</span>
            <span className="text-amber-600 font-semibold">{progress.learning} learning</span>
            <span className="text-blue-600 font-semibold">{progress.due} due</span>
          </div>
          {tenseFilter !== 'all' && (
            <button
              onClick={() => {
                setTenseFilter('all');
                setStoreTenseFilter(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Study All Tenses
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse text-slate-400">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Mode Switcher, Shuffle, and Tense Filter */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setMode('typing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'typing'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Typing
            </button>
            <button
              onClick={() => setMode('flashcard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'flashcard'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Flashcard
            </button>
            <button
              onClick={() => setMode('prodeck')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'prodeck'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              ProDeck
            </button>
          </div>

          {/* Shuffle Toggle */}
          <button
            onClick={toggleShuffle}
            className={`vk-toggle ${shuffleEnabled ? 'vk-toggle-active' : 'vk-toggle-inactive'}`}
            title={shuffleEnabled ? 'Shuffle: ON (random order)' : 'Shuffle: OFF (original order)'}
          >
            <Shuffle className={`w-4 h-4 ${shuffleEnabled ? 'animate-pulse' : ''}`} />
            Shuffle
          </button>

          {/* Tense Filter Toggle */}
          <button
            onClick={() => setShowTenseFilter(!showTenseFilter)}
            className={`vk-toggle ${tenseFilter !== 'all' ? 'vk-toggle-active' : 'vk-toggle-inactive'}`}
            title="Filter by tense"
          >
            <Filter className="w-4 h-4" />
            Tense
          </button>
        </div>

        {/* Tense Filter Dropdown */}
        {showTenseFilter && (
          <div className="inline-flex bg-slate-100 rounded-lg p-1 animate-fadeIn">
            {TENSE_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setTenseFilter(option.key);
                  const filterValue = option.key === 'all' ? null : option.key;
                  setStoreTenseFilter(filterValue);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tenseFilter === option.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Session Stats Bar */}
      <div className="flex justify-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold">{sessionStats.cardsReviewed}</span>
          <span className="text-slate-400">reviewed</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Check className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-green-600">{sessionStats.correctCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <X className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-red-600">{sessionStats.incorrectCount}</span>
        </div>
      </div>

      {/* Card Component */}
      {mode === 'typing' && (
        <TypingCard
          verb={currentCard.verb}
          tense={currentCard.tense}
          pronoun={currentCard.pronoun}
          boxLevel={boxLevel}
          onSubmit={handleSubmit}
          onOverride={handleOverride}
          onSkip={handleSkip}
          onNext={handleNext}
          onReadyForNext={handleReadyForNext}
          onPrimaryAction={handlePrimaryAction}
        />
      )}
      {mode === 'flashcard' && (
        <FlashCard
          verb={currentCard.verb}
          tense={currentCard.tense}
          pronoun={currentCard.pronoun}
          boxLevel={boxLevel}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          onNext={handleNext}
          onReadyForNext={handleReadyForNext}
          onPrimaryAction={handlePrimaryAction}
          onGradeActions={handleGradeActions}
        />
      )}
      {mode === 'prodeck' && (
        <ProDeck
          verb={currentCard.verb}
          boxLevel={boxLevel}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          onNext={handleNext}
          onReadyForNext={handleReadyForNext}
          onPrimaryAction={handlePrimaryAction}
          onGradeActions={handleGradeActions}
        />
      )}

      {/* Progress Overview */}
      <div className="mt-4 bg-white rounded-xl p-3 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600">
              <span className="font-semibold text-blue-600">{progress.due}</span> due
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              <span className="font-semibold text-amber-600">{progress.learning}</span> learning
            </span>
            <span className="text-slate-600">
              <span className="font-semibold text-green-600">{progress.mastered}</span> mastered
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
