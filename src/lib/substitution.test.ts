import { describe, expect, it } from 'vitest';
import {
  CONTENT_BANK,
  PUZZLE_CONTENT_JSON_SCHEMA,
  CONTENT_BANK_TARGET_SIZE,
  getContentBankReadiness,
  getContentByCategory,
  getPuzzleCategories,
  getProductionReadyContentBank,
  isPublicDomainByAuthorDeathYear,
  selectContentForCategory,
  selectNextContent,
  validatePuzzleContent,
  type PuzzleContent
} from './content';
import {
  applyOrthography,
  buildCipherWords,
  createNumberAssignment,
  createSubstitutionPuzzle,
  evaluateGuess,
  extractUniqueLetters,
  getHintAllowance,
  getLifeCount,
  getStarterCount,
  getVisibleSolvedLetters,
  isSubstitutionLetter,
  selectStarterNumbers
} from './substitution';

function seededRandom(values: readonly number[]): () => number {
  let index = 0;

  return () => {
    const value = values[index] ?? values.at(-1) ?? 0;
    index += 1;
    return value;
  };
}

describe('substitution logic', () => {
  it('extracts unique substitution letters in first-seen order', () => {
    expect(extractUniqueLetters('Ní neart go cur le chéile.')).toEqual([
      'N',
      'Í',
      'E',
      'A',
      'R',
      'T',
      'G',
      'O',
      'C',
      'U',
      'L',
      'H',
      'É',
      'I'
    ]);
  });

  it('supports dotted traditional Irish letters', () => {
    expect(extractUniqueLetters('ċéile agus ḃfuil?')).toEqual([
      'Ċ',
      'É',
      'I',
      'L',
      'E',
      'A',
      'G',
      'U',
      'S',
      'Ḃ',
      'F'
    ]);
    expect(isSubstitutionLetter('ċ')).toBe(true);
  });

  it('applies the fixed nine-pair dot-above lookup before puzzle generation', () => {
    expect(applyOrthography('bh ch dh fh gh mh ph sh th', 'trad')).toBe(
      'ḃ ċ ḋ ḟ ġ ṁ ṗ ṡ ṫ'
    );
    expect(applyOrthography('Bh Ch DH', 'trad')).toBe('Ḃ Ċ Ḋ');
    expect(applyOrthography('bh ch dh', 'digraf')).toBe('bh ch dh');
  });

  it('assigns shuffled numbers to letters without changing the letter set', () => {
    const assignment = createNumberAssignment(['A', 'B', 'C', 'D'], seededRandom([0, 0, 0]));

    expect(assignment.letterToNumber).toEqual({ A: 2, B: 3, C: 4, D: 1 });
    expect(assignment.numberToLetter).toEqual({ 1: 'D', 2: 'A', 3: 'B', 4: 'C' });
  });

  it('drives starter count from difficulty while leaving at least three letters unsolved', () => {
    expect(getStarterCount(10, 'easy')).toBe(5);
    expect(getStarterCount(10, 'medium')).toBe(3);
    expect(getStarterCount(10, 'hard')).toBe(1);
    expect(getStarterCount(10, 'expert')).toBe(0);
    expect(getStarterCount(4, 'easy')).toBe(1);
    expect(getStarterCount(3, 'easy')).toBe(0);
  });

  it('drives hint allowance and life count from the same difficulty setting', () => {
    expect(getHintAllowance('easy')).toBe(3);
    expect(getLifeCount('easy')).toBe(5);
    expect(getHintAllowance('medium')).toBe(2);
    expect(getLifeCount('medium')).toBe(3);
    expect(getHintAllowance('hard')).toBe(1);
    expect(getLifeCount('hard')).toBe(2);
    expect(getHintAllowance('expert')).toBe(0);
    expect(getLifeCount('expert')).toBe(1);
  });

  it('selects random starter numbers using the difficulty tier count', () => {
    expect(selectStarterNumbers([1, 2, 3, 4, 5], 'medium', seededRandom([0, 0, 0, 0]))).toEqual([
      2,
      3
    ]);
  });

  it('creates a complete DOM-free puzzle model', () => {
    const puzzle = createSubstitutionPuzzle('Abba!', 'hard', seededRandom([0, 0, 0]));

    expect(puzzle.uniqueLetters).toEqual(['A', 'B']);
    expect(puzzle.starterNumbers).toEqual([]);
    expect(puzzle.starterLetters).toEqual([]);
    expect(puzzle.letterToNumber).toEqual({ A: 2, B: 1 });
    expect(puzzle.numberToLetter).toEqual({ 1: 'B', 2: 'A' });
  });

  it('projects text into cipher word groups with numbered letter cells and punctuation', () => {
    expect(buildCipherWords('Abba!', { A: 2, B: 1 })).toEqual([
      {
        cells: [
          { kind: 'letter', letter: 'A', number: 2 },
          { kind: 'letter', letter: 'B', number: 1 },
          { kind: 'letter', letter: 'B', number: 1 },
          { kind: 'letter', letter: 'A', number: 2 },
          { kind: 'punctuation', value: '!' }
        ]
      }
    ]);
  });

  it('marks only genuinely new wrong letters for a number as life-burning mistakes', () => {
    const firstWrong = evaluateGuess({ 7: 'A' }, {}, 7, 'B');
    const repeatedWrong = evaluateGuess({ 7: 'A' }, firstWrong.wrongGuessesByNumber, 7, 'B');
    const newWrong = evaluateGuess({ 7: 'A' }, repeatedWrong.wrongGuessesByNumber, 7, 'C');
    const correct = evaluateGuess({ 7: 'A' }, newWrong.wrongGuessesByNumber, 7, 'A');

    expect(firstWrong).toMatchObject({ correct: false, newWrongGuess: true });
    expect(repeatedWrong).toMatchObject({ correct: false, newWrongGuess: false });
    expect(newWrong).toMatchObject({ correct: false, newWrongGuess: true });
    expect(correct).toMatchObject({ correct: true, newWrongGuess: false });
    expect(newWrong.wrongGuessesByNumber).toEqual({ 7: ['B', 'C'] });
  });

  it('derives used keyboard letters from visible starter letters', () => {
    expect(
      getVisibleSolvedLetters(
        'A H R N Z',
        { A: 1, H: 2, R: 3, N: 4, Z: 5 },
        { 1: 'A', 2: 'H', 3: 'R', 4: 'N', 5: 'Z' },
        {},
        [1, 2, 3, 4]
      )
    ).toEqual(['A', 'H', 'R', 'N']);
  });

  it('derives used keyboard letters from correct guesses and hints only', () => {
    expect(
      getVisibleSolvedLetters(
        'A H R',
        { A: 1, H: 2, R: 3 },
        { 1: 'A', 2: 'H', 3: 'R' },
        { 2: 'H', 3: 'X' },
        [1, 2]
      )
    ).toEqual(['A', 'H']);
  });

  it('reveals every visible answer letter when the puzzle is locked', () => {
    expect(
      getVisibleSolvedLetters(
        'Abba!',
        { A: 2, B: 1 },
        { 1: 'B', 2: 'A' },
        {},
        [],
        { revealAnswer: true }
      )
    ).toEqual(['A', 'B']);
  });

  it('ignores stale solved numbers that are not visible in the current puzzle', () => {
    expect(
      getVisibleSolvedLetters(
        'B',
        { B: 2 },
        { 2: 'B' },
        {},
        [1]
      )
    ).toEqual([]);
  });
});

