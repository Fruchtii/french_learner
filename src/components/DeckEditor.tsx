'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { getSupabase, type Deck, type Card } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface CardRow {
  id?: string; // undefined for new cards
  front: string;
  back: string;
  order_index: number;
  _deleted?: boolean; // Mark for deletion
}

interface DeckEditorProps {
  deckId?: string; // undefined for create mode
}

export default function DeckEditor({ deckId }: DeckEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!deckId); // Load deck if editing
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Deck metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Cards
  const [cards, setCards] = useState<CardRow[]>([
    { front: '', back: '', order_index: 0 },
  ]);

  // Refs for keyboard navigation
  const cardRefs = useRef<{ [key: number]: { front: HTMLInputElement | null; back: HTMLInputElement | null } }>({});

  // Check auth
  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  // Load deck data if editing
  useEffect(() => {
    if (deckId && user) {
      loadDeck();
    }
  }, [deckId, user]);

  const loadDeck = async () => {
    if (!deckId) return;

    const supabase = getSupabase();
    setLoading(true);

    try {
      // Load deck
      const { data: deck, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (deckError) throw deckError;

      // Check ownership
      if (deck.created_by !== user?.id) {
        alert('You do not have permission to edit this deck.');
        router.push('/dashboard');
        return;
      }

      setTitle(deck.title);
      setDescription(deck.description || '');
      setIsPublic(deck.is_public);

      // Load cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('order_index');

      if (cardsError) throw cardsError;

      if (cardsData && cardsData.length > 0) {
        setCards(
          cardsData.map((card: Card, index: number) => ({
            id: card.id,
            front: card.front,
            back: card.back,
            order_index: index,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading deck:', error);
      alert('Failed to load deck. Please try again.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    const newCard: CardRow = {
      front: '',
      back: '',
      order_index: cards.length,
    };
    setCards([...cards, newCard]);

    // Focus the new card's front input after a brief delay
    setTimeout(() => {
      const newIndex = cards.length;
      cardRefs.current[newIndex]?.front?.focus();
    }, 50);
  };

  const handleDeleteCard = (index: number) => {
    const updatedCards = [...cards];

    // If card has an id, mark it for deletion (so we can delete from DB)
    if (updatedCards[index].id) {
      updatedCards[index]._deleted = true;
    }

    // Remove from UI
    updatedCards.splice(index, 1);

    // Reindex remaining cards
    updatedCards.forEach((card, idx) => {
      card.order_index = idx;
    });

    setCards(updatedCards);
  };

  const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const handleKeyDown = (index: number, field: 'front' | 'back', e: React.KeyboardEvent) => {
    // Enter in back field of last card: add new card
    if (e.key === 'Enter' && field === 'back' && index === cards.length - 1) {
      e.preventDefault();
      handleAddCard();
    }
    // Tab in back field: move to next card's front
    else if (e.key === 'Tab' && field === 'back' && !e.shiftKey) {
      if (index < cards.length - 1) {
        e.preventDefault();
        cardRefs.current[index + 1]?.front?.focus();
      }
    }
  };

  const handleSave = async () => {
    console.log('=== SAVE DECK: Starting save process ===');

    // Step 1: Get current user
    const supabase = getSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Auth error - user not authenticated:', userError);
      alert('Please sign in to save decks.');
      return;
    }

    console.log('✅ User authenticated:', user.id);
    console.log('   Email:', user.email);

    if (!title.trim()) {
      alert('Please enter a deck title.');
      return;
    }

    if (cards.filter(c => !c._deleted).length === 0) {
      alert('Please add at least one card to your deck.');
      return;
    }

    // Validate that all non-deleted cards have front and back
    const invalidCards = cards.filter(c => !c._deleted && (!c.front.trim() || !c.back.trim()));
    if (invalidCards.length > 0) {
      alert('All cards must have both front and back content.');
      return;
    }

    setSaving(true);

    try {
      let finalDeckId = deckId;

      // Step 2: Insert/Update Deck
      if (deckId) {
        // Update existing deck
        const { error: deckError } = await supabase
          .from('decks')
          .update({
            title,
            description: description || null,
            is_public: isPublic,
          })
          .eq('id', deckId);

        if (deckError) {
          console.error('Deck update error:', deckError);
          throw deckError;
        }
      } else {
        // Create new deck - CRITICAL: Return the new ID
        const deckPayload = {
          title,
          description: description || null,
          is_public: isPublic,
          created_by: user.id,
        };

        console.log('📝 Creating new deck with payload:', deckPayload);

        const { data: newDeck, error: deckError } = await supabase
          .from('decks')
          .insert(deckPayload)
          .select()
          .single();

        if (deckError) {
          console.error('Deck insert error (FULL DETAILS):', deckError);
          console.error('Error code:', deckError.code);
          console.error('Error message:', deckError.message);
          console.error('Error details:', deckError.details);
          console.error('Error hint:', deckError.hint);

          // Check for Foreign Key Violation (User Profile Missing)
          if (deckError.code === '23503') {
            alert(`❌ USER PROFILE MISSING - Cannot create deck

Error: Foreign Key Violation (23503)
User ID: ${user.id}

Your user profile is missing from the database.

FIX:
1. Run sync_profiles_and_fix_access.sql in Supabase SQL Editor
   (This will sync all users from auth.users to profiles)

ALTERNATIVE:
2. Sign out and sign back in to regenerate your profile

After fixing, try saving the deck again.
Full error logged to console.`);
          }
          // Check for RLS permission denied error
          else if (deckError.code === '42501' || deckError.message?.includes('permission denied')) {
            alert(`❌ PERMISSION DENIED - Cannot create deck

Error Code: ${deckError.code || 'unknown'}
Error Message: ${deckError.message || 'unknown'}

Possible fixes:
1. Run fix_rls_permissions.sql in Supabase SQL Editor
2. Verify you are signed in (User ID: ${user.id})
3. Check RLS policies allow authenticated users to INSERT decks

Full error logged to console.`);
          } else {
            alert(`❌ DECK CREATION FAILED

Error Code: ${deckError.code || 'unknown'}
Error Message: ${deckError.message || 'unknown'}
${deckError.hint ? `\nHint: ${deckError.hint}` : ''}

User ID: ${user.id}
Full error logged to console - please check developer tools.`);
          }

          throw deckError;
        }

        if (!newDeck || !newDeck.id) {
          console.error('No deck ID returned from insert');
          throw new Error('Failed to create deck - no ID returned');
        }

        finalDeckId = newDeck.id;
        console.log('Created new deck with ID:', finalDeckId);
      }

      // Step 3: Handle card deletions (for edit mode)
      const deletedCards = cards.filter(c => c._deleted && c.id);
      if (deletedCards.length > 0) {
        const deleteIds = deletedCards.map(c => c.id!);
        const { error: deleteError } = await supabase
          .from('cards')
          .delete()
          .in('id', deleteIds);

        if (deleteError) {
          console.error('Card deletion error:', deleteError);
          throw deleteError;
        }
      }

      // Step 4: Insert/Update Cards
      const activeCards = cards.filter(c => !c._deleted);

      // Build card payloads - only include id for existing cards (updates)
      const cardsToSave = activeCards.map(card => {
        const payload: any = {
          deck_id: finalDeckId!,
          front: card.front.trim(),
          back: card.back.trim(),
          data: { type: 'flashcard' },
          order_index: card.order_index,
        };

        // Only include id if it exists (for updates)
        // Omit id for new cards so database can auto-generate UUID
        if (card.id) {
          payload.id = card.id;
        }

        return payload;
      });

      console.log(`Saving ${cardsToSave.length} cards to deck ${finalDeckId}`);
      console.log('Cards payload:', cardsToSave.map(c => ({ id: c.id || 'NEW', front: c.front.substring(0, 20) })));

      const { error: cardsError } = await supabase
        .from('cards')
        .upsert(cardsToSave, {
          onConflict: 'id',
        });

      if (cardsError) {
        console.error('Cards insert error (FULL DETAILS):', cardsError);
        console.error('Error code:', cardsError.code);
        console.error('Error message:', cardsError.message);
        console.error('Error details:', cardsError.details);
        console.error('Error hint:', cardsError.hint);

        // Check for NOT NULL constraint violation (23502)
        if (cardsError.code === '23502') {
          alert(`❌ DATABASE CONSTRAINT ERROR - Cannot save cards

Error: NOT NULL constraint violation (23502)
User ID: ${user.id}
Deck ID: ${finalDeckId}

This error has been fixed in the latest version.
Please refresh the page and try again.

If the problem persists:
1. Clear your browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try creating the deck again

Full error logged to console.`);
        }
        // Check for Foreign Key Violation
        else if (cardsError.code === '23503') {
          alert(`❌ FOREIGN KEY VIOLATION - Cannot save cards

Error: Foreign Key Violation (23503)
User ID: ${user.id}
Deck ID: ${finalDeckId}

This usually means:
- The deck was deleted while you were editing
- Database relationships are broken

FIX:
1. Go back to the dashboard
2. Try creating the deck again from scratch

Full error logged to console.`);
        }
        // Check for RLS permission denied error
        else if (cardsError.code === '42501' || cardsError.message?.includes('permission denied')) {
          alert(`❌ PERMISSION DENIED - Cannot save cards

Error Code: ${cardsError.code || 'unknown'}
Error Message: ${cardsError.message || 'unknown'}

Possible fixes:
1. Run fix_rls_permissions.sql in Supabase SQL Editor
2. Verify you are signed in (User ID: ${user.id})
3. Verify RLS policies allow INSERT on cards table
4. Ensure you own this deck (Deck ID: ${finalDeckId})

Full error logged to console.`);
        } else {
          alert(`❌ CARDS SAVE FAILED

Error Code: ${cardsError.code || 'unknown'}
Error Message: ${cardsError.message || 'unknown'}
${cardsError.hint ? `\nHint: ${cardsError.hint}` : ''}

User ID: ${user.id}
Deck ID: ${finalDeckId}
Full error logged to console - please check developer tools.`);
        }

        throw cardsError;
      }

      // Success! Redirect to dashboard
      console.log('Deck saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving deck:', error);
      if (error instanceof Error) {
        alert(`Failed to save deck: ${error.message}`);
      } else {
        alert('Failed to save deck. Please check console for details.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/25"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Deck
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          {deckId ? 'Edit Deck' : 'Create New Deck'}
        </h1>

        {/* Deck Metadata */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Deck Information</h2>

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., French Irregular Verbs"
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this deck covers..."
              rows={3}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400"
            />
          </div>

          {/* Public/Private Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  !isPublic
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="font-medium">Private</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  isPublic
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium">Public</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Cards ({cards.filter(c => !c._deleted).length})
            </h2>
            <button
              onClick={handleAddCard}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {cards.filter(c => !c._deleted).map((card, index) => (
              <div
                key={card.id || `new-${index}`}
                className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                {/* Card Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700 mt-2">
                  {index + 1}
                </div>

                {/* Front Input */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Front</label>
                  <input
                    ref={(el) => {
                      if (!cardRefs.current[index]) cardRefs.current[index] = { front: null, back: null };
                      cardRefs.current[index].front = el;
                    }}
                    type="text"
                    value={card.front}
                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                    placeholder="Question or term"
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                  />
                </div>

                {/* Back Input */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Back</label>
                  <input
                    ref={(el) => {
                      if (!cardRefs.current[index]) cardRefs.current[index] = { front: null, back: null };
                      cardRefs.current[index].back = el;
                    }}
                    type="text"
                    value={card.back}
                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, 'back', e)}
                    placeholder="Answer or definition"
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                  />
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteCard(index)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                  title="Delete card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Card Button (Bottom) */}
          <button
            onClick={handleAddCard}
            className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Card (or press Enter on last card)
          </button>

          {/* Keyboard Hint */}
          <p className="mt-4 text-xs text-slate-500 text-center">
            💡 Tip: Press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">Enter</kbd> in the last card's Back field to quickly add a new card
          </p>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/25"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Deck
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
