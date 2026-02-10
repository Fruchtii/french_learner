'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Trash2, Globe, Lock, Loader2, AlertCircle, ArrowLeft, RefreshCw, Pencil } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface DeckWithOwner {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  created_by: string;
  owner_email: string;
  owner_name: string | null;
  card_count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [decks, setDecks] = useState<DeckWithOwner[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      try {
        const supabase = getSupabase();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log('Not authenticated, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }

        // Get user profile to check admin status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to verify admin status');
          setLoading(false);
          return;
        }

        if (!profile?.is_admin) {
          console.log('User is not admin, showing 403');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // User is admin - load decks
        setIsAdmin(true);
        await loadDecks();
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  // Load all decks with owner info
  async function loadDecks() {
    try {
      setRefreshing(true);
      const supabase = getSupabase();

      // Get all decks with owner info and card counts
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select(`
          id,
          title,
          description,
          is_public,
          created_at,
          created_by,
          profiles!decks_created_by_fkey (
            email,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (decksError) throw decksError;

      // Get card counts for each deck
      const deckIds = decksData?.map((d: any) => d.id) || [];
      const { data: cardCounts, error: cardError } = await supabase
        .from('cards')
        .select('deck_id')
        .in('deck_id', deckIds);

      if (cardError) throw cardError;

      // Count cards per deck
      const countMap: Record<string, number> = {};
      cardCounts?.forEach((card: any) => {
        countMap[card.deck_id] = (countMap[card.deck_id] || 0) + 1;
      });

      // Format the data
      const formattedDecks: DeckWithOwner[] = decksData?.map((deck: any) => ({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        is_public: deck.is_public,
        created_at: deck.created_at,
        created_by: deck.created_by,
        owner_email: (deck.profiles as any)?.email || 'Unknown',
        owner_name: (deck.profiles as any)?.display_name || null,
        card_count: countMap[deck.id] || 0,
      })) || [];

      setDecks(formattedDecks);
      setError(null);
    } catch (err) {
      console.error('Error loading decks:', err);
      setError('Failed to load decks');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  // Delete a deck
  async function handleDeleteDeck(deckId: string, deckTitle: string) {
    const confirmed = confirm(
      `⚠️ DELETE DECK\n\nAre you sure you want to permanently delete "${deckTitle}"?\n\nThis will also delete all cards in this deck.\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

      // Remove from local state
      setDecks(prev => prev.filter(d => d.id !== deckId));

      alert(`✅ Deck "${deckTitle}" deleted successfully`);
    } catch (err) {
      console.error('Error deleting deck:', err);
      alert(`❌ Failed to delete deck: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Toggle public/private status
  async function handleTogglePublic(deckId: string, currentStatus: boolean, deckTitle: string) {
    const newStatus = !currentStatus;
    const action = newStatus ? 'PUBLIC' : 'PRIVATE';

    const confirmed = confirm(
      `Change deck visibility?\n\nDeck: "${deckTitle}"\nCurrent: ${currentStatus ? 'PUBLIC' : 'PRIVATE'}\nNew: ${action}\n\nContinue?`
    );

    if (!confirmed) return;

    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from('decks')
        .update({ is_public: newStatus })
        .eq('id', deckId);

      if (error) throw error;

      // Update local state
      setDecks(prev =>
        prev.map(d =>
          d.id === deckId ? { ...d, is_public: newStatus } : d
        )
      );

      alert(`✅ Deck is now ${action}`);
    } catch (err) {
      console.error('Error toggling deck visibility:', err);
      alert(`❌ Failed to update deck: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600 text-sm">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // 403 Forbidden - Not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            403 Forbidden
          </h1>
          <p className="text-slate-600 mb-8">
            You do not have permission to access the admin dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Admin Dashboard UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">Platform Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadDecks()}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Total Decks</p>
            <p className="text-3xl font-bold text-slate-900">{decks.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Public Decks</p>
            <p className="text-3xl font-bold text-green-600">
              {decks.filter(d => d.is_public).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Private Decks</p>
            <p className="text-3xl font-bold text-slate-600">
              {decks.filter(d => !d.is_public).length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Decks Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">All Decks</h2>
          </div>

          {decks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No decks found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Deck
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Cards
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {decks.map(deck => (
                    <tr key={deck.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/learn/${deck.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {deck.title}
                          </Link>
                          {deck.description && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                              {deck.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {deck.owner_name || deck.owner_email}
                          </p>
                          {deck.owner_name && (
                            <p className="text-xs text-slate-500">{deck.owner_email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{deck.card_count}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            deck.is_public
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {deck.is_public ? (
                            <>
                              <Globe className="w-3 h-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              Private
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {new Date(deck.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/${deck.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Deck"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublic(deck.id, deck.is_public, deck.title)}
                            className={`p-2 rounded-lg transition-colors ${
                              deck.is_public
                                ? 'text-slate-600 hover:bg-slate-100'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={deck.is_public ? 'Make Private' : 'Make Public'}
                          >
                            {deck.is_public ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteDeck(deck.id, deck.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Deck"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
