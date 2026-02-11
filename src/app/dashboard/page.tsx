'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, ArrowRight, Lock, Globe, Loader2, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { getSupabase, type Deck } from '@/lib/supabase';
import AuthButton from '@/components/AuthButton';
import VokabLogo from '@/components/VokabLogo';
import type { Session } from '@supabase/supabase-js';

interface DeckWithCount extends Deck {
  card_count?: number;
  mastered_count?: number;
  learning_count?: number;
}

export default function DashboardPage() {
  const [decks, setDecks] = useState<DeckWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // Check auth and fetch decks
    const initDashboard = async () => {
      const { data: { session } }: { data: { session: Session | null } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchDecks();
      }
      setLoading(false);
    };

    initDashboard();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchDecks();
      } else {
        setDecks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchDecks = async () => {
    const supabase = getSupabase();
    setLoading(true);

    // Fetch decks with card count
    const { data, error } = await supabase
      .from('decks')
      .select(`
        *,
        cards:cards(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching decks:', error);
      setLoading(false);
      return;
    }

    // Transform the data to include card count
    const decksWithCount: DeckWithCount[] = data?.map((deck: any) => ({
      ...deck,
      card_count: deck.cards[0]?.count || 0,
      mastered_count: 0,
      learning_count: 0,
    })) || [];

    // Fetch study progress for all decks
    try {
      const { data: progressData } = await supabase
        .from('study_progress')
        .select('card_id, box, cards!inner(deck_id)');

      if (progressData) {
        // Build a map: deckId -> { mastered, learning }
        const progressByDeck: Record<string, { mastered: number; learning: number }> = {};
        for (const row of progressData as any[]) {
          const deckId = row.cards?.deck_id;
          if (!deckId) continue;
          if (!progressByDeck[deckId]) progressByDeck[deckId] = { mastered: 0, learning: 0 };
          if (row.box >= 3) progressByDeck[deckId].mastered++;
          else if (row.box > 0) progressByDeck[deckId].learning++;
        }
        // Merge into decks
        for (const deck of decksWithCount) {
          const prog = progressByDeck[deck.id];
          if (prog) {
            deck.mastered_count = prog.mastered;
            deck.learning_count = prog.learning;
          }
        }
      }
    } catch {
      // Progress fetch failed — proceed without it
    }

    setDecks(decksWithCount);
    setLoading(false);
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? This cannot be undone.')) return;
    setDeletingDeckId(deckId);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('decks').delete().eq('id', deckId);
      if (error) {
        console.error('Error deleting deck:', error);
        alert('Failed to delete deck. Please try again.');
      } else {
        setDecks(decks.filter(d => d.id !== deckId));
      }
    } catch (err) {
      console.error('Error deleting deck:', err);
    }
    setDeletingDeckId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <VokabLogo variant="dark" size={28} />
            </Link>
            <AuthButton />
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <VokabLogo variant="dark" size={28} />
            </Link>
            <AuthButton />
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Sign in to continue
            </h1>
            <p className="text-slate-600 mb-8">
              Create an account or sign in to access your decks and track your progress.
            </p>
            <AuthButton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <VokabLogo variant="dark" size={28} />
          </Link>
          <AuthButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              My Decks
            </h1>
            <p className="text-slate-600">
              Choose a deck to start learning, or create a new one.
            </p>
          </div>

          {/* Create Deck Button */}
          <div className="mb-8">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-5 h-5" />
              Create New Deck
            </Link>
          </div>

          {/* Verb Conjugation Practice Card */}
          <div className="mb-8">
            <Link
              href="/learn"
              className="block group bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg border-2 border-purple-400 hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                    <span>Interactive Study</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-100 transition-colors">
                  French Verb Conjugation Practice
                </h3>

                <p className="text-purple-100 mb-4">
                  Master French irregular verbs with 3 study modes: Typing, Flashcards, and ProDeck progressive reveal
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-purple-100">
                    <span className="font-semibold text-white">100 verbs</span> • <span className="font-semibold text-white">4 tenses</span> • <span className="font-semibold text-white">2400 cards</span>
                  </div>
                  <div className="flex items-center gap-1 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="h-1.5 bg-purple-800/50">
                <div className="h-full bg-gradient-to-r from-white/60 to-purple-200 w-0 group-hover:w-full transition-all duration-700" />
              </div>
            </Link>
          </div>

          {/* Decks Grid */}
          {decks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No decks yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first deck to start learning!
              </p>
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Deck
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden relative"
                >
                  {/* Action Buttons (Top Right) */}
                  <div className="absolute top-4 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/dashboard/${deck.id}/edit`}
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                      title="Edit deck"
                    >
                      <Pencil className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteDeck(deck.id); }}
                      disabled={deletingDeckId === deck.id}
                      className="p-2 bg-white rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                      title="Delete deck"
                    >
                      <Trash2 className="w-4 h-4 text-slate-600 hover:text-red-600" />
                    </button>
                  </div>

                  {/* Main Deck Link (Study) */}
                  <Link href={`/learn/${deck.id}`} className="block">
                    {/* Deck Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          {deck.is_public ? (
                            <>
                              <Globe className="w-3 h-3" />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Private</span>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {deck.title}
                      </h3>

                      {deck.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {deck.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {deck.card_count || 0}
                          </span>{' '}
                          cards
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-medium">Study</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Progress indicators */}
                      {(deck.card_count || 0) > 0 && (deck.mastered_count! > 0 || deck.learning_count! > 0) && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600 font-medium">{deck.mastered_count} mastered</span>
                          <span className="text-slate-300">&middot;</span>
                          <span className="text-amber-600 font-medium">{deck.learning_count} learning</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar (real progress, not just hover animation) */}
                    <div className="h-1.5 bg-slate-100">
                      {(deck.card_count || 0) > 0 ? (
                        <div className="h-full flex">
                          <div
                            className="bg-green-500 transition-all duration-500"
                            style={{ width: `${((deck.mastered_count || 0) / deck.card_count!) * 100}%` }}
                          />
                          <div
                            className="bg-amber-400 transition-all duration-500"
                            style={{ width: `${((deck.learning_count || 0) / deck.card_count!) * 100}%` }}
                          />
                        </div>
                      ) : (
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-0 group-hover:w-full transition-all duration-500" />
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