describe('content selection', () => {
  const bank: readonly PuzzleContent[] = [
    {
      id: 'a',
      category: 'test',
      text_digraf: 'A',
      text_trad: 'A',
      translation_en: 'A',
      provenance_note: 'A',
      difficulty_tier: 'easy',
      source_rights_reference: 'Test fixture.',
      source_url: 'candidate:test',
      author_name: 'Test Author',
      author_death_year: 1900,
      public_domain_basis: 'Test author died in 1900.',
      linguistic_review: { status: 'pending' }
    },
    {
      id: 'b',
      category: 'test',
      text_digraf: 'B',
      text_trad: 'B',
      translation_en: 'B',
      provenance_note: 'B',
      difficulty_tier: 'medium',
      source_rights_reference: 'Test fixture.',
      source_url: 'candidate:test',
      author_name: 'Test Author',
      author_death_year: 1900,
      public_domain_basis: 'Test author died in 1900.',
      linguistic_review: { status: 'pending' }
    },
    {
      id: 'c',
      category: 'test',
      text_digraf: 'C',
      text_trad: 'C',
      translation_en: 'C',
      provenance_note: 'C',
      difficulty_tier: 'hard',
      source_rights_reference: 'Test fixture.',
      source_url: 'candidate:test',
      author_name: 'Test Author',
      author_death_year: 1900,
      public_domain_basis: 'Test author died in 1900.',
      linguistic_review: { status: 'pending' }
    }
  ];

  it('defines the requested required JSON schema fields', () => {
    expect(PUZZLE_CONTENT_JSON_SCHEMA.required).toEqual([
      'id',
      'category',
      'text_digraf',
      'text_trad',
      'translation_en',
      'provenance_note',
      'difficulty_tier',
      'source_rights_reference',
      'source_url',
      'author_name',
      'author_death_year',
      'public_domain_basis',
      'linguistic_review'
    ]);
  });

  it('validates every bank item against the puzzle schema', () => {
    expect(CONTENT_BANK.every(validatePuzzleContent)).toBe(true);
  });

  it('groups puzzle content into browsable categories', () => {
    expect(getPuzzleCategories(bank)).toEqual([
      {
        slug: 'test',
        category: 'test',
        label: 'Test',
        description: 'Bailiúchán puzal ón gcatagóir seo.',
        count: 3,
        difficultyTiers: ['easy', 'medium', 'hard']
      }
    ]);
  });

  it('filters and selects content by category slug', () => {
    expect(getContentByCategory(bank, 'test')).toEqual([...bank]);
    expect(selectContentForCategory(bank, 'test', '2026-08-02').category).toBe('test');
    expect(() => selectContentForCategory(bank, 'missing', '2026-08-02')).toThrow(
      'Cannot select content for unknown category "missing".'
    );
  });

  it('selects the next content item from the full bank', () => {
    expect(selectNextContent(bank, 'a').id).toBe('b');
    expect(selectNextContent(bank, 'c').id).toBe('a');
    expect(selectNextContent(bank, 'missing').id).toBe('a');
  });

  it('selects the next content item inside a category when supplied', () => {
    const firstFixture = bank[0];

    if (firstFixture === undefined) {
      throw new Error('Missing content fixture.');
    }

    const mixedBank: readonly PuzzleContent[] = [
      ...bank,
      { ...firstFixture, id: 'other', category: 'other-category', text_digraf: 'Other' }
    ];

    expect(selectNextContent(mixedBank, 'b', 'test').id).toBe('c');
    expect(selectNextContent(mixedBank, 'c', 'test').id).toBe('a');
    expect(selectNextContent(mixedBank, 'other', 'other-category').id).toBe('other');
  });

  it('requires a source and rights reference', () => {
    expect(
      validatePuzzleContent({
        id: 'missing-rights',
        category: 'test',
        text_digraf: 'Téacs',
        text_trad: 'Téacs',
        translation_en: 'Text',
        provenance_note: 'Fixture note.',
        difficulty_tier: 'easy',
        source_url: 'candidate:test',
        author_name: 'Test Author',
        author_death_year: 1900,
        public_domain_basis: 'Test author died in 1900.',
        linguistic_review: { status: 'pending' }
      })
    ).toBe(false);
  });

  it('requires native-speaker or linguist sign-off before production eligibility', () => {
    const unsignedFixture = bank[0];

    if (unsignedFixture === undefined) {
      throw new Error('Missing content fixture.');
    }

    const signedOffFixture: PuzzleContent = {
      ...unsignedFixture,
      source_rights_reference:
        'CELT: Corpus of Electronic Texts reference; underlying text public domain by author death year.',
      source_url: 'https://celt.ucc.ie/document/E900007-006/',
      author_name: 'Pádraic H. Pearse',
      author_death_year: 1916,
      public_domain_basis: 'Pádraic H. Pearse died in 1916; 70-year term satisfied by 1986.',
      linguistic_review: {
        status: 'signed_off',
        reviewer_name: 'Reviewer Name',
        reviewer_role: 'linguist',
        reviewed_on: '2026-08-02'
      }
    };

    expect(getProductionReadyContentBank([unsignedFixture, signedOffFixture])).toEqual([
      signedOffFixture
    ]);
  });

  it('reports production readiness against the 120-entry target', () => {
    const readiness = getContentBankReadiness(CONTENT_BANK);

    expect(readiness.targetSize).toBe(CONTENT_BANK_TARGET_SIZE);
    expect(readiness.totalEntries).toBe(CONTENT_BANK.length);
    expect(readiness.readyForProduction).toBe(false);
    expect(readiness.signedOffEntries).toBe(0);
    expect(readiness.unsignedEntryIds).toEqual(CONTENT_BANK.map((item) => item.id));
    expect(readiness.nonPublicDomainEntryIds).toEqual(CONTENT_BANK.map((item) => item.id));
  });

  it('uses author death year for public-domain eligibility', () => {
    expect(isPublicDomainByAuthorDeathYear({ author_death_year: 1956 }, 2026)).toBe(true);
    expect(isPublicDomainByAuthorDeathYear({ author_death_year: 1957 }, 2026)).toBe(false);
    expect(isPublicDomainByAuthorDeathYear({ author_death_year: 0 }, 2026)).toBe(false);
  });
});
