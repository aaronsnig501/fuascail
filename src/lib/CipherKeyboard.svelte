<script lang="ts">
  import { DOT_LETTERS, FADA_LETTERS } from './substitution';
  import type { OrthographyMode } from './substitution';

  type Props = {
    mode?: OrthographyMode;
    solvedLetters?: readonly string[];
    disabled?: boolean;
    onpress?: (letter: string) => void;
  };

  let {
    mode = 'digraf',
    solvedLetters = [],
    disabled = false,
    onpress = () => {}
  }: Props = $props();

  const baseRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ] as const;

  function pressLetter(letter: string): void {
    if (disabled) {
      return;
    }

    onpress(letter);
  }

  function isUsed(letter: string): boolean {
    return solvedLetters.includes(letter);
  }

  function getLetterLabel(letter: string): string {
    return isUsed(letter) ? `Litir ${letter}, réitithe cheana` : `Buille faoi thuairim: litir ${letter}`;
  }

</script>

<div
  class:pointer-events-none={disabled}
  class="cipher-keyboard flex flex-col gap-1.5"
  role="group"
  aria-label="Méarchlár litreacha don tomhas"
  aria-disabled={disabled}
>
  {#each baseRows as row, rowIndex}
    <div class="flex justify-center gap-1.5" role="group" aria-label={`Sraith litreacha ${rowIndex + 1}`}>
      {#each row as letter}
        <button
          type="button"
          class={[
            'cipher-key font-utility h-9 w-7 border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] text-center text-[13px] font-medium text-[var(--cream)] transition hover:bg-[var(--charcoal-hover)] focus:outline-none focus-visible:border-[var(--vermilion)]',
            isUsed(letter) ? 'opacity-35' : ''
          ]}
          aria-label={getLetterLabel(letter)}
          disabled={isUsed(letter)}
          onclick={() => pressLetter(letter)}
        >
          {letter}
        </button>
      {/each}
    </div>
  {/each}

  <div class="flex justify-center gap-1.5" role="group" aria-label="Gutaí fada">
    {#each FADA_LETTERS as letter}
      <button
        type="button"
        class={[
          'cipher-key cipher-key-wide font-utility h-9 w-8 border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] text-center text-xs font-medium text-[var(--cream)] transition hover:bg-[var(--charcoal-hover)] focus:outline-none focus-visible:border-[var(--vermilion)]',
          isUsed(letter) ? 'opacity-35' : ''
        ]}
        aria-label={getLetterLabel(letter)}
        disabled={isUsed(letter)}
        onclick={() => pressLetter(letter)}
      >
        {letter}
      </button>
    {/each}
  </div>

  {#if mode === 'trad'}
    <div class="flex justify-center gap-1.5" role="group" aria-label="Consain le ponc séimhithe">
      {#each DOT_LETTERS as letter}
        <button
          type="button"
          class={[
            'cipher-key cipher-key-wide font-utility h-9 w-8 border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] text-center text-xs font-medium text-[var(--cream)] transition hover:bg-[var(--charcoal-hover)] focus:outline-none focus-visible:border-[var(--vermilion)]',
            isUsed(letter) ? 'opacity-35' : ''
          ]}
          aria-label={getLetterLabel(letter)}
          disabled={isUsed(letter)}
          onclick={() => pressLetter(letter)}
        >
          {letter}
        </button>
      {/each}
    </div>
  {/if}
</div>
