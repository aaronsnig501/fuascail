import type { DifficultyTier } from './substitution';

export const CONTENT_BANK_TARGET_SIZE = 120;
export const PUBLIC_DOMAIN_AUTHOR_DEATH_YEARS = 70;
export const APPROVED_PUBLIC_DOMAIN_SOURCE_REFERENCES = [
  'celt.ucc.ie',
  'CELT',
  'Corpus of Electronic Texts',
  'Project Gutenberg',
  'Internet Archive',
  'Wikisource'
] as const;

export type LinguisticReview =
  | {
      status: 'pending';
    }
  | {
      status: 'signed_off';
      reviewer_name: string;
      reviewer_role: 'native_speaker' | 'linguist';
      reviewed_on: string;
      notes?: string;
    };

export type PuzzleContent = {
  id: string;
  category: string;
  text_digraf: string;
  text_trad: string;
  translation_en: string;
  provenance_note: string;
  difficulty_tier: DifficultyTier;
  source_rights_reference: string;
  source_url: string;
  author_name: string;
  author_death_year: number;
  public_domain_basis: string;
  linguistic_review: LinguisticReview;
};

export type ContentBankReadiness = {
  targetSize: number;
  totalEntries: number;
  signedOffEntries: number;
  unsignedEntryIds: string[];
  unapprovedSourceEntryIds: string[];
  missingRightsReferenceIds: string[];
  nonPublicDomainEntryIds: string[];
  readyForProduction: boolean;
};

export type PuzzleCategory = {
  slug: string;
  category: string;
  label: string;
  description: string;
  count: number;
  difficultyTiers: DifficultyTier[];
};

const CATEGORY_PRESENTATION: Record<string, Pick<PuzzleCategory, 'label' | 'description'>> = {
  'caitheamh-aimsire': {
    label: 'Caitheamh Aimsire',
    description: 'Abairtí gearra ó shaol na léitheoireachta, na gcluichí, na siúlóide, agus caitheamh aimsire eile.'
  },
  ceoltoiri: {
    label: 'Ceoltóirí',
    description: 'Rudaí a déarfadh ceoltóirí agus iad ag cleachtadh, ag seinm, nó ag caint faoin bhfuaim.'
  },
  cistin: {
    label: 'Sa Chistin',
    description: 'Gníomhartha laethúla sa chistin: ní, gearradh, cócaireacht, agus glanadh.'
  },
  seanfhocal: {
    label: 'Seanfhocail',
    description: 'Nathanna gearra traidisiúnta le leideanna faoin saol, faoin bpobal, agus faoin obair.'
  },
  taisteal: {
    label: 'Taisteal',
    description: 'Frásaí faoi mhálaí, traenacha, geataí, seomraí, bóithre, agus dul ó áit go háit.'
  }
};

export const PUZZLE_CONTENT_JSON_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'FuascailPuzzleContent',
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'category',
    'text_digraf',
    'text_trad',
    'translation_en',
    'provenance_note',
    'difficulty_tier',
    'source_rights_reference',
    'source_url',
    'author_name',
    'author_death_year',
    'public_domain_basis',
    'linguistic_review'
  ],
  properties: {
    id: { type: 'string', minLength: 1 },
    category: { type: 'string', minLength: 1 },
    text_digraf: { type: 'string', minLength: 1 },
    text_trad: { type: 'string', minLength: 1 },
    translation_en: { type: 'string', minLength: 1 },
    provenance_note: { type: 'string', minLength: 1 },
    difficulty_tier: { enum: ['easy', 'medium', 'hard', 'expert'] },
    source_rights_reference: { type: 'string', minLength: 1 },
    source_url: { type: 'string', minLength: 1 },
    author_name: { type: 'string', minLength: 1 },
    author_death_year: { type: 'integer' },
    public_domain_basis: { type: 'string', minLength: 1 },
    linguistic_review: {
      oneOf: [
        {
          type: 'object',
          additionalProperties: false,
          required: ['status'],
          properties: {
            status: { const: 'pending' }
          }
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['status', 'reviewer_name', 'reviewer_role', 'reviewed_on'],
          properties: {
            status: { const: 'signed_off' },
            reviewer_name: { type: 'string', minLength: 1 },
            reviewer_role: { enum: ['native_speaker', 'linguist'] },
            reviewed_on: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            notes: { type: 'string' }
          }
        }
      ]
    }
  }
} as const;

type CandidateContentSeed = {
  id: string;
  category: string;
  text_digraf: string;
  text_trad: string;
  translation_en: string;
  difficulty_tier: DifficultyTier;
};

const ORIGINAL_CONTENT_SOURCE = {
  source_rights_reference:
    'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
  source_url: 'candidate:original-app-content',
  author_name: 'Fuascail content candidate',
  author_death_year: 0,
  public_domain_basis:
    'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
  linguistic_review: { status: 'pending' }
} as const satisfies Pick<
  PuzzleContent,
  | 'source_rights_reference'
  | 'source_url'
  | 'author_name'
  | 'author_death_year'
  | 'public_domain_basis'
  | 'linguistic_review'
>;

const PROVERB_CONTENT_SOURCE = {
  source_rights_reference:
    'Traditional Irish proverb; candidate entry pending archival source verification.',
  source_url: 'candidate:source-needed',
  author_name: 'Unknown traditional source',
  author_death_year: 0,
  public_domain_basis:
    'Candidate only: no author death year has been verified; not production eligible.',
  linguistic_review: { status: 'pending' }
} as const satisfies Pick<
  PuzzleContent,
  | 'source_rights_reference'
  | 'source_url'
  | 'author_name'
  | 'author_death_year'
  | 'public_domain_basis'
  | 'linguistic_review'
>;

