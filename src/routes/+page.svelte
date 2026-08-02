<script lang="ts">
  import { onMount } from 'svelte';
  import CipherKeyboard from '$lib/CipherKeyboard.svelte';
  import CipherText from '$lib/CipherText.svelte';
  import {
    CONTENT_BANK,
    RECENT_CONTENT_WINDOW_DAYS,
    getDateKey,
    recordServedContent,
    selectContentForDate,
    type ContentBankItem,
    type ServedContentRecord
  } from '$lib/content';
  import type { DifficultyTier, LivesMode, OrthographyMode, WrongGuessesByNumber } from '$lib/substitution';
  import {
    DIFFICULTY_SETTINGS,
    applyOrthography,
    createSubstitutionPuzzle,
    evaluateGuess,
    getHintAllowance,
    getLifeCount
  } from '$lib/substitution';

  const servedContentStorageKey = 'fuascail.recentlyServedContent';
  const todayKey = getDateKey(new Date());

  let mode: OrthographyMode = $state('digraf');
  let difficulty: DifficultyTier = $state('medium');
  let livesMode: LivesMode = $state('teoranta');
  let puzzleSeed = $state(1);
  let selectedContent: ContentBankItem = $state(selectContentForDate(CONTENT_BANK, todayKey));
  let selectedNumber: number | null = $state(null);
  let guesses: Record<number, string> = $state({});
  let wrongGuessesByNumber: WrongGuessesByNumber = $state({});
  let hintsUsed = $state(0);
  let livesLeft = $state(getLifeCount('medium'));
  let status = $state('roghnaigh cill chun tosú');
  let showTranslation = $state(false);

  let phrase = $derived(applyOrthography(selectedContent.text, mode));
  let puzzle = $derived(
    createSubstitutionPuzzle(phrase, difficulty, seededRandomFromSeed(puzzleSeed))
  );
  let hintAllowance = $derived(getHintAllowance(difficulty));
  let lifeCount = $derived(getLifeCount(difficulty));
  let correctGuessNumbers = $derived(
    Object.entries(guesses)
      .filter(([number, letter]) => puzzle.numberToLetter[Number(number)] === letter)
      .map(([number]) => Number(number))
  );
  let solvedNumbers = $derived([...puzzle.starterNumbers, ...correctGuessNumbers]);
  let solvedLetters = $derived(solvedNumbers.map((number) => puzzle.numberToLetter[number] ?? ''));
  let remainingHints = $derived(Math.max(0, hintAllowance - hintsUsed));
  let complete = $derived(
    Object.keys(puzzle.numberToLetter)
      .map(Number)
      .every((number) => solvedNumbers.includes(number))
  );
  let resultKind = $derived(complete ? 'solved' : livesMode === 'teoranta' && livesLeft <= 0 ? 'shown' : null);
  let locked = $derived(resultKind !== null);
  let resultEyebrow = $derived(resultKind === 'solved' ? 'Réitithe' : 'Seo é');

  onMount(() => {
    const servedRecords = loadServedContentRecords();
    selectedContent = selectContentForDate(CONTENT_BANK, todayKey, servedRecords);
    saveServedContentRecords(
      recordServedContent(
        servedRecords,
        selectedContent.id,
        todayKey,
        RECENT_CONTENT_WINDOW_DAYS
      )
    );
    resetProgress(getLifeCount(difficulty));
  });

  function setMode(nextMode: OrthographyMode): void {
    if (mode === nextMode) {
      return;
    }

    mode = nextMode;
    puzzleSeed += 1;
    resetProgress(getLifeCount(difficulty));
  }

  function setDifficulty(nextDifficulty: DifficultyTier): void {
    difficulty = nextDifficulty;
    resetProgress(getLifeCount(nextDifficulty));
  }

  function setLivesMode(nextLivesMode: LivesMode): void {
    livesMode = nextLivesMode;
    resetProgress(getLifeCount(difficulty));
  }

  function resetProgress(nextLivesLeft: number): void {
    selectedNumber = null;
    guesses = {};
    wrongGuessesByNumber = {};
    hintsUsed = 0;
    livesLeft = nextLivesLeft;
    status = 'roghnaigh cill chun tosú';
    showTranslation = false;
  }

  function guessLetter(letter: string): void {
    if (selectedNumber === null || locked) {
      return;
    }

    const evaluation = evaluateGuess(
      puzzle.numberToLetter,
      wrongGuessesByNumber,
      selectedNumber,
      letter
    );

    guesses = {
      ...guesses,
      [selectedNumber]: evaluation.letter
    };
    wrongGuessesByNumber = evaluation.wrongGuessesByNumber;

    if (evaluation.correct) {
      status = `ceart: ${selectedNumber} = ${evaluation.letter}`;
      selectedNumber = null;
      return;
    }

    if (livesMode === 'teoranta' && evaluation.newWrongGuess) {
      livesLeft = Math.max(0, livesLeft - 1);
    }

    status = evaluation.newWrongGuess
      ? `mícheart: ${selectedNumber} ≠ ${evaluation.letter}`
      : `triailte cheana: ${selectedNumber} ≠ ${evaluation.letter}`;
  }

  function useHint(): void {
    if (locked || remainingHints <= 0) {
      return;
    }

    const unsolvedNumber = Object.keys(puzzle.numberToLetter)
      .map(Number)
      .find((number) => !solvedNumbers.includes(number));

    if (unsolvedNumber === undefined) {
      return;
    }

    const letter = puzzle.numberToLetter[unsolvedNumber];

    if (letter === undefined) {
      return;
    }

    guesses = {
      ...guesses,
      [unsolvedNumber]: letter
    };
    selectedNumber = null;
    hintsUsed += 1;
    status = `nod: ${unsolvedNumber} = ${letter}`;
  }

  function seededRandomFromSeed(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  function loadServedContentRecords(): ServedContentRecord[] {
    const storedValue = localStorage.getItem(servedContentStorageKey);

    if (storedValue === null) {
      return [];
    }

    try {
      const parsedValue: unknown = JSON.parse(storedValue);

      if (!Array.isArray(parsedValue)) {
        return [];
      }

      return parsedValue.filter(isServedContentRecord);
    } catch {
      return [];
    }
  }

  function saveServedContentRecords(records: readonly ServedContentRecord[]): void {
    localStorage.setItem(servedContentStorageKey, JSON.stringify(records));
  }

  function isServedContentRecord(value: unknown): value is ServedContentRecord {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'servedOn' in value &&
      typeof value.id === 'string' &&
      typeof value.servedOn === 'string'
    );
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

    <div class="mb-4 flex items-center justify-between gap-3">
      <div class="flex border border-stone-700 font-mono text-[10px] tracking-[0.08em] uppercase">
        {#each Object.keys(DIFFICULTY_SETTINGS) as tier}
          <button
            type="button"
            class={[
              'px-2 py-1 text-stone-400',
              difficulty === tier ? 'bg-[#6f2a1c] text-stone-100' : ''
            ]}
            aria-pressed={difficulty === tier}
            onclick={() => setDifficulty(tier as DifficultyTier)}
          >
            {tier}
          </button>
        {/each}
      </div>

      <div class="flex border border-stone-700 font-mono text-[10px] tracking-[0.08em] uppercase">
        <button
          type="button"
          class={[
            'px-2.5 py-1 text-stone-400',
            livesMode === 'saor' ? 'bg-[#6f2a1c] text-stone-100' : ''
          ]}
          aria-pressed={livesMode === 'saor'}
          onclick={() => setLivesMode('saor')}
        >
          Saor
        </button>
        <button
          type="button"
          class={[
            'px-2.5 py-1 text-stone-400',
            livesMode === 'teoranta' ? 'bg-[#6f2a1c] text-stone-100' : ''
          ]}
          aria-pressed={livesMode === 'teoranta'}
          onclick={() => setLivesMode('teoranta')}
        >
          Teoranta
        </button>
      </div>
    </div>

    <div class="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[0.08em] text-stone-500 uppercase">
      <p>Nodanna {remainingHints}/{hintAllowance}</p>
      {#if livesMode === 'teoranta'}
        <p>Saolta {livesLeft}/{lifeCount}</p>
      {:else}
        <p>Saor</p>
      {/if}
    </div>

    <h1 class="mb-5 text-center text-2xl font-normal tracking-wide text-stone-100">Fuascail an Seanfhocal</h1>

    <CipherText
      text={phrase}
      letterToNumber={puzzle.letterToNumber}
      numberToLetter={puzzle.numberToLetter}
      {guesses}
      {solvedNumbers}
      bind:selectedNumber
      disabled={locked}
    />

    <CipherKeyboard
      {mode}
      {solvedLetters}
      disabled={locked}
      onpress={guessLetter}
    />

    <div class="mt-4 border-y border-stone-700 px-2 py-3">
      {#if resultKind === null}
        <p class="text-center font-mono text-xs text-stone-400">{status}</p>
      {:else}
        <div class="text-center">
          <p class="mb-3 font-mono text-[10px] tracking-[0.14em] text-[#d95a3f] uppercase">
            {resultEyebrow}
          </p>
          <p class="mb-2 text-2xl leading-snug text-stone-100">{phrase}</p>

          <button
            type="button"
            class="mb-4 border border-stone-700 px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] text-stone-400 uppercase"
            aria-pressed={showTranslation}
            onclick={() => {
              showTranslation = !showTranslation;
            }}
          >
            Aistriúchán
          </button>

          {#if showTranslation}
            <p class="mb-4 font-mono text-xs text-stone-400">{selectedContent.translation}</p>
          {/if}

          <p class="border-t border-stone-700 pt-4 text-left text-sm leading-6 text-stone-400">
            {selectedContent.provenanceNote}
          </p>
        </div>
      {/if}
    </div>

    <div class="mt-3 flex gap-2">
      <button
        type="button"
        class="flex-1 border border-stone-700 px-3 py-2 font-mono text-[10.5px] tracking-[0.06em] text-stone-400 uppercase disabled:opacity-35"
        disabled={locked || remainingHints <= 0}
        onclick={useHint}
      >
        Nod
      </button>
      <button
        type="button"
        class="flex-1 border border-stone-700 px-3 py-2 font-mono text-[10.5px] tracking-[0.06em] text-stone-400 uppercase"
        onclick={() => resetProgress(getLifeCount(difficulty))}
      >
        Athshocraigh
      </button>
    </div>

    <p class="mt-3 text-center font-mono text-[10px] text-stone-500">gach uimhir = an litir chéanna, i gcónaí</p>
  </section>
</main>
