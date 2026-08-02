<script lang="ts">
  import CipherKeyboard from '$lib/CipherKeyboard.svelte';
  import CipherText from '$lib/CipherText.svelte';
  import type { OrthographyMode } from '$lib/substitution';
  import { createSubstitutionPuzzle } from '$lib/substitution';

  const phrases: Record<OrthographyMode, string> = {
    digraf: 'Ní neart go cur le chéile.',
    trad: 'Ní neart go cur le ċéile.'
  };

  let mode: OrthographyMode = $state('digraf');
  let phrase = $derived(phrases[mode]);
  let puzzle = $derived(
    createSubstitutionPuzzle(phrase, 'medium', seededRandom([0.18, 0.72, 0.31, 0.94, 0.43, 0.09]))
  );

  let selectedNumber: number | null = $state(null);
  let pressedLetter: string | null = $state(null);

  function setMode(nextMode: OrthographyMode): void {
    mode = nextMode;
    selectedNumber = null;
    pressedLetter = null;
  }

  function seededRandom(values: readonly number[]): () => number {
    let index = 0;

    return () => {
      const value = values[index] ?? values.at(-1) ?? 0;
      index += 1;
      return value;
    };
  }
</script>

<svelte:head>
  <title>Fuascail</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#241f19_0%,#1c1916_62%)] px-3 py-7 text-stone-100">
  <section class="w-full max-w-[460px] border border-stone-700 bg-[#262019] px-5 py-6 shadow-2xl [border-top:3px_solid_#c1442c]">
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="font-mono text-[11px] tracking-[0.14em] text-stone-400 uppercase">Inniu · Seanfhocal</p>
      <div class="flex border border-stone-700 font-mono text-[10px] tracking-[0.08em] uppercase">
        <button
          type="button"
          class={[
            'px-2.5 py-1 text-stone-400',
            mode === 'digraf' ? 'bg-[#6f2a1c] text-stone-100' : ''
          ]}
          aria-pressed={mode === 'digraf'}
          onclick={() => setMode('digraf')}
        >
          Digraf
        </button>
        <button
          type="button"
          class={[
            'px-2.5 py-1 text-stone-400',
            mode === 'trad' ? 'bg-[#6f2a1c] text-stone-100' : ''
          ]}
          aria-pressed={mode === 'trad'}
          onclick={() => setMode('trad')}
        >
          Trad
        </button>
      </div>
    </div>

    <h1 class="mb-5 text-center text-2xl font-normal tracking-wide text-stone-100">Fuascail an Seanfhocal</h1>

    <CipherText
      text={phrase}
      letterToNumber={puzzle.letterToNumber}
      numberToLetter={puzzle.numberToLetter}
      solvedNumbers={puzzle.starterNumbers}
      bind:selectedNumber
    />

    <CipherKeyboard
      {mode}
      solvedLetters={puzzle.starterLetters}
      onpress={(letter) => {
        pressedLetter = letter;
      }}
    />

    <div class="mt-4 border-y border-stone-700 px-2 py-3">
      {#if selectedNumber === null}
        <p class="text-center font-mono text-[10.5px] text-stone-500 italic">roghnaigh cill chun tosú</p>
      {:else if pressedLetter !== null}
        <p class="text-center font-mono text-xs text-stone-400">
          uimhir <span class="font-semibold text-[#d95a3f]">{selectedNumber}</span>
          · litir <span class="font-semibold text-[#d95a3f]">{pressedLetter}</span>
        </p>
      {:else}
        <p class="text-center font-mono text-xs text-stone-400">
          uimhir roghnaithe <span class="font-semibold text-[#d95a3f]">{selectedNumber}</span>
        </p>
      {/if}
    </div>

    <p class="mt-3 text-center font-mono text-[10px] text-stone-500">gach uimhir = an litir chéanna, i gcónaí</p>
  </section>
</main>
