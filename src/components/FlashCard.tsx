'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Check, X, ArrowRight, RotateCcw, Trophy, Layers } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';

type CardState = 'question' | 'revealed';

function getCorrectAnswer(verb: Verb, tense: TenseKey, pronoun: PronounKey): string {
  const conjugation = verb[tense];
  return conjugation[pronoun];
}

interface FlashCardProps {
  verb: Verb;
  tense: TenseKey;
  pronoun: PronounKey;
  boxLevel: number;
  onSubmit: (isCorrect: boolean) => void;
  onSkip: () => void;
  onNext: () => void;
  onReadyForNext?: (ready: boolean) => void;
}

export default function FlashCard({
  verb,
  tense,
  pronoun,
  boxLevel,
  onSubmit,
  onSkip,
  onNext,
  onReadyForNext,
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (cardState === 'question') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleReveal();
      }
    } else if (!hasGraded) {
      if (e.key === '1' || e.key === 'ArrowLeft') {
        handleGrade(false);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        handleGrade(true);
      }
    } else if (hasGraded && e.key === 'Enter') {
      onNext();
    }
  }, [cardState, hasGraded, handleReveal, handleGrade, onNext]);

  return (
    <div
      className="w-full outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Main Card */}
      <div
        className={`
          bg-white rounded-2xl shadow-xl border overflow-hidden transition-all duration-300
          ${cardState === 'question' ? 'shadow-teal-200/50 border-teal-200 cursor-pointer hover:shadow-teal-300/50' : 'shadow-slate-200/50 border-slate-200'}
        `}
        onClick={cardState === 'question' ? handleReveal : undefined}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-100" />
              <span className="text-teal-100 text-sm font-medium">Flashcard</span>
              <span className="text-white/60">•</span>
              <span className="text-teal-100 text-sm font-medium uppercase tracking-wide">
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
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              {verb.infinitive}
            </h2>
            <p className="text-slate-500 text-lg">{verb.english}</p>
          </div>

          {/* Pronoun Prompt */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 mb-5 border border-teal-100">
            <p className="text-center text-xl text-slate-700">
              <span className="text-slate-500">Conjugate for</span>{' '}
              <span className="font-bold text-teal-600 text-2xl">
                {pronouns[pronoun]}
              </span>
            </p>
          </div>

          {/* State: Question (Hidden Answer) */}
          {cardState === 'question' && (
            <div className="animate-fadeIn">
              <button
                onClick={handleReveal}
                className="w-full py-8 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Eye className="w-6 h-6 text-teal-600" />
                </div>
                <span className="text-slate-600 font-medium">Tap to reveal</span>
                <span className="text-slate-400 text-sm">or press Space</span>
              </button>
            </div>
          )}

          {/* State: Revealed (Answer) */}
          {cardState === 'revealed' && (
            <div className="animate-fadeIn">
              <div className="w-full py-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl mb-5">
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
                <p className="text-center text-slate-500 text-sm mb-3">Did you know the answer?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleGrade(false)}
                    className="flex-1 py-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 text-red-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    I forgot
                  </button>
                  <button
                    onClick={() => handleGrade(true)}
                    className="flex-1 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 text-green-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    I knew it
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <button
                  onClick={onNext}
                  className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
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
      <p className="text-center text-slate-400 text-xs mt-3">
        {cardState === 'question'
          ? 'Press Space to reveal'
          : !hasGraded
            ? '1 or ← = forgot • 2 or → = knew it'
            : 'Press Space or Enter for next card'}
      </p>
    </div>
  );
}