const ORIGINAL_SUPPLEMENTAL_CONTENT: readonly CandidateContentSeed[] = [
  { id: 'rinse-cups', category: 'cistin', text_digraf: 'Sruthlaigh na cupáin le huisce te.', text_trad: 'Sruṫlaiġ na cupáin le huisce te.', translation_en: 'Rinse the cups with hot water.', difficulty_tier: 'hard' },
  { id: 'dry-plates', category: 'cistin', text_digraf: 'Triomaigh na plátaí leis an tuáille.', text_trad: 'Triomaiġ na plátaí leis an tuáille.', translation_en: 'Dry the plates with the towel.', difficulty_tier: 'hard' },
  { id: 'open-oven', category: 'cistin', text_digraf: 'Oscail doras an oighinn go cúramach.', text_trad: 'Oscail doras an oiġinn go cúramach.', translation_en: 'Open the oven door carefully.', difficulty_tier: 'expert' },
  { id: 'close-fridge', category: 'cistin', text_digraf: 'Dún an cuisneoir i gceart.', text_trad: 'Dún an cuisneoir i gceart.', translation_en: 'Close the fridge properly.', difficulty_tier: 'medium' },
  { id: 'peel-carrots', category: 'cistin', text_digraf: 'Scamh na cairéid don dinnéar.', text_trad: 'Scaṁ na cairéid don dinnéar.', translation_en: 'Peel the carrots for dinner.', difficulty_tier: 'hard' },
  { id: 'add-salt', category: 'cistin', text_digraf: 'Cuir beagán salainn sa phota.', text_trad: 'Cuir beagán salainn sa ṗota.', translation_en: 'Put a little salt in the pot.', difficulty_tier: 'medium' },
  { id: 'taste-sauce', category: 'cistin', text_digraf: 'Blais an t-anlann anois.', text_trad: 'Blais an t-anlann anois.', translation_en: 'Taste the sauce now.', difficulty_tier: 'medium' },
  { id: 'bake-cake', category: 'cistin', text_digraf: 'Bácáil cáca don deireadh seachtaine.', text_trad: 'Bácáil cáca don deireadh seaċtaine.', translation_en: 'Bake a cake for the weekend.', difficulty_tier: 'expert' },
  { id: 'warm-milk', category: 'cistin', text_digraf: 'Téigh an bainne go réidh.', text_trad: 'Téiġ an bainne go réiḋ.', translation_en: 'Warm the milk gently.', difficulty_tier: 'medium' },
  { id: 'make-tea', category: 'cistin', text_digraf: 'Déan tae láidir dom.', text_trad: 'Déan tae láidir dom.', translation_en: 'Make strong tea for me.', difficulty_tier: 'easy' },
  { id: 'pour-water', category: 'cistin', text_digraf: 'Doirt uisce fuar sa ghloine.', text_trad: 'Doirt uisce fuar sa ġloine.', translation_en: 'Pour cold water into the glass.', difficulty_tier: 'hard' },
  { id: 'set-table', category: 'cistin', text_digraf: 'Leag amach an bord don lón.', text_trad: 'Leag amaċ an bord don lón.', translation_en: 'Set the table for lunch.', difficulty_tier: 'medium' },
  { id: 'light-stove', category: 'cistin', text_digraf: 'Las an sorn go mall.', text_trad: 'Las an sorn go mall.', translation_en: 'Light the stove slowly.', difficulty_tier: 'easy' },
  { id: 'turn-off-oven', category: 'cistin', text_digraf: 'Múch an t-oigheann anois.', text_trad: 'Múċ an t-oiġeann anois.', translation_en: 'Turn off the oven now.', difficulty_tier: 'medium' },
  { id: 'leave-dough', category: 'cistin', text_digraf: 'Fág an taos ar an gcuntar.', text_trad: 'Fág an taos ar an gcuntar.', translation_en: 'Leave the dough on the counter.', difficulty_tier: 'medium' },
  { id: 'find-lid', category: 'cistin', text_digraf: 'Aimsigh clúdach don phota.', text_trad: 'Aimsiġ clúdaċ don ṗota.', translation_en: 'Find a lid for the pot.', difficulty_tier: 'hard' },
  { id: 'sharpen-knife', category: 'cistin', text_digraf: 'Géaraigh an scian roimh ré.', text_trad: 'Géaraiġ an scian roiṁ ré.', translation_en: 'Sharpen the knife beforehand.', difficulty_tier: 'hard' },
  { id: 'share-soup', category: 'cistin', text_digraf: 'Roinn an anraith idir gach duine.', text_trad: 'Roinn an anraiṫ idir gaċ duine.', translation_en: 'Share the soup between everyone.', difficulty_tier: 'hard' },
  { id: 'wash-pan', category: 'cistin', text_digraf: 'Nigh an friochtán tar éis bricfeasta.', text_trad: 'Niġ an frioċtán tar éis bricfeasta.', translation_en: 'Wash the frying pan after breakfast.', difficulty_tier: 'expert' },
  { id: 'put-away-spoons', category: 'cistin', text_digraf: 'Cuir na spúnóga sa tarraiceán.', text_trad: 'Cuir na spúnóga sa tarraiceán.', translation_en: 'Put the spoons in the drawer.', difficulty_tier: 'hard' },
  { id: 'bass-too-heavy', category: 'ceoltoiri', text_digraf: 'Tá an dord ró-throm sa mheascán.', text_trad: 'Tá an dord ró-ṫrom sa ṁeascán.', translation_en: 'The bass is too heavy in the mix.', difficulty_tier: 'expert' },
  { id: 'play-slower', category: 'ceoltoiri', text_digraf: 'Seinn níos moille an uair seo.', text_trad: 'Seinn níos moille an uair seo.', translation_en: 'Play slower this time.', difficulty_tier: 'medium' },
  { id: 'verse-too-fast', category: 'ceoltoiri', text_digraf: 'Tá an véarsa ró-thapa.', text_trad: 'Tá an véarsa ró-ṫapa.', translation_en: 'The verse is too fast.', difficulty_tier: 'medium' },
  { id: 'missed-last-note', category: 'ceoltoiri', text_digraf: 'Chaill mé an nóta deireanach.', text_trad: 'Ċaill mé an nóta deireanaċ.', translation_en: 'I missed the last note.', difficulty_tier: 'hard' },
  { id: 'check-microphone', category: 'ceoltoiri', text_digraf: 'Seiceáil an micreafón roimh an seó.', text_trad: 'Seiceáil an micreafón roiṁ an seó.', translation_en: 'Check the microphone before the show.', difficulty_tier: 'expert' },
  { id: 'drummer-ready', category: 'ceoltoiri', text_digraf: 'Tá an drumadóir réidh anois.', text_trad: 'Tá an drumadóir réiḋ anois.', translation_en: 'The drummer is ready now.', difficulty_tier: 'medium' },
  { id: 'start-softly', category: 'ceoltoiri', text_digraf: 'Tosaigh go bog leis an véarsa.', text_trad: 'Tosaiġ go bog leis an véarsa.', translation_en: 'Start softly with the verse.', difficulty_tier: 'hard' },
  { id: 'strong-chorus', category: 'ceoltoiri', text_digraf: 'Tá an curfá láidir go leor.', text_trad: 'Tá an curfá láidir go leor.', translation_en: 'The chorus is strong enough.', difficulty_tier: 'medium' },
  { id: 'need-new-strings', category: 'ceoltoiri', text_digraf: 'Teastaíonn téada nua ón ngiotár.', text_trad: 'Teastaíonn téada nua ón ngiotár.', translation_en: 'The guitar needs new strings.', difficulty_tier: 'hard' },
  { id: 'crowd-singing', category: 'ceoltoiri', text_digraf: 'Bhí an slua ag canadh linn.', text_trad: 'Ḃí an slua ag canaḋ linn.', translation_en: 'The crowd was singing with us.', difficulty_tier: 'hard' },
  { id: 'wrong-key', category: 'ceoltoiri', text_digraf: 'Táimid sa ghléas mícheart.', text_trad: 'Táimid sa ġléas míċeart.', translation_en: 'We are in the wrong key.', difficulty_tier: 'hard' },
  { id: 'practice-bridge', category: 'ceoltoiri', text_digraf: 'Cleachtaimis an droichead arís.', text_trad: 'Cleaċtaimis an droiċead arís.', translation_en: 'Let us practise the bridge again.', difficulty_tier: 'expert' },
  { id: 'violin-sweet', category: 'ceoltoiri', text_digraf: 'Tá fuaim bhinn ag an veidhlín.', text_trad: 'Tá fuaim ḃinn ag an veidhlín.', translation_en: 'The violin has a sweet sound.', difficulty_tier: 'expert' },
  { id: 'count-four', category: 'ceoltoiri', text_digraf: 'Comhair ceithre bhuille dúinn.', text_trad: 'Coṁair ceiṫre ḃuille dúinn.', translation_en: 'Count four beats for us.', difficulty_tier: 'hard' },
  { id: 'quiet-stage', category: 'ceoltoiri', text_digraf: 'Tá an stáitse ciúin fós.', text_trad: 'Tá an stáitse ciúin fós.', translation_en: 'The stage is still quiet.', difficulty_tier: 'medium' },
  { id: 'bring-spare-cable', category: 'ceoltoiri', text_digraf: 'Tabhair cábla breise leat.', text_trad: 'Taḃair cábla breise leat.', translation_en: 'Bring a spare cable with you.', difficulty_tier: 'hard' },
  { id: 'audience-clapped', category: 'ceoltoiri', text_digraf: 'Bhuail an lucht éisteachta bos.', text_trad: 'Ḃuail an luċt éisteaċta bos.', translation_en: 'The audience clapped.', difficulty_tier: 'expert' },
  { id: 'song-too-long', category: 'ceoltoiri', text_digraf: 'Tá an t-amhrán beagán ró-fhada.', text_trad: 'Tá an t-aṁrán beagán ró-ḟada.', translation_en: 'The song is a little too long.', difficulty_tier: 'hard' },
  { id: 'piano-needs-tuning', category: 'ceoltoiri', text_digraf: 'Teastaíonn tiúnadh ón bpianó.', text_trad: 'Teastaíonn tiúnaḋ ón bpianó.', translation_en: 'The piano needs tuning.', difficulty_tier: 'hard' },
  { id: 'last-chord-ring', category: 'ceoltoiri', text_digraf: 'Lig don chorda deireanach fanacht.', text_trad: 'Lig don ċorda deireanaċ fanaċt.', translation_en: 'Let the last chord hang.', difficulty_tier: 'expert' },
  { id: 'saved-game', category: 'caitheamh-aimsire', text_digraf: 'Shábháil mé an cluiche díreach anois.', text_trad: 'Ṡáḃáil mé an cluiċe díreaċ anois.', translation_en: 'I saved the game just now.', difficulty_tier: 'expert' },
  { id: 'boss-fight', category: 'caitheamh-aimsire', text_digraf: 'Tá an cath deireanach ródheacair.', text_trad: 'Tá an caṫ deireanaċ ródheacair.', translation_en: 'The final fight is too hard.', difficulty_tier: 'hard' },
  { id: 'new-book-smell', category: 'caitheamh-aimsire', text_digraf: 'Is breá liom boladh leabhair nua.', text_trad: 'Is breá liom bolaḋ leaḃair nua.', translation_en: 'I love the smell of a new book.', difficulty_tier: 'hard' },
  { id: 'read-by-fire', category: 'caitheamh-aimsire', text_digraf: 'Léigh mé cois tine aréir.', text_trad: 'Léiġ mé cois tine aréir.', translation_en: 'I read by the fire last night.', difficulty_tier: 'medium' },
  { id: 'trail-map', category: 'caitheamh-aimsire', text_digraf: 'D’fhág mé an léarscáil sa charr.', text_trad: 'D’ḟág mé an léarscáil sa ċarr.', translation_en: 'I left the map in the car.', difficulty_tier: 'expert' },
  { id: 'boots-wet', category: 'caitheamh-aimsire', text_digraf: 'Tá mo bhuataisí fliuch fós.', text_trad: 'Tá mo ḃuataisí fliuċ fós.', translation_en: 'My boots are still wet.', difficulty_tier: 'hard' },
  { id: 'run-extra-mile', category: 'caitheamh-aimsire', text_digraf: 'Rith mé míle breise inniu.', text_trad: 'Riṫ mé míle breise inniu.', translation_en: 'I ran an extra mile today.', difficulty_tier: 'medium' },
  { id: 'bike-chain', category: 'caitheamh-aimsire', text_digraf: 'Thit an slabhra den rothar.', text_trad: 'Ṫit an slaḃra den roṫar.', translation_en: 'The chain fell off the bike.', difficulty_tier: 'expert' },
  { id: 'camera-battery', category: 'caitheamh-aimsire', text_digraf: 'Tá ceallra an cheamara íseal.', text_trad: 'Tá ceallra an ċeamara íseal.', translation_en: 'The camera battery is low.', difficulty_tier: 'hard' },
  { id: 'knitting-row', category: 'caitheamh-aimsire', text_digraf: 'Chríochnaigh mé sraith eile cniotála.', text_trad: 'Ċríoċnaiġ mé sraiṫ eile cniotála.', translation_en: 'I finished another row of knitting.', difficulty_tier: 'expert' },
  { id: 'garden-weeds', category: 'caitheamh-aimsire', text_digraf: 'D’fhás fiailí timpeall na rósanna.', text_trad: 'D’ḟás fiailí timpeall na rósanna.', translation_en: 'Weeds grew around the roses.', difficulty_tier: 'expert' },
  { id: 'paint-still-wet', category: 'caitheamh-aimsire', text_digraf: 'Tá an phéint fós fliuch.', text_trad: 'Tá an ṗéint fós fliuċ.', translation_en: 'The paint is still wet.', difficulty_tier: 'medium' },
  { id: 'puzzle-piece', category: 'caitheamh-aimsire', text_digraf: 'Tá píosa amháin den phuzal ar iarraidh.', text_trad: 'Tá píosa amháin den ṗuzal ar iarṫaiḋ.', translation_en: 'One piece of the puzzle is missing.', difficulty_tier: 'expert' },
  { id: 'campfire-bright', category: 'caitheamh-aimsire', text_digraf: 'Bhí an tine champa geal.', text_trad: 'Ḃí an tine ċampa geal.', translation_en: 'The campfire was bright.', difficulty_tier: 'medium' },
  { id: 'caught-fish', category: 'caitheamh-aimsire', text_digraf: 'Rug mé ar iasc beag.', text_trad: 'Rug mé ar iasc beag.', translation_en: 'I caught a small fish.', difficulty_tier: 'easy' },
  { id: 'chess-move', category: 'caitheamh-aimsire', text_digraf: 'Rinne sí bogadh cliste san fhicheall.', text_trad: 'Rinne sí bogaḋ cliste san ḟiċeall.', translation_en: 'She made a clever move in chess.', difficulty_tier: 'expert' },
  { id: 'movie-night', category: 'caitheamh-aimsire', text_digraf: 'Beidh oíche scannáin againn.', text_trad: 'Beiḋ oíċe scannáin againn.', translation_en: 'We will have a movie night.', difficulty_tier: 'hard' },
  { id: 'swim-before-breakfast', category: 'caitheamh-aimsire', text_digraf: 'Shnámh mé roimh bhricfeasta.', text_trad: 'Ṡnáṁ mé roiṁ ḃricfeasta.', translation_en: 'I swam before breakfast.', difficulty_tier: 'expert' },
  { id: 'finished-level', category: 'caitheamh-aimsire', text_digraf: 'Chríochnaigh mé an leibhéal sin.', text_trad: 'Ċríoċnaiġ mé an leiḃéal sin.', translation_en: 'I finished that level.', difficulty_tier: 'expert' },
  { id: 'book-club', category: 'caitheamh-aimsire', text_digraf: 'Phléamar an leabhar sa chlub.', text_trad: 'Ṗléamar an leaḃar sa ċlub.', translation_en: 'We discussed the book in the club.', difficulty_tier: 'expert' },
  { id: 'missed-bus', category: 'taisteal', text_digraf: 'Chaill mé an bus ar maidin.', text_trad: 'Ċaill mé an bus ar maidin.', translation_en: 'I missed the bus this morning.', difficulty_tier: 'medium' },
  { id: 'passport-pocket', category: 'taisteal', text_digraf: 'Tá an pas i mo phóca.', text_trad: 'Tá an pas i mo ṗóca.', translation_en: 'The passport is in my pocket.', difficulty_tier: 'medium' },
  { id: 'ticket-phone', category: 'taisteal', text_digraf: 'Tá an ticéad ar mo ghuthán.', text_trad: 'Tá an ticéad ar mo ġuṫán.', translation_en: 'The ticket is on my phone.', difficulty_tier: 'hard' },
  { id: 'rain-at-station', category: 'taisteal', text_digraf: 'Bhí báisteach ag an stáisiún.', text_trad: 'Ḃí báisteaċ ag an stáisiún.', translation_en: 'There was rain at the station.', difficulty_tier: 'hard' },
  { id: 'booked-room', category: 'taisteal', text_digraf: 'Chuir mé seomra in áirithe.', text_trad: 'Ċuir mé seomra in áiriṫe.', translation_en: 'I booked a room.', difficulty_tier: 'hard' },
  { id: 'road-closed', category: 'taisteal', text_digraf: 'Tá an bóthar dúnta romhainn.', text_trad: 'Tá an bóṫar dúnta roṁainn.', translation_en: 'The road ahead is closed.', difficulty_tier: 'hard' },
  { id: 'lost-luggage', category: 'taisteal', text_digraf: 'Cailleadh mo bhagáiste san aerfort.', text_trad: 'Cailleaḋ mo ḃagáiste san aerfort.', translation_en: 'My luggage was lost in the airport.', difficulty_tier: 'expert' },
  { id: 'first-flight', category: 'taisteal', text_digraf: 'Is é seo mo chéad eitilt.', text_trad: 'Is é seo mo ċéad eitilt.', translation_en: 'This is my first flight.', difficulty_tier: 'medium' },
  { id: 'window-seat', category: 'taisteal', text_digraf: 'Ba mhaith liom suíochán fuinneoige.', text_trad: 'Ba ṁaiṫ liom suíoċán fuinneoige.', translation_en: 'I would like a window seat.', difficulty_tier: 'expert' },
  { id: 'rent-car', category: 'taisteal', text_digraf: 'Fuaireamar carr ar cíos.', text_trad: 'Fuaireamar carr ar cíos.', translation_en: 'We rented a car.', difficulty_tier: 'medium' },
  { id: 'bridge-after-town', category: 'taisteal', text_digraf: 'Tá droichead tar éis an bhaile.', text_trad: 'Tá droiċead tar éis an ḃaile.', translation_en: 'There is a bridge after the town.', difficulty_tier: 'hard' },
  { id: 'change-trains', category: 'taisteal', text_digraf: 'Caithfimid traenacha a athrú.', text_trad: 'Caiṫfimid traenaċa a aṫrú.', translation_en: 'We must change trains.', difficulty_tier: 'expert' },
  { id: 'map-not-loading', category: 'taisteal', text_digraf: 'Níl an léarscáil ag luchtú.', text_trad: 'Níl an léarscáil ag luċtú.', translation_en: 'The map is not loading.', difficulty_tier: 'hard' },
  { id: 'long-queue', category: 'taisteal', text_digraf: 'Tá scuaine fhada ag an ngeata.', text_trad: 'Tá scuaine ḟada ag an ngeata.', translation_en: 'There is a long queue at the gate.', difficulty_tier: 'hard' },
  { id: 'arrived-before-dark', category: 'taisteal', text_digraf: 'Shroicheamar an áit roimh dhorchadas.', text_trad: 'Ṡroiċeamar an áit roiṁ ḋorċadas.', translation_en: 'We reached the place before darkness.', difficulty_tier: 'expert' },
  { id: 'asked-directions', category: 'taisteal', text_digraf: 'D’iarr mé treoracha ón bhfear.', text_trad: 'D’iarr mé treoraċa ón ḃfear.', translation_en: 'I asked the man for directions.', difficulty_tier: 'expert' },
  { id: 'harbour-windy', category: 'taisteal', text_digraf: 'Bhí an calafort gaofar tráthnóna.', text_trad: 'Ḃí an calafort gaofar tráṫnóna.', translation_en: 'The harbour was windy in the evening.', difficulty_tier: 'expert' },
  { id: 'early-checkout', category: 'taisteal', text_digraf: 'Tá an tseiceáil amach ró-luath.', text_trad: 'Tá an tseiceáil amaċ ró-luaṫ.', translation_en: 'Checkout is too early.', difficulty_tier: 'expert' },
  { id: 'cross-border', category: 'taisteal', text_digraf: 'Thrasnaíomar an teorainn gan mhoill.', text_trad: 'Ṫrasnaíomar an teorainn gan ṁoill.', translation_en: 'We crossed the border without delay.', difficulty_tier: 'expert' },
  { id: 'homeward-road', category: 'taisteal', text_digraf: 'Tá bóthar fada abhaile againn.', text_trad: 'Tá bóṫar fada aḃaile againn.', translation_en: 'We have a long road home.', difficulty_tier: 'hard' }
];

