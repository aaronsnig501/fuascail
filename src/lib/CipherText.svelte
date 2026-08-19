<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { buildCipherWords } from './substitution';

  export let text = '';
  export let letterToNumber: Readonly<Record<string, number>> = {};
  export let numberToLetter: Readonly<Record<number, string>> = {};
  export let guesses: Readonly<Record<number, string>> = {};
  export let solvedNumbers: ReadonlySet<number> | readonly number[] = [];
  export let selectedNumber: number | null = null;
  export let disabled = false;

  const dispatch = createEventDispatcher<{ select: { number: number } }>();

  $: words = buildCipherWords(text, letterToNumber);
  $: solvedNumberSet = normalizeNumberSet(solvedNumbers);

  function selectNumber(number: number): void {
    if (disabled) {
      return;
    }

    selectedNumber = selectedNumber === number ? null : number;
    dispatch('select', { number });
  }

  function isSolved(number: number): boolean {
    return solvedNumberSet.has(number);
  }

  function getCellAriaLabel(number: number, solved: boolean): string {
    const guessedLetter = guesses[number];

    if (solved) {
      return `Cill uimhir ${number}, réitithe mar ${numberToLetter[number] ?? ''}`;
    }

    if (selectedNumber === number) {
      return `Cill uimhir ${number}, roghnaithe`;
    }

    if (guessedLetter !== undefined) {
      return `Cill uimhir ${number}, buille faoi thuairim ${guessedLetter}`;
    }

    return `Cill uimhir ${number}, gan réiteach`;
  }

  function normalizeNumberSet(numbers: ReadonlySet<number> | readonly number[]): ReadonlySet<number> {
    return numbers instanceof Set ? numbers : new Set(numbers);
  }
</script>

<div
  class="cipher-text flex min-h-36 flex-wrap content-start justify-center gap-y-1 px-1.5 py-2"
  role="group"
  aria-label="Téacs rúin"
  aria-describedby="cipher-instructions"
>
  {#each words as word, wordIndex}
    <div class="my-1.5 mr-3 flex" role="group" aria-label={`Focal ${wordIndex + 1}`}>
      {#each word.cells as cell}
        {#if cell.kind === 'letter'}
          {@const solved = isSolved(cell.number)}
          <button
            type="button"
            class={[
              'cipher-cell mr-0.5 flex w-6 flex-col items-center select-none disabled:cursor-default',
              selectedNumber === cell.number ? 'text-[var(--cream)]' : 'text-[var(--cream)]',
              solved ? 'text-[var(--vermilion-bright)]' : '',
              disabled ? 'cursor-default' : 'cursor-pointer'
            ]}
            aria-label={getCellAriaLabel(cell.number, solved)}
            aria-pressed={selectedNumber === cell.number}
            disabled={disabled || solved}
            onclick={() => selectNumber(cell.number)}
          >
            <span
              class={[
                'cipher-letter font-utility flex h-6 w-full items-center justify-center border-b-2 text-lg font-semibold leading-none',
                selectedNumber === cell.number ? 'border-[var(--vermilion-bright)]' : 'border-[var(--charcoal-line)]',
                solved ? 'border-[var(--vermilion-dim)] text-[var(--vermilion-bright)]' : ''
              ]}
            >
              {solved ? numberToLetter[cell.number] ?? cell.letter : guesses[cell.number] ?? ''}
            </span>
            <span class="cipher-number font-utility mt-0.5 text-[9px] leading-none text-[var(--cream-faint)]">{cell.number}</span>
          </button>
        {:else}
          <span class="cipher-punctuation font-utility mr-1 self-end pb-1.5 text-lg text-[var(--cream-dim)]">{cell.value}</span>
        {/if}
      {/each}
    </div>
  {/each}
</div>
