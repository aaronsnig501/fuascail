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
  seanfhocal: {
    label: 'Seanfhocail',
    description: 'Nathanna gearra traidisiúnta le leideanna faoin saol, faoin bpobal, agus faoin obair.'
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
