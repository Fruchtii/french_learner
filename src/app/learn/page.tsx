'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import StudySession from '@/components/StudySession';
import AuthButton from '@/components/AuthButton';
import { getSupabase } from '@/lib/supabase';

export default function LearnPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deckNotFound, setDeckNotFound] = useState(false);

  useEffect(() => {
    async function findDefaultDeck() {
      try {
        const supabase = getSupabase();

        // Try to find the Essential French Irregular Verbs deck first
        let { data: frenchDeck, error: frenchError } = await supabase
          .from('decks')
          .select('id')
          .eq('title', 'Essential French Irregular Verbs')
          .eq('is_public', true)
          .single();

        if (frenchDeck && !frenchError) {
          // Redirect to the French Verbs deck
          router.replace(`/learn/${frenchDeck.id}`);
          return;
        }

        // If not found, try to get the first public deck
        const { data: publicDecks, error: publicError } = await supabase
          .from('decks')
          .select('id')
          .eq('is_public', true)
          .limit(1);

        if (publicDecks && publicDecks.length > 0 && !publicError) {
          // Redirect to the first public deck
          router.replace(`/learn/${publicDecks[0].id}`);
          return;
        }

        // No decks found - show the study session anyway (uses local verb data)
        setDeckNotFound(true);
        setLoading(false);
      } catch (err) {
        console.error('Error finding default deck:', err);
        // Show the study session anyway
        setDeckNotFound(true);
        setLoading(false);
      }
    }

    findDefaultDeck();
  }, [router]);

  // Loading state while we search for a deck
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
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

  // No deck found - show study session with warning
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
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
        {/* Warning Banner */}
        {deckNotFound && (
          <div className="mb-4 max-w-lg w-full">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 text-sm mb-1">
                  Setup Needed
                </h3>
                <p className="text-amber-800 text-sm mb-2">
                  No public decks found. Run the database seed scripts to create the French Verbs deck.
                </p>
                <Link
                  href="/dashboard"
                  className="text-amber-700 hover:text-amber-900 font-medium text-sm underline"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            vokab
          </h1>
          <p className="text-slate-500 text-sm">
            Master your flashcards.
          </p>
        </div>

        {/* Study Session Component */}
        <StudySession initialMode="typing" />
      </main>
    </div>
  );
}
