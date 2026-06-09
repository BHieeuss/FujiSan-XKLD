import { HiraganaGroup, HiraganaItem, QuizDirection } from '../hiragana/hiragana-data';

export type KatakanaGroup = HiraganaGroup;
export type KatakanaItem = HiraganaItem;

const BOTH_DIRECTIONS: QuizDirection[] = ['kana-to-romaji', 'romaji-to-kana'];
const KANA_ONLY: QuizDirection[] = ['kana-to-romaji'];

function item(
  id: string,
  kana: string,
  romaji: string,
  group: KatakanaGroup,
  quizDirections: QuizDirection[] = BOTH_DIRECTIONS,
): KatakanaItem {
  return {
    id,
    kana,
    romaji,
    group,
    glyphs: Array.from(kana),
    quizDirections,
  };
}

export const BASIC_KATAKANA: KatakanaItem[] = [
  item('a', 'ア', 'a', 'basic'),
  item('i', 'イ', 'i', 'basic'),
  item('u', 'ウ', 'u', 'basic'),
  item('e', 'エ', 'e', 'basic'),
  item('o', 'オ', 'o', 'basic'),
  item('ka', 'カ', 'ka', 'basic'),
  item('ki', 'キ', 'ki', 'basic'),
  item('ku', 'ク', 'ku', 'basic'),
  item('ke', 'ケ', 'ke', 'basic'),
  item('ko', 'コ', 'ko', 'basic'),
  item('sa', 'サ', 'sa', 'basic'),
  item('shi', 'シ', 'shi', 'basic'),
  item('su', 'ス', 'su', 'basic'),
  item('se', 'セ', 'se', 'basic'),
  item('so', 'ソ', 'so', 'basic'),
  item('ta', 'タ', 'ta', 'basic'),
  item('chi', 'チ', 'chi', 'basic'),
  item('tsu', 'ツ', 'tsu', 'basic'),
  item('te', 'テ', 'te', 'basic'),
  item('to', 'ト', 'to', 'basic'),
  item('na', 'ナ', 'na', 'basic'),
  item('ni', 'ニ', 'ni', 'basic'),
  item('nu', 'ヌ', 'nu', 'basic'),
  item('ne', 'ネ', 'ne', 'basic'),
  item('no', 'ノ', 'no', 'basic'),
  item('ha', 'ハ', 'ha', 'basic'),
  item('hi', 'ヒ', 'hi', 'basic'),
  item('fu', 'フ', 'fu', 'basic'),
  item('he', 'ヘ', 'he', 'basic'),
  item('ho', 'ホ', 'ho', 'basic'),
  item('ma', 'マ', 'ma', 'basic'),
  item('mi', 'ミ', 'mi', 'basic'),
  item('mu', 'ム', 'mu', 'basic'),
  item('me', 'メ', 'me', 'basic'),
  item('mo', 'モ', 'mo', 'basic'),
  item('ya', 'ヤ', 'ya', 'basic'),
  item('yu', 'ユ', 'yu', 'basic'),
  item('yo', 'ヨ', 'yo', 'basic'),
  item('ra', 'ラ', 'ra', 'basic'),
  item('ri', 'リ', 'ri', 'basic'),
  item('ru', 'ル', 'ru', 'basic'),
  item('re', 'レ', 're', 'basic'),
  item('ro', 'ロ', 'ro', 'basic'),
  item('wa', 'ワ', 'wa', 'basic'),
  item('wo', 'ヲ', 'wo', 'basic'),
  item('n', 'ン', 'n', 'basic'),
];

export const VOICED_KATAKANA: KatakanaItem[] = [
  item('ga', 'ガ', 'ga', 'voiced'),
  item('gi', 'ギ', 'gi', 'voiced'),
  item('gu', 'グ', 'gu', 'voiced'),
  item('ge', 'ゲ', 'ge', 'voiced'),
  item('go', 'ゴ', 'go', 'voiced'),
  item('za', 'ザ', 'za', 'voiced'),
  item('ji', 'ジ', 'ji', 'voiced'),
  item('zu', 'ズ', 'zu', 'voiced'),
  item('ze', 'ゼ', 'ze', 'voiced'),
  item('zo', 'ゾ', 'zo', 'voiced'),
  item('da', 'ダ', 'da', 'voiced'),
  item('di', 'ヂ', 'ji', 'voiced', KANA_ONLY),
  item('du', 'ヅ', 'zu', 'voiced', KANA_ONLY),
  item('de', 'デ', 'de', 'voiced'),
  item('do', 'ド', 'do', 'voiced'),
  item('ba', 'バ', 'ba', 'voiced'),
  item('bi', 'ビ', 'bi', 'voiced'),
  item('bu', 'ブ', 'bu', 'voiced'),
  item('be', 'ベ', 'be', 'voiced'),
  item('bo', 'ボ', 'bo', 'voiced'),
  item('pa', 'パ', 'pa', 'voiced'),
  item('pi', 'ピ', 'pi', 'voiced'),
  item('pu', 'プ', 'pu', 'voiced'),
  item('pe', 'ペ', 'pe', 'voiced'),
  item('po', 'ポ', 'po', 'voiced'),
];

const YOON_ROWS: Array<[string, string, string]> = [
  ['ky', 'キ', 'ky'],
  ['gy', 'ギ', 'gy'],
  ['sh', 'シ', 'sh'],
  ['j', 'ジ', 'j'],
  ['ch', 'チ', 'ch'],
  ['ny', 'ニ', 'ny'],
  ['hy', 'ヒ', 'hy'],
  ['by', 'ビ', 'by'],
  ['py', 'ピ', 'py'],
  ['my', 'ミ', 'my'],
  ['ry', 'リ', 'ry'],
];

const YOON_ENDINGS: Array<[string, string, string]> = [
  ['a', 'ャ', 'a'],
  ['u', 'ュ', 'u'],
  ['o', 'ョ', 'o'],
];

export const YOON_KATAKANA: KatakanaItem[] = YOON_ROWS.flatMap(
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

export const KATAKANA_ITEMS: KatakanaItem[] = [
  ...BASIC_KATAKANA,
  ...VOICED_KATAKANA,
  ...YOON_KATAKANA,
];

export const KATAKANA_GROUP_LABELS: Record<KatakanaGroup, string> = {
  basic: '46 chữ cơ bản',
  voiced: 'Âm đục và bán đục',
  yoon: 'Âm ghép',
};

export const UNIQUE_KATAKANA_GLYPHS = Array.from(
  new Set(KATAKANA_ITEMS.flatMap((katakana) => katakana.glyphs)),
);
