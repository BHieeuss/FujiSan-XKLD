import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JapaneseSpeechService } from '../../minna/lesson-1/japanese-speech.service';
import { KANJI_N5_LESSONS, KANJI_N5_TOTAL, KanjiN5Item, KanjiN5Lesson } from './kanji-n5.data';
import { KanjiN5ProgressService } from './kanji-n5-progress.service';
import { KANJI_N5_STROKES, KanjiStrokeData, KanjiStrokePath } from './kanji-n5-strokes.generated';

type QuizScope = 'lesson' | 'all';
type QuizMode = 'flashcard' | 'choice';
type WorksheetScope = 'kanji' | 'lesson' | 'level';

@Component({
  selector: 'app-kanji-n5-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kanji-n5-page.html',
  styleUrl: './kanji-n5-page.scss',
})
export class KanjiN5Page implements OnDestroy {
  readonly lessons = KANJI_N5_LESSONS;
  readonly allKanji = this.lessons.flatMap((lesson) => lesson.items);
  readonly kanjiOrderById = new Map(this.allKanji.map((item, index) => [item.id, index + 1]));
  readonly totalKanji = KANJI_N5_TOTAL;
  readonly progress = inject(KanjiN5ProgressService);
  readonly speech = inject(JapaneseSpeechService);

  selectedLevel = 'N5';
  activeLessonSlug = this.lessons[0].slug;
  activeKanjiId = this.lessons[0].items[0].id;
  expandedKanjiId?: string;
  quizScope: QuizScope = 'lesson';
  quizMode: QuizMode = 'flashcard';
  quizIndex = 0;
  flashcardRevealed = false;
  selectedQuizAnswerId?: string;
  quizAnswered = false;
  worksheetScope: WorksheetScope = 'kanji';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routeSub: Subscription;
  private reminderTimer?: number;

  constructor() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const slug = params.get('lessonSlug') ?? this.lessons[0].slug;
      const lesson = this.lessons.find((item) => item.slug === slug);

      if (!lesson) {
        void this.router.navigate(['/hoc-kanji-n5', this.lessons[0].slug], { replaceUrl: true });
        return;
      }

