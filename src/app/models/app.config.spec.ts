import { APP_LEARNING_MENU } from './app.config';

describe('Application learning menu', () => {
  it('should expose Kanji N5 as a direct page link', () => {
    const kanji = APP_LEARNING_MENU.find((item) => item.id === 'kanji');
    const n5 = kanji?.children?.find((item) => item.id === 'kanji-n5');

    expect(kanji?.label).toBe('Kanji ( Hán Tự )');
    expect(n5?.label).toBe('N5');
    expect(n5).toEqual(
      jasmine.objectContaining({
        link: '/hoc-kanji-n5/bai-1',
      }),
    );
    expect(n5?.children).toBeUndefined();
  });

  it('should group Minna no Nihongo N5 lessons in a nested menu', () => {
    const minna = APP_LEARNING_MENU.find((item) => item.id === 'minna-n5');

    expect(minna?.label).toBe('Minna no Nihongo N5');
    expect(minna?.children?.length).toBe(1);
    expect(minna?.children?.[0]).toEqual(
      jasmine.objectContaining({
        label: 'Bài 1 · はじめまして',
        link: '/hoc-minna-bai-1',
      }),
    );
  });
});
