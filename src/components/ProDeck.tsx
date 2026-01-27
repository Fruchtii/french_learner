'use client';

import { useState, useEffect } from 'react';
import { Eye, Check, X, ArrowRight, RotateCcw, Trophy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';

type CardState = 'question' | 'revealed' | 'fullTable';

function getCorrectAnswer(verb: Verb, tense: TenseKey, pronoun: PronounKey): string {
  const conjugation = verb[tense];
  return conjugation[pronoun];
}

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
  pronoun: PronounKey;
  boxLevel: number;
  onSubmit: (isCorrect: boolean) => void;
  onSkip: () => void;
  onNext: () => void;
}

export default function ProDeck({
  verb,
  tense,
  pronoun,
  boxLevel,
  onSubmit,
  onSkip,
  onNext,
}: ProDeckProps) {
  const [cardState, setCardState] = useState<CardState>('question');
  const [hasGraded, setHasGraded] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setCardState('question');
    setHasGraded(false);
  }, [verb.id, tense, pronoun]);

  const correctAnswer = getCorrectAnswer(verb, tense, pronoun);
  const allConjugations = getAllConjugations(verb, tense);

  const handleReveal = () => {
    setCardState('revealed');
  };

  const handleShowFullTable = () => {
    setCardState('fullTable');
  };

  const handleCollapseTable = () => {
    setCardState('revealed');
  };

  const handleGrade = (isCorrect: boolean) => {
    onSubmit(isCorrect);
    setHasGraded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      } else if (e.key === 't' || e.key === 'Tab') {
        e.preventDefault();
        if (cardState === 'revealed') {
          handleShowFullTable();
        } else {
          handleCollapseTable();
        }
      }
    } else if (hasGraded && e.key === 'Enter') {
      onNext();
    }
  };

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
              <span className="text-purple-100 text-sm font-medium uppercase tracking-wide">
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
          {/* Question Section - Always visible */}
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              {verb.infinitive}
            </h2>
            <p className="text-slate-500 text-lg">{verb.english}</p>
          </div>

          {/* Pronoun Prompt */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 mb-5 border border-purple-100">
            <p className="text-center text-xl text-slate-700">
              <span className="text-slate-500">Conjugate for</span>{' '}
              <span className="font-bold text-purple-600 text-2xl">
                {pronouns[pronoun]}
              </span>
            </p>
          </div>

          {/* State: Question (Hidden Answer) */}
          {cardState === 'question' && (
            <div className="animate-fadeIn">
              <button
                onClick={handleReveal}
                className="w-full py-10 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Eye className="w-7 h-7 text-purple-600" />
                </div>
                <span className="text-slate-600 font-medium text-lg">Tap to reveal answer</span>
                <span className="text-slate-400 text-sm">or press Space</span>
              </button>
            </div>
          )}

          {/* State: Revealed (Single Answer) */}
          {cardState === 'revealed' && (
            <div className="animate-fadeIn">
              {/* Answer Display */}
              <div className="w-full py-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mb-4">
                <p className="text-center text-3xl font-mono font-bold text-white">
                  {correctAnswer}
                </p>
              </div>

              {/* Show Full Table Button */}
              <button
                onClick={handleShowFullTable}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 text-slate-600 font-medium"
              >
                <ChevronDown className="w-4 h-4" />
                Show Full Conjugation Table
              </button>
            </div>
          )}

          {/* State: Full Table */}
          {cardState === 'fullTable' && (
            <div className="animate-fadeIn">
              {/* Answer Display */}
              <div className="w-full py-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mb-4">
                <p className="text-center text-2xl font-mono font-bold text-white">
                  {pronouns[pronoun]}: {correctAnswer}
                </p>
              </div>

              {/* Full Conjugation Table */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 text-center">
                  Full {tenseNames[tense]} Conjugation
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {allConjugations.map(({ pronoun: p, label, value }) => (
                    <div
                      key={p}
                      className={`
                        flex justify-between items-center px-3 py-2 rounded-lg
                        ${p === pronoun
                          ? 'bg-purple-100 border border-purple-300'
                          : 'bg-white border border-slate-200'}
                      `}
                    >
                      <span className={`text-sm ${p === pronoun ? 'text-purple-700 font-semibold' : 'text-slate-500'}`}>
                        {label}
                      </span>
                      <span className={`font-mono font-medium ${p === pronoun ? 'text-purple-700' : 'text-slate-700'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collapse Button */}
              <button
                onClick={handleCollapseTable}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 text-slate-600 text-sm"
              >
                <ChevronUp className="w-4 h-4" />
                Collapse Table
              </button>
            </div>
          )}
        </div>

        {/* Self-Grading Section - Only when revealed */}
        {cardState !== 'question' && (
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
            ? '1 or ← = forgot • 2 or → = knew • T = toggle table'
            : 'Press Enter for next card'}
      </p>
    </div>
  );
}
