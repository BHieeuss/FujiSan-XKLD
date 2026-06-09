import { toJapaneseNumber } from './japanese-number';

describe('Japanese number composition', () => {
  it('should compose regular values from large to small units', () => {
    expect(toJapaneseNumber(47)).toEqual(
      jasmine.objectContaining({ kanji: '四十七', kana: 'よんじゅうなな' }),
    );
    expect(toJapaneseNumber(10000)).toEqual(
      jasmine.objectContaining({ kanji: '一万', kana: 'いちまん' }),
    );
    expect(toJapaneseNumber(31415)).toEqual(
      jasmine.objectContaining({ kanji: '三万千四百十五', kana: 'さんまんせんよんひゃくじゅうご' }),
    );
  });

  it('should apply the main hundred and thousand sound changes', () => {
    expect(toJapaneseNumber(300).kana).toBe('さんびゃく');
    expect(toJapaneseNumber(600).kana).toBe('ろっぴゃく');
    expect(toJapaneseNumber(800).kana).toBe('はっぴゃく');
    expect(toJapaneseNumber(3000).kana).toBe('さんぜん');
    expect(toJapaneseNumber(8000).kana).toBe('はっせん');
  });

  it('should reject values outside the supported range', () => {
    expect(() => toJapaneseNumber(-1)).toThrowError(RangeError);
    expect(() => toJapaneseNumber(100000000)).toThrowError(RangeError);
  });
});
