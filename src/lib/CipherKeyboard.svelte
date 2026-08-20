<script lang="ts">
  import type { OrthographyMode } from './substitution';

  type Props = {
    mode?: OrthographyMode;
    letters?: readonly string[];
    solvedLetters?: readonly string[];
    disabled?: boolean;
    onpress?: (letter: string) => void;
  };

  let {
    mode = 'digraf',
    letters = [],
    solvedLetters = [],
    disabled = false,
    onpress = () => {}
  }: Props = $props();

  let keyboardRows = $derived(getKeyboardRows(letters));

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

  function getKeyboardRows(keyboardLetters: readonly string[]): string[][] {
    if (keyboardLetters.length === 0) {
      return [];
    }

    const rowCount = Math.ceil(keyboardLetters.length / 9);
    const rowLength = Math.ceil(keyboardLetters.length / rowCount);
    const rows: string[][] = [];

    for (let index = 0; index < keyboardLetters.length; index += rowLength) {
      rows.push(keyboardLetters.slice(index, index + rowLength));
    }

    return rows;
  }
</script>

<div
  class:pointer-events-none={disabled}
  class="cipher-keyboard flex flex-col gap-1.5"
  role="group"
  aria-label={mode === 'trad' ? 'Méarchlár litreacha traidisiúnta don tomhas' : 'Méarchlár litreacha don tomhas'}
  aria-disabled={disabled}
>
  {#each keyboardRows as row, rowIndex}
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
</div>