const PROVERB_SUPPLEMENTAL_CONTENT: readonly CandidateContentSeed[] = [
  { id: 'health-better-than-wealth', category: 'seanfhocal', text_digraf: 'Is fearr an tsláinte ná na táinte.', text_trad: 'Is fearr an tsláinte ná na táinte.', translation_en: 'Health is better than wealth.', difficulty_tier: 'medium' },
  { id: 'long-road-without-turn', category: 'seanfhocal', text_digraf: 'Is fada an bóthar nach mbíonn casadh ann.', text_trad: 'Is fada an bóṫar naċ mbíonn casaḋ ann.', translation_en: 'It is a long road that has no turn.', difficulty_tier: 'expert' },
  { id: 'no-place-like-home', category: 'seanfhocal', text_digraf: 'Níl aon tinteán mar do thinteán féin.', text_trad: 'Níl aon tinteán mar do ṫinteán féin.', translation_en: 'There is no hearth like your own hearth.', difficulty_tier: 'expert' },
  { id: 'quiet-mouth', category: 'seanfhocal', text_digraf: 'Is binn béal ina thost.', text_trad: 'Is binn béal ina ṫost.', translation_en: 'A silent mouth is sweet.', difficulty_tier: 'medium' },
  { id: 'generous-hand', category: 'seanfhocal', text_digraf: 'Is maith an scáthán súil charad.', text_trad: 'Is maiṫ an scáṫán súil ċarad.', translation_en: 'A friend’s eye is a good mirror.', difficulty_tier: 'expert' },
  { id: 'small-thing-heavy', category: 'seanfhocal', text_digraf: 'Is trom an t-ualach an t-aineolas.', text_trad: 'Is trom an t-ualaċ an t-aineolas.', translation_en: 'Ignorance is a heavy burden.', difficulty_tier: 'expert' },
  { id: 'better-late-than-never', category: 'seanfhocal', text_digraf: 'Is fearr mall ná go brách.', text_trad: 'Is fearr mall ná go bráċ.', translation_en: 'Better late than never.', difficulty_tier: 'easy' },
  { id: 'help-at-door', category: 'seanfhocal', text_digraf: 'Aithníonn ciaróg ciaróg eile.', text_trad: 'Aiṫníonn ciaróg ciaróg eile.', translation_en: 'One beetle recognises another.', difficulty_tier: 'hard' },
  { id: 'knowledge-with-practice', category: 'seanfhocal', text_digraf: 'Cleachtadh a dhéanann máistreacht.', text_trad: 'Cleaċtaḋ a ḋéanann máistreaċt.', translation_en: 'Practice makes mastery.', difficulty_tier: 'expert' },
  { id: 'small-sparks', category: 'seanfhocal', text_digraf: 'Tagann tinte móra as spréacha beaga.', text_trad: 'Tagann tinte móra as spréaċa beaga.', translation_en: 'Great fires come from small sparks.', difficulty_tier: 'expert' }
];

