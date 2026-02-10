'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Check, X, ArrowRight, ArrowLeft, RotateCcw, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';

// All 4 tenses in order of reveal
const TENSE_ORDER: TenseKey[] = ['present', 'passeCompose', 'imparfait', 'futurSimple'];

// Colors for each tense
const TENSE_COLORS: Record<TenseKey, { bg: string; border: string; text: string; badge: string }> = {
  present: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  passeCompose: { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  imparfait: { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  futurSimple: { bg: 'from-rose-50 to-rose-100', border: 'border-rose-200', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
};

function getAllConjugations(verb: Verb, tense: TenseKey): { pronoun: PronounKey; label: string; value: string }[] {
  const conjugation = verb[tense];
  const pronounKeys: PronounKey[] = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

  return pronounKeys.map(key => ({
    pronoun: key,
    label: pronouns[key],
    value: conjugation[key],
  }));
}

// Types for the component state
type ProDeckState = 'waiting' | 'revealing' | 'grading' | 'finished';

interface GradeActions {
  gradeCorrect: () => void;
  gradeIncorrect: () => void;
}

interface ProDeckProps {
  verb: Verb;
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

export default function ProDeck({
  verb,
  boxLevel,
  onSubmit,
  onSkip,
  onNext,
  onBack,
  canGoBack = false,
  onReadyForNext,
  onPrimaryAction,
  onGradeActions,
}: ProDeckProps) {
  // revealStep: 0 = nothing, 1 = présent, 2 = +passé composé, 3 = +imparfait, 4 = +futur (all 4)
  const [revealStep, setRevealStep] = useState(0);
  const [hasGraded, setHasGraded] = useState(false);

  // Derived state
  const state: ProDeckState =
    revealStep === 0 ? 'waiting' :
    revealStep < 4 ? 'revealing' :
    !hasGraded ? 'grading' : 'finished';

  // Reset state when verb changes
  useEffect(() => {
    setRevealStep(0);
    setHasGraded(false);
    onReadyForNext?.(false);
  }, [verb.id, onReadyForNext]);

  // Notify parent when ready for next (after grading)
  useEffect(() => {
    onReadyForNext?.(hasGraded);
  }, [hasGraded, onReadyForNext]);

  // Reveal next tense
  const handleRevealNext = useCallback(() => {
    if (revealStep < 4) {
      setRevealStep(prev => prev + 1);
    }
  }, [revealStep]);

  // Grade the attempt
  const handleGrade = useCallback((isCorrect: boolean) => {
    onSubmit(isCorrect);
    setHasGraded(true);
  }, [onSubmit]);

  // Register primary action with parent for spacebar handling
  useEffect(() => {
    if (!onPrimaryAction) return;

    if (state === 'waiting' || state === 'revealing') {
      onPrimaryAction(handleRevealNext);
    } else if (state === 'finished') {
      onPrimaryAction(onNext);
    } else {
      // In grading state, no primary spacebar action (use 1/2 keys)
      onPrimaryAction(() => {});
    }
  }, [state, handleRevealNext, onNext, onPrimaryAction]);

  // Register grading actions with parent for keyboard handling
  useEffect(() => {
    if (!onGradeActions) return;

    // Only register when in grading state
    if (state === 'grading') {
      onGradeActions({
        gradeCorrect: () => handleGrade(true),
        gradeIncorrect: () => handleGrade(false),
      });
    } else {
      onGradeActions(null);
    }
  }, [state, handleGrade, onGradeActions]);

  // Get revealed tenses - one at a time
  // Step 0: nothing, Step 1: présent, Step 2: +passé composé, Step 3: +imparfait, Step 4: +futur
  const revealedTenses = TENSE_ORDER.slice(0, revealStep);

  const nextTenseName =
    revealStep < 4 ? tenseNames[TENSE_ORDER[revealStep]] : null;

  return (
    <div className="w-full outline-none">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-purple-200/50 border border-purple-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="text-purple-100 text-sm font-medium">ProDeck</span>
              <span className="text-white/60">•</span>
              <span className="text-white text-sm font-semibold">Full Verb Drill</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" />
                <span className="text-xs font-medium">Box {boxLevel}</span>
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
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Verb Display */}
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-slate-900 mb-1">
              {verb.infinitive}
            </h2>
            <p className="text-slate-600 text-lg">{verb.english}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {TENSE_ORDER.map((tense, i) => (
              <div
                key={tense}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < revealStep ? 'bg-purple-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* State: Waiting (Nothing revealed) */}
          {state === 'waiting' && (
            <div className="animate-fadeIn">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-4 border border-purple-100">
                <p className="text-center text-slate-600">
                  Can you conjugate all 4 tenses?
                </p>
              </div>
              <button
                onClick={handleRevealNext}
                className="w-full py-8 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Eye className="w-7 h-7 text-purple-600" />
                </div>
                <span className="text-slate-600 font-medium text-lg">Tap to reveal {tenseNames.present}</span>
                <span className="text-slate-400 text-sm">or press Space</span>
              </button>
            </div>
          )}

          {/* State: Revealing / Grading / Finished (Show tense tables) */}
          {revealStep > 0 && (
            <div className="space-y-3 animate-fadeIn">
              {/* 2x2 Grid of Tense Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {revealedTenses.map((tense) => {
                  const colors = TENSE_COLORS[tense];
                  const conjugations = getAllConjugations(verb, tense);

                  return (
                    <div
                      key={tense}
                      className={`bg-gradient-to-br ${colors.bg} rounded-xl p-3 border ${colors.border} animate-fadeIn`}
                    >
                      {/* Tense Header */}
                      <div className={`inline-flex items-center gap-1 ${colors.badge} px-2 py-1 rounded-md text-xs font-semibold mb-2`}>
                        {tenseNames[tense]}
                      </div>

                      {/* Conjugation Grid */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {conjugations.map(({ pronoun, label, value }) => (
                          <div
                            key={pronoun}
                            className="flex justify-between items-center px-2 py-1.5 bg-white/80 rounded-md text-sm"
                          >
                            <span className={`${colors.text} font-medium text-xs`}>{label}</span>
                            <span className="font-mono font-bold text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reveal Next Button (if not all revealed) */}
              {state === 'revealing' && nextTenseName && (
                <button
                  onClick={handleRevealNext}
                  className="w-full py-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 border border-purple-200"
                >
                  Reveal {nextTenseName}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grading Section - Only when all tenses revealed */}
        {state === 'grading' && (
          <div className="px-5 pb-5 animate-fadeIn">
            <p className="text-center text-slate-500 text-sm mb-3">How well did you know all the tenses?</p>
            <div className="flex gap-3">
              {canGoBack && onBack && (
                <button
                  onClick={onBack}
                  className="px-3 py-4 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center"
                  title="Go back to previous card"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleGrade(false)}
                className="flex-1 py-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 text-red-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                I struggled
              </button>
              <button
                onClick={() => handleGrade(true)}
                className="flex-1 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 text-green-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                I knew it all
              </button>
            </div>
          </div>
        )}

        {/* Next Button - Only after grading */}
        {state === 'finished' && (
          <div className="px-5 pb-5 animate-fadeIn flex gap-2">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="px-3 py-4 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center"
                title="Go back to previous card"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onNext}
              className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Next Verb
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <p className="text-center text-slate-400 text-xs mt-3">
        {state === 'waiting' && 'Press Space to reveal'}
        {state === 'revealing' && 'Press Space to reveal next tense'}
        {state === 'grading' && '1 or ← = struggled • 2 or → = knew it'}
        {state === 'finished' && 'Press Space or Enter for next verb'}
      </p>
    </div>
  );
}
