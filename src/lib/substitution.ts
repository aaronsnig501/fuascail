export const FADA_LETTERS = ['Á', 'É', 'Í', 'Ó', 'Ú'] as const;
export const DOT_LETTERS = ['Ḃ', 'Ċ', 'Ḋ', 'Ḟ', 'Ġ', 'Ṁ', 'Ṗ', 'Ṡ', 'Ṫ'] as const;
export const DIGRAPH_TO_DOT_ABOVE_PAIRS = [
  ['bh', 'ḃ'],
  ['ch', 'ċ'],
  ['dh', 'ḋ'],
  ['fh', 'ḟ'],
  ['gh', 'ġ'],
  ['mh', 'ṁ'],
  ['ph', 'ṗ'],
  ['sh', 'ṡ'],
  ['th', 'ṫ']
] as const;

export const DIFFICULTY_SETTINGS = {
  easy: {
    starterLetterCount: 5,
    hintAllowance: 3,
    lifeCount: 5
  },
  medium: {
    starterLetterCount: 3,
    hintAllowance: 2,
    lifeCount: 3
  },
  hard: {
    starterLetterCount: 1,
    hintAllowance: 1,
    lifeCount: 2
  },
  expert: {
    starterLetterCount: 0,
    hintAllowance: 0,
    lifeCount: 1
  }
} as const;

export type DifficultyTier = keyof typeof DIFFICULTY_SETTINGS;
export type LivesMode = 'saor' | 'teoranta';
export type OrthographyMode = 'digraf' | 'trad';
export type RandomSource = () => number;
export type WrongGuessesByNumber = Record<number, readonly string[]>;

export type NumberAssignment = {
  letterToNumber: Record<string, number>;
  numberToLetter: Record<number, string>;
};

export type SubstitutionPuzzle = NumberAssignment & {
  uniqueLetters: string[];
  starterNumbers: number[];
  starterLetters: string[];
};

export type CipherLetterCell = {
  kind: 'letter';
  letter: string;
  number: number;
};

export type CipherPunctuationCell = {
  kind: 'punctuation';
  value: string;
};

export type CipherCell = CipherLetterCell | CipherPunctuationCell;

export type CipherWord = {
  cells: CipherCell[];
};

export type GuessEvaluation = {
  letter: string;
  correct: boolean;
  newWrongGuess: boolean;
  wrongGuessesByNumber: WrongGuessesByNumber;
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

export function applyOrthography(text: string, mode: OrthographyMode): string {
  if (mode === 'digraf') {
    return text;
  }

  return DIGRAPH_TO_DOT_ABOVE_PAIRS.reduce(
    (convertedText, [digraph, dotAbove]) => replaceDigraph(convertedText, digraph, dotAbove),
    text
  );
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
  const requestedCount = DIFFICULTY_SETTINGS[difficulty].starterLetterCount;
  const maxStarterCount = Math.max(0, totalLetters - 3);

  return Math.min(requestedCount, maxStarterCount);
}

export function getHintAllowance(difficulty: DifficultyTier): number {
  return DIFFICULTY_SETTINGS[difficulty].hintAllowance;
}

export function getLifeCount(difficulty: DifficultyTier): number {
  return DIFFICULTY_SETTINGS[difficulty].lifeCount;
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

export function buildCipherWords(
  text: string,
  letterToNumber: Readonly<Record<string, number>>
): CipherWord[] {
  return text
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => ({
      cells: Array.from(word, (character): CipherCell => {
        const letter = normalizeSubstitutionLetter(character);

        if (isSubstitutionLetter(letter)) {
          const number = letterToNumber[letter];

          if (number === undefined) {
            throw new Error(`Missing substitution number for letter "${letter}".`);
          }

          return {
            kind: 'letter',
            letter,
            number
          };
        }

        return {
          kind: 'punctuation',
          value: character
        };
      })
    }));
}

export function evaluateGuess(
  numberToLetter: Readonly<Record<number, string>>,
  wrongGuessesByNumber: WrongGuessesByNumber,
  number: number,
  rawLetter: string
): GuessEvaluation {
  const letter = normalizeSubstitutionLetter(rawLetter);
  const correct = numberToLetter[number] === letter;

  if (correct) {
    return {
      letter,
      correct,
      newWrongGuess: false,
      wrongGuessesByNumber
    };
  }

  const previousWrongGuesses = wrongGuessesByNumber[number] ?? [];
  const newWrongGuess = !previousWrongGuesses.includes(letter);

  return {
    letter,
    correct,
    newWrongGuess,
    wrongGuessesByNumber: newWrongGuess
      ? {
          ...wrongGuessesByNumber,
          [number]: [...previousWrongGuesses, letter]
        }
      : wrongGuessesByNumber
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

function replaceDigraph(text: string, digraph: string, dotAbove: string): string {
  return text.replaceAll(digraph, dotAbove).replaceAll(
    capitalizeFirstLetter(digraph),
    capitalizeFirstLetter(dotAbove)
  ).replaceAll(digraph.toLocaleUpperCase('ga-IE'), dotAbove.toLocaleUpperCase('ga-IE'));
}

function capitalizeFirstLetter(value: string): string {
  const [first = '', ...rest] = Array.from(value);

  return `${first.toLocaleUpperCase('ga-IE')}${rest.join('')}`;
}
