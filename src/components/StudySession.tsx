'use client';

import { useEffect, useState } from 'react';
import { Check, X, Zap, Clock, Keyboard, Layers } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import TypingCard from './TypingCard';
import FlashCard from './FlashCard';

export type StudyMode = 'typing' | 'flashcard';

interface StudySessionProps {
  initialMode?: StudyMode;
}

export default function StudySession({ initialMode = 'typing' }: StudySessionProps) {
  const [mode, setMode] = useState<StudyMode>(initialMode);

  const {
    currentCard,
    sessionStats,
    userProgress,
    initializeCards,
    submitResult,
    selectNextCard,
    getProgress,
  } = useStudyStore();

  // Initialize cards on mount
  useEffect(() => {
    initializeCards();
  }, [initializeCards]);

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
    // Submit a correct answer to offset the previous wrong one
    // The store will increment the box and adjust stats
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
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'flashcard'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Flashcard
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
      {mode === 'typing' ? (
        <TypingCard
          verb={currentCard.verb}
          tense={currentCard.tense}
          pronoun={currentCard.pronoun}
          boxLevel={boxLevel}
          onSubmit={handleSubmit}
          onOverride={handleOverride}
          onSkip={handleSkip}
          onNext={handleNext}
        />
      ) : (
        <FlashCard
          verb={currentCard.verb}
          tense={currentCard.tense}
          pronoun={currentCard.pronoun}
          boxLevel={boxLevel}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          onNext={handleNext}
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

      {/* Keyboard hint */}
      <p className="text-center text-slate-400 text-xs mt-3">
        Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">Enter</kbd> to continue
      </p>
    </div>
  );
}
