import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BASIC_NUMBER_ROWS,
  TENS_NUMBER_ROWS,
  HUNDREDS_NUMBER_ROWS,
  THOUSANDS_NUMBER_ROWS,
  MAN_NUMBER_ROWS,
  NATIVE_JAPANESE_NUMBERS,
  DETAILED_COUNTERS,
  formatNumber,
  JapaneseNumber,
  NUMBER_GROUPS,
  NumberGroup,
  NumberGroupDefinition,
  toJapaneseNumber,
} from './japanese-number';
import { createNumberQuiz, NumberQuizQuestion } from './number-quiz';
import { NumberProgressService } from './number-progress.service';

import { JapaneseAudioService } from '../../services/japanese-audio.service';

type LearningTab = 'quiz';
type PracticeMode = 'guided' | 'continuous';
type LearningGroup = 'all' | NumberGroup | 'weak';
type ViewMode = 'practice' | 'theory';
type TheoryTab = 'matrix' | 'irregulars' | 'counters' | 'builder';

@Component({
  selector: 'app-numbers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './numbers-page.html',
  styleUrl: './numbers-page.scss',
})
export class NumbersPage implements OnDestroy {
  private readonly router = inject(Router);
  private readonly audioService = inject(JapaneseAudioService);
  readonly progress = inject(NumberProgressService);

  readonly numberGroups = NUMBER_GROUPS;
  readonly basicRows = BASIC_NUMBER_ROWS;
  readonly tensRows = TENS_NUMBER_ROWS;
  readonly hundredsRows = HUNDREDS_NUMBER_ROWS;
  readonly thousandsRows = THOUSANDS_NUMBER_ROWS;
  readonly manRows = MAN_NUMBER_ROWS;
  readonly nativeRows = NATIVE_JAPANESE_NUMBERS;
  readonly detailedCounters = DETAILED_COUNTERS;
  readonly examples = [18, 47, 300, 648, 2026, 8315, 31415, 90000];

  // View state (Practice vs Theory) - Defaults to Theory!
  currentView: ViewMode = 'theory';
  theoryTab: TheoryTab = 'matrix';
  headerCollapsed = false;

  // Selected counter in theory
  selectedCounterId = 'people';

  // Audio system
  audioUnlocked = false;
  showAudioPrompt = false;
  audioPromptError = '';
  private readonly AUDIO_KEY = 'viejap.audio-unlocked';

  // Practice state
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
  streak = 0;
  bestStreak = 0;

  // Number builder state
  builderValue: number | null = 31415;

  constructor() {
    this.startQuiz();
  }

  ngOnDestroy(): void {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  toggleHeader(): void {
    this.headerCollapsed = !this.headerCollapsed;
  }

  switchView(view: ViewMode): void {
    this.currentView = view;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  setTheoryTab(tab: TheoryTab): void {
    this.theoryTab = tab;
  }

  selectCounter(counterId: string): void {
    this.selectedCounterId = counterId;
  }

  get selectedCounter() {
    return this.detailedCounters.find((c) => c.id === this.selectedCounterId) ?? this.detailedCounters[0];
  }

  openAudioPrompt(): void {
    this.audioPromptError = '';
    this.showAudioPrompt = true;
  }

  closeAudioPrompt(): void {
    this.showAudioPrompt = false;
  }

  async enableAudioSupport(): Promise<void> {
    this.audioPromptError = '';
    const success = await this.audioService.unlockAudio();
    if (success) {
      this.audioUnlocked = true;
      this.showAudioPrompt = false;
      this.playCorrectSound();
      this.speakJapanese('いち');
    } else {
      this.audioPromptError = 'Không thể bật âm thanh tự động. Hãy mở tiếng trên thiết bị rồi thử lại.';
    }
  }

  speakJapanese(text: string): void {
    void this.audioService.speak(text);
  }

  playAudio(text: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.speakJapanese(text);
  }

  playCorrectSound(): void {
    this.audioService.playCorrectSound();
  }

  playWrongSound(): void {
    this.audioService.playWrongSound();
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
    const raw = Number(this.builderValue ?? 1);
    const clamped = Math.min(90000, Math.max(1, Math.trunc(raw || 1)));
    return toJapaneseNumber(clamped);
  }

  selectGroup(group: LearningGroup): void {
    this.selectedGroup = group;
    this.startQuiz();
  }

  setQuizMode(mode: PracticeMode): void {
    if (this.quizMode === mode) {
      return;
    }
    this.quizMode = mode;
    this.startQuiz();
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

    if (this.quizMode === 'continuous') {
      this.loadNextContinuousQuestion();
      return;
    }

    this.questions = createNumberQuiz(this.groupsForSelection(group), 10);
  }

  chooseAnswer(answer: string): void {
    const question = this.currentQuestion;
    if (!question || this.answerLocked) {
      return;
    }

    this.selectedAnswer = answer;
    this.answerLocked = true;
    const isCorrect = answer === question.correctAnswer;
    const group = this.groupForValue(question.value);

    if (isCorrect) {
      this.quizScore += 1;
      this.streak += 1;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }
      this.playCorrectSound();
    } else {
      this.streak = 0;
      this.playWrongSound();
    }
    this.quizAnsweredCount += 1;
    this.progress.record(group, isCorrect);

    // Speak pronunciation on answer
    this.speakJapanese(question.result.kana);
  }

  nextQuestion(): void {
    if (!this.answerLocked) {
      return;
    }

    if (this.quizMode === 'continuous') {
      this.loadNextContinuousQuestion();
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
    const question = this.currentQuestion;
    return {
      'is-selected': this.selectedAnswer === answer,
      'is-correct': this.answerLocked && answer === question?.correctAnswer,
      'is-wrong':
        this.answerLocked &&
        this.selectedAnswer === answer &&
        answer !== question?.correctAnswer,
    };
  }

  setBuilderExample(value: number): void {
    this.builderValue = value;
    this.speakJapanese(this.builderResult.kana);
  }

  resetProgress(): void {
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm('Xóa toàn bộ tiến độ học số đếm trên thiết bị này?');
    if (confirmed) {
      this.progress.reset();
      this.streak = 0;
      this.bestStreak = 0;
      this.startQuiz('all');
    }
  }

  format(value: number): string {
    return formatNumber(value);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyboardAnswer(event: KeyboardEvent): void {
    if (
      this.currentView !== 'practice' ||
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

    const optionIndex = ['1', '2', '3', '4'].indexOf(event.key);
    const option = this.currentQuestion?.options[optionIndex];
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

  private groupForValue(value: number): NumberGroup {
    return (
      NUMBER_GROUPS.find((group) => value >= group.min && value <= group.max)?.id ?? 'basic'
    );
  }

  private loadNextContinuousQuestion(): void {
    const groups = this.groupsForSelection(this.selectedGroup);
    const questions = createNumberQuiz(groups, 1, Math.random, this.lastQuizValue);
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.selectedAnswer = undefined;
    this.answerLocked = false;
    this.quizComplete = false;
    this.lastQuizValue = questions[0]?.value;
  }
}
