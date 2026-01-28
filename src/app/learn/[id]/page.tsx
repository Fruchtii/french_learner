'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import DeckStudySession from '@/components/DeckStudySession';
import AuthButton from '@/components/AuthButton';
import { getSupabase, type Deck } from '@/lib/supabase';

export default function LearnDeckPage() {
  const params = useParams();
  const deckId = params?.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeck() {
      if (!deckId) {
        setError('No deck ID provided');
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabase();
        const { data, error: fetchError } = await supabase
          .from('decks')
          .select('*')
          .eq('id', deckId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Deck not found');
          } else {
            setError('Failed to load deck');
          }
          setLoading(false);
          return;
        }

        setDeck(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching deck:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }

    fetchDeck();
  }, [deckId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">vk</span>
                </div>
                <span className="font-semibold text-lg text-slate-800">vokab</span>
              </Link>
              <AuthButton />
            </div>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </div>
    );
  }

  // Error state (404 or other errors)
  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">vk</span>
                </div>
                <span className="font-semibold text-lg text-slate-800">vokab</span>
              </Link>
              <AuthButton />
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Deck Not Found
            </h1>
            <p className="text-slate-600 mb-8">
              {error === 'Deck not found'
                ? "This deck doesn't exist or has been deleted."
                : "There was an error loading this deck."}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Success state - render the study session
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">vk</span>
              </div>
              <span className="font-semibold text-lg text-slate-800">vokab</span>
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {deck.title}
          </h1>
          {deck.description && (
            <p className="text-slate-500 text-sm max-w-md">
              {deck.description}
            </p>
          )}
        </div>

        {/* Study Session Component */}
        <DeckStudySession deckId={deckId} />
      </main>
    </div>
  );
}
