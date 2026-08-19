<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeAds, recordPuzzleCompletedAndMaybeShowInterstitial } from '$lib/ads';
  import CipherKeyboard from '$lib/CipherKeyboard.svelte';
  import CipherText from '$lib/CipherText.svelte';
  import HowToDialog from '$lib/HowToDialog.svelte';
  import {
    initializePurchases,
    purchaseRemoveAds,
    purchaseState,
    restorePurchases
  } from '$lib/purchases';
  import {
    CONTENT_BANK,
    RECENT_CONTENT_WINDOW_DAYS,
    getDateKey,
    getPuzzleCategories,
    recordServedContent,
    selectContentForCategory,
    selectContentForDate,
    type PuzzleContent,
    type ServedContentRecord
  } from '$lib/content';
  import type { DifficultyTier, LivesMode, OrthographyMode, WrongGuessesByNumber } from '$lib/substitution';
  import {
    DIFFICULTY_SETTINGS,
    DOT_LETTERS,
    FADA_LETTERS,
    createSubstitutionPuzzle,
    evaluateGuess,
    getHintAllowance,
    getLifeCount
  } from '$lib/substitution';

  const servedContentStorageKey = 'fuascail.recentlyServedContent';
  const todayKey = getDateKey(new Date());
  const difficultyLabels: Record<DifficultyTier, string> = {
    easy: 'Éasca',
    medium: 'Meánach',
    hard: 'Crua',
    expert: 'Saineolaí'
  };
  const baseKeyboardLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const puzzleCategories = getPuzzleCategories(CONTENT_BANK);

  let playView = $state<'puzzle' | 'categories'>('puzzle');
  let mode = $state<OrthographyMode>('digraf');
  let difficulty = $state<DifficultyTier>('medium');
  let livesMode = $state<LivesMode>('teoranta');
  let puzzleSeed = $state(1);
  let selectedContent: PuzzleContent = $state(selectContentForDate(CONTENT_BANK, todayKey));
  let selectedCategorySlug: string | null = $state(null);
  let selectedNumber: number | null = $state(null);
  let guesses: Record<number, string> = $state({});
  let wrongGuessesByNumber: WrongGuessesByNumber = $state({});
  let hintsUsed = $state(0);
  let livesLeft = $state(getLifeCount('medium'));
  let status = $state('roghnaigh cill chun tosú');
  let puzzleAttempt = $state(0);
  let showHowTo = $state(false);
  let lastAdCompletionKey: string | null = null;

  let phrase = $derived(mode === 'trad' ? selectedContent.text_trad : selectedContent.text_digraf);
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
  let selectedCategory = $derived(
    puzzleCategories.find((category) => category.slug === selectedCategorySlug)
  );
  let puzzleContextLabel = $derived(selectedCategory?.label ?? 'Puzal Laethúil');

  onMount(() => {
    void initializePurchases().finally(() => {
      void initializeAds();
    });

    window.addEventListener('keydown', handlePhysicalKeyboardGuess);
    window.addEventListener('popstate', applyLocationState);
    applyLocationState();

    return () => {
      window.removeEventListener('keydown', handlePhysicalKeyboardGuess);
      window.removeEventListener('popstate', applyLocationState);
    };
  });

  $effect(() => {
    const completionKey = resultKind === null ? null : `${puzzleSeed}:${puzzleAttempt}:${resultKind}`;

    if (completionKey === null || completionKey === lastAdCompletionKey) {
      return;
    }

    lastAdCompletionKey = completionKey;
    void recordPuzzleCompletedAndMaybeShowInterstitial();
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

  function applyLocationState(): void {
    const params = new URLSearchParams(window.location.search);
    showHowTo = params.get('how-to') === '1';

    if (params.get('view') === 'categories') {
      playView = 'categories';
      selectedNumber = null;
      return;
    }

    const categorySlug = params.get('category');

    if (categorySlug !== null) {
      if (puzzleCategories.some((category) => category.slug === categorySlug)) {
        startCategoryPuzzle(categorySlug, false);
      } else {
        showCategoryList(false);
      }

      return;
    }

    startDailyPuzzle(false);
  }

  function startDailyPuzzle(pushHistory = true): void {
    const servedRecords = loadServedContentRecords();

    selectedCategorySlug = null;
    selectedContent = selectContentForDate(CONTENT_BANK, todayKey, servedRecords);
    difficulty = selectedContent.difficulty_tier;
    playView = 'puzzle';
    saveServedContentRecords(
      recordServedContent(
        servedRecords,
        selectedContent.id,
        todayKey,
        RECENT_CONTENT_WINDOW_DAYS
      )
    );

    if (pushHistory) {
      history.pushState(history.state, '', '/play');
    }

    puzzleSeed += 1;
    resetProgress(getLifeCount(selectedContent.difficulty_tier));
  }

  function startCategoryPuzzle(categorySlug: string, pushHistory = true): void {
    selectedContent = selectContentForCategory(CONTENT_BANK, categorySlug, todayKey);
    selectedCategorySlug = categorySlug;
    difficulty = selectedContent.difficulty_tier;
    playView = 'puzzle';

    if (pushHistory) {
      history.pushState(history.state, '', `/play?category=${encodeURIComponent(categorySlug)}`);
    }

    puzzleSeed += 1;
    resetProgress(getLifeCount(selectedContent.difficulty_tier));
  }

  function showCategoryList(pushHistory = true): void {
    playView = 'categories';
    selectedNumber = null;

    if (pushHistory) {
      history.pushState(history.state, '', '/play?view=categories');
    }
  }

  function resetProgress(nextLivesLeft: number): void {
    selectedNumber = null;
    guesses = {};
    wrongGuessesByNumber = {};
    hintsUsed = 0;
    livesLeft = nextLivesLeft;
    puzzleAttempt += 1;
    status = 'roghnaigh cill chun tosú';
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

  function openHowTo(): void {
    showHowTo = true;
  }

  function closeHowTo(): void {
    showHowTo = false;

    if (new URLSearchParams(window.location.search).has('how-to')) {
      history.replaceState(history.state, '', window.location.pathname);
    }
  }

  function handlePhysicalKeyboardGuess(event: KeyboardEvent): void {
    if (showHowTo) {
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.key.length !== 1) {
      return;
    }

    const letter = event.key.toLocaleUpperCase('ga-IE');

    if (!getAllowedKeyboardLetters().includes(letter) || solvedLetters.includes(letter)) {
      return;
    }

    if (selectedNumber !== null && !locked) {
      event.preventDefault();
      guessLetter(letter);
    }
  }

  function getAllowedKeyboardLetters(): readonly string[] {
    return mode === 'trad'
      ? [...baseKeyboardLetters, ...FADA_LETTERS, ...DOT_LETTERS]
      : [...baseKeyboardLetters, ...FADA_LETTERS];
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

<main class="app-shell flex items-center justify-center bg-[var(--charcoal-deep)] text-[var(--cream)]">
  <section
    class="app-surface puzzle-card w-full max-w-[460px] border border-[var(--charcoal-line)] bg-[var(--charcoal-surface)] px-5 py-6 shadow-2xl [border-top:3px_solid_var(--vermilion)] lg:max-w-[1120px] lg:px-0 lg:py-0 xl:max-w-[1240px]"
    aria-labelledby="puzzle-title"
  >
    <p id="cipher-instructions" class="sr-only">
      Roghnaigh cill uimhrithe sa téacs rúin, ansin roghnaigh litir ón méarchlár ar an scáileán nó brúigh litir ar an méarchlár fisiciúil.
    </p>
    <div class="mb-5 flex items-center justify-between gap-4 lg:mb-7">
      <a class="font-display inline-block text-2xl text-[var(--cream)] lg:text-3xl" href="/" aria-label="Fuascail, téigh go dtí an baile">Fuascail</a>
      <div class="font-utility flex items-center gap-3 text-[10px] tracking-[0.08em] uppercase">
        <button
          type="button"
          class="text-[var(--cream-dim)]"
          onclick={() => showCategoryList()}
        >
          Catagóirí
        </button>
        <button
          type="button"
          class="text-[var(--cream-dim)]"
          onclick={openHowTo}
        >
          Conas a imirt
        </button>
      </div>
    </div>

    {#if playView === 'categories'}
      <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="font-utility mb-3 text-[11px] tracking-[0.14em] text-[var(--cream-dim)] uppercase">Roghnaigh grúpa</p>
          <h1 id="puzzle-title" class="font-display text-center text-3xl font-normal tracking-wide text-[var(--cream)] lg:text-left lg:text-5xl">
            Catagóirí
          </h1>
        </div>

        <button
          type="button"
          class="font-utility border border-[var(--vermilion-dim)] bg-[var(--vermilion-dim)] px-4 py-2 text-[10.5px] tracking-[0.06em] text-[var(--cream)] uppercase"
          onclick={() => startDailyPuzzle()}
        >
          Puzal Laethúil
        </button>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        {#each puzzleCategories as category}
          <button
            type="button"
            class="border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] p-4 text-left transition hover:bg-[var(--charcoal-hover)] focus:outline-none focus-visible:border-[var(--vermilion)]"
            onclick={() => startCategoryPuzzle(category.slug)}
          >
            <span class="font-display mb-2 block text-2xl text-[var(--cream)]">{category.label}</span>
            <span class="mb-4 block text-sm leading-6 text-[var(--cream-dim)]">{category.description}</span>
            <span class="font-utility flex flex-wrap gap-2 text-[10px] tracking-[0.08em] text-[var(--cream-faint)] uppercase">
              <span>{category.count} puzal</span>
              <span>{category.difficultyTiers.map((tier) => difficultyLabels[tier]).join(' · ')}</span>
            </span>
          </button>
        {/each}
      </div>
    {:else}
    <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="font-utility mb-3 text-[11px] tracking-[0.14em] text-[var(--cream-dim)] uppercase">Inniu · {puzzleContextLabel}</p>
        <h1 id="puzzle-title" class="font-display text-center text-2xl font-normal tracking-wide text-[var(--cream)] lg:text-left lg:text-4xl">
          Fuascail {selectedCategory === undefined ? 'an Puzal' : selectedCategory.label}
        </h1>
      </div>

      <div class="font-utility flex justify-center border border-[var(--charcoal-line)] text-[10px] tracking-[0.08em] uppercase lg:justify-start">
        <button
          type="button"
          class={[
            'px-2.5 py-1 text-[var(--cream-dim)]',
            mode === 'digraf' ? 'bg-[var(--vermilion-dim)] text-[var(--cream)]' : ''
          ]}
          aria-pressed={mode === 'digraf'}
          onclick={() => setMode('digraf')}
        >
          Digraf
        </button>
        <button
          type="button"
          class={[
            'px-2.5 py-1 text-[var(--cream-dim)]',
            mode === 'trad' ? 'bg-[var(--vermilion-dim)] text-[var(--cream)]' : ''
          ]}
          aria-pressed={mode === 'trad'}
          onclick={() => setMode('trad')}
        >
          Trad
        </button>
      </div>
    </div>

    <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div class="lg:flex lg:min-h-[560px] lg:flex-col lg:justify-center">
        <CipherText
          text={phrase}
          letterToNumber={puzzle.letterToNumber}
          numberToLetter={puzzle.numberToLetter}
          {guesses}
          {solvedNumbers}
          bind:selectedNumber
          disabled={locked}
        />

        <div class="mt-4 border-y border-[var(--charcoal-line)] px-2 py-3 lg:mt-6 lg:px-4 lg:py-5">
          {#if resultKind === null}
            <p class="font-utility text-center text-xs text-[var(--cream-dim)] lg:text-sm" aria-live="polite">{status}</p>
          {:else}
            <div
              class="text-center"
              role="dialog"
              aria-modal="false"
              aria-labelledby="reveal-title"
              aria-describedby="reveal-answer reveal-note"
            >
              <p id="reveal-title" class="font-utility mb-3 text-[10px] tracking-[0.14em] text-[var(--vermilion-bright)] uppercase">
                {resultEyebrow}
              </p>
              <p id="reveal-answer" class="font-display mb-4 text-2xl leading-snug text-[var(--cream)] lg:text-4xl">{phrase}</p>

              <p id="reveal-note" class="border-t border-[var(--charcoal-line)] pt-4 text-left text-sm leading-6 text-[var(--cream-dim)] lg:text-base lg:leading-7">
                {selectedContent.provenance_note}
              </p>
              <div class="font-utility mt-4 flex flex-col gap-2 text-[10.5px] tracking-[0.06em] uppercase sm:flex-row">
                <button
                  type="button"
                  class="flex-1 border border-[var(--vermilion-dim)] bg-[var(--vermilion-dim)] px-3 py-2 text-[var(--cream)]"
                  onclick={() => showCategoryList()}
                >
                  Fill ar Chatagóirí
                </button>
                <button
                  type="button"
                  class="flex-1 border border-[var(--charcoal-line)] px-3 py-2 text-[var(--cream-dim)]"
                  onclick={() => selectedCategorySlug === null ? startDailyPuzzle() : startCategoryPuzzle(selectedCategorySlug)}
                >
                  Puzal Eile
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <aside class="mt-5 border-t border-[var(--charcoal-line)] pt-5 lg:mt-0 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0" aria-label="Rialuithe puzail">
        <div class="mb-4 flex items-center justify-between gap-3 lg:flex-col lg:items-stretch">
          <div class="font-utility flex border border-[var(--charcoal-line)] text-[10px] tracking-[0.08em] uppercase">
            {#each Object.keys(DIFFICULTY_SETTINGS) as tier}
              <button
                type="button"
                class={[
                  'flex-1 px-2 py-1 text-[var(--cream-dim)]',
                  difficulty === tier ? 'bg-[var(--vermilion-dim)] text-[var(--cream)]' : ''
                ]}
                aria-pressed={difficulty === tier}
                onclick={() => setDifficulty(tier as DifficultyTier)}
              >
                {difficultyLabels[tier as DifficultyTier]}
              </button>
            {/each}
          </div>

          <div class="font-utility flex border border-[var(--charcoal-line)] text-[10px] tracking-[0.08em] uppercase">
            <button
              type="button"
              class={[
                'flex-1 px-2.5 py-1 text-[var(--cream-dim)]',
                livesMode === 'saor' ? 'bg-[var(--vermilion-dim)] text-[var(--cream)]' : ''
              ]}
              aria-pressed={livesMode === 'saor'}
              onclick={() => setLivesMode('saor')}
            >
              Saor
            </button>
            <button
              type="button"
              class={[
                'flex-1 px-2.5 py-1 text-[var(--cream-dim)]',
                livesMode === 'teoranta' ? 'bg-[var(--vermilion-dim)] text-[var(--cream)]' : ''
              ]}
              aria-pressed={livesMode === 'teoranta'}
              onclick={() => setLivesMode('teoranta')}
            >
              Teoranta
            </button>
          </div>
        </div>

        <div class="font-utility mb-4 flex items-center justify-between text-[10px] tracking-[0.08em] text-[var(--cream-faint)] uppercase lg:border-y lg:border-[var(--charcoal-line)] lg:py-3">
          <p>Nodanna {remainingHints}/{hintAllowance}</p>
          {#if livesMode === 'teoranta'}
            <p>Saolta {livesLeft}/{lifeCount}</p>
          {:else}
            <p>Saor</p>
          {/if}
        </div>

        <CipherKeyboard
          {mode}
          {solvedLetters}
          disabled={locked || selectedNumber === null}
          onpress={guessLetter}
        />

        <div class="mt-4 flex gap-2 lg:mt-6">
          <button
            type="button"
            class="font-utility flex-1 border border-[var(--charcoal-line)] px-3 py-2 text-[10.5px] tracking-[0.06em] text-[var(--cream-dim)] uppercase disabled:opacity-35"
            disabled={locked || remainingHints <= 0}
            onclick={useHint}
          >
            Nod
          </button>
          <button
            type="button"
            class="font-utility flex-1 border border-[var(--charcoal-line)] px-3 py-2 text-[10.5px] tracking-[0.06em] text-[var(--cream-dim)] uppercase"
            onclick={() => resetProgress(getLifeCount(difficulty))}
          >
            Athshocraigh
          </button>
        </div>

        <div class="font-utility mt-3 flex items-center gap-2 border-t border-[var(--charcoal-line)] pt-3 text-[10px] tracking-[0.05em] text-[var(--cream-faint)] uppercase">
          {#if $purchaseState.removeAds}
            <p class="flex-1 text-center text-[var(--cream-dim)]">Fógraí bainte</p>
          {:else}
            <button
              type="button"
              class="flex-1 border border-[var(--charcoal-line)] px-2 py-2 text-[var(--cream-dim)] uppercase disabled:opacity-35"
              disabled={$purchaseState.busy || $purchaseState.available === 'unavailable'}
              onclick={purchaseRemoveAds}
            >
              Bain fógraí{#if $purchaseState.price !== null} · {$purchaseState.price}{/if}
            </button>
            <button
              type="button"
              class="border border-[var(--charcoal-line)] px-2 py-2 text-[var(--cream-dim)] uppercase disabled:opacity-35"
              disabled={$purchaseState.busy || $purchaseState.available === 'unavailable'}
              onclick={restorePurchases}
            >
              Athchóirigh
            </button>
          {/if}
        </div>

        {#if $purchaseState.message !== null && !$purchaseState.removeAds}
          <p class="font-utility mt-2 text-center text-[10px] text-[var(--cream-faint)]">{$purchaseState.message}</p>
        {/if}

        <p class="font-utility mt-3 text-center text-[10px] text-[var(--cream-faint)]">gach uimhir = an litir chéanna, i gcónaí</p>
      </aside>
    </div>
    {/if}
  </section>

  {#if showHowTo}
    <HowToDialog onclose={closeHowTo} />
  {/if}
</main>
