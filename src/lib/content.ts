export type ContentBankItem = {
  id: string;
  text: string;
  translation: string;
  provenanceNote: string;
};

export type ServedContentRecord = {
  id: string;
  servedOn: string;
};

export const RECENT_CONTENT_WINDOW_DAYS = 60;

export const CONTENT_BANK: readonly ContentBankItem[] = [
  {
    id: 'unity-strength',
    text: 'Ní neart go cur le chéile.',
    translation: "There's no strength without unity.",
    provenanceNote:
      'Ní bua aon duine amháin é seo — sean-nath a deirtear ag bailiúcháin, ag tógáil tí, ag cur an fhómhair. Meabhrúchán go bhfuil an lámh chúnta níos láidre ná an lámh aonair.'
  },
  {
    id: 'shared-shelter',
    text: 'Ar scáth a chéile a mhaireann na daoine.',
    translation: 'People live in one another’s shelter.',
    provenanceNote:
      'Seanfhocal faoi chomhluadar agus faoi chúram pobail. Cuireann sé i gcuimhne dúinn nach seasann duine ina aonar ar feadh i bhfad.'
  },
  {
    id: 'good-beginning',
    text: 'Tús maith leath na hoibre.',
    translation: 'A good start is half the work.',
    provenanceNote:
      'Nath coitianta a deirtear le hobair nua, le foghlaim, agus le haon iarracht a dteastaíonn misneach uaithi ag an tús.'
  },
  {
    id: 'praise-youth',
    text: 'Mol an óige agus tiocfaidh sí.',
    translation: 'Praise the young and they will flourish.',
    provenanceNote:
      'Seanfhocal a bhaineann le spreagadh agus muinín. Tugann sé áit don fhocal maith mar chuid den fhás.'
  },
  {
    id: 'broken-irish',
    text: 'Is fearr Gaeilge bhriste ná Béarla cliste.',
    translation: 'Broken Irish is better than clever English.',
    provenanceNote:
      'Nath nua-aimseartha i spiorad na seanfhocal, cloiste go minic i gcomhthéacs foghlaim agus úsáid na Gaeilge gan faitíos.'
  }
];

export function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function selectContentForDate(
  bank: readonly ContentBankItem[],
  dateKey: string,
  servedRecords: readonly ServedContentRecord[] = [],
  rollingWindowDays = RECENT_CONTENT_WINDOW_DAYS
): ContentBankItem {
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
