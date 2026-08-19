<script lang="ts">
  import { onMount } from 'svelte';

  type DemoNumber = 7 | 12;
  type DemoGuess = 'N' | 'A' | 'R' | null;

  const demoLetters = ['N', 'A', 'R'] as const;
  const demoAnswer: Record<DemoNumber, DemoGuess> = {
    7: 'N',
    12: 'A'
  };

  let { onclose = () => {} }: { onclose?: () => void } = $props();

  let selectedNumber: DemoNumber | null = $state(null);
  let guesses: Partial<Record<DemoNumber, DemoGuess>> = $state({});
  let message = $state('Roghnaigh uimhir 7 nó 12.');
  let closeButton: HTMLButtonElement;

  onMount(() => {
    closeButton?.focus();
  });

  function selectNumber(number: DemoNumber): void {
    selectedNumber = selectedNumber === number ? null : number;
    message = selectedNumber === null ? 'Roghnaigh uimhir 7 nó 12.' : `Uimhir ${number} roghnaithe. Roghnaigh litir.`;
  }

  function guessLetter(letter: DemoGuess): void {
    if (selectedNumber === null || letter === null) {
      return;
    }

    guesses = {
      ...guesses,
      [selectedNumber]: letter
    };

    message =
      demoAnswer[selectedNumber] === letter
        ? `Ceart. Gach ${selectedNumber} = ${letter}.`
        : `Ní hea. Bain triail eile as uimhir ${selectedNumber}.`;
  }

  function resetDemo(): void {
    selectedNumber = null;
    guesses = {};
    message = 'Roghnaigh uimhir 7 nó 12.';
  }

  function closeFromBackdrop(event: MouseEvent): void {
    if (event.currentTarget === event.target) {
      onclose();
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-3 py-4 text-[var(--cream)] sm:items-center"
  role="presentation"
  onclick={closeFromBackdrop}
>
  <div
    class="max-h-[min(720px,calc(100dvh-2rem))] w-full max-w-[560px] overflow-y-auto border border-[var(--charcoal-line)] bg-[var(--charcoal-surface)] px-4 py-5 shadow-2xl sm:px-5"
    role="dialog"
    aria-modal="true"
    aria-labelledby="how-to-dialog-title"
    aria-describedby="how-to-dialog-summary"
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <p class="font-utility mb-2 text-[10px] tracking-[0.14em] text-[var(--vermilion-bright)] uppercase">Conas a imirt</p>
        <h2 id="how-to-dialog-title" class="font-display text-2xl font-normal text-[var(--cream)]">Triail bheag</h2>
      </div>
      <button
        bind:this={closeButton}
        type="button"
        class="font-utility border border-[var(--charcoal-line)] px-3 py-2 text-[10px] tracking-[0.08em] text-[var(--cream-dim)] uppercase"
        aria-label="Dún an treoir"
        onclick={onclose}
      >
        Dún
      </button>
    </div>

    <p id="how-to-dialog-summary" class="mb-4 text-sm leading-6 text-[var(--cream-dim)]">
      Roghnaigh uimhir, ansin tomhais an litir. Tá gach uimhir den chineál céanna ceangailte leis an litir chéanna.
    </p>

    <div class="border-y border-[var(--charcoal-line)] py-4">
      <div class="mb-4 flex justify-center gap-1.5" role="group" aria-label="Sampla focal rúin">
        <button
          type="button"
          class={[
            'flex w-8 flex-col items-center text-[var(--cream)]',
            selectedNumber === 7 ? 'text-[var(--vermilion-bright)]' : ''
          ]}
          aria-label={`Cill uimhir 7${selectedNumber === 7 ? ', roghnaithe' : ''}`}
          aria-pressed={selectedNumber === 7}
          onclick={() => selectNumber(7)}
        >
          <span class="font-utility flex h-8 w-full items-center justify-center border-b-2 text-xl font-semibold">
            {guesses[7] ?? ''}
          </span>
          <span class="font-utility mt-1 text-[10px] text-[var(--cream-faint)]">7</span>
        </button>

        <button
          type="button"
          class={[
            'flex w-8 flex-col items-center text-[var(--cream)]',
            selectedNumber === 12 ? 'text-[var(--vermilion-bright)]' : ''
          ]}
          aria-label={`Cill uimhir 12${selectedNumber === 12 ? ', roghnaithe' : ''}`}
          aria-pressed={selectedNumber === 12}
          onclick={() => selectNumber(12)}
        >
          <span class="font-utility flex h-8 w-full items-center justify-center border-b-2 text-xl font-semibold">
            {guesses[12] ?? ''}
          </span>
          <span class="font-utility mt-1 text-[10px] text-[var(--cream-faint)]">12</span>
        </button>

        <button
          type="button"
          class={[
            'flex w-8 flex-col items-center text-[var(--cream)]',
            selectedNumber === 7 ? 'text-[var(--vermilion-bright)]' : ''
          ]}
          aria-label={`Cill uimhir 7 arís${selectedNumber === 7 ? ', roghnaithe' : ''}`}
          aria-pressed={selectedNumber === 7}
          onclick={() => selectNumber(7)}
        >
          <span class="font-utility flex h-8 w-full items-center justify-center border-b-2 text-xl font-semibold">
            {guesses[7] ?? ''}
          </span>
          <span class="font-utility mt-1 text-[10px] text-[var(--cream-faint)]">7</span>
        </button>
      </div>

      <div class="mb-4 flex justify-center gap-2" role="group" aria-label="Litreacha samplacha">
        {#each demoLetters as letter}
          <button
            type="button"
            class="font-utility h-10 w-10 border border-[var(--charcoal-line)] bg-[var(--charcoal-raised)] text-sm text-[var(--cream)] disabled:opacity-35"
            disabled={selectedNumber === null}
            aria-label={`Tomhais ${letter}`}
            onclick={() => guessLetter(letter)}
          >
            {letter}
          </button>
        {/each}
      </div>

      <div class="flex items-center justify-between gap-3">
        <p class="font-utility flex-1 text-xs text-[var(--cream-dim)]" aria-live="polite">{message}</p>
        <button
          type="button"
          class="font-utility border border-[var(--charcoal-line)] px-3 py-2 text-[10px] tracking-[0.08em] text-[var(--cream-dim)] uppercase"
          onclick={resetDemo}
        >
          Glan
        </button>
      </div>
    </div>

    <div class="mt-4 grid gap-3 text-sm leading-6 text-[var(--cream-dim)] sm:grid-cols-2">
      <section class="border border-[var(--charcoal-line)] p-3" aria-labelledby="rules-title">
        <h3 id="rules-title" class="font-utility mb-2 text-[10px] tracking-[0.1em] text-[var(--cream)] uppercase">Rialacha</h3>
        <p>Gach uimhir = an litir chéanna. Críochnaíonn tú nuair atá gach uimhir réitithe.</p>
      </section>

      <section class="border border-[var(--charcoal-line)] p-3" aria-labelledby="help-title">
        <h3 id="help-title" class="font-utility mb-2 text-[10px] tracking-[0.1em] text-[var(--cream)] uppercase">Nodanna agus saolta</h3>
        <p>Osclaíonn Nod litir amháin. Laghdaíonn Saolta Teoranta ar bhotúin; fanann siad saor i gcónaí.</p>
      </section>

      <section class="border border-[var(--charcoal-line)] p-3" aria-labelledby="modes-title">
        <h3 id="modes-title" class="font-utility mb-2 text-[10px] tracking-[0.1em] text-[var(--cream)] uppercase">Móid</h3>
        <p>Athraíonn deacracht tosaithe/nodanna/saolta. Úsáideann Digraf péirí; úsáideann Trad litreacha poncaithe.</p>
      </section>

      <section class="border border-[var(--charcoal-line)] p-3" aria-labelledby="access-title">
        <h3 id="access-title" class="font-utility mb-2 text-[10px] tracking-[0.1em] text-[var(--cream)] uppercase">Inrochtaineacht</h3>
        <p>Oibríonn sé le méarchlár, ach tá patrúin uimhreacha níos éasca a scanadh go radhairc.</p>
      </section>
    </div>

    <a
      class="font-utility mt-4 block border border-[var(--vermilion-dim)] bg-[var(--vermilion-dim)] px-4 py-3 text-center text-[11px] tracking-[0.08em] text-[var(--cream)] uppercase"
      href="/play"
      onclick={onclose}
    >
      Ar aghaidh
    </a>
  </div>
</div>
