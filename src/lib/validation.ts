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
