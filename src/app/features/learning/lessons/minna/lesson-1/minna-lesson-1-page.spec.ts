import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinnaLesson1Page } from './minna-lesson-1-page';
import { MINNA_LESSON_1_PROGRESS_STORAGE_KEY } from './minna-lesson-1-progress.service';

describe('MinnaLesson1Page', () => {
  let fixture: ComponentFixture<MinnaLesson1Page>;
  let component: MinnaLesson1Page;

  beforeEach(async () => {
    localStorage.removeItem(MINNA_LESSON_1_PROGRESS_STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [MinnaLesson1Page] }).compileComponents();
    fixture = TestBed.createComponent(MinnaLesson1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem(MINNA_LESSON_1_PROGRESS_STORAGE_KEY));

  it('should render searchable vocabulary with audio controls', () => {
    expect(component.vocabulary.length).toBeGreaterThan(20);
    expect(fixture.nativeElement.querySelectorAll('.vocabulary-row article').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.vocabulary-row').length).toBe(
      component.vocabulary.length + 1,
    );
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('.vocabulary-table-head span'),
      (element: Element) => element.textContent?.trim(),
    );
    const firstRow = fixture.nativeElement.querySelector('.vocabulary-row:not(.vocabulary-table-head)');
    expect(headings).toEqual(['Từ vựng', 'Chữ Nhật', 'Nghĩa', 'Thao tác']);
    expect(firstRow.querySelector(':scope > strong').textContent.trim()).toBe(
      component.vocabulary[0].reading,
    );
    expect(firstRow.querySelector(':scope > span').textContent.trim()).toBe(
      component.vocabulary[0].japanese,
    );

    component.vocabularySearch = 'giáo viên';
    fixture.detectChanges();
    expect(component.filteredVocabulary.some((item) => item.id === 'kyoushi')).toBeTrue();
  });

  it('should show five grammar points and mark a point as viewed', () => {
    component.setTab('grammar');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.grammar-list > article').length).toBe(5);
    expect(component.progress.state().grammarViewed).toContain(component.grammar[0].id);
  });

  it('should score the reading exercise', () => {
    component.setTab('reading');
    for (const question of component.reading.questions) {
      component.readingAnswers[question.id] = question.answer;
    }
    component.checkReading();
    expect(component.readingScore).toBe(component.reading.questions.length);
    expect(component.progress.state().readingCompleted).toBeTrue();
  });

  it('should score the listening exercise and reveal the transcript', () => {
    component.setTab('listening');
    component.showListeningTranscript = true;
    for (const question of component.listeningQuestions) {
      component.listeningAnswers[question.id] = question.answer;
    }
    component.checkListening();
    fixture.detectChanges();
    expect(component.listeningScore).toBe(component.listeningQuestions.length);
    expect(fixture.nativeElement.querySelectorAll('.transcript-panel p').length).toBe(
      component.dialogue.length,
    );
  });
});
