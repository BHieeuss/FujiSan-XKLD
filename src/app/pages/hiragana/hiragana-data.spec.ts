import { HIRAGANA_ITEMS, UNIQUE_HIRAGANA_GLYPHS } from './hiragana-data';
import { HIRAGANA_STROKES } from './stroke-data.generated';

describe('Hiragana data', () => {
  it('should contain all 104 review items with unique ids', () => {
    expect(HIRAGANA_ITEMS.length).toBe(104);
    expect(new Set(HIRAGANA_ITEMS.map((item) => item.id)).size).toBe(104);
    expect(HIRAGANA_ITEMS.every((item) => /^[a-z]+$/.test(item.romaji))).toBeTrue();
  });

  it('should provide local stroke data for every glyph', () => {
    expect(UNIQUE_HIRAGANA_GLYPHS.length).toBe(74);
    for (const glyph of UNIQUE_HIRAGANA_GLYPHS) {
      expect(HIRAGANA_STROKES[glyph]).withContext(`Missing ${glyph}`).toBeTruthy();
      expect(HIRAGANA_STROKES[glyph].outlines.length).toBeGreaterThan(0);
      expect(HIRAGANA_STROKES[glyph].medians.length).toBeGreaterThan(0);
    }
  });

  it('should prevent ambiguous di and du romaji prompts', () => {
    expect(HIRAGANA_ITEMS.find((item) => item.id === 'di')?.quizDirections).toEqual([
      'kana-to-romaji',
    ]);
    expect(HIRAGANA_ITEMS.find((item) => item.id === 'du')?.quizDirections).toEqual([
      'kana-to-romaji',
    ]);
  });
});
