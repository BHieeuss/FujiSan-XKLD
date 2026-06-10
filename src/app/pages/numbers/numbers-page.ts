import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BASIC_NUMBER_ROWS,
  COMMON_COUNTERS,
  formatNumber,
  JapaneseNumber,
  NUMBER_GROUPS,
  NumberGroup,
  NumberGroupDefinition,
  toJapaneseNumber,
  TEN_NUMBER_ROW,
} from './japanese-number';
import { createNumberQuiz, NumberQuizQuestion } from './number-quiz';
import { NumberProgressService } from './number-progress.service';

type LearningTab = 'quiz' | 'guide';
type PracticeMode = 'guided' | 'continuous';
type LearningGroup = 'all' | NumberGroup | 'weak';

@Component({
  selector: 'app-numbers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './numbers-page.html',
  styleUrls: ['../hiragana/hiragana-page.scss', './numbers-page.scss'],
})
export class NumbersPage {
  readonly progress = inject(NumberProgressService);
  readonly numberGroups = NUMBER_GROUPS;
  readonly basicRows = [...BASIC_NUMBER_ROWS, TEN_NUMBER_ROW];
  readonly counters = COMMON_COUNTERS;
  readonly examples = [18, 47, 300, 648, 2026, 8315, 31415, 90000];

  activeTab: LearningTab = 'quiz';
  selectedGroup: LearningGroup = 'all';
  quizMode: PracticeMode = 'guided';
  questions: NumberQuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswer?: string;
  answerLocked = false;
  quizScore = 0;
  quizAnsweredCount = 0;
  quizComplete = false;
  lastQuizValue?: number;
  builderValue: number | null = 31415;

  constructor() {
    this.startQuiz();
  }

  get groupOptions(): Array<{ id: LearningGroup; label: string; count: number }> {
    return [
      { id: 'all', label: 'Tất cả', count: NUMBER_GROUPS.length },
      ...NUMBER_GROUPS.map((group) => ({ id: group.id, label: group.shortLabel, count: 1 })),
      { id: 'weak', label: 'Cần ôn', count: this.progress.weakGroups().length },
    ];
  }

  get currentQuestion(): NumberQuizQuestion | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  get quizAccuracy(): number {
    const total = this.quizMode === 'continuous' ? this.quizAnsweredCount : this.questions.length;
    return total ? Math.round((this.quizScore / total) * 100) : 0;
  }

  get currentQuestionNumber(): number {
    return this.quizMode === 'continuous'
      ? Math.max(1, this.quizAnsweredCount + (this.answerLocked ? 0 : 1))
      : this.currentQuestionIndex + 1;
  }

  get quizScoreLabel(): string {
    return this.quizMode === 'continuous'
      ? this.quizAnsweredCount
        ? `${this.quizScore}/${this.quizAnsweredCount} đúng`
        : '0 đã làm'
      : `${this.quizScore} đúng`;
  }

  get quizProgressPercent(): number {
    return this.quizMode === 'continuous'
      ? 100
      : this.questions.length
        ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
        : 0;
  }

  get selectedGroupLabel(): string {
    if (this.selectedGroup === 'all') {
      return 'Bài tổng hợp';
    }
    if (this.selectedGroup === 'weak') {
      return 'Nhóm cần ôn';
    }
    return NUMBER_GROUPS.find((group) => group.id === this.selectedGroup)?.label ?? '';
  }

  get builderResult(): JapaneseNumber {
    const value = Math.min(90000, Math.max(1, Math.trunc(this.builderValue ?? 1)));
    return toJapaneseNumber(value);
  }

  setTab(tab: LearningTab): void {
    this.activeTab = tab;
  }

  selectGroup(group: LearningGroup): void {
    this.selectedGroup = group;
    this.startQuiz();
  }

  setQuizMode(mode: PracticeMode): void {
    if (this.quizMode !== mode) {
      this.quizMode = mode;
      this.startQuiz();
    }
  }

  startQuiz(group: LearningGroup = this.selectedGroup): void {
    this.selectedGroup = group;
    this.currentQuestionIndex = 0;
    this.selectedAnswer = undefined;
    this.answerLocked = false;
    this.quizScore = 0;
    this.quizAnsweredCount = 0;
    this.quizComplete = false;
    this.lastQuizValue = undefined;

    const groups = this.groupsForSelection(group);
    this.questions = groups.length
      ? createNumberQuiz(groups, this.quizMode === 'continuous' ? 1 : 10)
      : [];
    this.lastQuizValue = this.questions[0]?.value;
  }

  chooseAnswer(answer: string): void {
    const question = this.currentQuestion;
    if (!question || this.answerLocked) {
      return;
    }
    this.selectedAnswer = answer;
    this.answerLocked = true;
    const isCorrect = answer === question.correctAnswer;
    this.quizScore += isCorrect ? 1 : 0;
    this.quizAnsweredCount += 1;
    this.progress.record(this.groupForValue(question.value).id, isCorrect);
  }

  nextQuestion(): void {
    if (!this.answerLocked) {
      return;
    }
    if (this.quizMode === 'continuous') {
      const groups = this.groupsForSelection(this.selectedGroup);
      this.questions = createNumberQuiz(groups, 1, Math.random, this.lastQuizValue);
      this.lastQuizValue = this.questions[0]?.value;
      this.currentQuestionIndex = 0;
      this.selectedAnswer = undefined;
      this.answerLocked = false;
      return;
    }
    if (this.currentQuestionIndex >= this.questions.length - 1) {
      this.quizComplete = true;
      return;
    }
    this.currentQuestionIndex += 1;
    this.selectedAnswer = undefined;
    this.answerLocked = false;
  }

  reviewWeakGroups(): void {
    this.quizMode = 'guided';
    this.startQuiz('weak');
  }

  answerClass(answer: string): Record<string, boolean> {
    return {
      'is-selected': this.selectedAnswer === answer,
      'is-correct': this.answerLocked && answer === this.currentQuestion?.correctAnswer,
      'is-wrong':
        this.answerLocked &&
        this.selectedAnswer === answer &&
        answer !== this.currentQuestion?.correctAnswer,
    };
  }

  setBuilderExample(value: number): void {
    this.builderValue = value;
  }

  format(value: number): string {
    return formatNumber(value);
  }

  resetProgress(): void {
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm('Xóa toàn bộ tiến độ học số đếm trên thiết bị này?');
    if (confirmed) {
      this.progress.reset();
      this.startQuiz('all');
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyboardAnswer(event: KeyboardEvent): void {
    if (
      this.activeTab !== 'quiz' ||
      this.quizComplete ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }
    if (this.answerLocked && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.nextQuestion();
      return;
    }
    const option = this.currentQuestion?.options[['1', '2', '3', '4'].indexOf(event.key)];
    if (option && !this.answerLocked) {
      this.chooseAnswer(option);
    }
  }

  private groupsForSelection(selection: LearningGroup): NumberGroupDefinition[] {
    if (selection === 'all') {
      return NUMBER_GROUPS;
    }
    if (selection === 'weak') {
      const weak = new Set(this.progress.weakGroups());
      return NUMBER_GROUPS.filter((group) => weak.has(group.id));
    }
    return NUMBER_GROUPS.filter((group) => group.id === selection);
  }

  private groupForValue(value: number): NumberGroupDefinition {
    return (
      NUMBER_GROUPS.find((group) => value >= group.min && value <= group.max) ??
      NUMBER_GROUPS[NUMBER_GROUPS.length - 1]
    );
  }
}
