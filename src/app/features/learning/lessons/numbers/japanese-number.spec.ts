import { toJapaneseNumber } from './japanese-number';

describe('Japanese number composition', () => {
  it('should compose regular values from large to small units', () => {
    expect(toJapaneseNumber(47)).toEqual(
      jasmine.objectContaining({ kana: 'よんじゅうなな' }),
    );
    expect(toJapaneseNumber(10000)).toEqual(
      jasmine.objectContaining({ kana: 'いちまん' }),
    );
    expect(toJapaneseNumber(31415)).toEqual(
      jasmine.objectContaining({ kana: 'さんまんせんよんひゃくじゅうご' }),
    );
    expect(toJapaneseNumber(90000).kana).toBe('きゅうまん');
  });

  it('should apply the main hundred and thousand sound changes', () => {
    expect(toJapaneseNumber(300).kana).toBe('さんびゃく');
    expect(toJapaneseNumber(600).kana).toBe('ろっぴゃく');
    expect(toJapaneseNumber(800).kana).toBe('はっぴゃく');
    expect(toJapaneseNumber(3000).kana).toBe('さんぜん');
    expect(toJapaneseNumber(8000).kana).toBe('はっせん');
  });

  it('should reject values outside the supported range', () => {
    expect(() => toJapaneseNumber(0)).toThrowError(RangeError);
    expect(() => toJapaneseNumber(90001)).toThrowError(RangeError);
  });
});
