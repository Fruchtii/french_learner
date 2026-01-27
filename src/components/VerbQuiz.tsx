'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, ArrowRight, RotateCcw, Clock, Zap, Trophy } from 'lucide-react';
import { tenseNames, pronouns, type Verb, type TenseKey, type PronounKey } from '@/data/verbs';
import { useStudyStore } from '@/store/useStudyStore';

type QuizState = 'answering' | 'correct' | 'incorrect';

const accentChars = ['é', 'è', 'ê', 'à', 'â', 'ù', 'û', 'ç', 'ô', 'î', 'ï', 'œ'];

function getCorrectAnswer(verb: Verb, tense: TenseKey, pronoun: PronounKey): string {
  const conjugation = verb[tense];
  return conjugation[pronoun];
}

export default function VerbQuiz() {
  // Store state and actions
  const {
    currentCard,
    sessionStats,
    userProgress,
    initializeCards,
    submitResult,
    selectNextCard,
    getProgress,
  } = useStudyStore();

  // Local UI state
  const [userInput, setUserInput] = useState('');
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [currentBoxLevel, setCurrentBoxLevel] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize cards on mount
  useEffect(() => {
    initializeCards();
  }, [initializeCards]);

  // Focus input when card changes
  useEffect(() => {
    if (currentCard && quizState === 'answering') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentCard, quizState]);

  // Get current card's box level for display
  useEffect(() => {
    if (currentCard) {
      const progress = userProgress[currentCard.cardId];
      if (progress) {
        setCurrentBoxLevel(progress.box);
      }
    }
  }, [currentCard, userProgress]);

  const handleAccentClick = (char: string) => {
    setUserInput(prev => prev + char);
    inputRef.current?.focus();
  };

  const validateAnswer = () => {
    if (!currentCard || quizState !== 'answering') return;

    const correct = getCorrectAnswer(currentCard.verb, currentCard.tense, currentCard.pronoun);
    const normalizedUser = userInput.trim().toLowerCase();
    const normalizedCorrect = correct.toLowerCase();
    const isCorrect = normalizedUser === normalizedCorrect;

    // Update store with result
    submitResult(currentCard.verb.id, currentCard.tense, currentCard.pronoun, isCorrect);

    // Update UI state
    setCorrectAnswer(correct);

    if (isCorrect) {
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
        validateAnswer();
      } else {
        handleNextCard();
      }
    }
  };

  const handleNextCard = () => {
    selectNextCard();
    setUserInput('');
    setQuizState('answering');
    setCorrectAnswer('');
    setIsShaking(false);
  };

  const handleSkip = () => {
    // Skip without recording result
    selectNextCard();
    setUserInput('');
    setQuizState('answering');
    setCorrectAnswer('');
    setIsShaking(false);
  };

  // Get progress stats
  const progress = getProgress();

  // Loading state
  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Session Stats Bar */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center gap-2 text-slate-600">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">
            <span className="font-semibold">{sessionStats.cardsReviewed}</span> reviewed
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm">
            <span className="font-semibold text-green-600">{sessionStats.correctCount}</span> correct
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <X className="w-4 h-4 text-red-500" />
          <span className="text-sm">
            <span className="font-semibold text-red-600">{sessionStats.incorrectCount}</span> wrong
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <span className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                {tenseNames[currentCard.tense]}
              </span>
              {/* Box Level Indicator */}
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <Trophy className="w-3 h-3" />
                <span className="text-xs font-medium">Box {currentBoxLevel}</span>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Skip to new verb"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Verb Display */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              {currentCard.verb.infinitive}
            </h2>
            <p className="text-slate-500 text-lg">{currentCard.verb.english}</p>
          </div>

          {/* Pronoun Prompt */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <p className="text-center text-lg text-slate-700">
              Conjugate for:{' '}
              <span className="font-bold text-blue-600 text-xl">
                {pronouns[currentCard.pronoun]}
              </span>
            </p>
          </div>

          {/* Accent Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {accentChars.map((char) => (
              <button
                key={char}
                onClick={() => handleAccentClick(char)}
                disabled={quizState !== 'answering'}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-mono text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Input Field */}
          <div className="relative mb-6">
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
                w-full px-6 py-4 text-xl text-center font-mono rounded-xl border-2
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
            <div className="flex items-center justify-center gap-2 text-green-600 mb-6 animate-fadeIn">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">Correct! Moving to Box {Math.min(currentBoxLevel + 1, 3)}</span>
            </div>
          )}

          {quizState === 'incorrect' && (
            <div className="text-center mb-6 animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">Not quite! Back to Box 0</span>
              </div>
              <p className="text-slate-600">
                The correct answer is:{' '}
                <span className="font-bold text-slate-800 font-mono text-lg">
                  {correctAnswer}
                </span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {quizState === 'answering' ? (
            <button
              onClick={validateAnswer}
              disabled={!userInput.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/25"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNextCard}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/25 flex items-center justify-center gap-2"
            >
              Next Verb
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600">
              <span className="font-semibold text-blue-600">{progress.due}</span> cards due
            </span>
          </div>
          <div className="flex items-center gap-4">
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
      <p className="text-center text-slate-400 text-sm mt-4">
        Press <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600">Enter</kbd> to submit
      </p>
    </div>
  );
}
