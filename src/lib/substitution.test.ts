import { describe, expect, it } from 'vitest';
import {
  buildCipherWords,
  createNumberAssignment,
  createSubstitutionPuzzle,
  extractUniqueLetters,
  getStarterCount,
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
});
