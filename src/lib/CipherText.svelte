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

  function normalizeNumberSet(numbers: ReadonlySet<number> | readonly number[]): ReadonlySet<number> {
    return numbers instanceof Set ? numbers : new Set(numbers);
  }
</script>

<div class="flex min-h-36 flex-wrap content-start justify-center gap-y-1 px-1.5 py-2" aria-label="Ciphered text">
  {#each words as word}
    <div class="my-1.5 mr-3 flex" role="group" aria-label="Word">
      {#each word.cells as cell}
        {#if cell.kind === 'letter'}
          {@const solved = isSolved(cell.number)}
          <button
            type="button"
            class={[
              'mr-0.5 flex w-6 flex-col items-center select-none disabled:cursor-default',
              selectedNumber === cell.number ? 'text-orange-200' : 'text-stone-100',
              solved ? 'text-red-400' : '',
              disabled ? 'cursor-default' : 'cursor-pointer'
            ]}
            aria-label={`Number ${cell.number}`}
            aria-pressed={selectedNumber === cell.number}
            disabled={disabled || solved}
            on:click={() => selectNumber(cell.number)}
          >
            <span
              class={[
                'flex h-6 w-full items-center justify-center border-b-2 font-mono text-lg font-semibold leading-none',
                selectedNumber === cell.number ? 'border-red-400' : 'border-stone-600',
                solved ? 'border-red-900 text-red-400' : ''
              ]}
            >
              {solved ? numberToLetter[cell.number] ?? cell.letter : guesses[cell.number] ?? ''}
            </span>
            <span class="mt-0.5 font-mono text-[9px] leading-none text-stone-500">{cell.number}</span>
          </button>
        {:else}
          <span class="mr-1 self-end pb-1.5 font-mono text-lg text-stone-400">{cell.value}</span>
        {/if}
      {/each}
    </div>
  {/each}
</div>
