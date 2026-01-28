'use client';

import { useEffect, useState, useRef } from 'react';
import { Check, X, Loader2, RotateCcw, ChevronRight, Keyboard, Layers, Sparkles, Zap } from 'lucide-react';
import { getSupabase, type Card } from '@/lib/supabase';

export type StudyMode = 'typing' | 'flashcard' | 'prodeck';

interface DeckStudySessionProps {
  deckId: string;
}

export default function DeckStudySession({ deckId }: DeckStudySessionProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<StudyMode>('typing');

  // Typing mode state
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flashcard mode state
  const [showAnswer, setShowAnswer] = useState(false);

  // ProDeck mode state
  const [revealLevel, setRevealLevel] = useState(0);
  const [isGrading, setIsGrading] = useState(false);

  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  // Load cards from database
  useEffect(() => {
    async function loadCards() {
      try {
        const supabase = getSupabase();
        const { data, error: fetchError } = await supabase
          .from('cards')
          .select('*')
          .eq('deck_id', deckId)
          .order('order_index');

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setError('This deck has no cards yet.');
          setLoading(false);
          return;
        }

        // Shuffle cards for variety
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setLoading(false);
      } catch (err) {
        console.error('Error loading cards:', err);
        setError('Failed to load cards. Please try again.');
        setLoading(false);
      }
    }

    loadCards();
  }, [deckId]);

  const currentCard = cards[currentIndex];

  // Reset state when changing modes or cards
  useEffect(() => {
    setUserInput('');
    setIsCorrect(null);
    setShowAnswer(false);
    setRevealLevel(0);
    setIsGrading(false);

    // Focus input in typing mode
    if (mode === 'typing') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode, currentIndex]);

  // === TYPING MODE FUNCTIONS ===
  const handleTypingSubmit = () => {
    if (!userInput.trim() || !currentCard) return;

    const correct = userInput.trim().toLowerCase() === currentCard.back.trim().toLowerCase();
    setIsCorrect(correct);

    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));
  };

  const handleTypingNext = () => {
    goToNextCard();
  };

  const handleTypingOverride = () => {
    setIsCorrect(true);
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + 1,
      incorrect: prev.incorrect - 1,
    }));
  };

  // === FLASHCARD MODE FUNCTIONS ===
  const handleFlashcardFlip = () => {
    setShowAnswer(true);
  };

  const handleFlashcardGrade = (correct: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));
    goToNextCard();
  };

  // === PRODECK MODE FUNCTIONS ===
  const handleProDeckReveal = () => {
    const answer = currentCard?.back || '';
    const maxLevel = Math.ceil(answer.length / 3);

    if (revealLevel < maxLevel) {
      setRevealLevel(revealLevel + 1);
    } else if (!isGrading) {
      setIsGrading(true);
    }
  };

  const handleProDeckGrade = (correct: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));
    goToNextCard();
  };

  // === SHARED FUNCTIONS ===
  const goToNextCard = () => {
    setUserInput('');
    setIsCorrect(null);
    setShowAnswer(false);
    setRevealLevel(0);
    setIsGrading(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Restart from beginning
      setCurrentIndex(0);
      // Reshuffle cards
      setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserInput('');
    setIsCorrect(null);
    setShowAnswer(false);
    setRevealLevel(0);
    setIsGrading(false);
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 text-sm">Loading cards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentCard) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {error || 'No cards available'}
          </h3>
          <p className="text-slate-600 text-sm">
            Add some cards to this deck to start studying.
          </p>
        </div>
      </div>
    );
  }

  // Helper function for ProDeck progressive reveal
  const getRevealedText = (text: string, level: number) => {
    const charsPerLevel = Math.ceil(text.length / 3);
    const charsToShow = Math.min(level * charsPerLevel, text.length);
    return text.substring(0, charsToShow);
  };

  // Study session UI
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

      {/* Session Stats */}
      <div className="flex justify-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold">{sessionStats.total}</span>
          <span className="text-slate-400">reviewed</span>
        </div>
        {sessionStats.total > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-600">{sessionStats.correct}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <X className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-red-600">{sessionStats.incorrect}</span>
            </div>
          </>
        )}
      </div>

      {/* TYPING MODE */}
      {mode === 'typing' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2 text-center">
              Question
            </p>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
              {currentCard.front}
            </h2>

            {isCorrect === null ? (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userInput.trim()) {
                      handleTypingSubmit();
                    }
                  }}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-center font-medium"
                />
                <button
                  onClick={handleTypingSubmit}
                  disabled={!userInput.trim()}
                  className="w-full mt-3 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Check Answer
                </button>
              </>
            ) : (
              <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {isCorrect ? (
                    <>
                      <Check className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-semibold text-green-900">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6 text-red-600" />
                      <span className="text-lg font-semibold text-red-900">Incorrect</span>
                    </>
                  )}
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-600 mb-1">Correct answer:</p>
                  <p className="text-xl font-bold text-slate-900">{currentCard.back}</p>
                </div>
                <div className="flex gap-2">
                  {!isCorrect && (
                    <button
                      onClick={handleTypingOverride}
                      className="flex-1 py-2 px-4 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                    >
                      I was right
                    </button>
                  )}
                  <button
                    onClick={handleTypingNext}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLASHCARD MODE */}
      {mode === 'flashcard' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
              Question
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              {currentCard.front}
            </h2>
          </div>

          {showAnswer ? (
            <div className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
                Answer
              </p>
              <h2 className="text-2xl font-bold text-green-900 mb-6">
                {currentCard.back}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleFlashcardGrade(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Incorrect
                </button>
                <button
                  onClick={() => handleFlashcardGrade(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Correct
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="h-32 flex items-center justify-center">
                <p className="text-slate-400 text-sm">Think about the answer...</p>
              </div>
              <button
                onClick={handleFlashcardFlip}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Show Answer
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* PRODECK MODE */}
      {mode === 'prodeck' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2 text-center">
              Question
            </p>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
              {currentCard.front}
            </h2>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2 text-center">
                Progressive Reveal
              </p>
              <p className="text-2xl font-bold text-purple-900 text-center font-mono tracking-wider">
                {revealLevel > 0 ? getRevealedText(currentCard.back, revealLevel) : '???'}
              </p>
            </div>

            {!isGrading ? (
              <button
                onClick={handleProDeckReveal}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                {revealLevel === 0 ? 'Start Revealing' : 'Reveal More'}
              </button>
            ) : (
              <div>
                <p className="text-center text-sm text-slate-600 mb-3">Did you get it right?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProDeckGrade(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Incorrect
                  </button>
                  <button
                    onClick={() => handleProDeckGrade(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    Correct
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Progress Indicator */}
      <div className="mt-4 text-center text-sm text-slate-500">
        <p>
          Card {currentIndex + 1} of {cards.length}
        </p>
      </div>

      {/* Restart Button */}
      {sessionStats.total > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Session
          </button>
        </div>
      )}
    </div>
  );
}
