import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BASIC_HIRAGANA,
  HIRAGANA_GROUP_LABELS,
  HIRAGANA_ITEMS,
  HiraganaGroup,
  HiraganaItem,
  VOICED_HIRAGANA,
  YOON_HIRAGANA,
} from './hiragana-data';
import { HiraganaProgressService } from './hiragana-progress.service';
import { createQuiz, HiraganaQuizQuestion } from './quiz-engine';
import { HIRAGANA_STROKES } from './stroke-data.generated';
import { StrokePadComponent } from './stroke-pad.component';
import { JapaneseAudioService } from '../../services/japanese-audio.service';

type LearningGroup = 'all' | HiraganaGroup | 'weak';
type LearningTab = 'quiz' | 'writing';
type PracticeMode = 'guided' | 'continuous';
type ViewMode = 'practice' | 'theory';
type TheoryTab = 'basic' | 'voiced' | 'yoon' | 'rules';

interface GroupOption {
  id: LearningGroup;
  label: string;
  count: number;
}

interface ChartCell {
  kana: string;
  romaji: string;
  id?: string;
  empty?: boolean;
}

interface ChartRow {
  rowLabel: string;
  consonant: string;
  cells: ChartCell[];
}

@Component({
  selector: 'app-hiragana-page',
  standalone: true,
  imports: [CommonModule, StrokePadComponent],
  templateUrl: './hiragana-page.html',
  styleUrl: './hiragana-page.scss',
})
export class HiraganaPage implements OnDestroy {
  private readonly router = inject(Router);
  private readonly audioService = inject(JapaneseAudioService);
  readonly progress = inject(HiraganaProgressService);
  readonly allItems = HIRAGANA_ITEMS;
  readonly strokeData = HIRAGANA_STROKES;

  // View state (Practice vs Theory)
  currentView: ViewMode = 'theory';
  theoryTab: TheoryTab = 'basic';
  headerCollapsed = false;

  // Audio system
  audioUnlocked = false;
  showAudioPrompt = false;
  audioPromptError = '';
  private readonly AUDIO_KEY = 'viejap.audio-unlocked';
  private audioCtx?: AudioContext;
  private speechSynth?: SpeechSynthesis;

  // Practice state
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
  streak = 0;
  bestStreak = 0;

  // Writing state
  writingItem?: HiraganaItem;
  activeGlyphIndex = 0;
  writingComplete = false;
  writingSkipped = false;
  writingResetToken = 0;
  writingSessionCompleted = 0;

