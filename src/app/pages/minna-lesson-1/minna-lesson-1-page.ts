import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JapaneseSpeechService } from './japanese-speech.service';
import {
  GrammarPoint,
  LESSON_1_GRAMMAR,
  LESSON_1_VOCABULARY,
  LISTENING_DIALOGUE,
  LISTENING_QUESTIONS,
  READING_PASSAGE,
  VocabularyCategory,
  VocabularyItem,
  VOCABULARY_CATEGORY_LABELS,
} from './minna-lesson-1.data';
import { MinnaLesson1ProgressService } from './minna-lesson-1-progress.service';

type LessonTab = 'vocabulary' | 'grammar' | 'reading' | 'listening';
type VocabularyFilter = 'all' | VocabularyCategory;

@Component({
  selector: 'app-minna-lesson-1-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './minna-lesson-1-page.html',
  styleUrl: './minna-lesson-1-page.scss',
})
export class MinnaLesson1Page implements OnDestroy {
  readonly progress = inject(MinnaLesson1ProgressService);
  readonly speech = inject(JapaneseSpeechService);
  readonly vocabulary = LESSON_1_VOCABULARY;
  readonly grammar = LESSON_1_GRAMMAR;
  readonly reading = READING_PASSAGE;
  readonly dialogue = LISTENING_DIALOGUE;
  readonly listeningQuestions = LISTENING_QUESTIONS;
  readonly categoryLabels = VOCABULARY_CATEGORY_LABELS;

  activeTab: LessonTab = 'vocabulary';
  vocabularyFilter: VocabularyFilter = 'all';
  vocabularySearch = '';
  activeVocabularyId?: string;
  expandedGrammarId = LESSON_1_GRAMMAR[0].id;
  showReadingTranslation = false;
  showListeningTranscript = false;
  listeningRate: 'normal' | 'slow' = 'normal';
  readingAnswers: Record<string, string> = {};
  listeningAnswers: Record<string, string> = {};
  readingChecked = false;
  listeningChecked = false;

  private currentAudio?: HTMLAudioElement;

  get vocabularyFilters(): Array<{ id: VocabularyFilter; label: string; count: number }> {
    return [
      { id: 'all', label: 'Tất cả', count: this.vocabulary.length },
      ...(
        Object.entries(this.categoryLabels) as Array<[VocabularyCategory, string]>
      ).map(([id, label]) => ({
        id,
        label,
        count: this.vocabulary.filter((item) => item.category === id).length,
      })),
    ];
  }

  get filteredVocabulary(): VocabularyItem[] {
    const query = this.vocabularySearch.trim().toLocaleLowerCase('vi');
    return this.vocabulary.filter((item) => {
      const inCategory = this.vocabularyFilter === 'all' || item.category === this.vocabularyFilter;
      const matchesSearch =
        !query ||
        [item.japanese, item.reading, item.meaning]
          .join(' ')
          .toLocaleLowerCase('vi')
          .includes(query);
      return inCategory && matchesSearch;
    });
  }

  get readingScore(): number {
    return this.reading.questions.filter(
      (question) => this.readingAnswers[question.id] === question.answer,
    ).length;
  }

  get listeningScore(): number {
    return this.listeningQuestions.filter(
      (question) => this.listeningAnswers[question.id] === question.answer,
    ).length;
  }

  ngOnDestroy(): void {
    this.currentAudio?.pause();
    this.speech.stop();
  }

  setTab(tab: LessonTab): void {
    this.activeTab = tab;
    if (tab === 'grammar') {
      this.progress.markGrammar(this.expandedGrammarId);
    }
  }

  setVocabularyFilter(filter: VocabularyFilter): void {
    this.vocabularyFilter = filter;
  }

  playVocabulary(item: VocabularyItem): void {
    this.activeVocabularyId = item.id;
    if (item.audioSrc) {
      this.speech.stop();
      this.currentAudio?.pause();
      this.currentAudio = new Audio(item.audioSrc);
      this.currentAudio.addEventListener(
        'ended',
        () => {
          this.activeVocabularyId = undefined;
        },
        { once: true },
      );
      void this.currentAudio.play();
      return;
    }

    this.speech.speak(item.reading.replaceAll('～', ''), 0.82);
    window.setTimeout(() => {
      if (this.activeVocabularyId === item.id) {
        this.activeVocabularyId = undefined;
      }
    }, 1800);
  }

  speakJapanese(text: string, rate = 0.82): void {
    this.speech.speak(text, rate);
  }

  toggleLearned(item: VocabularyItem): void {
    this.progress.toggleVocabulary(item.id);
  }

  toggleGrammar(point: GrammarPoint): void {
    this.expandedGrammarId = this.expandedGrammarId === point.id ? '' : point.id;
    this.progress.markGrammar(point.id);
  }

  checkReading(): void {
    this.readingChecked = true;
    this.progress.completeReading();
  }

  playListening(): void {
    this.speech.speakSequence(
      this.dialogue.map((line) => line.text),
      this.listeningRate === 'slow' ? 0.68 : 0.84,
    );
  }

  checkListening(): void {
    this.listeningChecked = true;
    this.progress.completeListening();
  }

  answerState(
    checked: boolean,
    selected: string | undefined,
    option: string,
    answer: string,
  ): Record<string, boolean> {
    return {
      'is-selected': selected === option,
      'is-correct': checked && option === answer,
      'is-wrong': checked && selected === option && option !== answer,
    };
  }

  resetProgress(): void {
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm('Xóa toàn bộ tiến độ Minna no Nihongo Bài 1 trên thiết bị này?');
    if (confirmed) {
      this.progress.reset();
      this.readingAnswers = {};
      this.listeningAnswers = {};
      this.readingChecked = false;
      this.listeningChecked = false;
    }
  }

  trackVocabulary(_: number, item: VocabularyItem): string {
    return item.id;
  }
}
