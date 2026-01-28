'use client';

import { useEffect, useState } from 'react';
import { Check, X, Loader2, RotateCcw, ChevronRight } from 'lucide-react';
import { getSupabase, type Card } from '@/lib/supabase';

interface DeckStudySessionProps {
  deckId: string;
}

export default function DeckStudySession({ deckId }: DeckStudySessionProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
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

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleCorrect = () => {
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + 1,
      total: prev.total + 1,
    }));
    goToNextCard();
  };

  const handleIncorrect = () => {
    setSessionStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      total: prev.total + 1,
    }));
    goToNextCard();
  };

  const goToNextCard = () => {
    setShowAnswer(false);
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
    setShowAnswer(false);
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

  // Study session UI
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Session Stats */}
      <div className="flex justify-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="font-semibold">{currentIndex + 1}</span>
          <span className="text-slate-400">/ {cards.length}</span>
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

      {/* Flashcard */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Question (Front) */}
        <div className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
            Question
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {currentCard.front}
          </h2>
        </div>

        {/* Answer (Back) */}
        {showAnswer ? (
          <div className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
              Answer
            </p>
            <h2 className="text-2xl font-bold text-green-900">
              {currentCard.back}
            </h2>

            {/* Grading Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleIncorrect}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                <X className="w-5 h-5" />
                Incorrect
              </button>
              <button
                onClick={handleCorrect}
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
              <p className="text-slate-400 text-sm mb-4">Think about the answer...</p>
            </div>
            <button
              onClick={handleShowAnswer}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Show Answer
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-4 text-center text-xs text-slate-500">
        <p>
          Press <kbd className="px-2 py-1 bg-slate-200 rounded font-mono">Space</kbd> to reveal answer
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
