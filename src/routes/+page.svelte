<script lang="ts">
  import CipherText from '$lib/CipherText.svelte';
  import { createSubstitutionPuzzle } from '$lib/substitution';

  const phrase = 'Ní neart go cur le chéile.';
  const puzzle = createSubstitutionPuzzle(phrase, 'medium', seededRandom([0.18, 0.72, 0.31, 0.94, 0.43, 0.09]));

  let selectedNumber: number | null = $state(null);

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
      <p class="border border-stone-700 px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-stone-400 uppercase">Digraf</p>
    </div>

    <h1 class="mb-5 text-center text-2xl font-normal tracking-wide text-stone-100">Fuascail an Seanfhocal</h1>

    <CipherText
      text={phrase}
      letterToNumber={puzzle.letterToNumber}
      numberToLetter={puzzle.numberToLetter}
      solvedNumbers={puzzle.starterNumbers}
      bind:selectedNumber
    />

    <div class="mt-4 border-y border-stone-700 px-2 py-3">
      {#if selectedNumber === null}
        <p class="text-center font-mono text-[10.5px] text-stone-500 italic">roghnaigh cill chun tosú</p>
      {:else}
        <p class="text-center font-mono text-xs text-stone-400">
          uimhir roghnaithe <span class="font-semibold text-[#d95a3f]">{selectedNumber}</span>
        </p>
      {/if}
    </div>

    <p class="mt-3 text-center font-mono text-[10px] text-stone-500">gach uimhir = an litir chéanna, i gcónaí</p>
  </section>
</main>
