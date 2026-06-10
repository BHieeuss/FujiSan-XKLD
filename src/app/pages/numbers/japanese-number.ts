export type NumberGroup = 'basic' | 'tens' | 'hundreds' | 'thousands' | 'man';
export type NumberQuizDirection = 'number-to-reading' | 'reading-to-number';

export interface JapaneseNumberSegment {
  value: number;
  unit: string;
  kana: string;
  romaji: string;
  irregular?: boolean;
}

export interface JapaneseNumber {
  value: number;
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
  kana: string;
  romaji: string;
}

const DIGITS: Reading[] = [
  { kana: 'れい', romaji: 'rei' },
  { kana: 'いち', romaji: 'ichi' },
  { kana: 'に', romaji: 'ni' },
  { kana: 'さん', romaji: 'san' },
  { kana: 'よん', romaji: 'yon' },
  { kana: 'ご', romaji: 'go' },
  { kana: 'ろく', romaji: 'roku' },
  { kana: 'なな', romaji: 'nana' },
  { kana: 'はち', romaji: 'hachi' },
  { kana: 'きゅう', romaji: 'kyuu' },
];

export const NUMBER_GROUPS: NumberGroupDefinition[] = [
  { id: 'basic', label: 'Số cơ bản 1–10', shortLabel: '1–10', min: 1, max: 10 },
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
    label: 'Hàng vạn 10.000–90.000',
    shortLabel: '1–9 man',
    min: 10000,
    max: 90000,
  },
];

export const BASIC_NUMBER_ROWS = DIGITS.slice(1).map((digit, index) => ({
  value: index + 1,
  ...digit,
}));
export const TEN_NUMBER_ROW = { value: 10, kana: 'じゅう', romaji: 'juu' };

export const COMMON_COUNTERS = [
  { reading: 'えん', use: 'Giá tiền', example: '300 → さんびゃくえん' },
  { reading: 'にん', use: 'Người', example: '3 → さんにん' },
  { reading: 'こ', use: 'Vật nhỏ', example: '4 → よんこ' },
  { reading: 'まい', use: 'Vật mỏng', example: '5 → ごまい' },
  { reading: 'ほん', use: 'Vật dài', example: '6 → ろっぽん' },
];

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function toJapaneseNumber(input: number): JapaneseNumber {
  const value = Math.trunc(input);
  if (!Number.isFinite(value) || value < 1 || value > 90000) {
    throw new RangeError('Japanese number practice supports values from 1 to 90,000.');
  }

  const segments: JapaneseNumberSegment[] = [];
  const manValue = Math.floor(value / 10000);
  const remainder = value % 10000;

  if (manValue) {
    const reading = readSmallGroup(manValue);
    segments.push({
      value: manValue * 10000,
      unit: 'Hàng vạn · man',
      kana: `${reading.kana}まん`,
      romaji: `${reading.romaji} man`,
    });
  }

  segments.push(...readPlaceSegments(remainder));

  return {
    value,
    kana: segments.map((segment) => segment.kana).join(''),
    romaji: segments.map((segment) => segment.romaji).join(' '),
    segments,
  };
}

function readSmallGroup(value: number): Reading {
  const segments = readPlaceSegments(value);
  return {
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
      3: { kana: 'さんぜん', romaji: 'sanzen' },
      8: { kana: 'はっせん', romaji: 'hassen' },
    };
    const reading =
      special[thousands] ??
      (thousands === 1
        ? { kana: 'せん', romaji: 'sen' }
        : {
            kana: `${DIGITS[thousands].kana}せん`,
            romaji: `${DIGITS[thousands].romaji} sen`,
          });
    segments.push({
      value: thousands * 1000,
      unit: 'Hàng nghìn · sen',
      ...reading,
      irregular: Boolean(special[thousands]),
    });
  }

  if (hundreds) {
    const special: Record<number, Reading> = {
      3: { kana: 'さんびゃく', romaji: 'sanbyaku' },
      6: { kana: 'ろっぴゃく', romaji: 'roppyaku' },
      8: { kana: 'はっぴゃく', romaji: 'happyaku' },
    };
    const reading =
      special[hundreds] ??
      (hundreds === 1
        ? { kana: 'ひゃく', romaji: 'hyaku' }
        : {
            kana: `${DIGITS[hundreds].kana}ひゃく`,
            romaji: `${DIGITS[hundreds].romaji} hyaku`,
          });
    segments.push({
      value: hundreds * 100,
      unit: 'Hàng trăm · hyaku',
      ...reading,
      irregular: Boolean(special[hundreds]),
    });
  }

  if (tens) {
    const reading =
      tens === 1
        ? { kana: 'じゅう', romaji: 'juu' }
        : {
            kana: `${DIGITS[tens].kana}じゅう`,
            romaji: `${DIGITS[tens].romaji} juu`,
          };
    segments.push({ value: tens * 10, unit: 'Hàng chục · juu', ...reading });
  }

  if (ones) {
    segments.push({ value: ones, unit: 'Đơn vị', ...DIGITS[ones] });
  }

  return segments;
}
