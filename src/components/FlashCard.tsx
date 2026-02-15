'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Check, X, ArrowRight, ArrowLeft, RotateCcw, Trophy, Layers } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';

type CardState = 'question' | 'revealed';

function getCorrectAnswer(verb: Verb, tense: TenseKey, pronoun: PronounKey): string {
  const conjugation = verb[tense];
  return conjugation[pronoun];
}

interface GradeActions {
  gradeCorrect: () => void;
  gradeIncorrect: () => void;
}

interface FlashCardProps {
  verb: Verb;
  tense: TenseKey;
  pronoun: PronounKey;
  boxLevel: number;
  onSubmit: (isCorrect: boolean) => void;
  onSkip: () => void;
  onNext: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onReadyForNext?: (ready: boolean) => void;
  onPrimaryAction?: (action: () => void) => void;
  onGradeActions?: (actions: GradeActions | null) => void;
}

export default function FlashCard({
  verb,
  tense,
  pronoun,
  boxLevel,
  onSubmit,
  onSkip,
  onNext,
  onBack,
  canGoBack = false,
  onReadyForNext,
  onPrimaryAction,
  onGradeActions,
}: FlashCardProps) {
  const [cardState, setCardState] = useState<CardState>('question');
  const [hasGraded, setHasGraded] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setCardState('question');
    setHasGraded(false);
    onReadyForNext?.(false);
  }, [verb.id, tense, pronoun, onReadyForNext]);

  // Notify parent when ready for spacebar navigation
  useEffect(() => {
    onReadyForNext?.(hasGraded);
  }, [hasGraded, onReadyForNext]);

  const correctAnswer = getCorrectAnswer(verb, tense, pronoun);

  const handleReveal = useCallback(() => {
    setCardState('revealed');
  }, []);

  const handleGrade = useCallback((isCorrect: boolean) => {
    onSubmit(isCorrect);
    setHasGraded(true);
  }, [onSubmit]);

  // Register primary action with parent for spacebar handling
  useEffect(() => {
    if (!onPrimaryAction) return;

    if (cardState === 'question') {
      onPrimaryAction(handleReveal);
    } else if (hasGraded) {
      onPrimaryAction(onNext);
    } else {
      // In grading state, no primary spacebar action (use 1/2 keys)
      onPrimaryAction(() => {});
    }
  }, [cardState, hasGraded, handleReveal, onNext, onPrimaryAction]);

  // Register grading actions with parent for keyboard handling
  useEffect(() => {
    if (!onGradeActions) return;

    // Only register when in grading state (revealed but not yet graded)
    if (cardState === 'revealed' && !hasGraded) {
      onGradeActions({
        gradeCorrect: () => handleGrade(true),
        gradeIncorrect: () => handleGrade(false),
      });
    } else {
      onGradeActions(null);
    }
  }, [cardState, hasGraded, handleGrade, onGradeActions]);

  return (
    <div className="w-full"
    >
      {/* Main Card */}
      <div
        className={`
          bg-white dark:bg-slate-900 rounded-2xl shadow-xl border overflow-hidden transition-all duration-300
          ${cardState === 'question' ? 'shadow-slate-400/30 dark:shadow-slate-900/50 border-slate-300 dark:border-slate-600 cursor-pointer hover:shadow-slate-500/40' : 'shadow-slate-300/50 dark:shadow-slate-900/50 border-slate-200 dark:border-slate-700'}
        `}
        onClick={cardState === 'question' ? handleReveal : undefined}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-300" />
              <span className="text-slate-300 text-sm font-medium">Flashcard</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-300 text-sm font-medium uppercase tracking-wide">
                {tenseNames[tense]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" />
                <span className="text-xs font-medium">Box {boxLevel}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSkip(); }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Skip to new verb"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Verb Display */}
          <div className="text-center mb-5">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {verb.infinitive}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">{verb.english}</p>
          </div>

          {/* Pronoun Prompt */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 rounded-xl p-5 mb-5 border border-slate-200 dark:border-slate-700">
            <p className="text-center text-xl text-slate-800 dark:text-slate-100">
              <span className="text-slate-600 dark:text-slate-400">Conjugate for</span>{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100 text-2xl">
                {pronouns[pronoun]}
              </span>
            </p>
          </div>

          {/* State: Question (Hidden Answer) */}
          {cardState === 'question' && (
            <div className="animate-fadeIn">
              <button
                onClick={handleReveal}
                className="w-full py-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors">
                  <Eye className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-medium">Tap to reveal</span>
                <span className="text-slate-400 dark:text-slate-500 text-sm">or press Space</span>
              </button>
            </div>
          )}

          {/* State: Revealed (Answer) */}
          {cardState === 'revealed' && (
            <div className="animate-fadeIn">
              <div className="w-full py-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl mb-5">
                <p className="text-center text-3xl font-mono font-bold text-white">
                  {correctAnswer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Self-Grading Section - Only when revealed */}
        {cardState === 'revealed' && (
          <div className="px-6 pb-6">
            {!hasGraded ? (
              <div className="animate-fadeIn">
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-3">Did you know the answer?</p>
                <div className="flex gap-3">
                  {canGoBack && onBack && (
                    <button
                      onClick={onBack}
                      className="px-3 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                      title="Go back to previous card"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleGrade(false)}
                    className="flex-1 py-4 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    I forgot
                  </button>
                  <button
                    onClick={() => handleGrade(true)}
                    className="flex-1 py-4 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 text-green-700 dark:text-green-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    I knew it
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn flex gap-2">
                {canGoBack && onBack && (
                  <button
                    onClick={onBack}
                    className="px-3 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                    title="Go back to previous card"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onNext}
                  className="flex-1 py-4 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Next Card
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-3">
        {cardState === 'question'
          ? 'Press Space to reveal'
          : !hasGraded
            ? '1 or ← = forgot • 2 or → = knew it'
            : 'Press Space or Enter for next card'}
      </p>
    </div>
  );
}
