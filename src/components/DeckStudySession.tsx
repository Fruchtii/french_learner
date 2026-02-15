'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Check, X, Loader2, RotateCcw, Keyboard, Layers, Sparkles, Zap, ArrowLeftRight, Shuffle, Clock, Trophy, ArrowRight, ArrowLeft, Undo2, Eye, List, BookOpen, ChevronDown, RefreshCw, Trash2 } from 'lucide-react';
import { useDeckStudyStore, type LearningMode } from '@/store/useDeckStudyStore';
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
  const [submittedInput, setSubmittedInput] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
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
    cards: allCards,
    cardProgress,
    learningMode,
    setLearningMode,
    introPhase,
    markCardIntroduced,
    getGroupProgress,
    sessionCardProgress,
    resetCurrentGroup,
    resetAll,
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
  const groupProgress = getGroupProgress();

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
    setSubmittedInput('');
    setSubmittedAnswer('');
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

      // Handle introduction phase (group mode)
      if (introPhase) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          markCardIntroduced();
        }
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
  }, [mode, isCorrect, showAnswer, hasGraded, isGrading, revealLevel, introPhase, markCardIntroduced]);

  // === TYPING MODE ===
  const handleTypingSubmit = () => {
    if (!userInput.trim() || !currentCard) return;

    const answer = getAnswer();
    const correct = userInput.trim().toLowerCase() === answer.trim().toLowerCase();
    setSubmittedInput(userInput);
    setSubmittedAnswer(answer);
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
          <p className="text-slate-600 dark:text-slate-400 text-sm">Loading cards...</p>
        </div>
      </div>
    );
  }

  // Error state (no cards in deck)
  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="vk-card shadow-slate-200/50 border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{error}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
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
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {allMastered ? 'All Cards Mastered!' : 'No Cards Due'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
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
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setMode('typing')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'typing'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Typing
          </button>
          <button
            onClick={() => setMode('flashcard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'flashcard'
                ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Flashcard
          </button>
          <button
            onClick={() => setMode('prodeck')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'prodeck'
                ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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

      {/* Learning Algorithm Selector */}
      <div className="flex justify-center mb-3">
        <div className="relative inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <select
            value={learningMode}
            onChange={(e) => setLearningMode(e.target.value as LearningMode)}
            className="appearance-none bg-transparent text-sm text-slate-700 dark:text-slate-300 font-medium pr-5 focus:outline-none cursor-pointer"
          >
            <option value="groups">Groups of 7 (Recommended)</option>
            <option value="classic">Classic SRS</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Group Progress Bar (group mode only) */}
      {groupProgress && (
        <div className="mb-4 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Group {groupProgress.currentGroupIndex + 1} of {groupProgress.totalGroups}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {groupProgress.totalGraduated} / {groupProgress.totalCards} learned
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: groupProgress.groupSize }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  i < groupProgress.groupGraduated
                    ? 'bg-green-400'
                    : i < groupProgress.groupIntroduced
                    ? 'bg-indigo-200'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <span>{groupProgress.groupGraduated}/{groupProgress.groupSize} mastered in group</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Done</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-200 inline-block" /> Seen</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 inline-block border border-slate-200 dark:border-slate-700" /> New</span>
            </div>
          </div>
        </div>
      )}

      {/* Session Stats */}
      <div className="flex justify-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold">{sessionStats.total}</span>
          <span className="text-slate-400 dark:text-slate-500">reviewed</span>
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

      {/* INTRODUCTION PHASE (group mode) */}
      {introPhase && currentCard && (
        <div className="vk-card shadow-indigo-200/50 border-indigo-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-200" />
                <span className="text-indigo-100 text-sm font-medium">New Card</span>
              </div>
              {groupProgress && (
                <span className="text-indigo-200 text-xs font-medium">
                  {groupProgress.groupIntroduced + 1} of {groupProgress.groupSize}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 text-center">
            {/* Question side */}
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Question</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {getQuestion()}
            </h2>

            {/* Answer side — revealed immediately */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-6 mb-6">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Answer</p>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300 font-mono">{getAnswer()}</p>
            </div>

            {/* Got it button */}
            <button
              onClick={markCardIntroduced}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Got it
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pb-4">
            <p className="text-center text-slate-400 dark:text-slate-500 text-xs">
              Press Space or Enter to continue
            </p>
          </div>
        </div>
      )}

      {/* TYPING MODE */}
      {!introPhase && mode === 'typing' && (
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
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
                  className="w-9 h-9 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-mono text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        e.preventDefault();
                        e.nativeEvent.stopImmediatePropagation();
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
                      className="px-3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
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
              <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {isCorrect ? (
                    <>
                      <div className="w-7 h-7 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-lg font-semibold text-green-900 dark:text-green-300">
                        {wasOverridden ? 'Overridden!' : `Correct! Box ${Math.min(boxLevel, 3)}`}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-lg font-semibold text-red-900 dark:text-red-300">Not quite! Back to Box 0</span>
                    </>
                  )}
                </div>
                {/* Diff display for incorrect answers */}
                {!isCorrect && (
                  <div className="text-center mb-4 space-y-1.5">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Your answer:</p>
                    <p className="font-mono text-base tracking-wide">
                      {diffAnswers(submittedInput, submittedAnswer).userDiff.map((seg, i) => (
                        <span
                          key={i}
                          className={
                            seg.type === 'correct'
                              ? 'text-slate-900 dark:text-slate-100'
                              : seg.type === 'wrong'
                              ? 'text-red-600 bg-red-100 dark:bg-red-900/50 rounded px-0.5'
                              : 'text-red-400 bg-red-50 dark:bg-red-900/30 rounded px-0.5 line-through'
                          }
                        >
                          {seg.char}
                        </span>
                      ))}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Correct answer:</p>
                    <p className="font-mono text-base tracking-wide">
                      {diffAnswers(submittedInput, submittedAnswer).correctDiff.map((seg, i) => (
                        <span
                          key={i}
                          className={
                            seg.type === 'correct'
                              ? 'text-slate-900 dark:text-slate-100'
                              : 'text-green-600 bg-green-100 dark:bg-green-900/50 rounded px-0.5'
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
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Answer:</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{submittedAnswer}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {cardHistory.length > 0 && (
                    <button
                      onClick={goBack}
                      className="px-3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                      title="Go back to previous card"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  {!isCorrect && (
                    <button
                      onClick={handleTypingOverride}
                      className="flex-1 py-3 bg-amber-100 dark:bg-amber-900/50 text-amber-700 rounded-xl font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/70 transition-colors flex items-center justify-center gap-2"
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
            <p className="text-center text-slate-400 dark:text-slate-500 text-xs">
              {isCorrect === null
                ? 'Press Enter to check answer'
                : 'Press Space or Enter to continue'}
            </p>
          </div>
        </div>
      )}

      {/* FLASHCARD MODE */}
      {!introPhase && mode === 'flashcard' && (
        <div
          className={`vk-card transition-all duration-300 ${
            !showAnswer ? 'shadow-slate-400/30 border-slate-300 dark:border-slate-600 cursor-pointer hover:shadow-slate-500/40' : 'shadow-slate-300/50 border-slate-200 dark:border-slate-700'
          }`}
          onClick={!showAnswer ? () => setShowAnswer(true) : undefined}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-300" />
                <span className="text-slate-300 text-sm font-medium">Flashcard</span>
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
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {getQuestion()}
              </h2>
            </div>

            {/* Hidden state */}
            {!showAnswer && (
              <div className="animate-fadeIn">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors">
                    <Eye className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Tap to reveal</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">or press Space</span>
                </button>
              </div>
            )}

            {/* Revealed answer */}
            {showAnswer && (
              <div className="animate-fadeIn">
                <div className="w-full py-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl mb-5">
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
                  <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-3">Did you know the answer?</p>
                  <div className="flex gap-3">
                    {cardHistory.length > 0 && (
                      <button
                        onClick={goBack}
                        className="px-3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
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
                      className="px-3 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                      title="Go back to previous card"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={goToNextCard}
                    className="flex-1 py-4 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
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
      {!introPhase && mode === 'prodeck' && (
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
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2 text-center">
              Question
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-6">
              {getQuestion()}
            </h2>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-lg mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2 text-center">
                Progressive Reveal
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center font-mono tracking-wider">
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
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-3">Did you get it right?</p>
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
      <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-blue-600">{progress.due}</span> due
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-amber-600">{progress.learning}</span> learning
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-green-600">{progress.mastered}</span> mastered
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-3">
        {mode === 'typing' && isCorrect === null && 'Press Enter to check answer'}
        {mode === 'typing' && isCorrect !== null && 'Press Space or Enter to continue'}
        {mode === 'flashcard' && !showAnswer && 'Press Space to reveal'}
        {mode === 'flashcard' && showAnswer && !hasGraded && '1 or \u2190 = forgot \u2022 2 or \u2192 = knew it'}
        {mode === 'flashcard' && hasGraded && 'Press Space or Enter for next card'}
        {mode === 'prodeck' && !isGrading && (revealLevel === 0 ? 'Press Space to start revealing' : 'Press Space to reveal more')}
        {mode === 'prodeck' && isGrading && !hasGraded && '1 or \u2190 = incorrect \u2022 2 or \u2192 = correct'}
        {mode === 'prodeck' && hasGraded && 'Press Space or Enter for next card'}
      </p>

      {/* Reset / Restart Buttons */}
      {sessionStats.total > 0 && (
        <div className="mt-4 flex justify-center items-center gap-3">
          {learningMode === 'groups' && groupProgress && (
            <button
              onClick={resetCurrentGroup}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
              title="Reset current group — re-introduce and re-test all cards in this group"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Group
            </button>
          )}
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Reset entire session — start over from group 1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset All
          </button>
        </div>
      )}

      {/* Card Overview — scrollable list below the study area */}
      {allCards.length > 0 && (
        <div className="mt-10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">All Cards</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">({allCards.length})</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> New</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Learning</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Familiar</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Mastered</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {allCards.map((card) => {
              const prog = cardProgress[card.id];
              const box = prog?.box ?? 0;
              const boxColors = [
                { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-400', text: 'text-red-700 dark:text-red-400', label: 'Box 0' },
                { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-400', label: 'Box 1' },
                { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-400', text: 'text-blue-700 dark:text-blue-400', label: 'Box 2' },
                { bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-400', text: 'text-green-700 dark:text-green-400', label: 'Box 3' },
              ];
              const style = boxColors[Math.min(box, 3)];
              const isCurrent = currentCard?.id === card.id;
              const isDue = prog ? prog.nextReviewDate <= Date.now() : true;

              return (
                <div
                  key={card.id}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                    isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Box indicator */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${style.text}`}>{box}</span>
                  </div>

                  {/* Card content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                        {isFlipped ? card.back : card.front}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 flex-shrink-0">&rarr;</span>
                      <span className="text-slate-600 dark:text-slate-400 text-sm truncate">
                        {isFlipped ? card.front : card.back}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 flex items-center gap-2 text-xs">
                    {/* Group mode: show session streak */}
                    {learningMode === 'groups' && sessionCardProgress[card.id] && (
                      sessionCardProgress[card.id].graduated ? (
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded text-[10px] font-semibold">
                          <Check className="w-3 h-3 inline -mt-0.5" /> Done
                        </span>
                      ) : sessionCardProgress[card.id].sessionStreak > 0 ? (
                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded text-[10px] font-semibold">
                          {sessionCardProgress[card.id].sessionStreak}/2
                        </span>
                      ) : null
                    )}
                    {prog && (prog.timesCorrect > 0 || prog.timesIncorrect > 0) && (
                      <span className="text-slate-400 dark:text-slate-500">
                        <span className="text-green-600 font-medium">{prog.timesCorrect}</span>
                        /
                        <span className="text-red-600 font-medium">{prog.timesIncorrect}</span>
                      </span>
                    )}
                    {isDue && (
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded text-[10px] font-semibold uppercase">Due</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
