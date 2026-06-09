export type HiraganaGroup = 'basic' | 'voiced' | 'yoon';
export type QuizDirection = 'kana-to-romaji' | 'romaji-to-kana';

export interface HiraganaItem {
  id: string;
  kana: string;
  romaji: string;
  group: HiraganaGroup;
  glyphs: string[];
  quizDirections: QuizDirection[];
}

const BOTH_DIRECTIONS: QuizDirection[] = ['kana-to-romaji', 'romaji-to-kana'];
const KANA_ONLY: QuizDirection[] = ['kana-to-romaji'];

function item(
  id: string,
  kana: string,
  romaji: string,
  group: HiraganaGroup,
  quizDirections: QuizDirection[] = BOTH_DIRECTIONS,
): HiraganaItem {
  return {
    id,
    kana,
    romaji,
    group,
    glyphs: Array.from(kana),
    quizDirections,
  };
}

export const BASIC_HIRAGANA: HiraganaItem[] = [
  item('a', 'あ', 'a', 'basic'),
  item('i', 'い', 'i', 'basic'),
  item('u', 'う', 'u', 'basic'),
  item('e', 'え', 'e', 'basic'),
  item('o', 'お', 'o', 'basic'),
  item('ka', 'か', 'ka', 'basic'),
  item('ki', 'き', 'ki', 'basic'),
  item('ku', 'く', 'ku', 'basic'),
  item('ke', 'け', 'ke', 'basic'),
  item('ko', 'こ', 'ko', 'basic'),
  item('sa', 'さ', 'sa', 'basic'),
  item('shi', 'し', 'shi', 'basic'),
  item('su', 'す', 'su', 'basic'),
  item('se', 'せ', 'se', 'basic'),
  item('so', 'そ', 'so', 'basic'),
  item('ta', 'た', 'ta', 'basic'),
  item('chi', 'ち', 'chi', 'basic'),
  item('tsu', 'つ', 'tsu', 'basic'),
  item('te', 'て', 'te', 'basic'),
  item('to', 'と', 'to', 'basic'),
  item('na', 'な', 'na', 'basic'),
  item('ni', 'に', 'ni', 'basic'),
  item('nu', 'ぬ', 'nu', 'basic'),
  item('ne', 'ね', 'ne', 'basic'),
  item('no', 'の', 'no', 'basic'),
  item('ha', 'は', 'ha', 'basic'),
  item('hi', 'ひ', 'hi', 'basic'),
  item('fu', 'ふ', 'fu', 'basic'),
  item('he', 'へ', 'he', 'basic'),
  item('ho', 'ほ', 'ho', 'basic'),
  item('ma', 'ま', 'ma', 'basic'),
  item('mi', 'み', 'mi', 'basic'),
  item('mu', 'む', 'mu', 'basic'),
  item('me', 'め', 'me', 'basic'),
  item('mo', 'も', 'mo', 'basic'),
  item('ya', 'や', 'ya', 'basic'),
  item('yu', 'ゆ', 'yu', 'basic'),
  item('yo', 'よ', 'yo', 'basic'),
  item('ra', 'ら', 'ra', 'basic'),
  item('ri', 'り', 'ri', 'basic'),
  item('ru', 'る', 'ru', 'basic'),
  item('re', 'れ', 're', 'basic'),
  item('ro', 'ろ', 'ro', 'basic'),
  item('wa', 'わ', 'wa', 'basic'),
  item('wo', 'を', 'wo', 'basic'),
  item('n', 'ん', 'n', 'basic'),
];

export const VOICED_HIRAGANA: HiraganaItem[] = [
  item('ga', 'が', 'ga', 'voiced'),
  item('gi', 'ぎ', 'gi', 'voiced'),
  item('gu', 'ぐ', 'gu', 'voiced'),
  item('ge', 'げ', 'ge', 'voiced'),
  item('go', 'ご', 'go', 'voiced'),
  item('za', 'ざ', 'za', 'voiced'),
  item('ji', 'じ', 'ji', 'voiced'),
  item('zu', 'ず', 'zu', 'voiced'),
  item('ze', 'ぜ', 'ze', 'voiced'),
  item('zo', 'ぞ', 'zo', 'voiced'),
  item('da', 'だ', 'da', 'voiced'),
  item('di', 'ぢ', 'ji', 'voiced', KANA_ONLY),
  item('du', 'づ', 'zu', 'voiced', KANA_ONLY),
  item('de', 'で', 'de', 'voiced'),
  item('do', 'ど', 'do', 'voiced'),
  item('ba', 'ば', 'ba', 'voiced'),
  item('bi', 'び', 'bi', 'voiced'),
  item('bu', 'ぶ', 'bu', 'voiced'),
  item('be', 'べ', 'be', 'voiced'),
  item('bo', 'ぼ', 'bo', 'voiced'),
  item('pa', 'ぱ', 'pa', 'voiced'),
  item('pi', 'ぴ', 'pi', 'voiced'),
  item('pu', 'ぷ', 'pu', 'voiced'),
  item('pe', 'ぺ', 'pe', 'voiced'),
  item('po', 'ぽ', 'po', 'voiced'),
];

const YOON_ROWS: Array<[string, string, string]> = [
  ['ky', 'き', 'ky'],
  ['gy', 'ぎ', 'gy'],
  ['sh', 'し', 'sh'],
  ['j', 'じ', 'j'],
  ['ch', 'ち', 'ch'],
  ['ny', 'に', 'ny'],
  ['hy', 'ひ', 'hy'],
  ['by', 'び', 'by'],
  ['py', 'ぴ', 'py'],
  ['my', 'み', 'my'],
  ['ry', 'り', 'ry'],
];

const YOON_ENDINGS: Array<[string, string, string]> = [
  ['a', 'ゃ', 'a'],
  ['u', 'ゅ', 'u'],
  ['o', 'ょ', 'o'],
];

export const YOON_HIRAGANA: HiraganaItem[] = YOON_ROWS.flatMap(
  ([idPrefix, baseKana, romajiPrefix]) =>
    YOON_ENDINGS.map(([idSuffix, smallKana, romajiSuffix]) =>
      item(
        `${idPrefix}${idSuffix}`,
        `${baseKana}${smallKana}`,
        `${romajiPrefix}${romajiSuffix}`,
        'yoon',
      ),
    ),
);

export const HIRAGANA_ITEMS: HiraganaItem[] = [
  ...BASIC_HIRAGANA,
  ...VOICED_HIRAGANA,
  ...YOON_HIRAGANA,
];

export const HIRAGANA_GROUP_LABELS: Record<HiraganaGroup, string> = {
  basic: '46 chữ cơ bản',
  voiced: 'Âm đục và bán đục',
  yoon: 'Âm ghép',
};

export const UNIQUE_HIRAGANA_GLYPHS = Array.from(
  new Set(HIRAGANA_ITEMS.flatMap((hiragana) => hiragana.glyphs)),
);
