export type NumberGroup = 'basic' | 'tens' | 'hundreds' | 'thousands' | 'man';
export type NumberQuizDirection = 'number-to-reading' | 'reading-to-number' | 'kanji-to-number';

export interface JapaneseNumberSegment {
  value: number;
  unit: string;
  kanji: string;
  kana: string;
  romaji: string;
  irregular?: boolean;
}

export interface JapaneseNumber {
  value: number;
  kanji: string;
  kana: string;
  romaji: string;
  segments: JapaneseNumberSegment[];
}

export interface NumberGroupDefinition {
  id: NumberGroup;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
}

interface Reading {
  kanji: string;
  kana: string;
  romaji: string;
}

const DIGITS: Reading[] = [
  { kanji: '零', kana: 'れい', romaji: 'rei' },
  { kanji: '一', kana: 'いち', romaji: 'ichi' },
  { kanji: '二', kana: 'に', romaji: 'ni' },
  { kanji: '三', kana: 'さん', romaji: 'san' },
  { kanji: '四', kana: 'よん', romaji: 'yon' },
  { kanji: '五', kana: 'ご', romaji: 'go' },
  { kanji: '六', kana: 'ろく', romaji: 'roku' },
  { kanji: '七', kana: 'なな', romaji: 'nana' },
  { kanji: '八', kana: 'はち', romaji: 'hachi' },
  { kanji: '九', kana: 'きゅう', romaji: 'kyuu' },
];

export const NUMBER_GROUPS: NumberGroupDefinition[] = [
  { id: 'basic', label: 'Số cơ bản 0–10', shortLabel: '0–10', min: 0, max: 10 },
  { id: 'tens', label: 'Hàng chục 11–99', shortLabel: 'Hàng chục', min: 11, max: 99 },
  { id: 'hundreds', label: 'Hàng trăm 100–999', shortLabel: 'Hàng trăm', min: 100, max: 999 },
  {
    id: 'thousands',
    label: 'Hàng nghìn 1.000–9.999',
    shortLabel: 'Hàng nghìn',
    min: 1000,
    max: 9999,
  },
  {
    id: 'man',
    label: 'Đơn vị 万 đến 99.999.999',
    shortLabel: 'Đơn vị 万',
    min: 10000,
    max: 99999999,
  },
];

export const BASIC_NUMBER_ROWS = DIGITS.map((digit, value) => ({ value, ...digit }));

export const COMMON_COUNTERS = [
  { counter: '円', reading: 'えん', use: 'Giá tiền', example: '300円 · さんびゃくえん' },
  { counter: '人', reading: 'にん', use: 'Người', example: '3人 · さんにん' },
  { counter: '個', reading: 'こ', use: 'Vật nhỏ', example: '4個 · よんこ' },
  { counter: '枚', reading: 'まい', use: 'Vật mỏng', example: '5枚 · ごまい' },
  { counter: '本', reading: 'ほん', use: 'Vật dài', example: '6本 · ろっぽん' },
];

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function toJapaneseNumber(input: number): JapaneseNumber {
  const value = Math.trunc(input);
  if (!Number.isFinite(value) || value < 0 || value > 99999999) {
    throw new RangeError('Japanese number practice supports values from 0 to 99,999,999.');
  }

  if (value === 0) {
    return { value, ...DIGITS[0], segments: [{ value, unit: 'Số 0', ...DIGITS[0] }] };
  }

  const segments: JapaneseNumberSegment[] = [];
  const manValue = Math.floor(value / 10000);
  const remainder = value % 10000;

  if (manValue) {
    const reading = readSmallGroup(manValue);
    segments.push({
      value: manValue * 10000,
      unit: '万 · 10.000',
      kanji: `${reading.kanji}万`,
      kana: `${reading.kana}まん`,
      romaji: `${reading.romaji} man`,
    });
  }

  segments.push(...readPlaceSegments(remainder));

  return {
    value,
    kanji: segments.map((segment) => segment.kanji).join(''),
    kana: segments.map((segment) => segment.kana).join(''),
    romaji: segments.map((segment) => segment.romaji).join(' '),
    segments,
  };
}

function readSmallGroup(value: number): Reading {
  const segments = readPlaceSegments(value);
  return {
    kanji: segments.map((segment) => segment.kanji).join(''),
    kana: segments.map((segment) => segment.kana).join(''),
    romaji: segments.map((segment) => segment.romaji).join(' '),
  };
}

function readPlaceSegments(value: number): JapaneseNumberSegment[] {
  const segments: JapaneseNumberSegment[] = [];
  const thousands = Math.floor(value / 1000);
  const hundreds = Math.floor((value % 1000) / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;

  if (thousands) {
    const special: Record<number, Reading> = {
      3: { kanji: '三千', kana: 'さんぜん', romaji: 'sanzen' },
      8: { kanji: '八千', kana: 'はっせん', romaji: 'hassen' },
    };
    const reading =
      special[thousands] ??
      (thousands === 1
        ? { kanji: '千', kana: 'せん', romaji: 'sen' }
        : {
            kanji: `${DIGITS[thousands].kanji}千`,
            kana: `${DIGITS[thousands].kana}せん`,
            romaji: `${DIGITS[thousands].romaji} sen`,
          });
    segments.push({
      value: thousands * 1000,
      unit: '千 · 1.000',
      ...reading,
      irregular: Boolean(special[thousands]),
    });
  }

  if (hundreds) {
    const special: Record<number, Reading> = {
      3: { kanji: '三百', kana: 'さんびゃく', romaji: 'sanbyaku' },
      6: { kanji: '六百', kana: 'ろっぴゃく', romaji: 'roppyaku' },
      8: { kanji: '八百', kana: 'はっぴゃく', romaji: 'happyaku' },
    };
    const reading =
      special[hundreds] ??
      (hundreds === 1
        ? { kanji: '百', kana: 'ひゃく', romaji: 'hyaku' }
        : {
            kanji: `${DIGITS[hundreds].kanji}百`,
            kana: `${DIGITS[hundreds].kana}ひゃく`,
            romaji: `${DIGITS[hundreds].romaji} hyaku`,
          });
    segments.push({
      value: hundreds * 100,
      unit: '百 · 100',
      ...reading,
      irregular: Boolean(special[hundreds]),
    });
  }

  if (tens) {
    const reading =
      tens === 1
        ? { kanji: '十', kana: 'じゅう', romaji: 'juu' }
        : {
            kanji: `${DIGITS[tens].kanji}十`,
            kana: `${DIGITS[tens].kana}じゅう`,
            romaji: `${DIGITS[tens].romaji} juu`,
          };
    segments.push({ value: tens * 10, unit: '十 · 10', ...reading });
  }

  if (ones) {
    segments.push({ value: ones, unit: 'Đơn vị', ...DIGITS[ones] });
  }

  return segments;
}
