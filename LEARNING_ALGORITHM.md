# Learning Algorithm Documentation

Vokab supports two learning algorithms for deck-based study, selectable via a
dropdown in the study session. The choice is persisted to `localStorage`
(`vokab-learning-mode`) so it carries across sessions.

---

## 1. Classic SRS (Leitner Box System)

The original algorithm. Each card has a **Leitner box level** (0–3) that
determines when it next comes up for review.

### Box Intervals

| Box | Interval     | Meaning                     |
|-----|--------------|-----------------------------|
| 0   | Immediate    | New card or just got wrong   |
| 1   | 1 minute     | First correct answer         |
| 2   | 10 minutes   | Second consecutive correct   |
| 3   | 24 hours     | Mastered                     |

### Card Selection

1. Filter all cards where `nextReviewDate <= now` (due cards).
2. Sort by box level ascending (box 0 first), then by review date.
3. From the lowest-box tier, pick a random card (avoid showing the same card
   back-to-back).
4. If no cards are due, pick the one coming due soonest.

### On Answer

- **Correct**: `box = min(box + 1, 3)`, schedule at `now + interval[newBox]`.
- **Incorrect**: `box = 0`, schedule immediately.
- **Override ("I was right")**: treat as correct, box moves up by 1.

### Strengths

- Simple, battle-tested.
- Good for small decks (< 30 cards) or review sessions.

### Weaknesses

- With large decks (50–200+ cards), the user is overwhelmed — all cards are
  due at once and shown in random order.
- No introduction phase — the user is tested on cards they've never seen.
- Doesn't consider `timesIncorrect` for prioritisation.

---

## 2. Group-Based Learning (Recommended)

Inspired by Quizlet's Learn mode and cognitive science research on working
memory (Miller's Law — "The Magical Number Seven, Plus or Minus Two").

### Core Idea

Cards are split into **groups of 7** and studied sequentially. Each group goes
through an **introduction phase** (user sees both sides) followed by a
**testing phase** (user is quizzed in their chosen study mode). This prevents
information overload on large decks.

### Constants

| Constant           | Value | Purpose                                        |
|--------------------|-------|------------------------------------------------|
| `GROUP_SIZE`       | 7     | Cards per group (optimal for working memory)   |
| `GRADUATION_STREAK`| 2     | Consecutive correct answers to "graduate"       |
| `REVIEW_MIX_RATIO` | 0.2   | Probability of showing a review card (~20%)    |

### Group Building

Cards are sorted by priority before splitting into groups:

1. **Lower Leitner box first** — struggling/new cards appear in earlier groups.
2. **Higher `timesIncorrect` first** — frequently-wrong cards are prioritised.
3. **Oldest `lastReviewed` first** — cards not seen recently get attention.

Groups are then formed in order: `[7, 7, 7, ..., remainder]`.

### Session Flow

```
For each group (7 cards):
  Phase 1 — Introduction
    Show each card as a flashcard (both sides visible).
    User clicks "Got it" or presses Space/Enter to acknowledge.

  Phase 2 — Testing
    Quiz cards using the selected study mode (Typing / Flashcard / ProDeck).
    Track a "session streak" per card:
      Correct → streak += 1
      Incorrect → streak = 0
    Card "graduates" when streak >= 2 (GRADUATION_STREAK).
    Non-graduated cards cycle back into the group queue.

    Review mixing:
      ~20% of shown cards are randomly drawn from the review pool
      (graduated cards from previous groups) to create within-session
      spaced repetition.

  When all 7 cards graduate → group complete.
    Move graduated cards to the review pool.
    Advance to next group.

When all groups are complete → session complete.
```

### Card Selection (within a group)

During Phase 2 (testing):

1. Check if any cards in the group are un-introduced → if so, show intro.
2. Filter cards that haven't graduated yet ("active cards").
3. If all active cards graduated → advance to next group.
4. Roll for review: 20% chance to show a card from the review pool instead.
5. Otherwise, sort active cards by session streak ascending (lowest first).
6. Avoid showing the same card back-to-back.
7. Pick randomly from the lowest-streak tier.

### Session Progress Tracking

Each card has a `SessionCardState` (session-only, not persisted):

```typescript
interface SessionCardState {
  sessionStreak: number;   // consecutive correct this session
  introduced: boolean;     // has the user seen both sides?
  graduated: boolean;      // streak >= GRADUATION_STREAK
  attempts: number;        // total attempts this session
}
```

This is separate from the Leitner box system. The Leitner system tracks
**long-term** progress (between sessions). The session state tracks
**within-session** mastery.

### Interaction with Leitner System

Both systems run in parallel:
- Every answer still updates the Leitner box and syncs to DB.
- The group system adds session-level tracking on top.
- When groups are rebuilt (on restart or next visit), the Leitner progress
  determines group ordering — previously-mastered cards appear in later groups.

### Override Handling

When a user clicks "I was right" (override):
- Leitner: box moves up by 1 (same as classic).
- Session: streak is set to 1 (conservative — still needs one more correct
  answer to graduate, rather than restoring the old streak).

### Graduation Permanence

Once a card graduates (streak >= `GRADUATION_STREAK`), it stays graduated for
the rest of the session — even if it's later shown as a review card and
answered incorrectly. This prevents the totalGraduated count from bouncing
and ensures consistent progress tracking.

### Reset Options

Two reset levels are available via buttons below the study card:

| Button         | What it resets                                              |
|----------------|-------------------------------------------------------------|
| **Reset Group**| Current group only — re-introduces all cards, resets streaks|
| **Reset All**  | Entire session — rebuilds all groups, clears review pool    |

Neither reset affects **Leitner box progress** (long-term data is preserved).

### UI Elements

| Element              | Location                        | Description                                     |
|----------------------|---------------------------------|-------------------------------------------------|
| Algorithm dropdown   | Above study card                | Switches between "Groups of 7" and "Classic SRS" |
| Group progress bar   | Below dropdown                  | Visual bar showing graduated/seen/new in group  |
| Group counter        | Progress bar header             | "Group 2 of 10"                                  |
| Total progress       | Progress bar right side         | "14 / 70 learned"                                |
| Introduction card    | Replaces study card during intro| Shows both Q and A with "Got it" button          |
| Card overview badges | Card list at bottom             | "Done" badge for graduated, "1/2" for streak    |
| Reset Group button   | Below study card                | Resets current group only                        |
| Reset All button     | Below study card                | Resets entire session                            |

### Persistence

| Data                | Persisted?       | Storage                          |
|---------------------|------------------|----------------------------------|
| Learning mode       | Yes              | `localStorage` (global key)      |
| Leitner box level   | Yes              | `localStorage` + Supabase DB     |
| Session progress    | No (session-only)| Zustand state (lost on refresh)  |
| Group assignments   | No (session-only)| Rebuilt each session from Leitner |

---

## File References

| File                                      | What it contains                       |
|-------------------------------------------|----------------------------------------|
| `src/store/useDeckStudyStore.ts`          | Both algorithms, all state management  |
| `src/components/DeckStudySession.tsx`     | UI: cards, progress bars, dropdown     |
| `src/lib/validation.ts`                   | `diffAnswers()` for typing mode diffs  |

---

## Future Improvements

- **Adaptive group size**: Adjust GROUP_SIZE based on card difficulty distribution.
- **Confidence weighting**: Factor in answer speed for Leitner interval adjustments.
- **Leech detection**: Flag cards with high `timesIncorrect` that never stick.
- **Batch DB sync**: Sync all cards every N seconds instead of per-card.
- **Forgetting curve modelling**: Replace fixed intervals with SM-2 or FSRS.
