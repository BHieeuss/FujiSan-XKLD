import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import {
  KATAKANA_GROUP_LABELS,
  KATAKANA_ITEMS,
  KatakanaGroup,
  KatakanaItem,
} from './katakana-data';
import { KatakanaProgressService } from './katakana-progress.service';
import { KATAKANA_STROKES } from './stroke-data.generated';
import { createQuiz, HiraganaQuizQuestion } from '../hiragana/quiz-engine';
import { StrokePadComponent } from '../hiragana/stroke-pad.component';

type LearningGroup = 'all' | KatakanaGroup | 'weak';
type LearningTab = 'quiz' | 'writing';
type PracticeMode = 'guided' | 'continuous';

interface GroupOption {
  id: LearningGroup;
  label: string;
  count: number;
}

@Component({
  selector: 'app-katakana-page',
  standalone: true,
  imports: [CommonModule, StrokePadComponent],
  templateUrl: './katakana-page.html',
  styleUrl: '../hiragana/hiragana-page.scss',
})
export class KatakanaPage {
  readonly progress = inject(KatakanaProgressService);
  readonly allItems = KATAKANA_ITEMS;
  readonly strokeData = KATAKANA_STROKES;

  activeTab: LearningTab = 'quiz';
  selectedGroup: LearningGroup = 'all';
  quizMode: PracticeMode = 'guided';
  writingMode: PracticeMode = 'guided';

  questions: HiraganaQuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswer?: string;
  answerLocked = false;
  quizScore = 0;
  quizAnsweredCount = 0;
  quizComplete = false;
  quizWrongIds = new Set<string>();
  lastQuizItemId?: string;

  writingItem?: KatakanaItem;
  activeGlyphIndex = 0;
  writingComplete = false;
  writingSkipped = false;
  writingResetToken = 0;
  writingSessionCompleted = 0;

  constructor() {
    this.startQuiz();
    this.writingItem = KATAKANA_ITEMS[0];
  }

  get groupOptions(): GroupOption[] {
    return [
      { id: 'all', label: 'Tất cả', count: KATAKANA_ITEMS.length },
      { id: 'basic', label: 'Cơ bản', count: 46 },
      { id: 'voiced', label: 'Âm đục', count: 25 },
      { id: 'yoon', label: 'Âm ghép', count: 33 },
      { id: 'weak', label: 'Cần ôn', count: this.progress.weakIds().length },
    ];
  }

  get currentQuestion(): HiraganaQuizQuestion | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  get quizAccuracy(): number {
    const total = this.quizMode === 'continuous' ? this.quizAnsweredCount : this.questions.length;
    if (!total) {
      return 0;
    }
    return Math.round((this.quizScore / total) * 100);
  }

  get currentQuestionNumber(): number {
    if (this.quizMode === 'continuous') {
      return Math.max(1, this.quizAnsweredCount + (this.answerLocked ? 0 : 1));
    }
    return this.currentQuestionIndex + 1;
  }

  get quizScoreLabel(): string {
    if (this.quizMode === 'continuous') {
      return this.quizAnsweredCount
        ? `${this.quizScore}/${this.quizAnsweredCount} đúng`
        : '0 đã làm';
    }
    return `${this.quizScore} đúng`;
  }

  get quizProgressPercent(): number {
    if (this.quizMode === 'continuous') {
      return 100;
    }
    return this.questions.length
      ? ((this.currentQuestionIndex + 1) / this.questions.length) * 100
      : 0;
  }

  get selectedGroupLabel(): string {
    return this.selectedGroup === 'all'
      ? 'Bài tổng hợp'
      : (this.groupOptions.find((group) => group.id === this.selectedGroup)?.label ?? '');
  }

  get filteredWritingItems(): KatakanaItem[] {
    return this.itemsForGroup(this.selectedGroup);
  }

  get writingProgressText(): string {
    if (!this.writingItem) {
      return 'Chưa chọn chữ';
    }
    const itemProgress = this.progress.getItem(this.writingItem.id);
    return itemProgress.writingCompleted
      ? `Đã hoàn thành ${itemProgress.writingCompleted} lần`
      : 'Chưa hoàn thành';
  }

  setTab(tab: LearningTab): void {
    this.activeTab = tab;
    if (tab === 'writing' && !this.writingItem) {
      this.selectFirstWritingItem();
    }
  }

