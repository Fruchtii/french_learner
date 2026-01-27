'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Check, X, Zap, Clock, Keyboard, Sparkles, Layers } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import TypingCard from './TypingCard';
import FlashCard from './FlashCard';
import ProDeck from './ProDeck';

export type StudyMode = 'typing' | 'flashcard' | 'prodeck';

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

  // Ref to store the current primary action (set by child components)
  const primaryActionRef = useRef<(() => void) | null>(null);

  // Ref to store grading actions (set by child components when in grading state)
  const gradeActionsRef = useRef<GradeActions | null>(null);

  const {
    currentCard,
    sessionStats,
    userProgress,
    initializeCards,
    submitResult,
    selectNextCard,
    getProgress,
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

  // Global keyboard handler - window-level for reliability
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CRITICAL: Strictly ignore keyboard shortcuts when typing in INPUT/TEXTAREA
      const target = e.target as HTMLElement;
      const tagName = target.tagName;

      if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        return; // User is typing - don't interfere
      }

      // Handle Spacebar
      if (e.key === ' ') {
        e.preventDefault(); // Prevent page scroll

        // Mode-specific behavior via primaryActionRef:
        // - typing mode: Next card (when result is visible)
        // - flashcard mode: Flip / Next
        // - prodeck mode: Progressive reveal
        if (primaryActionRef.current) {
          primaryActionRef.current();
        } else if (readyForNext) {
          // Fallback: if ready for next, go to next card
          selectNextCard();
          setReadyForNext(false);
        }
      }

      // Handle Enter key (Next card when ready)
      if (e.key === 'Enter') {
        if (readyForNext) {
          selectNextCard();
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
    };

    // Attach to window for global keyboard handling
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readyForNext, selectNextCard]);

  // Initialize cards on mount
  useEffect(() => {
    initializeCards();
  }, [initializeCards]);

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
    selectNextCard();
  };

  // Handle next card
  const handleNext = () => {
    selectNextCard();
  };

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
      {/* Mode Switcher */}
      <div className="flex justify-center mb-4">
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
