<svelte:head>
  <title>Conas a Imirt · Fuascail</title>
</svelte:head>

<main class="app-shell flex items-center justify-center bg-[radial-gradient(ellipse_at_top,#241f19_0%,var(--charcoal-deep)_62%)] text-[var(--cream)]">
  <article class="puzzle-card w-full max-w-[560px] border border-[var(--charcoal-line)] bg-[var(--charcoal-surface)] px-5 py-6 shadow-2xl [border-top:3px_solid_var(--vermilion)]" aria-labelledby="how-to-title">
    <a class="font-utility mb-5 inline-block text-[10px] tracking-[0.08em] text-[var(--cream-dim)] uppercase" href="/">Baile</a>

    <h1 id="how-to-title" class="font-display mb-5 text-center text-3xl font-normal text-[var(--cream)]">Conas a Imirt</h1>

    <div class="space-y-4 text-sm leading-6 text-[var(--cream-dim)]">
      <p>
        Tá gach uimhir ceangailte leis an litir chéanna i gcónaí. Má aimsíonn tú go bhfuil uimhir 7 ina N,
        beidh gach 7 eile ina N freisin.
      </p>

      <p>
        Roghnaigh cill uimhrithe sa seanfhocal, ansin roghnaigh litir ón méarchlár ar an scáileán. Ar ríomhaire,
        is féidir litir a bhrú ar an méarchlár fisiciúil tar éis cill a roghnú.
      </p>

      <p>
        Tugann Nod litir amháin duit. Tá saolta teoranta sa mhód Teoranta; sa mhód Saor, is féidir leat leanúint ar
        aghaidh gan pionós. Fanann nodanna agus saolta saor i gcónaí.
      </p>

      <p>
        Athraíonn an deacracht líon na litreacha tosaithe, na nodanna, agus na saolta. Athraíonn Digraf/Trad an
        litriú a úsáidtear sa phuzal.
      </p>
    </div>

    <div class="mt-6 flex gap-2">
      <a
        class="font-utility flex-1 border border-[var(--vermilion-dim)] bg-[var(--vermilion-dim)] px-4 py-3 text-center text-[11px] tracking-[0.08em] text-[var(--cream)] uppercase"
        href="/play"
      >
        Imir Anois
      </a>
      <a
        class="font-utility flex-1 border border-[var(--charcoal-line)] px-4 py-3 text-center text-[11px] tracking-[0.08em] text-[var(--cream-dim)] uppercase"
        href="/"
      >
        Baile
      </a>
    </div>
  </article>
</main>