  selectGroup(group: LearningGroup): void {
    this.selectedGroup = group;
    if (this.activeTab === 'quiz') {
      this.startQuiz();
    } else {
      this.startWritingSession();
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
    this.quizWrongIds = new Set<string>();
    this.lastQuizItemId = undefined;

    if (this.quizMode === 'continuous') {
      this.loadNextContinuousQuestion();
      return;
    }

    this.questions = createQuiz(this.itemsForGroup(group), KATAKANA_ITEMS);
  }

  setQuizMode(mode: PracticeMode): void {
    if (this.quizMode === mode) {
      return;
    }
    this.quizMode = mode;
    this.startQuiz();
  }

  setWritingMode(mode: PracticeMode): void {
    if (this.writingMode === mode) {
      return;
    }
    this.writingMode = mode;
    this.startWritingSession();
  }

  chooseAnswer(answer: string): void {
    const question = this.currentQuestion;
    if (!question || this.answerLocked) {
      return;
    }

    this.selectedAnswer = answer;
    this.answerLocked = true;
    const isCorrect = answer === question.correctAnswer;
    if (isCorrect) {
      this.quizScore += 1;
    } else {
      this.quizWrongIds.add(question.item.id);
    }
    this.quizAnsweredCount += 1;
    this.progress.recordQuiz(question.item.id, isCorrect);
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

  reviewWeakItems(): void {
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

  selectWritingItem(item: KatakanaItem): void {
    this.writingItem = item;
    this.restartWriting();
  }

  selectRandomWritingItem(): void {
    const items = this.filteredWritingItems;
    if (!items.length) {
      this.writingItem = undefined;
      return;
    }

    const candidates =
      items.length > 1 ? items.filter((item) => item.id !== this.writingItem?.id) : items;
    const nextItem = candidates[Math.floor(Math.random() * candidates.length)];
    this.selectWritingItem(nextItem);
  }

  moveWritingItem(offset: number): void {
    const items = this.filteredWritingItems;
    if (!items.length) {
      return;
    }
    const currentIndex = Math.max(
      0,
      items.findIndex((item) => item.id === this.writingItem?.id),
    );
    const nextIndex = (currentIndex + offset + items.length) % items.length;
    this.selectWritingItem(items[nextIndex]);
  }

  onGlyphCompleted(index: number): void {
    if (!this.writingItem || index !== this.activeGlyphIndex) {
      return;
    }

    if (index < this.writingItem.glyphs.length - 1) {
      this.activeGlyphIndex += 1;
      return;
    }

    this.writingComplete = true;
    this.writingSkipped = false;
    this.writingSessionCompleted += 1;
    this.progress.recordWriting(this.writingItem.id, true);
  }

  onGlyphSkipped(index: number): void {
    if (!this.writingItem || index !== this.activeGlyphIndex) {
      return;
    }
    this.writingComplete = true;
    this.writingSkipped = true;
    this.progress.recordWriting(this.writingItem.id, false);
  }

  restartWriting(): void {
    this.activeGlyphIndex = 0;
    this.writingComplete = false;
    this.writingSkipped = false;
    this.writingResetToken += 1;
  }

  continueWriting(): void {
    if (this.writingMode === 'continuous') {
      this.selectRandomWritingItem();
      return;
    }
    this.moveWritingItem(1);
  }

  isWeak(item: KatakanaItem): boolean {
    return this.progress.weakIds().includes(item.id);
  }

  isMastered(item: KatakanaItem): boolean {
    const itemProgress = this.progress.getItem(item.id);
    return (
      itemProgress.quizAttempts >= 3 &&
      itemProgress.quizCorrect / itemProgress.quizAttempts >= 0.8
    );
  }

  resetProgress(): void {
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm('Xóa toàn bộ tiến độ học Katakana trên thiết bị này?');
    if (confirmed) {
      this.progress.reset();
      this.startQuiz('all');
      this.startWritingSession();
    }
  }

  trackItem(_: number, item: KatakanaItem): string {
    return item.id;
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

    const optionIndex = ['1', '2', '3', '4'].indexOf(event.key);
    const option = this.currentQuestion?.options[optionIndex];
    if (option && !this.answerLocked) {
      this.chooseAnswer(option);
    }
  }

  private itemsForGroup(group: LearningGroup): KatakanaItem[] {
    if (group === 'all') {
      return KATAKANA_ITEMS;
    }
    if (group === 'weak') {
      const weakIds = new Set(this.progress.weakIds());
      return KATAKANA_ITEMS.filter((item) => weakIds.has(item.id));
    }
    return KATAKANA_ITEMS.filter((item) => item.group === group);
  }

  private selectFirstWritingItem(): void {
    this.writingItem = this.filteredWritingItems[0];
    this.restartWriting();
  }

  private startWritingSession(): void {
    this.writingSessionCompleted = 0;
    if (this.writingMode === 'continuous') {
      this.selectRandomWritingItem();
    } else {
      this.selectFirstWritingItem();
    }
  }

  private loadNextContinuousQuestion(): void {
    const pool = this.itemsForGroup(this.selectedGroup);
    const candidates =
      pool.length > 1 ? pool.filter((item) => item.id !== this.lastQuizItemId) : pool;
    this.questions = createQuiz(candidates, KATAKANA_ITEMS, 1);
    this.currentQuestionIndex = 0;
    this.selectedAnswer = undefined;
    this.answerLocked = false;
    this.quizComplete = false;
    this.lastQuizItemId = this.questions[0]?.item.id;
  }

  groupLabel(group: KatakanaGroup): string {
    return KATAKANA_GROUP_LABELS[group];
  }
}