      this.activeLessonSlug = lesson.slug;
      this.activeKanjiId = lesson.items[0].id;
      this.expandedKanjiId = undefined;
      this.resetQuizCard();
    });

    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.progress.notifyReviewIfDue(this.allKanji), 1200);
      this.reminderTimer = window.setInterval(
        () => this.progress.notifyReviewIfDue(this.allKanji),
        60_000,
      );
    }
  }

  get activeLesson(): KanjiN5Lesson {
    return this.lessons.find((lesson) => lesson.slug === this.activeLessonSlug) ?? this.lessons[0];
  }

  get activeKanji(): KanjiN5Item {
    return (
      this.activeLesson.items.find((item) => item.id === this.activeKanjiId) ??
      this.activeLesson.items[0]
    );
  }

  get activeLessonIndex(): number {
    return this.lessons.findIndex((lesson) => lesson.slug === this.activeLesson.slug);
  }

  get overallProgressPercent(): number {
    return Math.round((this.progress.learnedCount() / this.totalKanji) * 100);
  }

  get isFirstLesson(): boolean {
    return this.activeLessonIndex <= 0;
  }

  get isLastLesson(): boolean {
    return this.activeLessonIndex >= this.lessons.length - 1;
  }

  get quizItems(): KanjiN5Item[] {
    return this.quizScope === 'all' ? this.allKanji : this.activeLesson.items;
  }

  get currentQuizItem(): KanjiN5Item {
    return this.quizItems[this.quizIndex % this.quizItems.length] ?? this.activeLesson.items[0];
  }

  get quizOptions(): KanjiN5Item[] {
    const current = this.currentQuizItem;
    const pool = (this.quizItems.length >= 4 ? this.quizItems : this.allKanji).filter(
      (item) => item.id !== current.id,
    );
    const offset = pool.length ? (this.quizIndex * 5) % pool.length : 0;
    const distractors = [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 3);
    const options = [current, ...distractors];
    const shift = this.quizIndex % options.length;
    return [...options.slice(shift), ...options.slice(0, shift)];
  }

  get quizProgressLabel(): string {
    return `${(this.quizIndex % this.quizItems.length) + 1}/${this.quizItems.length}`;
  }

  get activeStrokeData(): KanjiStrokeData | undefined {
    return this.strokeDataFor(this.activeKanji);
  }

  get worksheetItems(): KanjiN5Item[] {
    return this.worksheetItemsForScope(this.worksheetScope);
  }

  get worksheetTitle(): string {
    return this.worksheetTitleForScope(this.worksheetScope);
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    if (this.reminderTimer) {
      window.clearInterval(this.reminderTimer);
    }
    this.speech.stop();
  }

  selectLesson(slug: string): void {
    if (slug !== this.activeLesson.slug) {
      void this.router.navigate(['/hoc-kanji-n5', slug]);
    }
  }

  goToLesson(offset: number): void {
    const lesson = this.lessons[this.activeLessonIndex + offset];
    if (lesson) {
      this.selectLesson(lesson.slug);
    }
  }

  selectKanji(item: KanjiN5Item): void {
    if (this.expandedKanjiId === item.id) {
      this.expandedKanjiId = undefined;
      return;
    }
    this.activeKanjiId = item.id;
    this.expandedKanjiId = item.id;
  }

  lessonLearnedCount(lesson: KanjiN5Lesson): number {
    return lesson.items.filter((item) => this.progress.isKanjiLearned(item.id)).length;
  }

  kanjiOrder(item: KanjiN5Item): number {
    return this.kanjiOrderById.get(item.id) ?? 0;
  }

  lessonProgressPercent(lesson: KanjiN5Lesson): number {
    return Math.round((this.lessonLearnedCount(lesson) / lesson.items.length) * 100);
  }

  toggleLearned(item: KanjiN5Item): void {
    this.progress.toggleKanji(item.id);
  }

  setQuizScope(scope: QuizScope): void {
    this.quizScope = scope;
    this.resetQuizCard();
  }

  setQuizMode(mode: QuizMode): void {
    this.quizMode = mode;
    this.resetQuizCard();
  }

  revealFlashcard(): void {
    this.flashcardRevealed = true;
  }

  markCurrentQuizKnown(): void {
    this.progress.markKanji(this.currentQuizItem.id);
    this.nextQuizCard();
  }

  nextQuizCard(): void {
    this.quizIndex = (this.quizIndex + 1) % this.quizItems.length;
    this.resetQuizCard(false);
  }

  selectQuizAnswer(option: KanjiN5Item): void {
    if (this.quizAnswered) {
      return;
    }

    this.selectedQuizAnswerId = option.id;
    this.quizAnswered = true;
    if (option.id === this.currentQuizItem.id) {
      this.progress.markKanji(this.currentQuizItem.id);
    }
  }

  quizAnswerState(option: KanjiN5Item): Record<string, boolean> {
    return {
      selected: this.selectedQuizAnswerId === option.id,
      correct: this.quizAnswered && option.id === this.currentQuizItem.id,
      wrong:
        this.quizAnswered &&
        this.selectedQuizAnswerId === option.id &&
        option.id !== this.currentQuizItem.id,
    };
  }

  speakKanji(item: KanjiN5Item): void {
    this.speech.speak(`${item.kanji}。${item.examples[0].word}`, 0.78);
  }

  speakExample(example: { word: string; reading: string }): void {
    this.speech.speak(`${example.word}。${example.reading}`, 0.82);
  }

  strokeDataFor(item: KanjiN5Item): KanjiStrokeData | undefined {
    return KANJI_N5_STROKES[item.kanji];
  }

  strokesBefore(strokeData: KanjiStrokeData, order: number): KanjiStrokePath[] {
    return strokeData.strokes.slice(0, Math.max(order - 1, 0));
  }

  printWorksheet(scope: WorksheetScope): void {
    this.worksheetScope = scope;
    window.setTimeout(() => window.print(), 40);
  }

  resetProgress(): void {
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm('Xóa toàn bộ tiến độ Hán tự N5 trên thiết bị này?');
    if (confirmed) {
      this.progress.reset();
    }
  }

  trackLesson(_: number, lesson: KanjiN5Lesson): string {
    return lesson.slug;
  }

  trackKanji(_: number, item: KanjiN5Item): string {
    return item.id;
  }

  trackExample(index: number): number {
    return index;
  }

  trackStroke(_: number, stroke: KanjiStrokePath): number {
    return stroke.order;
  }

  private resetQuizCard(resetIndex = true): void {
    if (resetIndex) {
      this.quizIndex = 0;
    }
    this.flashcardRevealed = false;
    this.selectedQuizAnswerId = undefined;
    this.quizAnswered = false;
  }

  private worksheetItemsForScope(scope: WorksheetScope): KanjiN5Item[] {
    if (scope === 'level') {
      return this.allKanji;
    }
    if (scope === 'lesson') {
      return this.activeLesson.items;
    }
    return [this.activeKanji];
  }

  private worksheetTitleForScope(scope: WorksheetScope): string {
    if (scope === 'level') {
      return 'Hán tự N5 - Toàn bộ cấp độ';
    }
    if (scope === 'lesson') {
      return `Hán tự N5 - Bài ${this.activeLesson.number}: ${this.activeLesson.title}`;
    }
    return `Hán tự N5 - ${this.activeKanji.kanji} (${this.activeKanji.hanViet})`;
  }
}
