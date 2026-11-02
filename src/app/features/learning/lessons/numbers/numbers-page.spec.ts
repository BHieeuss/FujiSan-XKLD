import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NUMBER_PROGRESS_STORAGE_KEY } from './number-progress.service';
import { NumbersPage } from './numbers-page';

describe('NumbersPage', () => {
  let fixture: ComponentFixture<NumbersPage>;
  let component: NumbersPage;

  beforeEach(async () => {
    localStorage.removeItem(NUMBER_PROGRESS_STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [NumbersPage] }).compileComponents();
    fixture = TestBed.createComponent(NumbersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem(NUMBER_PROGRESS_STORAGE_KEY));

  it('should render and score a four-answer quiz', () => {
    component.switchView('practice');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.hira-mc-option').length).toBe(4);
    const question = component.currentQuestion!;
    component.chooseAnswer(question.correctAnswer);
    fixture.detectChanges();
    expect(component.quizScore).toBe(1);
    expect(component.progress.attempts()).toBe(1);
  });

  it('should explain a custom number by segments', () => {
    component.switchView('theory');
    component.setTheoryTab('builder');
    component.builderValue = 31415;
    fixture.detectChanges();
    expect(component.builderResult.kana).toBe('さんまんせんよんひゃくじゅうご');
    expect(fixture.nativeElement.querySelectorAll('.segment-card').length).toBe(5);
  });

  it('should continue with a different random value', () => {
    component.switchView('practice');
    component.setQuizMode('continuous');
    const first = component.currentQuestion!;
    component.chooseAnswer(first.correctAnswer);
    component.nextQuestion();
    expect(component.currentQuestion?.value).not.toBe(first.value);
  });
});
