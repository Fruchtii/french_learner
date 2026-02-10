'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Check, X, Loader2, RotateCcw, Keyboard, Layers, Sparkles, Zap, ArrowLeftRight, Shuffle, Clock, Trophy, ArrowRight, ArrowLeft, Undo2, Eye } from 'lucide-react';
import { useDeckStudyStore } from '@/store/useDeckStudyStore';
import { getSupabase } from '@/lib/supabase';
import { diffAnswers } from '@/lib/validation';

export type StudyMode = 'typing' | 'flashcard' | 'prodeck';

interface DeckStudySessionProps {
  deckId: string;
}

const accentChars = ['é', 'è', 'ê', 'à', 'â', 'ù', 'û', 'ç', 'ô', 'î', 'ï', 'œ'];

export default function DeckStudySession({ deckId }: DeckStudySessionProps) {
  const [mode, setMode] = useState<StudyMode>('typing');

  // Typing mode state
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wasOverridden, setWasOverridden] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flashcard mode state
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasGraded, setHasGraded] = useState(false);

  // ProDeck mode state
  const [revealLevel, setRevealLevel] = useState(0);
  const [isGrading, setIsGrading] = useState(false);

  // Store
  const {
    currentCard,
    loading,
    error,
    sessionStats,
    shuffleEnabled,
    isFlipped,
    loadDeck,
    setUser,
    submitResult,
    overrideResult,
    selectNextCard,
    toggleShuffle,
    toggleFlip,
    restart,
    getProgress,
    getBoxLevel,
    goBack,
    cardHistory,
  } = useDeckStudyStore();

  // Load deck and check auth on mount
  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user.id);
      }
      loadDeck(deckId);
    }
    init();
  }, [deckId, loadDeck, setUser]);

  const boxLevel = currentCard ? getBoxLevel(currentCard.id) : 0;
  const progress = getProgress();

  // Helper functions for question/answer based on flip state
  const getQuestion = useCallback(() => {
    if (!currentCard) return '';
    return isFlipped ? currentCard.back : currentCard.front;
  }, [currentCard, isFlipped]);

  const getAnswer = useCallback(() => {
    if (!currentCard) return '';
    return isFlipped ? currentCard.front : currentCard.back;
  }, [currentCard, isFlipped]);

  // Reset local UI state when card or mode changes
  useEffect(() => {
    setUserInput('');
    setIsCorrect(null);
    setWasOverridden(false);
    setIsShaking(false);
    setShowAnswer(false);
    setHasGraded(false);
    setRevealLevel(0);
    setIsGrading(false);

    if (mode === 'typing') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode, currentCard?.id]);

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();

        if (mode === 'typing' && isCorrect !== null) {
          goToNextCard();
        } else if (mode === 'flashcard') {
          if (!showAnswer) setShowAnswer(true);
          else if (hasGraded) goToNextCard();
        } else if (mode === 'prodeck') {
          if (!isGrading) handleProDeckReveal();
          else if (isGrading && hasGraded) goToNextCard();
        }
      }

      // Grading shortcuts (1/← = incorrect, 2/→ = correct)
      if (mode === 'flashcard' && showAnswer && !hasGraded) {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleFlashcardGrade(false);
        } else if (e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleFlashcardGrade(true);
        }
      }

      if (mode === 'prodeck' && isGrading && !hasGraded) {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleProDeckGrade(false);
        } else if (e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleProDeckGrade(true);
        }
      }

      // ArrowRight for next when done
      if (e.key === 'ArrowRight' && !isGrading) {
        if (mode === 'typing' && isCorrect !== null) {
          e.preventDefault();
          goToNextCard();
        } else if (mode === 'flashcard' && hasGraded) {
          e.preventDefault();
          goToNextCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isCorrect, showAnswer, hasGraded, isGrading, revealLevel]);

  // === TYPING MODE ===
  const handleTypingSubmit = () => {
    if (!userInput.trim() || !currentCard) return;

    const correct = userInput.trim().toLowerCase() === getAnswer().trim().toLowerCase();
    setIsCorrect(correct);
    submitResult(currentCard.id, correct);

    if (!correct) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleTypingOverride = () => {
    if (!currentCard) return;
    overrideResult(currentCard.id);
    setIsCorrect(true);
    setWasOverridden(true);
  };

  const handleAccentClick = (char: string) => {
    setUserInput(prev => prev + char);
    inputRef.current?.focus();
  };

  // === FLASHCARD MODE ===
  const handleFlashcardGrade = (correct: boolean) => {
    if (!currentCard) return;
    submitResult(currentCard.id, correct);
    setHasGraded(true);
  };

  // === PRODECK MODE ===
  const handleProDeckReveal = () => {
    const answer = getAnswer();
    const maxLevel = Math.ceil(answer.length / 3);

    if (revealLevel < maxLevel) {
      setRevealLevel(revealLevel + 1);
    } else if (!isGrading) {
      setIsGrading(true);
    }
  };

  const handleProDeckGrade = (correct: boolean) => {
    if (!currentCard) return;
    submitResult(currentCard.id, correct);
    setHasGraded(true);
  };

  const getRevealedText = (text: string, level: number) => {
    const charsPerLevel = Math.ceil(text.length / 3);
    const charsToShow = Math.min(level * charsPerLevel, text.length);
    return text.substring(0, charsToShow);
  };

  // === SHARED ===
  const goToNextCard = () => {
    selectNextCard();
  };

  const handleRestart = () => {
    restart();
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

  // Error state (no cards in deck)
  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="vk-card shadow-slate-200/50 border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{error}</h3>
          <p className="text-slate-600 text-sm">
            Add some cards to this deck to start studying.
          </p>
        </div>
      </div>
    );
  }

  // Session complete / all mastered state
  if (!currentCard && !loading) {
    const allMastered = progress.mastered === progress.total;
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="vk-card shadow-green-200/50 border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {allMastered ? 'All Cards Mastered!' : 'No Cards Due'}
          </h3>
          <p className="text-slate-600 mb-2">
            {allMastered
              ? 'Amazing work! You\'ve mastered all the cards in this deck.'
              : 'You\'re all caught up. Come back later when more cards are due for review.'}
          </p>
          <div className="flex justify-center gap-4 mb-6 text-sm">
            <span className="text-green-600 font-semibold">{progress.mastered} mastered</span>
            <span className="text-amber-600 font-semibold">{progress.learning} learning</span>
            <span className="text-blue-600 font-semibold">{progress.due} due</span>
          </div>
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Restart Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Mode Switcher, Flip, and Shuffle */}
      <div className="flex justify-center items-center gap-3 mb-4">
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

        {/* Flip Direction Toggle */}
        <button
          onClick={toggleFlip}
          className={`vk-toggle ${isFlipped ? 'vk-toggle-active' : 'vk-toggle-inactive'}`}
          title={isFlipped ? 'Direction: Reversed' : 'Direction: Normal'}
        >
          <ArrowLeftRight className={`w-4 h-4 ${isFlipped ? 'rotate-90' : ''}`} />
          Flip
        </button>

        {/* Shuffle Toggle */}
        <button
          onClick={toggleShuffle}
          className={`vk-toggle ${shuffleEnabled ? 'vk-toggle-active' : 'vk-toggle-inactive'}`}
          title={shuffleEnabled ? 'Shuffle: ON' : 'Shuffle: OFF'}
        >
          <Shuffle className={`w-4 h-4 ${shuffleEnabled ? 'animate-pulse' : ''}`} />
          Shuffle
        </button>
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
        <div className="vk-card shadow-blue-200/50 border-blue-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-200" />
                <span className="text-blue-100 text-sm font-medium">Typing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <Trophy className="w-3 h-3" />
                  <span className="text-xs font-medium">Box {boxLevel}</span>
                </div>
                <button
                  onClick={goToNextCard}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Skip card"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Question */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {getQuestion()}
              </h2>
            </div>

            {/* Accent Bar */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              {accentChars.map((char) => (
                <button
                  key={char}
                  onClick={() => handleAccentClick(char)}
                  disabled={isCorrect !== null}
                  className="w-9 h-9 bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-mono text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {char}
                </button>
              ))}
            </div>

            {isCorrect === null ? (
              <>
                {/* Input */}
                <div className="relative mb-4">
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
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="vk-input"
                  />
                </div>
                <div className="flex gap-2">
                  {cardHistory.length > 0 && (
                    <button
                      onClick={goBack}
                      className="px-3 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center"
                      title="Go back to previous card"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleTypingSubmit}
                    disabled={!userInput.trim()}
                    className="flex-1 vk-btn-primary"
                  >
                    Check Answer
                  </button>
                </div>
              </>
            ) : (
              <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {isCorrect ? (
                    <>
                      <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-lg font-semibold text-green-900">
                        {wasOverridden ? 'Overridden!' : `Correct! Box ${Math.min(boxLevel, 3)}`}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-lg font-semibold text-red-900">Not quite! Back to Box 0</span>
                    </>
                  )}
                </div>
                {/* Diff display for incorrect answers */}
                {!isCorrect && (
                  <div className="text-center mb-4 space-y-1.5">
                    <p className="text-slate-500 text-xs">Your answer:</p>
                    <p className="font-mono text-base tracking-wide">
                      {diffAnswers(userInput, getAnswer()).userDiff.map((seg, i) => (
                        <span
                          key={i}
                          className={
                            seg.type === 'correct'
                              ? 'text-slate-900'
                              : seg.type === 'wrong'
                              ? 'text-red-600 bg-red-100 rounded px-0.5'
                              : 'text-red-400 bg-red-50 rounded px-0.5 line-through'
                          }
                        >
                          {seg.char}
                        </span>
                      ))}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">Correct answer:</p>
                    <p className="font-mono text-base tracking-wide">
                      {diffAnswers(userInput, getAnswer()).correctDiff.map((seg, i) => (
                        <span
                          key={i}
                          className={
                            seg.type === 'correct'
                              ? 'text-slate-900'
                              : 'text-green-600 bg-green-100 rounded px-0.5'
                          }
                        >
                          {seg.char}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
                {isCorrect && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-slate-600 mb-1">Answer:</p>
                    <p className="text-xl font-bold text-slate-900">{getAnswer()}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {cardHistory.length > 0 && (
                    <button
                      onClick={goBack}
                      className="px-3 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center"
                      title="Go back to previous card"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  {!isCorrect && (
                    <button
                      onClick={handleTypingOverride}
                      className="flex-1 py-3 bg-amber-100 text-amber-700 rounded-xl font-semibold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Undo2 className="w-4 h-4" />
                      I was right
                    </button>
                  )}
                  <button
                    onClick={goToNextCard}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Next Card
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Keyboard hint */}
          <div className="px-5 pb-4">
            <p className="text-center text-slate-400 text-xs">
              {isCorrect === null
                ? 'Press Enter to check answer'
                : 'Press Space or Enter to continue'}
            </p>
          </div>
        </div>
      )}

      {/* FLASHCARD MODE */}
      {mode === 'flashcard' && (
        <div
          className={`vk-card transition-all duration-300 ${
            !showAnswer ? 'shadow-teal-200/50 border-teal-200 cursor-pointer hover:shadow-teal-300/50' : 'shadow-slate-200/50 border-slate-200'
          }`}
          onClick={!showAnswer ? () => setShowAnswer(true) : undefined}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-100" />
                <span className="text-teal-100 text-sm font-medium">Flashcard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <Trophy className="w-3 h-3" />
                  <span className="text-xs font-medium">Box {boxLevel}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNextCard(); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Skip card"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Question */}
            <div className="text-center mb-5">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {getQuestion()}
              </h2>
            </div>

            {/* Hidden state */}
            {!showAnswer && (
              <div className="animate-fadeIn">
                <button
                  onClick={() => setShowAnswer(true)}
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

            {/* Revealed answer */}
            {showAnswer && (
              <div className="animate-fadeIn">
                <div className="w-full py-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl mb-5">
                  <p className="text-center text-3xl font-mono font-bold text-white">
                    {getAnswer()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Grading section */}
          {showAnswer && (
            <div className="px-6 pb-6">
              {!hasGraded ? (
                <div className="animate-fadeIn">
                  <p className="text-center text-slate-500 text-sm mb-3">Did you know the answer?</p>
                  <div className="flex gap-3">
                    {cardHistory.length > 0 && (
                      <button
                        onClick={goBack}
                        className="px-3 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center"
                        title="Go back to previous card"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleFlashcardGrade(false)}
                      className="vk-btn-grade-incorrect"
                    >
                      <X className="w-5 h-5" />
                      I forgot
                    </button>
                    <button
                      onClick={() => handleFlashcardGrade(true)}
                      className="vk-btn-grade-correct"
                    >
                      <Check className="w-5 h-5" />
                      I knew it
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn flex gap-2">
                  {cardHistory.length > 0 && (
                    <button
                      onClick={goBack}
                      className="px-3 py-4 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center"
                      title="Go back to previous card"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={goToNextCard}
                    className="flex-1 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Next Card
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PRODECK MODE */}
      {mode === 'prodeck' && (
        <div className="vk-card shadow-purple-200/50 border-purple-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span className="text-purple-100 text-sm font-medium">ProDeck</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <Trophy className="w-3 h-3" />
                  <span className="text-xs font-medium">Box {boxLevel}</span>
                </div>
                <button
                  onClick={goToNextCard}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Skip card"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2 text-center">
              Question
            </p>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
              {getQuestion()}
            </h2>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2 text-center">
                Progressive Reveal
              </p>
              <p className="text-2xl font-bold text-slate-900 text-center font-mono tracking-wider">
                {revealLevel > 0 ? getRevealedText(getAnswer(), revealLevel) : '???'}
              </p>
            </div>

            {!isGrading ? (
              <button
                onClick={handleProDeckReveal}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                {revealLevel === 0 ? 'Start Revealing' : 'Reveal More'}
              </button>
            ) : !hasGraded ? (
              <div>
                <p className="text-center text-sm text-slate-600 mb-3">Did you get it right?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProDeckGrade(false)}
                    className="vk-btn-grade-incorrect"
                  >
                    <X className="w-5 h-5" />
                    Incorrect
                  </button>
                  <button
                    onClick={() => handleProDeckGrade(true)}
                    className="vk-btn-grade-correct"
                  >
                    <Check className="w-5 h-5" />
                    Correct
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <button
                  onClick={goToNextCard}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Next Card
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="mt-4 bg-white rounded-xl p-3 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600">
              <span className="font-semibold text-blue-600">{progress.due}</span> due
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              <span className="font-semibold text-amber-600">{progress.learning}</span> learning
            </span>
            <span className="text-slate-600">
              <span className="font-semibold text-green-600">{progress.mastered}</span> mastered
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <p className="text-center text-slate-400 text-xs mt-3">
        {mode === 'typing' && isCorrect === null && 'Press Enter to check answer'}
        {mode === 'typing' && isCorrect !== null && 'Press Space or Enter to continue'}
        {mode === 'flashcard' && !showAnswer && 'Press Space to reveal'}
        {mode === 'flashcard' && showAnswer && !hasGraded && '1 or \u2190 = forgot \u2022 2 or \u2192 = knew it'}
        {mode === 'flashcard' && hasGraded && 'Press Space or Enter for next card'}
        {mode === 'prodeck' && !isGrading && (revealLevel === 0 ? 'Press Space to start revealing' : 'Press Space to reveal more')}
        {mode === 'prodeck' && isGrading && !hasGraded && '1 or \u2190 = incorrect \u2022 2 or \u2192 = correct'}
        {mode === 'prodeck' && hasGraded && 'Press Space or Enter for next card'}
      </p>

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
