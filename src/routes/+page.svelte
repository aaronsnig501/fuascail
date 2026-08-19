<svelte:head>
  <title>Fuascail</title>
</svelte:head>

<main class="app-shell flex items-center justify-center bg-[radial-gradient(ellipse_at_top,#241f19_0%,var(--charcoal-deep)_62%)] text-[var(--cream)]">
  <section class="puzzle-card w-full max-w-[460px] border border-[var(--charcoal-line)] bg-[var(--charcoal-surface)] px-5 py-6 shadow-2xl [border-top:3px_solid_var(--vermilion)]" aria-labelledby="home-title">
    <p class="font-utility mb-4 text-[11px] tracking-[0.14em] text-[var(--cream-dim)] uppercase">Inniu · Seanfhocail</p>

    <h1 id="home-title" class="font-display mb-4 text-center text-4xl font-normal text-[var(--cream)]">Fuascail</h1>

    <p class="mb-6 text-center text-sm leading-6 text-[var(--cream-dim)]">
      Cluiche ionadúcháin le seanfhocail Ghaeilge. Roghnaigh uimhir, tomhais litir, agus nocht an nath.
    </p>

    <nav class="font-utility flex flex-col gap-2 text-[11px] tracking-[0.08em] uppercase" aria-label="Príomhroghanna">
      <a
        class="border border-[var(--vermilion-dim)] bg-[var(--vermilion-dim)] px-4 py-3 text-center text-[var(--cream)]"
        href="/play"
      >
        Tosaigh an Puzal Laethúil
      </a>

      <button
        type="button"
        class="border border-[var(--charcoal-line)] px-4 py-3 text-[var(--cream-faint)] uppercase opacity-55"
        disabled
      >
        Catagóirí
      </button>

      <a
        class="border border-[var(--charcoal-line)] px-4 py-3 text-center text-[var(--cream-dim)]"
        href="/how-to"
      >
        Conas a Imirt
      </a>
    </nav>

    <div class="font-utility mt-6 border-t border-[var(--charcoal-line)] pt-4 text-[10px] tracking-[0.06em] uppercase" aria-label="Naisc siopaí aipeanna">
      <p class="mb-2 text-center text-[var(--cream-faint)]">Aipeanna dúchasacha</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 border border-[var(--charcoal-line)] px-2 py-2 text-[var(--cream-faint)] uppercase opacity-55"
          disabled
        >
          App Store
        </button>
        <button
          type="button"
          class="flex-1 border border-[var(--charcoal-line)] px-2 py-2 text-[var(--cream-faint)] uppercase opacity-55"
          disabled
        >
          Google Play
        </button>
      </div>
    </div>
  </section>
</main>
