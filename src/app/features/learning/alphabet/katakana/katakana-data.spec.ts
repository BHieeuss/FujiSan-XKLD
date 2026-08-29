import { KATAKANA_ITEMS, UNIQUE_KATAKANA_GLYPHS } from './katakana-data';
import { KATAKANA_STROKES } from './stroke-data.generated';

describe('Katakana data', () => {
  it('should contain all 104 review items with unique ids', () => {
    expect(KATAKANA_ITEMS.length).toBe(104);
    expect(new Set(KATAKANA_ITEMS.map((item) => item.id)).size).toBe(104);
    expect(KATAKANA_ITEMS.every((item) => /^[a-z]+$/.test(item.romaji))).toBeTrue();
  });

  it('should provide local stroke data for every glyph', () => {
    expect(UNIQUE_KATAKANA_GLYPHS.length).toBe(74);
    for (const glyph of UNIQUE_KATAKANA_GLYPHS) {
      expect(KATAKANA_STROKES[glyph]).withContext(`Missing ${glyph}`).toBeTruthy();
      expect(KATAKANA_STROKES[glyph].outlines.length).toBeGreaterThan(0);
      expect(KATAKANA_STROKES[glyph].medians.length).toBeGreaterThan(0);
    }
  });

  it('should prevent ambiguous di and du romaji prompts', () => {
    expect(KATAKANA_ITEMS.find((item) => item.id === 'di')?.quizDirections).toEqual([
      'kana-to-romaji',
    ]);
    expect(KATAKANA_ITEMS.find((item) => item.id === 'du')?.quizDirections).toEqual([
      'kana-to-romaji',
    ]);
  });
});