  // Basic Gojuon matrix (46 Seion)
  readonly basicChartRows: ChartRow[] = [
    {
      rowLabel: 'Hàng A (Nguyên âm)',
      consonant: 'Ø',
      cells: [
        { kana: 'あ', romaji: 'a', id: 'a' },
        { kana: 'い', romaji: 'i', id: 'i' },
        { kana: 'う', romaji: 'u', id: 'u' },
        { kana: 'え', romaji: 'e', id: 'e' },
        { kana: 'お', romaji: 'o', id: 'o' },
      ],
    },
    {
      rowLabel: 'Hàng Ka',
      consonant: 'K',
      cells: [
        { kana: 'か', romaji: 'ka', id: 'ka' },
        { kana: 'き', romaji: 'ki', id: 'ki' },
        { kana: 'く', romaji: 'ku', id: 'ku' },
        { kana: 'け', romaji: 'ke', id: 'ke' },
        { kana: 'こ', romaji: 'ko', id: 'ko' },
      ],
    },
    {
      rowLabel: 'Hàng Sa',
      consonant: 'S',
      cells: [
        { kana: 'さ', romaji: 'sa', id: 'sa' },
        { kana: 'し', romaji: 'shi', id: 'shi' },
        { kana: 'す', romaji: 'su', id: 'su' },
        { kana: 'せ', romaji: 'se', id: 'se' },
        { kana: 'そ', romaji: 'so', id: 'so' },
      ],
    },
    {
      rowLabel: 'Hàng Ta',
      consonant: 'T',
      cells: [
        { kana: 'た', romaji: 'ta', id: 'ta' },
        { kana: 'ち', romaji: 'chi', id: 'chi' },
        { kana: 'つ', romaji: 'tsu', id: 'tsu' },
        { kana: 'て', romaji: 'te', id: 'te' },
        { kana: 'と', romaji: 'to', id: 'to' },
      ],
    },
    {
      rowLabel: 'Hàng Na',
      consonant: 'N',
      cells: [
        { kana: 'な', romaji: 'na', id: 'na' },
        { kana: 'に', romaji: 'ni', id: 'ni' },
        { kana: 'ぬ', romaji: 'nu', id: 'nu' },
        { kana: 'ね', romaji: 'ne', id: 'ne' },
        { kana: 'の', romaji: 'no', id: 'no' },
      ],
    },
    {
      rowLabel: 'Hàng Ha',
      consonant: 'H',
      cells: [
        { kana: 'は', romaji: 'ha', id: 'ha' },
        { kana: 'ひ', romaji: 'hi', id: 'hi' },
        { kana: 'ふ', romaji: 'fu', id: 'fu' },
        { kana: 'へ', romaji: 'he', id: 'he' },
        { kana: 'ほ', romaji: 'ho', id: 'ho' },
      ],
    },
    {
      rowLabel: 'Hàng Ma',
      consonant: 'M',
      cells: [
        { kana: 'ま', romaji: 'ma', id: 'ma' },
        { kana: 'み', romaji: 'mi', id: 'mi' },
        { kana: 'む', romaji: 'mu', id: 'mu' },
        { kana: 'め', romaji: 'me', id: 'me' },
        { kana: 'mo', romaji: 'mo', id: 'mo' },
      ],
    },
    {
      rowLabel: 'Hàng Ya',
      consonant: 'Y',
      cells: [
        { kana: 'や', romaji: 'ya', id: 'ya' },
        { kana: '', romaji: '', empty: true },
        { kana: 'ゆ', romaji: 'yu', id: 'yu' },
        { kana: '', romaji: '', empty: true },
        { kana: 'よ', romaji: 'yo', id: 'yo' },
      ],
    },
    {
      rowLabel: 'Hàng Ra',
      consonant: 'R',
      cells: [
        { kana: 'ら', romaji: 'ra', id: 'ra' },
        { kana: 'り', romaji: 'ri', id: 'ri' },
        { kana: 'る', romaji: 'ru', id: 'ru' },
        { kana: 'れ', romaji: 're', id: 're' },
        { kana: 'ろ', romaji: 'ro', id: 'ro' },
      ],
    },
    {
      rowLabel: 'Hàng Wa & Âm mũi N',
      consonant: 'W / N',
      cells: [
        { kana: 'わ', romaji: 'wa', id: 'wa' },
        { kana: '', romaji: '', empty: true },
        { kana: '', romaji: '', empty: true },
        { kana: '', romaji: '', empty: true },
        { kana: 'を', romaji: 'wo', id: 'wo' },
      ],
    },
    {
      rowLabel: 'Âm mũi đặc biệt',
      consonant: 'N',
      cells: [
        { kana: 'ん', romaji: 'n', id: 'n' },
        { kana: '', romaji: '', empty: true },
        { kana: '', romaji: '', empty: true },
        { kana: '', romaji: '', empty: true },
        { kana: '', romaji: '', empty: true },
      ],
    },
  ];

  // Voiced Dakuon & Handakuon matrix
  readonly voicedChartRows: ChartRow[] = [
    {
      rowLabel: 'Hàng Ga (Âm đục Ka)',
      consonant: 'G',
      cells: [
        { kana: 'が', romaji: 'ga', id: 'ga' },
        { kana: 'ぎ', romaji: 'gi', id: 'gi' },
        { kana: 'ぐ', romaji: 'gu', id: 'gu' },
        { kana: 'げ', romaji: 'ge', id: 'ge' },
        { kana: 'ご', romaji: 'go', id: 'go' },
      ],
    },
    {
      rowLabel: 'Hàng Za (Âm đục Sa)',
      consonant: 'Z',
      cells: [
        { kana: 'ざ', romaji: 'za', id: 'za' },
        { kana: 'じ', romaji: 'ji', id: 'ji' },
        { kana: 'ず', romaji: 'zu', id: 'zu' },
        { kana: 'ぜ', romaji: 'ze', id: 'ze' },
        { kana: 'ぞ', romaji: 'zo', id: 'zo' },
      ],
    },
    {
      rowLabel: 'Hàng Da (Âm đục Ta)',
      consonant: 'D',
      cells: [
        { kana: 'だ', romaji: 'da', id: 'da' },
        { kana: 'ぢ', romaji: 'ji', id: 'di' },
        { kana: 'づ', romaji: 'zu', id: 'du' },
        { kana: 'で', romaji: 'de', id: 'de' },
        { kana: 'ど', romaji: 'do', id: 'do' },
      ],
    },
    {
      rowLabel: 'Hàng Ba (Âm đục Ha)',
      consonant: 'B',
      cells: [
        { kana: 'ば', romaji: 'ba', id: 'ba' },
        { kana: 'び', romaji: 'bi', id: 'bi' },
        { kana: 'ぶ', romaji: 'bu', id: 'bu' },
        { kana: 'べ', romaji: 'be', id: 'be' },
        { kana: 'ぼ', romaji: 'bo', id: 'bo' },
      ],
    },
    {
      rowLabel: 'Hàng Pa (Bán đục Ha)',
      consonant: 'P',
      cells: [
        { kana: 'ぱ', romaji: 'pa', id: 'pa' },
        { kana: 'ぴ', romaji: 'pi', id: 'pi' },
        { kana: 'ぷ', romaji: 'pu', id: 'pu' },
        { kana: 'ぺ', romaji: 'pe', id: 'pe' },
        { kana: 'ぽ', romaji: 'po', id: 'po' },
      ],
    },
  ];

