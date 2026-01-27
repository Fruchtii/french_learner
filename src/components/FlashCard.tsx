'use client';

import { useState, useEffect } from 'react';
import { Eye, Check, X, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';

type FlashCardState = 'hidden' | 'revealed';

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
}

export default function FlashCard({
  verb,
  tense,
  pronoun,
  boxLevel,
  onSubmit,
  onSkip,
  onNext,
}: FlashCardProps) {
  const [cardState, setCardState] = useState<FlashCardState>('hidden');
  const [hasAnswered, setHasAnswered] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setCardState('hidden');
    setHasAnswered(false);
  }, [verb.id, tense, pronoun]);

  const correctAnswer = getCorrectAnswer(verb, tense, pronoun);

  const handleReveal = () => {
    setCardState('revealed');
  };

  const handleAnswer = (isCorrect: boolean) => {
    onSubmit(isCorrect);
    setHasAnswered(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && cardState === 'hidden') {
      e.preventDefault();
      handleReveal();
    } else if (cardState === 'revealed' && !hasAnswered) {
      if (e.key === '1' || e.key === 'ArrowLeft') {
        handleAnswer(false);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        handleAnswer(true);
      }
    } else if (hasAnswered && e.key === 'Enter') {
      onNext();
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="text-purple-100 text-sm font-medium uppercase tracking-wide">
              {tenseNames[tense]}
            </span>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
              <Trophy className="w-3 h-3" />
              <span className="text-xs font-medium">Box {boxLevel}</span>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Skip to new verb"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Verb Display */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-slate-800 mb-1">
            {verb.infinitive}
          </h2>
          <p className="text-slate-500">{verb.english}</p>
        </div>

        {/* Pronoun Prompt */}
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="text-center text-lg text-slate-700">
            Conjugate for:{' '}
            <span className="font-bold text-purple-600 text-xl">
              {pronouns[pronoun]}
            </span>
          </p>
        </div>

        {/* Answer Area */}
        <div className="mb-4">
          {cardState === 'hidden' ? (
            <button
              onClick={handleReveal}
              className="w-full py-8 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-dashed border-slate-300 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Eye className="w-6 h-6 text-slate-500" />
              <span className="text-slate-600 font-medium">Click to reveal answer</span>
              <span className="text-slate-400 text-sm">or press Space</span>
            </button>
          ) : (
            <div className="w-full py-6 bg-purple-50 rounded-xl border-2 border-purple-200">
              <p className="text-center text-2xl font-mono font-bold text-purple-700">
                {correctAnswer}
              </p>
            </div>
          )}
        </div>

        {/* Feedback after answering */}
        {hasAnswered && (
          <div className="text-center mb-4 animate-fadeIn">
            <p className="text-slate-600">Answer recorded!</p>
          </div>
        )}

        {/* Action Buttons */}
        {cardState === 'hidden' ? (
          <button
            onClick={handleReveal}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-500/25 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Reveal Answer
          </button>
        ) : !hasAnswered ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors focus:outline-none focus:ring-4 focus:ring-red-500/25 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Didn&apos;t know
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors focus:outline-none focus:ring-4 focus:ring-green-500/25 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Got it!
            </button>
          </div>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-500/25 flex items-center justify-center gap-2"
          >
            Next Verb
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="px-5 pb-4">
        <p className="text-center text-slate-400 text-xs">
          {cardState === 'hidden'
            ? 'Press Space to reveal'
            : !hasAnswered
              ? 'Press 1 or ← for wrong, 2 or → for correct'
              : 'Press Enter for next card'}
        </p>
      </div>
    </div>
  );
}
