import { pronouns, type PronounKey } from '@/data/verbs';

// All possible pronoun forms to strip from user input
const PRONOUN_PATTERNS = [
  // Standard pronouns
  "j'", "je ", "tu ", "il ", "elle ", "on ",
  "nous ", "vous ", "ils ", "elles ",
  // With apostrophe variations
  "j'", "j'",
];

/**
 * Normalize answer for comparison
 * - Lowercase
 * - Trim whitespace
 * - Remove leading pronoun if present
 */
export function normalizeAnswer(input: string, pronoun?: PronounKey): string {
  let normalized = input.trim().toLowerCase();

  // Strip pronoun from the beginning if user typed it
  for (const pattern of PRONOUN_PATTERNS) {
    if (normalized.startsWith(pattern.toLowerCase())) {
      normalized = normalized.slice(pattern.length).trim();
      break;
    }
  }

  // Also check for the specific pronoun we're asking for
  if (pronoun) {
    const pronounText = pronouns[pronoun].toLowerCase();
    // Handle "j'" special case
    if (pronoun === 'je') {
      if (normalized.startsWith("j'") || normalized.startsWith("j'")) {
        normalized = normalized.slice(2).trim();
      } else if (normalized.startsWith("je ")) {
        normalized = normalized.slice(3).trim();
      }
    } else if (normalized.startsWith(pronounText + " ")) {
      normalized = normalized.slice(pronounText.length + 1).trim();
    }
  }

  return normalized;
}

/**
 * Validate user answer against correct answer
 * Returns detailed result for UI feedback
 */
export function validateAnswer(
  userInput: string,
  correctAnswer: string,
  pronoun: PronounKey
): {
  isCorrect: boolean;
  normalizedUser: string;
  normalizedCorrect: string;
} {
  const normalizedUser = normalizeAnswer(userInput, pronoun);
  const normalizedCorrect = correctAnswer.toLowerCase().trim();

  return {
    isCorrect: normalizedUser === normalizedCorrect,
    normalizedUser,
    normalizedCorrect,
  };
}

/**
 * Character-level diff between user answer and correct answer.
 * Returns arrays of segments with type: 'correct', 'wrong', or 'missing'.
 */
export interface DiffSegment {
  char: string;
  type: 'correct' | 'wrong' | 'missing' | 'extra';
}

export function diffAnswers(userInput: string, correctAnswer: string): {
  userDiff: DiffSegment[];
  correctDiff: DiffSegment[];
} {
  const user = userInput.toLowerCase().trim();
  const correct = correctAnswer.toLowerCase().trim();

  const userDiff: DiffSegment[] = [];
  const correctDiff: DiffSegment[] = [];

  const maxLen = Math.max(user.length, correct.length);

  for (let i = 0; i < maxLen; i++) {
    const uChar = i < user.length ? user[i] : null;
    const cChar = i < correct.length ? correct[i] : null;

    if (uChar && cChar) {
      if (uChar === cChar) {
        userDiff.push({ char: userInput[i] || uChar, type: 'correct' });
        correctDiff.push({ char: correctAnswer[i] || cChar, type: 'correct' });
      } else {
        userDiff.push({ char: userInput[i] || uChar, type: 'wrong' });
        correctDiff.push({ char: correctAnswer[i] || cChar, type: 'correct' });
      }
    } else if (uChar && !cChar) {
      // User typed extra characters
      userDiff.push({ char: userInput[i] || uChar, type: 'extra' });
    } else if (!uChar && cChar) {
      // User missed characters
      correctDiff.push({ char: correctAnswer[i] || cChar, type: 'missing' });
    }
  }

  return { userDiff, correctDiff };
}
