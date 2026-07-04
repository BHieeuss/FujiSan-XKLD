import { KANJI_N5_LESSONS, KANJI_N5_TOTAL } from './kanji-n5.data';
import { KANJI_N5_STROKES } from './kanji-n5-strokes.generated';

describe('KANJI_N5_LESSONS', () => {
  it('should split N5 kanji into 8 lessons of 10 items', () => {
    const kanjiIds = KANJI_N5_LESSONS.flatMap((lesson) => lesson.items.map((item) => item.id));

    expect(KANJI_N5_LESSONS.length).toBe(8);
    expect(KANJI_N5_TOTAL).toBe(80);
    expect(KANJI_N5_LESSONS.every((lesson) => lesson.items.length === 10)).toBeTrue();
    expect(new Set(kanjiIds).size).toBe(80);
  });

  it('should start the learning order with simple low-stroke kanji', () => {
    expect(KANJI_N5_LESSONS[0].title).toBe('Nét đơn giản và hình dễ nhớ');
    expect(KANJI_N5_LESSONS[0].items.map((item) => item.kanji)).toEqual([
      '一',
      '二',
      '三',
      '十',
      '人',
      '入',
      '大',
      '小',
      '山',
      '川',
    ]);
  });

  it('should provide stroke-order data for every N5 kanji', () => {
    const items = KANJI_N5_LESSONS.flatMap((lesson) => lesson.items);

    expect(Object.keys(KANJI_N5_STROKES).length).toBe(80);

    for (const item of items) {
      expect(KANJI_N5_STROKES[item.kanji]?.strokes.length).toBe(item.strokes);
    }
  });
});
