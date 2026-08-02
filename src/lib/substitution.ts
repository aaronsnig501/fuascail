export const FADA_LETTERS = ['Á', 'É', 'Í', 'Ó', 'Ú'] as const;
export const DOT_LETTERS = ['Ḃ', 'Ċ', 'Ḋ', 'Ḟ', 'Ġ', 'Ṁ', 'Ṗ', 'Ṡ', 'Ṫ'] as const;

export const DIFFICULTY_STARTER_COUNTS = {
  easy: 5,
  medium: 3,
  hard: 1,
  expert: 0
} as const;

export type DifficultyTier = keyof typeof DIFFICULTY_STARTER_COUNTS;
export type RandomSource = () => number;

export type NumberAssignment = {
  letterToNumber: Record<string, number>;
  numberToLetter: Record<number, string>;
};

export type SubstitutionPuzzle = NumberAssignment & {
  uniqueLetters: string[];
  starterNumbers: number[];
  starterLetters: string[];
};

const BASIC_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SUBSTITUTION_LETTERS = new Set<string>([
  ...BASIC_LETTERS,
  ...FADA_LETTERS,
  ...DOT_LETTERS
]);

export function isSubstitutionLetter(character: string): boolean {
  return SUBSTITUTION_LETTERS.has(character.toLocaleUpperCase('ga-IE'));
}

export function normalizeSubstitutionLetter(character: string): string {
  return character.toLocaleUpperCase('ga-IE');
}

export function extractUniqueLetters(text: string): string[] {
  const uniqueLetters: string[] = [];
  const seen = new Set<string>();

  for (const character of text) {
    const letter = normalizeSubstitutionLetter(character);

    if (isSubstitutionLetter(letter) && !seen.has(letter)) {
      uniqueLetters.push(letter);
      seen.add(letter);
    }
  }

  return uniqueLetters;
}

export function createNumberAssignment(
  letters: readonly string[],
  random: RandomSource = Math.random
): NumberAssignment {
  const numbers = shuffle(
    Array.from({ length: letters.length }, (_, index) => index + 1),
    random
  );
  const letterToNumber: Record<string, number> = {};
  const numberToLetter: Record<number, string> = {};

  letters.forEach((rawLetter, index) => {
    const letter = normalizeSubstitutionLetter(rawLetter);
    const number = numbers[index];

    if (number === undefined) {
      return;
    }

    letterToNumber[letter] = number;
    numberToLetter[number] = letter;
  });

  return { letterToNumber, numberToLetter };
}

export function getStarterCount(
  totalLetters: number,
  difficulty: DifficultyTier
): number {
  const requestedCount = DIFFICULTY_STARTER_COUNTS[difficulty];
  const maxStarterCount = Math.max(0, totalLetters - 3);

  return Math.min(requestedCount, maxStarterCount);
}

export function selectStarterNumbers(
  availableNumbers: readonly number[],
  difficulty: DifficultyTier,
  random: RandomSource = Math.random
): number[] {
  const starterCount = getStarterCount(availableNumbers.length, difficulty);

  return shuffle(availableNumbers, random).slice(0, starterCount);
}

export function createSubstitutionPuzzle(
  text: string,
  difficulty: DifficultyTier,
  random: RandomSource = Math.random
): SubstitutionPuzzle {
  const uniqueLetters = extractUniqueLetters(text);
  const assignment = createNumberAssignment(uniqueLetters, random);
  const numbers = Object.keys(assignment.numberToLetter).map(Number);
  const starterNumbers = selectStarterNumbers(numbers, difficulty, random);
  const starterLetters = starterNumbers.map((number) => assignment.numberToLetter[number] ?? '');

  return {
    ...assignment,
    uniqueLetters,
    starterNumbers,
    starterLetters
  };
}

function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const swap = shuffled[swapIndex];

    if (current === undefined || swap === undefined) {
      continue;
    }

    shuffled[index] = swap;
    shuffled[swapIndex] = current;
  }

  return shuffled;
}