const SUPPLEMENTAL_CONTENT: readonly PuzzleContent[] = [
  ...ORIGINAL_SUPPLEMENTAL_CONTENT.map(createOriginalCandidateContent),
  ...PROVERB_SUPPLEMENTAL_CONTENT.map(createProverbCandidateContent)
];

export const CONTENT_BANK: readonly PuzzleContent[] = [
  {
    id: 'unity-strength',
    category: 'seanfhocal',
    text_digraf: 'Ní neart go cur le chéile.',
    text_trad: 'Ní neart go cur le ċéile.',
    translation_en: "There's no strength without unity.",
    provenance_note:
      'Ní bua aon duine amháin é seo — sean-nath a deirtear ag bailiúcháin, ag tógáil tí, ag cur an fhómhair. Meabhrúchán go bhfuil an lámh chúnta níos láidre ná an lámh aonair.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'shared-shelter',
    category: 'seanfhocal',
    text_digraf: 'Ar scáth a chéile a mhaireann na daoine.',
    text_trad: 'Ar scáṫ a ċéile a ṁaireann na daoine.',
    translation_en: 'People live in one another’s shelter.',
    provenance_note:
      'Seanfhocal faoi chomhluadar agus faoi chúram pobail. Cuireann sé i gcuimhne dúinn nach seasann duine ina aonar ar feadh i bhfad.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'good-beginning',
    category: 'seanfhocal',
    text_digraf: 'Tús maith leath na hoibre.',
    text_trad: 'Tús maiṫ leaṫ na hoibre.',
    translation_en: 'A good start is half the work.',
    provenance_note:
      'Nath coitianta a deirtear le hobair nua, le foghlaim, agus le haon iarracht a dteastaíonn misneach uaithi ag an tús.',
    difficulty_tier: 'easy',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'praise-youth',
    category: 'seanfhocal',
    text_digraf: 'Mol an óige agus tiocfaidh sí.',
    text_trad: 'Mol an óige agus tiocfaiḋ sí.',
    translation_en: 'Praise the young and they will flourish.',
    provenance_note:
      'Seanfhocal a bhaineann le spreagadh agus muinín. Tugann sé áit don fhocal maith mar chuid den fhás.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'broken-irish',
    category: 'seanfhocal',
    text_digraf: 'Is fearr Gaeilge bhriste ná Béarla cliste.',
    text_trad: 'Is fearr Gaeilge ḃriste ná Béarla cliste.',
    translation_en: 'Broken Irish is better than clever English.',
    provenance_note:
      'Nath nua-aimseartha i spiorad na seanfhocal, cloiste go minic i gcomhthéacs foghlaim agus úsáid na Gaeilge gan faitíos.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Contemporary Irish-language saying in common circulation; included as user-curated app content.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown contemporary source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'wash-potatoes',
    category: 'cistin',
    text_digraf: 'Nigh na prátaí sa doirteal.',
    text_trad: 'Niġ na prátaí sa doirteal.',
    translation_en: 'Wash the potatoes in the sink.',
    provenance_note:
      'Abairt laethúil chumtha don aip faoi obair shimplí sa chistin. Ba chóir do chainteoir líofa í a sheiceáil roimh fhoilsiú.',
    difficulty_tier: 'easy',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'cut-bread-board',
    category: 'cistin',
    text_digraf: 'Gearr an t-arán ar an gclár.',
    text_trad: 'Gearr an t-arán ar an gclár.',
    translation_en: 'Cut the bread on the board.',
    provenance_note:
      'Abairt ghairid chumtha don chatagóir cistine, dírithe ar ghníomh coitianta agus focail shoiléire.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'switch-on-kettle',
    category: 'cistin',
    text_digraf: 'Cuir an citeal ar siúl.',
    text_trad: 'Cuir an citeal ar siúl.',
    translation_en: 'Put the kettle on.',
    provenance_note:
      'Frása cistine chumtha don aip, úsáideach mar phuzal gearr le litreachas laethúil.',
    difficulty_tier: 'easy',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'stir-soup-slowly',
    category: 'cistin',
    text_digraf: 'Corraigh an t-anraith go mall.',
    text_trad: 'Corraiġ an t-anraiṫ go mall.',
    translation_en: 'Stir the soup slowly.',
    provenance_note:
      'Abairt chumtha faoin gcócaireacht, le gníomh soiléir agus focail oiriúnacha don phuzal.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'clean-table-after-meal',
    category: 'cistin',
    text_digraf: 'Glan an bord tar éis béile.',
    text_trad: 'Glan an bord tar éis béile.',
    translation_en: 'Clean the table after the meal.',
    provenance_note:
      'Abairt laethúil chumtha faoi ghlanadh i ndiaidh béile, le foclóir simplí agus nádúrtha.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'guitar-out-of-tune',
    category: 'ceoltoiri',
    text_digraf: 'Tá an giotár as tiúin.',
    text_trad: 'Tá an giotár as tiúin.',
    translation_en: 'The guitar is out of tune.',
    provenance_note:
      'Trácht gearr cumtha a d’fhéadfadh ceoltóir a rá le linn cleachtaidh nó roimh sheisiún.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'keep-rhythm-drum',
    category: 'ceoltoiri',
    text_digraf: 'Coinnigh an rithim leis an druma.',
    text_trad: 'Coinniġ an riṫim leis an druma.',
    translation_en: 'Keep the rhythm with the drum.',
    provenance_note:
      'Abairt chumtha faoi rithim agus seinm le chéile, le béim ar chaint chleachtaidh.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'sing-chorus-again',
    category: 'ceoltoiri',
    text_digraf: 'Can an curfá arís.',
    text_trad: 'Can an curfá arís.',
    translation_en: 'Sing the chorus again.',
    provenance_note:
      'Ordú gearr cumtha ó chleachtadh ceoil, simplí go leor don leibhéal éasca.',
    difficulty_tier: 'easy',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'sound-too-loud',
    category: 'ceoltoiri',
    text_digraf: 'Bhí an fhuaim ró-ard anocht.',
    text_trad: 'Ḃí an ḟuaim ró-ard anoċt.',
    translation_en: 'The sound was too loud tonight.',
    provenance_note:
      'Trácht iar-sheó chumtha faoi fhuaim agus toirt, oiriúnach do chatagóir na gceoltóirí.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'start-after-count',
    category: 'ceoltoiri',
    text_digraf: 'Tosóimid tar éis an chomhairimh.',
    text_trad: 'Tosóimid tar éis an ċoṁairiṁ.',
    translation_en: 'We will start after the count.',
    provenance_note:
      'Abairt chumtha ó chomhthéacs cleachtaidh, le foirm bhriathartha a chuireann dúshlán beag leis.',
    difficulty_tier: 'expert',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'game-too-hard',
    category: 'caitheamh-aimsire',
    text_digraf: 'Tá an cluiche ró-dheacair dom.',
    text_trad: 'Tá an cluiċe ró-ḋeacair dom.',
    translation_en: 'The game is too hard for me.',
    provenance_note:
      'Trácht gearr cumtha do gamers, le foclóir comhaimseartha agus struchtúr simplí.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'one-chapter-left',
    category: 'caitheamh-aimsire',
    text_digraf: 'Tá caibidil eile fágtha agam.',
    text_trad: 'Tá caibidil eile fágṫa agam.',
    translation_en: 'I have one more chapter left.',
    provenance_note:
      'Abairt chumtha do léitheoirí, oiriúnach do phuzal gairid faoin léitheoireacht.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'path-slippery-today',
    category: 'caitheamh-aimsire',
    text_digraf: 'Tá an cosán sleamhain inniu.',
    text_trad: 'Tá an cosán sleaṁain inniu.',
    translation_en: 'The path is slippery today.',
    provenance_note:
      'Trácht chumtha do shiúlóirí agus lucht fánaíochta, le híomhá shoiléir laethúil.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'lost-paintbrush-again',
    category: 'caitheamh-aimsire',
    text_digraf: 'Chaill mé an scuab péinte arís.',
    text_trad: 'Ċaill mé an scuab péinte arís.',
    translation_en: 'I lost the paintbrush again.',
    provenance_note:
      'Abairt chumtha do lucht ealaíne agus ceardaíochta, greannmhar ach simplí.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'seeds-planted-garden',
    category: 'caitheamh-aimsire',
    text_digraf: 'Tá na síolta curtha sa ghairdín.',
    text_trad: 'Tá na síolta curṫa sa ġairdín.',
    translation_en: 'The seeds are planted in the garden.',
    provenance_note:
      'Abairt chumtha do gharraíodóirí, le focail choitianta faoi chur agus faoin ngairdín.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'pack-bag-before-morning',
    category: 'taisteal',
    text_digraf: 'Pacáil an mála roimh mhaidin.',
    text_trad: 'Pacáil an mála roiṁ ṁaidin.',
    translation_en: 'Pack the bag before morning.',
    provenance_note:
      'Abairt taistil chumtha faoin ullmhúchán roimh imeacht.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'train-late-again',
    category: 'taisteal',
    text_digraf: 'Tá an traein déanach arís.',
    text_trad: 'Tá an traein déanaċ arís.',
    translation_en: 'The train is late again.',
    provenance_note:
      'Frása taistil chumtha faoi mhoill choitianta ar thuras.',
    difficulty_tier: 'easy',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'where-departure-gate',
    category: 'taisteal',
    text_digraf: 'Cá bhfuil an geata imeachta?',
    text_trad: 'Cá ḃfuil an geata imeaċta?',
    translation_en: 'Where is the departure gate?',
    provenance_note:
      'Ceist taistil chumtha a bhaineann le haerfort nó stáisiún mór.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'quiet-small-room',
    category: 'taisteal',
    text_digraf: 'Fuair mé seomra beag ciúin.',
    text_trad: 'Fuair mé seomra beag ciúin.',
    translation_en: 'I got a quiet small room.',
    provenance_note:
      'Abairt chumtha faoi lóistín agus seomra ciúin i rith turais.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'follow-road-bridge',
    category: 'taisteal',
    text_digraf: 'Lean an bóthar go dtí an droichead.',
    text_trad: 'Lean an bóṫar go dtí an droiċead.',
    translation_en: 'Follow the road to the bridge.',
    provenance_note:
      'Treoir taistil chumtha faoi bhealach simplí ó áit go háit.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Original candidate app content; not sourced from a third-party text; pending linguistic and rights review.',
    source_url: 'candidate:original-app-content',
    author_name: 'Fuascail content candidate',
    author_death_year: 0,
    public_domain_basis:
      'Original candidate content; no public-domain basis asserted; not production eligible until rights and review are completed.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'two-shorten-road',
    category: 'seanfhocal',
    text_digraf: 'Giorraíonn beirt bóthar.',
    text_trad: 'Giorraíonn beirt bóṫar.',
    translation_en: 'Two people shorten a road.',
    provenance_note:
      'Seanfhocal coitianta faoi chomhluadar ar thuras nó in obair. Teastaíonn foinse chartlainne agus athbhreithniú teanga fós.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'walker-has-stories',
    category: 'seanfhocal',
    text_digraf: 'An té a bhíonn siúlach bíonn scéalach.',
    text_trad: 'An té a ḃíonn siúlaċ bíonn scéalaċ.',
    translation_en: 'The one who travels has stories.',
    provenance_note:
      'Seanfhocal faoi thaithí agus scéalaíocht, le ceangal nádúrtha leis an taisteal.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'taste-in-little',
    category: 'seanfhocal',
    text_digraf: 'Bíonn blas ar an mbeagán.',
    text_trad: 'Bíonn blas ar an mbeagán.',
    translation_en: 'There is taste in a little.',
    provenance_note:
      'Nath traidisiúnta gearr faoi shástacht agus meas ar an méid beag.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'mouth-broke-nose',
    category: 'seanfhocal',
    text_digraf: 'Is minic a bhris béal duine a shrón.',
    text_trad: 'Is minic a ḃris béal duine a ṡrón.',
    translation_en: 'A person’s mouth often broke their nose.',
    provenance_note:
      'Seanfhocal rabhaidh faoi chaint mhíchúramach agus a hiarmhairtí.',
    difficulty_tier: 'hard',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  {
    id: 'wise-without-fault',
    category: 'seanfhocal',
    text_digraf: 'Ní bhíonn saoi gan locht.',
    text_trad: 'Ní ḃíonn saoi gan loċt.',
    translation_en: 'There is no wise person without a fault.',
    provenance_note:
      'Seanfhocal gearr faoi lochtanna daonna agus measarthacht i mbreithiúnas.',
    difficulty_tier: 'medium',
    source_rights_reference:
      'Traditional Irish proverb; candidate entry pending archival source verification.',
    source_url: 'candidate:source-needed',
    author_name: 'Unknown traditional source',
    author_death_year: 0,
    public_domain_basis:
      'Candidate only: no author death year has been verified; not production eligible.',
    linguistic_review: { status: 'pending' }
  },
  ...SUPPLEMENTAL_CONTENT
];

export function validatePuzzleContent(item: unknown): item is PuzzleContent {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const candidate = item as Partial<Record<keyof PuzzleContent, unknown>>;

  return (
    isNonEmptyString(candidate.id) &&
    isNonEmptyString(candidate.category) &&
    isNonEmptyString(candidate.text_digraf) &&
    isNonEmptyString(candidate.text_trad) &&
    isNonEmptyString(candidate.translation_en) &&
    isNonEmptyString(candidate.provenance_note) &&
    isDifficultyTier(candidate.difficulty_tier) &&
    isNonEmptyString(candidate.source_rights_reference) &&
    isNonEmptyString(candidate.source_url) &&
    isNonEmptyString(candidate.author_name) &&
    typeof candidate.author_death_year === 'number' &&
    Number.isInteger(candidate.author_death_year) &&
    isNonEmptyString(candidate.public_domain_basis) &&
    isLinguisticReview(candidate.linguistic_review)
  );
}

export function getProductionReadyContentBank(
  bank: readonly PuzzleContent[],
  asOfYear = new Date().getUTCFullYear()
): PuzzleContent[] {
  return bank.filter(
    (item) =>
      validatePuzzleContent(item) &&
      item.linguistic_review.status === 'signed_off' &&
      hasApprovedPublicDomainSourceReference(item) &&
      isPublicDomainByAuthorDeathYear(item, asOfYear)
  );
}

export function getContentBankReadiness(
  bank: readonly PuzzleContent[],
  targetSize = CONTENT_BANK_TARGET_SIZE,
  asOfYear = new Date().getUTCFullYear()
): ContentBankReadiness {
  const signedOffEntries = getProductionReadyContentBank(bank, asOfYear);
  const unsignedEntryIds = bank
    .filter((item) => item.linguistic_review.status !== 'signed_off')
    .map((item) => item.id);
  const unapprovedSourceEntryIds = bank
    .filter((item) => !hasApprovedPublicDomainSourceReference(item))
    .map((item) => item.id);
  const missingRightsReferenceIds = bank
    .filter((item) => item.source_rights_reference.trim().length === 0)
    .map((item) => item.id);
  const nonPublicDomainEntryIds = bank
    .filter((item) => !isPublicDomainByAuthorDeathYear(item, asOfYear))
    .map((item) => item.id);

  return {
    targetSize,
    totalEntries: bank.length,
    signedOffEntries: signedOffEntries.length,
    unsignedEntryIds,
    unapprovedSourceEntryIds,
    missingRightsReferenceIds,
    nonPublicDomainEntryIds,
    readyForProduction:
      signedOffEntries.length >= targetSize &&
      unsignedEntryIds.length === 0 &&
      unapprovedSourceEntryIds.length === 0 &&
      missingRightsReferenceIds.length === 0 &&
      nonPublicDomainEntryIds.length === 0
  };
}

export function isPublicDomainByAuthorDeathYear(
  item: Pick<PuzzleContent, 'author_death_year'>,
  asOfYear = new Date().getUTCFullYear()
): boolean {
  return item.author_death_year > 0 && asOfYear - item.author_death_year >= PUBLIC_DOMAIN_AUTHOR_DEATH_YEARS;
}

export function getPuzzleCategories(bank: readonly PuzzleContent[]): PuzzleCategory[] {
  const groupedItems = new Map<string, PuzzleContent[]>();

  for (const item of bank) {
    if (!validatePuzzleContent(item)) {
      continue;
    }

    groupedItems.set(item.category, [...(groupedItems.get(item.category) ?? []), item]);
  }

  return [...groupedItems.entries()]
    .map(([category, items]) => {
      const presentation = CATEGORY_PRESENTATION[category] ?? {
        label: titleCaseCategory(category),
        description: 'Bailiúchán puzal ón gcatagóir seo.'
      };

      return {
        slug: getCategorySlug(category),
        category,
        label: presentation.label,
        description: presentation.description,
        count: items.length,
        difficultyTiers: getOrderedDifficultyTiers(items)
      };
    })
    .sort((first, second) => first.label.localeCompare(second.label, 'ga-IE'));
}

export function getCategorySlug(category: string): string {
  return category
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getContentByCategory(
  bank: readonly PuzzleContent[],
  categorySlug: string
): PuzzleContent[] {
  return bank.filter((item) => getCategorySlug(item.category) === categorySlug);
}

export function selectContentForCategory(
  bank: readonly PuzzleContent[],
  categorySlug: string,
  seedKey: string
): PuzzleContent {
  const categoryItems = getContentByCategory(bank, categorySlug);

  if (categoryItems.length === 0) {
    throw new Error(`Cannot select content for unknown category "${categorySlug}".`);
  }

  const index = hashString(`${categorySlug}:${seedKey}`) % categoryItems.length;
  const selectedItem = categoryItems[index];

  if (selectedItem === undefined) {
    throw new Error('Unable to select category content.');
  }

  return selectedItem;
}

export function selectNextContent(
  bank: readonly PuzzleContent[],
  currentItemId: string,
  categorySlug: string | null = null
): PuzzleContent {
  const selectionPool =
    categorySlug === null ? [...bank] : getContentByCategory(bank, categorySlug);

  if (selectionPool.length === 0) {
    throw new Error('Cannot select next content from an empty bank.');
  }

  const currentIndex = selectionPool.findIndex((item) => item.id === currentItemId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % selectionPool.length;
  const selectedItem = selectionPool[nextIndex];

  if (selectedItem === undefined) {
    throw new Error('Unable to select next content.');
  }

  return selectedItem;
}

function createOriginalCandidateContent(seed: CandidateContentSeed): PuzzleContent {
  return {
    ...seed,
    provenance_note:
      'Abairt laethúil chumtha don aip mar ábhar iarrthach. Teastaíonn athbhreithniú ó chainteoir líofa nó ó theangeolaí roimh fhoilsiú.',
    ...ORIGINAL_CONTENT_SOURCE
  };
}

function createProverbCandidateContent(seed: CandidateContentSeed): PuzzleContent {
  return {
    ...seed,
    provenance_note:
      'Seanfhocal iarrthach don bhanc ábhair. Teastaíonn foinse chartlainne agus athbhreithniú teanga roimh fhoilsiú.',
    ...PROVERB_CONTENT_SOURCE
  };
}

function hashString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function titleCaseCategory(category: string): string {
  return category
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0]?.toLocaleUpperCase('ga-IE') + part.slice(1))
    .join(' ');
}

function getOrderedDifficultyTiers(items: readonly PuzzleContent[]): DifficultyTier[] {
  const order: DifficultyTier[] = ['easy', 'medium', 'hard', 'expert'];
  const tiers = new Set(items.map((item) => item.difficulty_tier));

  return order.filter((tier) => tiers.has(tier));
}

function parseDateKey(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);

  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    throw new Error(`Invalid date key "${dateKey}".`);
  }

  return Date.UTC(year, month - 1, day);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDifficultyTier(value: unknown): value is DifficultyTier {
  return value === 'easy' || value === 'medium' || value === 'hard' || value === 'expert';
}

function isLinguisticReview(value: unknown): value is LinguisticReview {
  if (typeof value !== 'object' || value === null || !('status' in value)) {
    return false;
  }

  if (value.status === 'pending') {
    return true;
  }

  if (value.status !== 'signed_off') {
    return false;
  }

  return (
    'reviewer_name' in value &&
    'reviewer_role' in value &&
    'reviewed_on' in value &&
    isNonEmptyString(value.reviewer_name) &&
    (value.reviewer_role === 'native_speaker' || value.reviewer_role === 'linguist') &&
    isDateKey(value.reviewed_on)
  );
}

function hasApprovedPublicDomainSourceReference(item: PuzzleContent): boolean {
  const sourceText = `${item.source_rights_reference} ${item.source_url}`.toLocaleLowerCase('en');

  return APPROVED_PUBLIC_DOMAIN_SOURCE_REFERENCES.some((sourceReference) =>
    sourceText.includes(sourceReference.toLocaleLowerCase('en'))
  );
}

function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  try {
    parseDateKey(value);
    return true;
  } catch {
    return false;
  }
}
