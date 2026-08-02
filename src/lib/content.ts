import type { DifficultyTier } from './substitution';

export type PuzzleContent = {
  id: string;
  category: string;
  text_digraf: string;
  text_trad: string;
  translation_en: string;
  provenance_note: string;
  difficulty_tier: DifficultyTier;
  source_rights_reference: string;
};

export type ServedContentRecord = {
  id: string;
  servedOn: string;
};

export const RECENT_CONTENT_WINDOW_DAYS = 60;

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
    'source_rights_reference'
  ],
  properties: {
    id: { type: 'string', minLength: 1 },
    category: { type: 'string', minLength: 1 },
    text_digraf: { type: 'string', minLength: 1 },
    text_trad: { type: 'string', minLength: 1 },
    translation_en: { type: 'string', minLength: 1 },
    provenance_note: { type: 'string', minLength: 1 },
    difficulty_tier: { enum: ['easy', 'medium', 'hard', 'expert'] },
    source_rights_reference: { type: 'string', minLength: 1 }
  }
} as const;

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
    source_rights_reference: 'Traditional Irish proverb; public-domain folk saying.'
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
    source_rights_reference: 'Traditional Irish proverb; public-domain folk saying.'
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
    source_rights_reference: 'Traditional Irish proverb; public-domain folk saying.'
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
    source_rights_reference: 'Traditional Irish proverb; public-domain folk saying.'
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
      'Contemporary Irish-language saying in common circulation; included as user-curated app content.'
  }
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
    isNonEmptyString(candidate.source_rights_reference)
  );
}

export function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function selectContentForDate(
  bank: readonly PuzzleContent[],
  dateKey: string,
  servedRecords: readonly ServedContentRecord[] = [],
  rollingWindowDays = RECENT_CONTENT_WINDOW_DAYS
): PuzzleContent {
  if (bank.length === 0) {
    throw new Error('Cannot select content from an empty bank.');
  }

  const sameDayRecord = servedRecords.find((record) => record.servedOn === dateKey);
  const sameDayItem = bank.find((item) => item.id === sameDayRecord?.id);

  if (sameDayItem !== undefined) {
    return sameDayItem;
  }

  const recentIds = new Set(
    pruneServedRecords(servedRecords, dateKey, rollingWindowDays).map((record) => record.id)
  );
  const eligibleItems = bank.filter((item) => !recentIds.has(item.id));
  const selectionPool = eligibleItems.length > 0 ? eligibleItems : bank;
  const index = hashDateKey(dateKey) % selectionPool.length;
  const selectedItem = selectionPool[index];

  if (selectedItem === undefined) {
    throw new Error('Unable to select content.');
  }

  return selectedItem;
}

export function recordServedContent(
  servedRecords: readonly ServedContentRecord[],
  itemId: string,
  dateKey: string,
  rollingWindowDays = RECENT_CONTENT_WINDOW_DAYS
): ServedContentRecord[] {
  const prunedRecords = pruneServedRecords(servedRecords, dateKey, rollingWindowDays);
  const withoutSameDateDuplicate = prunedRecords.filter(
    (record) => record.servedOn !== dateKey
  );

  return [...withoutSameDateDuplicate, { id: itemId, servedOn: dateKey }];
}

export function pruneServedRecords(
  servedRecords: readonly ServedContentRecord[],
  dateKey: string,
  rollingWindowDays = RECENT_CONTENT_WINDOW_DAYS
): ServedContentRecord[] {
  return servedRecords.filter((record) => {
    const daysAgo = getDateKeyDistance(record.servedOn, dateKey);

    return daysAgo >= 0 && daysAgo < rollingWindowDays;
  });
}

function hashDateKey(dateKey: string): number {
  let hash = 0;

  for (const character of dateKey) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function getDateKeyDistance(fromDateKey: string, toDateKey: string): number {
  return (parseDateKey(toDateKey) - parseDateKey(fromDateKey)) / 86_400_000;
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
