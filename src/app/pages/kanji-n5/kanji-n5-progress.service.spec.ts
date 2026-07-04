import { TestBed } from '@angular/core/testing';
import { KANJI_N5_LESSONS } from './kanji-n5.data';
import {
  hintStrokeCount,
  KanjiN5ProgressService,
  KANJI_N5_PROGRESS_STORAGE_KEY,
} from './kanji-n5-progress.service';

describe('KanjiN5ProgressService', () => {
  let service: KanjiN5ProgressService;

  beforeEach(() => {
    localStorage.removeItem(KANJI_N5_PROGRESS_STORAGE_KEY);
    localStorage.removeItem('viejap.kanji-n5-progress.v1');
    TestBed.configureTestingModule({ providers: [KanjiN5ProgressService] });
    service = TestBed.inject(KanjiN5ProgressService);
  });

  afterEach(() => {
    service.reset();
    TestBed.resetTestingModule();
  });

  it('should promote kanji through memory levels after remembered reviews', () => {
    service.markRemembered('ichi', '一');
    expect(service.recordFor('ichi').status).toBe('learning');

    service.markRemembered('ichi', '一');
    expect(service.recordFor('ichi').status).toBe('almost_remembered');

    service.markRemembered('ichi', '一');
    expect(service.recordFor('ichi').status).toBe('remembered');
    expect(service.learnedCount()).toBe(1);
  });

  it('should reduce memory level and prioritize review after repeated forgotten reviews', () => {
    service.setStatus('ichi', 'remembered');
    service.markForgotten('ichi', '一');
    expect(service.recordFor('ichi').status).toBe('almost_remembered');

    service.markForgotten('ichi', '一');
    expect(service.recordFor('ichi').status).toBe('need_review');
  });

  it('should calculate hint strokes by status', () => {
    expect(hintStrokeCount(10, 'new')).toBe(10);
    expect(hintStrokeCount(10, 'learning')).toBe(7);
    expect(hintStrokeCount(10, 'almost_remembered')).toBe(3);
    expect(hintStrokeCount(10, 'remembered')).toBe(0);
    expect(hintStrokeCount(10, 'need_review')).toBe(9);
  });

  it('should return due review items for need-review kanji', () => {
    const items = KANJI_N5_LESSONS[0].items;

    service.markNeedReview(items[0].id, items[0].kanji);

    expect(service.dueItems(items).map((item) => item.id)).toContain(items[0].id);
  });
});