  // Yoon items
  readonly yoonItems = YOON_HIRAGANA;

  constructor() {
    this.startQuiz();
    this.writingItem = HIRAGANA_ITEMS[0];
    this.initAudio();
  }

  ngOnDestroy(): void {
    this.speechSynth?.cancel();
    this.audioCtx?.close();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  toggleHeader(): void {
    this.headerCollapsed = !this.headerCollapsed;
  }

  switchView(view: ViewMode): void {
    this.currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setTheoryTab(tab: TheoryTab): void {
    this.theoryTab = tab;
  }

  // Audio system
  private initAudio(): void {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.speechSynth = window.speechSynthesis;
      }
      const saved = window.localStorage.getItem(this.AUDIO_KEY);
      if (saved === '1') {
        this.audioUnlocked = true;
      }
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    return this.audioCtx!;
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
      this.speakJapanese('あ');
    } else {
      this.audioPromptError = 'Không thể bật âm thanh tự động. Hãy mở tiếng trên thiết bị rồi thử lại.';
    }
  }

  speakJapanese(text: string): void {
    void this.audioService.speak(text);
  }

  playKanaAudio(kana: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.speakJapanese(kana);
  }

  playCorrectSound(): void {
    this.audioService.playCorrectSound();
  }

  playWrongSound(): void {
    this.audioService.playWrongSound();
  }

  get groupOptions(): GroupOption[] {
    return [
      { id: 'all', label: 'Tất cả', count: HIRAGANA_ITEMS.length },
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

  get filteredWritingItems(): HiraganaItem[] {
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

    this.questions = createQuiz(this.itemsForGroup(group), HIRAGANA_ITEMS);
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
      this.streak += 1;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }
      this.playCorrectSound();
    } else {
      this.quizWrongIds.add(question.item.id);
      this.streak = 0;
      this.playWrongSound();
    }
    this.quizAnsweredCount += 1;
    this.progress.recordQuiz(question.item.id, isCorrect);

    // Speak pronunciation on answer
    this.speakJapanese(question.item.kana);
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

  selectWritingItem(item: HiraganaItem): void {
    this.writingItem = item;
    this.restartWriting();
    this.speakJapanese(item.kana);
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
    this.playCorrectSound();
    this.speakJapanese(this.writingItem.kana);
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

  isWeak(item: HiraganaItem): boolean {
    return this.progress.weakIds().includes(item.id);
  }

  isMastered(item: HiraganaItem): boolean {
    const itemProgress = this.progress.getItem(item.id);
    return (
      itemProgress.quizAttempts >= 3 &&
      itemProgress.quizCorrect / itemProgress.quizAttempts >= 0.8
    );
  }

  resetProgress(): void {
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm('Xóa toàn bộ tiến độ học Hiragana trên thiết bị này?');
    if (confirmed) {
      this.progress.reset();
      this.streak = 0;
      this.bestStreak = 0;
      this.startQuiz('all');
      this.startWritingSession();
    }
  }

  trackItem(_: number, item: HiraganaItem): string {
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

  private itemsForGroup(group: LearningGroup): HiraganaItem[] {
    if (group === 'all') {
      return HIRAGANA_ITEMS;
    }
    if (group === 'weak') {
      const weakIds = new Set(this.progress.weakIds());
      return HIRAGANA_ITEMS.filter((item) => weakIds.has(item.id));
    }
    return HIRAGANA_ITEMS.filter((item) => item.group === group);
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
    this.questions = createQuiz(candidates, HIRAGANA_ITEMS, 1);
    this.currentQuestionIndex = 0;
    this.selectedAnswer = undefined;
    this.answerLocked = false;
    this.quizComplete = false;
    this.lastQuizItemId = this.questions[0]?.item.id;
  }

  groupLabel(group: HiraganaGroup): string {
    return HIRAGANA_GROUP_LABELS[group];
  }
}

