import { computed, Injectable, signal } from '@angular/core';

interface LessonProgress {
  version: 1;
  learnedVocabulary: string[];
  grammarViewed: string[];
  readingCompleted: boolean;
  listeningCompleted: boolean;
}

const STORAGE_KEY = 'viejap.minna-lesson-1-progress.v1';
const emptyProgress = (): LessonProgress => ({
  version: 1,
  learnedVocabulary: [],
  grammarViewed: [],
  readingCompleted: false,
  listeningCompleted: false,
});

@Injectable({ providedIn: 'root' })
export class MinnaLesson1ProgressService {
  private readonly progress = signal<LessonProgress>(this.load());

  readonly state = this.progress.asReadonly();
  readonly learnedCount = computed(() => this.progress().learnedVocabulary.length);
  readonly completedSections = computed(
    () =>
      Number(this.progress().learnedVocabulary.length > 0) +
      Number(this.progress().grammarViewed.length > 0) +
      Number(this.progress().readingCompleted) +
      Number(this.progress().listeningCompleted),
  );

  toggleVocabulary(id: string): void {
    const current = this.progress();
    const learned = new Set(current.learnedVocabulary);
    learned.has(id) ? learned.delete(id) : learned.add(id);
    this.update({ learnedVocabulary: Array.from(learned) });
  }

  markGrammar(id: string): void {
    const current = this.progress();
    if (!current.grammarViewed.includes(id)) {
      this.update({ grammarViewed: [...current.grammarViewed, id] });
    }
  }

  completeReading(): void {
    this.update({ readingCompleted: true });
  }

  completeListening(): void {
    this.update({ listeningCompleted: true });
  }

  isVocabularyLearned(id: string): boolean {
    return this.progress().learnedVocabulary.includes(id);
  }

  reset(): void {
    this.progress.set(emptyProgress());
    this.persist();
  }

  private update(update: Partial<LessonProgress>): void {
    this.progress.set({ ...this.progress(), ...update });
    this.persist();
  }

  private load(): LessonProgress {
    if (typeof localStorage === 'undefined') {
      return emptyProgress();
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as LessonProgress;
      return parsed.version === 1 &&
        Array.isArray(parsed.learnedVocabulary) &&
        Array.isArray(parsed.grammarViewed)
        ? parsed
        : emptyProgress();
    } catch {
      return emptyProgress();
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress()));
    } catch {
      // The lesson remains usable when browser storage is unavailable.
    }
  }
}

export const MINNA_LESSON_1_PROGRESS_STORAGE_KEY = STORAGE_KEY;
