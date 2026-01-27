'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, ArrowRight, Lock, Globe, Loader2, Pencil } from 'lucide-react';
import { getSupabase, type Deck } from '@/lib/supabase';
import AuthButton from '@/components/AuthButton';

interface DeckWithCount extends Deck {
  card_count?: number;
}

export default function DashboardPage() {
  const [decks, setDecks] = useState<DeckWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // Check auth and fetch decks
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
    } = supabase.auth.onAuthStateChange((_event: any, session) => {
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
    } else {
      // Transform the data to include card count
      const decksWithCount = data?.map((deck: any) => ({
        ...deck,
        card_count: deck.cards[0]?.count || 0,
      })) || [];
      setDecks(decksWithCount);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">vk</span>
              </div>
              <span className="font-semibold text-lg text-slate-800">vokab</span>
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
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">vk</span>
              </div>
              <span className="font-semibold text-lg text-slate-800">vokab</span>
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
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">vk</span>
            </div>
            <span className="font-semibold text-lg text-slate-800">vokab</span>
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
                  {/* Edit Button (Top Right) */}
                  <Link
                    href={`/dashboard/${deck.id}/edit`}
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                    title="Edit deck"
                  >
                    <Pencil className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                  </Link>

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

                      <div className="flex items-center justify-between">
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
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-100">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-0 group-hover:w-full transition-all duration-500" />
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
