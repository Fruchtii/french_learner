'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Check, X, ArrowRight, RotateCcw, Trophy, Sparkles, Table } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';

type CardState = 'question' | 'revealed';

function getAllConjugations(verb: Verb, tense: TenseKey): { pronoun: PronounKey; label: string; value: string }[] {
  const conjugation = verb[tense];
  const pronounKeys: PronounKey[] = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

  return pronounKeys.map(key => ({
    pronoun: key,
    label: pronouns[key],
    value: conjugation[key],
  }));
}

interface ProDeckProps {
  verb: Verb;
  tense: TenseKey;
  boxLevel: number;
  onSubmit: (isCorrect: boolean) => void;
  onSkip: () => void;
  onNext: () => void;
  onReadyForNext?: (ready: boolean) => void;
}

export default function ProDeck({
  verb,
  tense,
  boxLevel,
  onSubmit,
  onSkip,
  onNext,
  onReadyForNext,
}: ProDeckProps) {
  const [cardState, setCardState] = useState<CardState>('question');
  const [hasGraded, setHasGraded] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setCardState('question');
    setHasGraded(false);
    onReadyForNext?.(false);
  }, [verb.id, tense, onReadyForNext]);

  // Notify parent when ready for spacebar navigation
  useEffect(() => {
    onReadyForNext?.(hasGraded);
  }, [hasGraded, onReadyForNext]);

  const allConjugations = getAllConjugations(verb, tense);

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
          ${cardState === 'question' ? 'shadow-purple-200/50 border-purple-200 cursor-pointer hover:shadow-purple-300/50' : 'shadow-slate-200/50 border-slate-200'}
        `}
        onClick={cardState === 'question' ? handleReveal : undefined}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="text-purple-100 text-sm font-medium">ProDeck</span>
              <span className="text-white/60">•</span>
              <span className="text-white text-sm font-semibold">Full Table</span>
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
          {/* Question Section */}
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              {verb.infinitive}
            </h2>
            <p className="text-slate-500 text-lg mb-4">{verb.english}</p>

            {/* Tense Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
              <Table className="w-4 h-4" />
              <span className="font-semibold">{tenseNames[tense]}</span>
            </div>
          </div>

          {/* Challenge Text */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-5 border border-purple-100">
            <p className="text-center text-slate-600">
              {cardState === 'question'
                ? 'Can you conjugate all 6 pronouns?'
                : 'Review the full conjugation table:'}
            </p>
          </div>

          {/* State: Question (Hidden Table) */}
          {cardState === 'question' && (
            <div className="animate-fadeIn">
              <button
                onClick={handleReveal}
                className="w-full py-10 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Eye className="w-7 h-7 text-purple-600" />
                </div>
                <span className="text-slate-600 font-medium text-lg">Tap to reveal table</span>
                <span className="text-slate-400 text-sm">or press Space</span>
              </button>
            </div>
          )}

          {/* State: Revealed (Full Table) */}
          {cardState === 'revealed' && (
            <div className="animate-fadeIn">
              {/* Full Conjugation Table */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-5 border border-purple-200">
                <div className="grid grid-cols-2 gap-2">
                  {allConjugations.map(({ pronoun, label, value }) => (
                    <div
                      key={pronoun}
                      className="flex justify-between items-center px-4 py-3 bg-white rounded-lg border border-purple-100 shadow-sm"
                    >
                      <span className="text-purple-600 font-medium">{label}</span>
                      <span className="font-mono font-bold text-slate-800 text-lg">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Self-Grading Section - Only when revealed */}
        {cardState === 'revealed' && (
          <div className="px-6 pb-6">
            {!hasGraded ? (
              <div className="animate-fadeIn">
                <p className="text-center text-slate-500 text-sm mb-3">How well did you know the table?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleGrade(false)}
                    className="flex-1 py-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 text-red-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    I missed some
                  </button>
                  <button
                    onClick={() => handleGrade(true)}
                    className="flex-1 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 text-green-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    I knew the table
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <button
                  onClick={onNext}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
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
            ? '1 or ← = missed some • 2 or → = knew it'
            : 'Press Space or Enter for next card'}
      </p>
    </div>
  );
}
