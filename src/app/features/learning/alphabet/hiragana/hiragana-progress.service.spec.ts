import { TestBed } from '@angular/core/testing';
import {
  HIRAGANA_PROGRESS_STORAGE_KEY,
  HiraganaProgressService,
} from './hiragana-progress.service';

describe('HiraganaProgressService', () => {
  beforeEach(() => {
    localStorage.removeItem(HIRAGANA_PROGRESS_STORAGE_KEY);
    TestBed.configureTestingModule({ providers: [HiraganaProgressService] });
  });

  afterEach(() => {
    localStorage.removeItem(HIRAGANA_PROGRESS_STORAGE_KEY);
    TestBed.resetTestingModule();
  });

  it('should save quiz progress and identify weak and mastered items', () => {
    const service = TestBed.inject(HiraganaProgressService);

    service.recordQuiz('a', false);
    expect(service.weakIds()).toContain('a');

    service.recordQuiz('ka', true);
    service.recordQuiz('ka', true);
    service.recordQuiz('ka', true);
    expect(service.masteredCount()).toBe(1);
    expect(service.streak()).toBe(1);
    expect(localStorage.getItem(HIRAGANA_PROGRESS_STORAGE_KEY)).toContain('"ka"');
  });

  it('should ignore invalid saved data and reset safely', () => {
    localStorage.setItem(HIRAGANA_PROGRESS_STORAGE_KEY, '{not-json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [HiraganaProgressService] });

    const service = TestBed.inject(HiraganaProgressService);
    expect(service.studiedCount()).toBe(0);

    service.recordWriting('i', true);
    expect(service.getItem('i').writingCompleted).toBe(1);
    service.reset();
    expect(service.studiedCount()).toBe(0);
  });
});
