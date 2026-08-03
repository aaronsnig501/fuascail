<script lang="ts">
  import { DOT_LETTERS, FADA_LETTERS } from './substitution';
  import type { OrthographyMode } from './substitution';

  export let mode: OrthographyMode = 'digraf';
  export let solvedLetters: ReadonlySet<string> | readonly string[] = [];
  export let disabled = false;
  export let onpress: (letter: string) => void = () => {};

  const baseRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ] as const;

  $: solvedLetterSet = normalizeLetterSet(solvedLetters);

  function pressLetter(letter: string): void {
    if (disabled) {
      return;
    }

    onpress(letter);
  }

  function isUsed(letter: string): boolean {
    return solvedLetterSet.has(letter);
  }

  function normalizeLetterSet(letters: ReadonlySet<string> | readonly string[]): ReadonlySet<string> {
    return letters instanceof Set ? letters : new Set(letters);
  }
</script>

<div class:opacity-35={disabled} class:pointer-events-none={disabled} class="flex flex-col gap-1.5">
  {#each baseRows as row}
    <div class="flex justify-center gap-1.5">
      {#each row as letter}
        <button
          type="button"
          class={[
            'font-utility h-9 w-7 border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] text-center text-[13px] font-medium text-[var(--cream)] transition hover:bg-[var(--charcoal-hover)] focus:outline-none focus-visible:border-[var(--vermilion)]',
            isUsed(letter) ? 'opacity-35' : ''
          ]}
          aria-label={`Litir ${letter}`}
          disabled={disabled}
          onclick={() => pressLetter(letter)}
        >
          {letter}
        </button>
      {/each}
    </div>
  {/each}

  <div class="flex justify-center gap-1.5">
    {#each FADA_LETTERS as letter}
      <button
        type="button"
        class={[
          'font-utility h-9 w-8 border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] text-center text-xs font-medium text-[var(--cream)] transition hover:bg-[var(--charcoal-hover)] focus:outline-none focus-visible:border-[var(--vermilion)]',
          isUsed(letter) ? 'opacity-35' : ''
        ]}
        aria-label={`Litir ${letter}`}
        disabled={disabled}
        onclick={() => pressLetter(letter)}
      >
        {letter}
      </button>
    {/each}
  </div>

  {#if mode === 'trad'}
    <div class="flex justify-center gap-1.5">
      {#each DOT_LETTERS as letter}
        <button
          type="button"
          class={[
            'font-utility h-9 w-8 border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] text-center text-xs font-medium text-[var(--cream)] transition hover:bg-[var(--charcoal-hover)] focus:outline-none focus-visible:border-[var(--vermilion)]',
            isUsed(letter) ? 'opacity-35' : ''
          ]}
          aria-label={`Litir ${letter}`}
          disabled={disabled}
          onclick={() => pressLetter(letter)}
        >
          {letter}
        </button>
      {/each}
    </div>
  {/if}
</div>
