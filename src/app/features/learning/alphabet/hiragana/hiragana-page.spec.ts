import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HIRAGANA_ITEMS } from './hiragana-data';
import { HIRAGANA_PROGRESS_STORAGE_KEY } from './hiragana-progress.service';
import { HiraganaPage } from './hiragana-page';

describe('HiraganaPage', () => {
  let fixture: ComponentFixture<HiraganaPage>;
  let component: HiraganaPage;

  beforeEach(async () => {
    localStorage.removeItem(HIRAGANA_PROGRESS_STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [HiraganaPage] }).compileComponents();
    fixture = TestBed.createComponent(HiraganaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(HIRAGANA_PROGRESS_STORAGE_KEY);
  });

  it('should render a four-answer quiz and record an answer', () => {
    component.switchView('practice');
    component.setTab('quiz');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.hira-mc-option').length).toBe(4);

    const question = component.currentQuestion!;
    component.chooseAnswer(question.correctAnswer);
    fixture.detectChanges();

    expect(component.answerLocked).toBeTrue();
    expect(component.quizScore).toBe(1);
    expect(compiled.querySelector('.hira-feedback-banner.is-correct')).toBeTruthy();
  });

  it('should render two ordered writing pads for a compound sound', () => {
    component.switchView('practice');
    component.setTab('writing');
    component.selectWritingItem(HIRAGANA_ITEMS.find((item) => item.id === 'kya')!);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-stroke-pad').length).toBe(2);
    expect(compiled.querySelector('.canvas-title-group h3')?.textContent).toContain('きゃ');
  });

  it('should show an empty weak state when no item needs review', () => {
    component.switchView('practice');
    component.setTab('quiz');
    component.selectGroup('weak');
    fixture.detectChanges();

    expect(component.questions.length).toBe(0);
    expect(fixture.nativeElement.querySelector('.hira-empty-state')).toBeTruthy();
  });

  it('should keep generating random quiz questions without an immediate repeat', () => {
    component.switchView('practice');
    component.setTab('quiz');
    component.setQuizMode('continuous');
    const firstQuestion = component.currentQuestion!;

    component.chooseAnswer(firstQuestion.correctAnswer);
    component.nextQuestion();

    expect(component.quizMode).toBe('continuous');
    expect(component.quizAnsweredCount).toBe(1);
    expect(component.quizScore).toBe(1);
    expect(component.questions.length).toBe(1);
    expect(component.currentQuestion?.item.id).not.toBe(firstQuestion.item.id);
    expect(component.answerLocked).toBeFalse();
  });

  it('should continue with a different random writing item after completion', () => {
    component.switchView('practice');
    component.setTab('writing');
    component.selectGroup('basic');
    component.setWritingMode('continuous');
    const firstItem = component.writingItem!;

    component.onGlyphCompleted(0);
    expect(component.writingComplete).toBeTrue();
    expect(component.writingSessionCompleted).toBe(1);

    component.continueWriting();
    expect(component.writingItem?.id).not.toBe(firstItem.id);
    expect(component.writingComplete).toBeFalse();
    expect(component.writingSessionCompleted).toBe(1);
  });
});
