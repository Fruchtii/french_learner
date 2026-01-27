'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, ArrowRight, RotateCcw, Trophy, Undo2, Keyboard } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';
import { validateAnswer } from '@/lib/validation';

type QuizState = 'answering' | 'correct' | 'incorrect';

const accentChars = ['é', 'è', 'ê', 'à', 'â', 'ù', 'û', 'ç', 'ô', 'î', 'ï', 'œ'];

function getCorrectAnswer(verb: Verb, tense: TenseKey, pronoun: PronounKey): string {
  const conjugation = verb[tense];
  return conjugation[pronoun];
}

interface TypingCardProps {
  verb: Verb;
  tense: TenseKey;
  pronoun: PronounKey;
  boxLevel: number;
  onSubmit: (isCorrect: boolean) => void;
  onOverride: () => void;
  onSkip: () => void;
  onNext: () => void;
  onReadyForNext?: (ready: boolean) => void;
}

export default function TypingCard({
  verb,
  tense,
  pronoun,
  boxLevel,
  onSubmit,
  onOverride,
  onSkip,
  onNext,
  onReadyForNext,
}: TypingCardProps) {
  const [userInput, setUserInput] = useState('');
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [wasOverridden, setWasOverridden] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and when state changes to answering
  useEffect(() => {
    if (quizState === 'answering') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quizState]);

  // Reset state when card changes
  useEffect(() => {
    setUserInput('');
    setQuizState('answering');
    setCorrectAnswer('');
    setIsShaking(false);
    setWasOverridden(false);
    onReadyForNext?.(false);
  }, [verb.id, tense, pronoun, onReadyForNext]);

  // Notify parent when ready for spacebar navigation
  useEffect(() => {
    const isReady = quizState === 'correct' || quizState === 'incorrect';
    onReadyForNext?.(isReady);
  }, [quizState, onReadyForNext]);

  const handleAccentClick = (char: string) => {
    setUserInput(prev => prev + char);
    inputRef.current?.focus();
  };

  const handleValidate = () => {
    if (quizState !== 'answering') return;

    const correct = getCorrectAnswer(verb, tense, pronoun);
    const result = validateAnswer(userInput, correct, pronoun);

    setCorrectAnswer(correct);
    onSubmit(result.isCorrect);

    if (result.isCorrect) {
      setQuizState('correct');
    } else {
      setQuizState('incorrect');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (quizState === 'answering') {
        handleValidate();
      } else {
        onNext();
      }
    }
  };

  const handleOverride = () => {
    // Call override to fix the score in the store
    onOverride();
    // Update UI to show correct state
    setQuizState('correct');
    setWasOverridden(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-200" />
            <span className="text-blue-100 text-sm font-medium">Typing</span>
            <span className="text-white/60">•</span>
            <span className="text-blue-100 text-sm font-medium uppercase tracking-wide">
              {tenseNames[tense]}
            </span>
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

      {/* Content - Compact spacing */}
      <div className="p-5">
        {/* Verb Display */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-slate-800 mb-1">
            {verb.infinitive}
          </h2>
          <p className="text-slate-500">{verb.english}</p>
        </div>

        {/* Pronoun Prompt */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
          <p className="text-center text-lg text-slate-700">
            Conjugate for:{' '}
            <span className="font-bold text-blue-600 text-xl">
              {pronouns[pronoun]}
            </span>
          </p>
        </div>

        {/* Accent Bar */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          {accentChars.map((char) => (
            <button
              key={char}
              onClick={() => handleAccentClick(char)}
              disabled={quizState !== 'answering'}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-mono text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="relative mb-4">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={quizState !== 'answering'}
            placeholder="Type your answer..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`
              w-full px-5 py-3 text-lg text-center font-mono rounded-xl border-2
              transition-all duration-200 outline-none
              ${isShaking ? 'animate-shake' : ''}
              ${quizState === 'answering'
                ? 'bg-gray-50 text-gray-900 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400'
                : ''}
              ${quizState === 'correct'
                ? 'border-green-500 bg-green-50 text-green-700'
                : ''}
              ${quizState === 'incorrect'
                ? 'border-red-500 bg-red-50 text-red-700'
                : ''}
              disabled:cursor-not-allowed
            `}
          />
        </div>

        {/* Feedback Messages */}
        {quizState === 'correct' && (
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4 animate-fadeIn">
            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-semibold">
              {wasOverridden ? 'Overridden! Moving to next box' : `Correct! Moving to Box ${Math.min(boxLevel + 1, 3)}`}
            </span>
          </div>
        )}

        {quizState === 'incorrect' && (
          <div className="text-center mb-4 animate-fadeIn">
            <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
              <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4" />
              </div>
              <span className="font-semibold">Not quite! Back to Box 0</span>
            </div>
            <p className="text-slate-600 text-sm">
              Correct answer:{' '}
              <span className="font-bold text-slate-800 font-mono">
                {correctAnswer}
              </span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {quizState === 'answering' ? (
          <button
            onClick={handleValidate}
            disabled={!userInput.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/25"
          >
            Check Answer
          </button>
        ) : (
          <div className="flex gap-2">
            {quizState === 'incorrect' && (
              <button
                onClick={handleOverride}
                className="flex-1 py-3 bg-amber-100 text-amber-700 rounded-xl font-semibold hover:bg-amber-200 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/25 flex items-center justify-center gap-2"
              >
                <Undo2 className="w-4 h-4" />
                I was right
              </button>
            )}
            <button
              onClick={onNext}
              className={`${quizState === 'incorrect' ? 'flex-1' : 'w-full'} py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/25 flex items-center justify-center gap-2`}
            >
              Next Verb
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="px-5 pb-4">
        <p className="text-center text-slate-400 text-xs">
          {quizState === 'answering'
            ? 'Press Enter to check'
            : 'Press Space or Enter for next card'}
        </p>
      </div>
    </div>
  );
}
