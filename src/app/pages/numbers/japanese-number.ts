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

export interface CounterItem {
  id: string;
  name: string;
  kanji: string;
  reading: string;
  use: string;
  tip: string;
  items: Array<{
    number: number;
    kana: string;
    romaji: string;
    kanji: string;
    irregular?: boolean;
  }>;
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

// 0 - 10
export const BASIC_NUMBER_ROWS = [
  { value: 0, kana: 'ゼロ / れい', romaji: 'zero / rei', kanji: '零' },
  { value: 1, kana: 'いち', romaji: 'ichi', kanji: '一' },
  { value: 2, kana: 'に', romaji: 'ni', kanji: '二' },
  { value: 3, kana: 'さん', romaji: 'san', kanji: '三' },
  { value: 4, kana: 'よん / し', romaji: 'yon / shi', kanji: '四' },
  { value: 5, kana: 'ご', romaji: 'go', kanji: '五' },
  { value: 6, kana: 'ろく', romaji: 'roku', kanji: '六' },
  { value: 7, kana: 'なな / しち', romaji: 'nana / shichi', kanji: '七' },
  { value: 8, kana: 'はち', romaji: 'hachi', kanji: '八' },
  { value: 9, kana: 'きゅう / く', romaji: 'kyuu / ku', kanji: '九' },
  { value: 10, kana: 'じゅう', romaji: 'juu', kanji: '十' },
];

// Hàng chục (10 - 90)
export const TENS_NUMBER_ROWS = [
  { value: 10, kana: 'じゅう', romaji: 'juu', kanji: '十' },
  { value: 20, kana: 'にじゅう', romaji: 'ni-juu', kanji: '二十' },
  { value: 30, kana: 'さんじゅう', romaji: 'san-juu', kanji: '三十' },
  { value: 40, kana: 'よんじゅう', romaji: 'yon-juu', kanji: '四十' },
  { value: 50, kana: 'ごじゅう', romaji: 'go-juu', kanji: '五十' },
  { value: 60, kana: 'ろくじゅう', romaji: 'roku-juu', kanji: '六十' },
  { value: 70, kana: 'ななじゅう', romaji: 'nana-juu', kanji: '七十' },
  { value: 80, kana: 'はちじゅう', romaji: 'hachi-juu', kanji: '八十' },
  { value: 90, kana: 'きゅうじゅう', romaji: 'kyuu-juu', kanji: '九十' },
];

// Hàng trăm (100 - 900)
export const HUNDREDS_NUMBER_ROWS = [
  { value: 100, kana: 'ひゃく', romaji: 'hyaku', kanji: '百', irregular: false },
  { value: 200, kana: 'にひゃく', romaji: 'ni-hyaku', kanji: '二百', irregular: false },
  { value: 300, kana: 'さんびゃく', romaji: 'san-byaku', kanji: '三百', irregular: true, note: 'Biến âm byaku' },
  { value: 400, kana: 'よんひゃく', romaji: 'yon-hyaku', kanji: '四百', irregular: false },
  { value: 500, kana: 'ごひゃく', romaji: 'go-hyaku', kanji: '五百', irregular: false },
  { value: 600, kana: 'ろっぴゃく', romaji: 'rop-pyaku', kanji: '六百', irregular: true, note: 'Âm ngắt rop + pyaku' },
  { value: 700, kana: 'ななひゃく', romaji: 'nana-hyaku', kanji: '七百', irregular: false },
  { value: 800, kana: 'はっぴゃく', romaji: 'hap-pyaku', kanji: '八百', irregular: true, note: 'Âm ngắt hap + pyaku' },
  { value: 900, kana: 'きゅうひゃく', romaji: 'kyuu-hyaku', kanji: '九百', irregular: false },
];

// Hàng nghìn (1.000 - 9.000)
export const THOUSANDS_NUMBER_ROWS = [
  { value: 1000, kana: 'せん', romaji: 'sen', kanji: '千', irregular: false, note: 'Chỉ đọc sen, không đọc ichi-sen' },
  { value: 2000, kana: 'にせん', romaji: 'ni-sen', kanji: '二千', irregular: false },
  { value: 3000, kana: 'さんぜん', romaji: 'san-zen', kanji: '三千', irregular: true, note: 'Biến âm zen' },
  { value: 4000, kana: 'よんせん', romaji: 'yon-sen', kanji: '四千', irregular: false },
  { value: 5000, kana: 'ごせん', romaji: 'go-sen', kanji: '五千', irregular: false },
  { value: 6000, kana: 'ろくせん', romaji: 'roku-sen', kanji: '六千', irregular: false },
  { value: 7000, kana: 'ななせん', romaji: 'nana-sen', kanji: '七千', irregular: false },
  { value: 8000, kana: 'はっせん', romaji: 'has-sen', kanji: '八千', irregular: true, note: 'Âm ngắt has-sen' },
  { value: 9000, kana: 'きゅうせん', romaji: 'kyuu-sen', kanji: '九千', irregular: false },
];

// Hàng vạn (Man - 10.000 đến 100 triệu)
export const MAN_NUMBER_ROWS = [
  { value: 10000, kana: 'いちまん', romaji: 'ichi-man', kanji: '一万', note: 'Bắt buộc đọc ichi-man' },
  { value: 20000, kana: 'にまん', romaji: 'ni-man', kanji: '二万' },
  { value: 50000, kana: 'ごまん', romaji: 'go-man', kanji: '五万' },
  { value: 100000, kana: 'じゅうまん', romaji: 'juu-man', kanji: '十万', note: '10 vạn = 100.000' },
  { value: 1000000, kana: 'ひゃくまん', romaji: 'hyaku-man', kanji: '百万', note: '100 vạn = 1 triệu' },
  { value: 10000000, kana: 'いっせんまん', romaji: 'issen-man', kanji: '一千万', note: '1.000 vạn = 10 triệu' },
  { value: 100000000, kana: 'いちおく', romaji: 'ichi-oku', kanji: '一億', note: '1 ức = 100 triệu' },
];

// Số đếm đồ vật thuần Nhật (Hitotsu, Futatsu...)
export const NATIVE_JAPANESE_NUMBERS = [
  { number: 1, kana: 'ひとつ', romaji: 'hitotsu', kanji: '一つ', meaning: '1 cái' },
  { number: 2, kana: 'ふたつ', romaji: 'futatsu', kanji: '二つ', meaning: '2 cái' },
  { number: 3, kana: 'みっつ', romaji: 'mittsu', kanji: '三つ', meaning: '3 cái' },
  { number: 4, kana: 'よっつ', romaji: 'yottsu', kanji: '四つ', meaning: '4 cái' },
  { number: 5, kana: 'いつつ', romaji: 'itsutsu', kanji: '五つ', meaning: '5 cái' },
  { number: 6, kana: 'むっつ', romaji: 'muttsu', kanji: '六つ', meaning: '6 cái' },
  { number: 7, kana: 'ななつ', romaji: 'nanatsu', kanji: '七つ', meaning: '7 cái' },
  { number: 8, kana: 'やっつ', romaji: 'yattsu', kanji: '八つ', meaning: '8 cái' },
  { number: 9, kana: 'ここのつ', romaji: 'kokonotsu', kanji: '九つ', meaning: '9 cái' },
  { number: 10, kana: 'とお', romaji: 'too', kanji: '十', meaning: '10 cái (không có tsu)' },
];

// Danh sách Trợ số từ đếm thông dụng & Biến âm
export const DETAILED_COUNTERS: CounterItem[] = [
  {
    id: 'people',
    name: 'Đếm người',
    kanji: '人',
    reading: '〜にん (nin)',
    use: 'Đếm số lượng người (1-2 người có cách đọc đặc biệt)',
    tip: '1 người (ひとり), 2 người (ふたり), 4 người đọc là よにん (không đọc yon-nin).',
    items: [
      { number: 1, kana: 'ひとり', romaji: 'hitori', kanji: '1人', irregular: true },
      { number: 2, kana: 'ふたり', romaji: 'futari', kanji: '2人', irregular: true },
      { number: 3, kana: 'さんにん', romaji: 'sannin', kanji: '3人' },
      { number: 4, kana: 'よにん', romaji: 'yonin', kanji: '4人', irregular: true },
      { number: 5, kana: 'ごにん', romaji: 'gonin', kanji: '5人' },
      { number: 6, kana: 'ろくにん', romaji: 'rokunin', kanji: '6人' },
      { number: 7, kana: 'ななにん / しちにん', romaji: 'nananin', kanji: '7人' },
      { number: 8, kana: 'はちにん', romaji: 'hachinin', kanji: '8人' },
      { number: 9, kana: 'きゅうにん / くにん', romaji: 'kyuunin', kanji: '9人' },
      { number: 10, kana: 'じゅうにん', romaji: 'juunin', kanji: '10人' },
    ],
  },
  {
    id: 'long_objects',
    name: 'Vật thon dài',
    kanji: '本',
    reading: '〜ほん / ぼん / ぽん (hon/bon/pon)',
    use: 'Chai nước, bút, cây cối, ô dù, thanh sắt, video clip...',
    tip: '1, 6, 8, 10 đọc là ぽん (pon); 3 đọc là ぼん (bon); các số còn lại đọc là ほん (hon).',
    items: [
      { number: 1, kana: 'いっぽん', romaji: 'ippon', kanji: '1本', irregular: true },
      { number: 2, kana: 'にほん', romaji: 'nihon', kanji: '2本' },
      { number: 3, kana: 'さんぼん', romaji: 'sanbon', kanji: '3本', irregular: true },
      { number: 4, kana: 'よんほん', romaji: 'yonhon', kanji: '4本' },
      { number: 5, kana: 'ごほん', romaji: 'gohon', kanji: '5本' },
      { number: 6, kana: 'ろっぽん', romaji: 'roppon', kanji: '6本', irregular: true },
      { number: 7, kana: 'ななほん', romaji: 'nanahon', kanji: '7本' },
      { number: 8, kana: 'はっぽん', romaji: 'happon', kanji: '8本', irregular: true },
      { number: 9, kana: 'きゅうほん', romaji: 'kyuuhon', kanji: '9本' },
      { number: 10, kana: 'じゅっぽん / じっぽん', romaji: 'juppon', kanji: '10本', irregular: true },
    ],
  },
  {
    id: 'flat_objects',
    name: 'Vật mỏng dẹt',
    kanji: '枚',
    reading: '〜まい (mai)',
    use: 'Tờ giấy, áo sơ mi, đĩa CD, vé tàu, ảnh...',
    tip: 'Rất dễ nhớ: hoàn toàn ghép số + まい (mai) mà không có biến âm.',
    items: [
      { number: 1, kana: 'いちまい', romaji: 'ichimai', kanji: '1枚' },
      { number: 2, kana: 'にまい', romaji: 'nimai', kanji: '2枚' },
      { number: 3, kana: 'さんまい', romaji: 'sanmai', kanji: '3枚' },
      { number: 4, kana: 'よんまい', romaji: 'yonmai', kanji: '4枚' },
      { number: 5, kana: 'ごまい', romaji: 'gomai', kanji: '5枚' },
      { number: 6, kana: 'ろくまい', romaji: 'rokumai', kanji: '6枚' },
      { number: 7, kana: 'ななまい', romaji: 'nanamai', kanji: '7枚' },
      { number: 8, kana: 'はちまい', romaji: 'hachimai', kanji: '8枚' },
      { number: 9, kana: 'きゅうまい', romaji: 'kyuumai', kanji: '9枚' },
      { number: 10, kana: 'じゅうまい', romaji: 'juumai', kanji: '10枚' },
    ],
  },
  {
    id: 'small_items',
    name: 'Vật nhỏ / Cái / Quả',
    kanji: '個',
    reading: '〜こ (ko)',
    use: 'Quả táo, trứng gà, viên kẹo, hộp nhỏ, hạt, cái...',
    tip: '1, 6, 8, 10 có âm ngắt (いっこ, ろっこ, はっこ, じゅっこ).',
    items: [
      { number: 1, kana: 'いっこ', romaji: 'ikko', kanji: '1個', irregular: true },
      { number: 2, kana: 'にこ', romaji: 'niko', kanji: '2個' },
      { number: 3, kana: 'さんこ', romaji: 'sanko', kanji: '3個' },
      { number: 4, kana: 'よんこ', romaji: 'yonko', kanji: '4個' },
      { number: 5, kana: 'ごこ', romaji: 'goko', kanji: '5個' },
      { number: 6, kana: 'ろっこ', romaji: 'rokko', kanji: '6個', irregular: true },
      { number: 7, kana: 'ななこ', romaji: 'nanako', kanji: '7個' },
      { number: 8, kana: 'はっこ', romaji: 'hakko', kanji: '8個', irregular: true },
      { number: 9, kana: 'きゅうこ', romaji: 'kyuuko', kanji: '9個' },
      { number: 10, kana: 'じゅっこ / じっこ', romaji: 'jukko', kanji: '10個', irregular: true },
    ],
  },
  {
    id: 'animals',
    name: 'Con vật nhỏ',
    kanji: '匹',
    reading: '〜ひき / ぴき / びき (hiki/piki/biki)',
    use: 'Chó, mèo, cá, chim, côn trùng...',
    tip: '1, 6, 8, 10 đọc là ぴき (piki); 3 đọc là びき (biki); còn lại đọc là ひき (hiki).',
    items: [
      { number: 1, kana: 'いっぴき', romaji: 'ippiki', kanji: '1匹', irregular: true },
      { number: 2, kana: 'にひき', romaji: 'nihiki', kanji: '2匹' },
      { number: 3, kana: 'さんびき', romaji: 'sanbiki', kanji: '3匹', irregular: true },
      { number: 4, kana: 'よんひき', romaji: 'yonhiki', kanji: '4匹' },
      { number: 5, kana: 'ごひき', romaji: 'gohiki', kanji: '5匹' },
      { number: 6, kana: 'ろっぴき', romaji: 'roppiki', kanji: '6匹', irregular: true },
      { number: 7, kana: 'ななひき', romaji: 'nanahiki', kanji: '7匹' },
      { number: 8, kana: 'はっぴき', romaji: 'happiki', kanji: '8匹', irregular: true },
      { number: 9, kana: 'きゅうひき', romaji: 'kyuuhiki', kanji: '9匹' },
      { number: 10, kana: 'じゅっぴき', romaji: 'juppiki', kanji: '10匹', irregular: true },
    ],
  },
  {
    id: 'books',
    name: 'Sách / Vở',
    kanji: '冊',
    reading: '〜さつ (satsu)',
    use: 'Quyển sách, cuốn từ điển, cuốn vở, tạp chí...',
    tip: '1, 8, 10 có âm ngắt (いっさつ, はっさつ, じゅっさつ).',
    items: [
      { number: 1, kana: 'いっさつ', romaji: 'issatsu', kanji: '1冊', irregular: true },
      { number: 2, kana: 'にさつ', romaji: 'nisatsu', kanji: '2冊' },
      { number: 3, kana: 'さんさつ', romaji: 'sansatsu', kanji: '3冊' },
      { number: 4, kana: 'よんさつ', romaji: 'yonsatsu', kanji: '4冊' },
      { number: 5, kana: 'ごさつ', romaji: 'gosatsu', kanji: '5冊' },
      { number: 6, kana: 'ろくさつ', romaji: 'rokusatsu', kanji: '6冊' },
      { number: 7, kana: 'ななさつ', romaji: 'nanasatsu', kanji: '7冊' },
      { number: 8, kana: 'はっさつ', romaji: 'hassatsu', kanji: '8冊', irregular: true },
      { number: 9, kana: 'きゅうさつ', romaji: 'kyuusatsu', kanji: '9冊' },
      { number: 10, kana: 'じゅっさつ', romaji: 'jussatsu', kanji: '10冊', irregular: true },
    ],
  },
  {
    id: 'age',
    name: 'Đếm tuổi',
    kanji: '歳 / 才',
    reading: '〜さい (sai)',
    use: 'Tuổi của người và động vật',
    tip: '1 tuổi là いっさい (issai), 8 tuổi là はっさい (hassai), 20 tuổi là はたち (hatachi).',
    items: [
      { number: 1, kana: 'いっさい', romaji: 'issai', kanji: '1歳', irregular: true },
      { number: 2, kana: 'にさい', romaji: 'nisai', kanji: '2歳' },
      { number: 3, kana: 'さんさい', romaji: 'sansai', kanji: '3歳' },
      { number: 4, kana: 'よんさい', romaji: 'yonsai', kanji: '4歳' },
      { number: 5, kana: 'ごさい', romaji: 'gosai', kanji: '5歳' },
      { number: 6, kana: 'ろくさい', romaji: 'rokusai', kanji: '6歳' },
      { number: 7, kana: 'ななさい', romaji: 'nanasai', kanji: '7歳' },
      { number: 8, kana: 'はっさい', romaji: 'hassai', kanji: '8歳', irregular: true },
      { number: 9, kana: 'きゅうさい', romaji: 'kyuusai', kanji: '9歳' },
      { number: 20, kana: 'はたち / にじゅっさい', romaji: 'hatachi', kanji: '20歳', irregular: true },
    ],
  },
  {
    id: 'floors',
    name: 'Tầng nhà',
    kanji: '階',
    reading: '〜かい / がい (kai/gai)',
    use: 'Tầng trong toà nhà, chung cư',
    tip: '3 tầng đọc là さんがい (sangai); 1, 6, 8, 10 có âm ngắt (いっかい, ろっかい, はっかい, じゅっかい).',
    items: [
      { number: 1, kana: 'いっかい', romaji: 'ikkai', kanji: '1階', irregular: true },
      { number: 2, kana: 'にかい', romaji: 'nikai', kanji: '2階' },
      { number: 3, kana: 'さんがい', romaji: 'sangai', kanji: '3階', irregular: true },
      { number: 4, kana: 'よんかい', romaji: 'yonkai', kanji: '4階' },
      { number: 5, kana: 'ごかい', romaji: 'gokai', kanji: '5階' },
      { number: 6, kana: 'ろっかい', romaji: 'rokkai', kanji: '6階', irregular: true },
      { number: 7, kana: 'ななかい', romaji: 'nanakai', kanji: '7階' },
      { number: 8, kana: 'はっかい', romaji: 'hakkai', kanji: '8階', irregular: true },
      { number: 9, kana: 'きゅうかい', romaji: 'kyuukai', kanji: '9階' },
      { number: 10, kana: 'じゅっかい', romaji: 'jukkai', kanji: '10階', irregular: true },
    ],
  },
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
