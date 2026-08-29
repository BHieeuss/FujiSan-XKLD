import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KATAKANA_ITEMS } from './katakana-data';
import { KatakanaPage } from './katakana-page';
import { KATAKANA_PROGRESS_STORAGE_KEY } from './katakana-progress.service';

describe('KatakanaPage', () => {
  let fixture: ComponentFixture<KatakanaPage>;
  let component: KatakanaPage;

  beforeEach(async () => {
    localStorage.removeItem(KATAKANA_PROGRESS_STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [KatakanaPage] }).compileComponents();
    fixture = TestBed.createComponent(KatakanaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem(KATAKANA_PROGRESS_STORAGE_KEY));

  it('should render a four-answer Katakana quiz', () => {
    expect(fixture.nativeElement.querySelectorAll('.answer-grid button').length).toBe(4);
    const question = component.currentQuestion!;
    component.chooseAnswer(question.correctAnswer);
    fixture.detectChanges();
    expect(component.quizScore).toBe(1);
    expect(fixture.nativeElement.querySelector('.answer-feedback.is-correct')).toBeTruthy();
  });

  it('should render two writing pads for a compound sound', () => {
    component.setTab('writing');
    component.selectWritingItem(KATAKANA_ITEMS.find((item) => item.id === 'kya')!);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-stroke-pad').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.writing-tool-header h2')?.textContent).toContain(
      'キャ',
    );
  });

  it('should avoid an immediate repeat in continuous mode', () => {
    component.setQuizMode('continuous');
    const first = component.currentQuestion!;
    component.chooseAnswer(first.correctAnswer);
    component.nextQuestion();
    expect(component.currentQuestion?.item.id).not.toBe(first.item.id);
  });
});
