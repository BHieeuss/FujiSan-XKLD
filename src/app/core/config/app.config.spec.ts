import { APP_LEARNING_MENU } from './app.config';

describe('Application learning menu', () => {
  it('should expose Kanji tools as a direct page link', () => {
    const kanji = APP_LEARNING_MENU.find((item) => item.id === 'kanji');

    expect(kanji?.label).toBe('Kanji ( Hán Tự )');
    expect(kanji).toEqual(
      jasmine.objectContaining({
        link: '/hoc-kanji',
      }),
    );
    expect(kanji?.children).toBeUndefined();
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
