import { computed, Injectable, signal } from '@angular/core';

export interface HiraganaItemProgress {
  quizAttempts: number;
  quizCorrect: number;
  quizIncorrect: number;
  writingCompleted: number;
  lastResult: boolean | null;
  lastStudiedAt: string | null;
}

export interface HiraganaProgressState {
  version: 1;
  items: Record<string, HiraganaItemProgress>;
  activeDates: string[];
}

const STORAGE_KEY = 'viejap.hiragana-progress.v1';

function emptyState(): HiraganaProgressState {
  return { version: 1, items: {}, activeDates: [] };
}

function emptyItemProgress(): HiraganaItemProgress {
  return {
    quizAttempts: 0,
    quizCorrect: 0,
    quizIncorrect: 0,
    writingCompleted: 0,
    lastResult: null,
    lastStudiedAt: null,
  };
}

@Injectable({ providedIn: 'root' })
export class HiraganaProgressService {
  private readonly progressState = signal<HiraganaProgressState>(this.load());

  readonly state = this.progressState.asReadonly();
  readonly studiedCount = computed(
    () => Object.values(this.progressState().items).filter((item) => item.lastStudiedAt).length,
  );
  readonly masteredCount = computed(
    () =>
      Object.values(this.progressState().items).filter(
        (item) => item.quizAttempts >= 3 && item.quizCorrect / item.quizAttempts >= 0.8,
      ).length,
  );
  readonly weakIds = computed(() =>
    Object.entries(this.progressState().items)
      .filter(([, item]) => {
        const accuracy = item.quizAttempts ? item.quizCorrect / item.quizAttempts : 1;
        return item.lastResult === false || (item.quizAttempts > 0 && accuracy < 0.8);
      })
      .map(([id]) => id),
  );
  readonly streak = computed(() => this.calculateStreak(this.progressState().activeDates));

  recordQuiz(itemId: string, isCorrect: boolean): void {
    this.updateItem(itemId, (current) => ({
      ...current,
      quizAttempts: current.quizAttempts + 1,
      quizCorrect: current.quizCorrect + (isCorrect ? 1 : 0),
      quizIncorrect: current.quizIncorrect + (isCorrect ? 0 : 1),
      lastResult: isCorrect,
      lastStudiedAt: new Date().toISOString(),
    }));
  }

  recordWriting(itemId: string, completed: boolean): void {
    this.updateItem(itemId, (current) => ({
      ...current,
      writingCompleted: current.writingCompleted + (completed ? 1 : 0),
      lastResult: completed,
      lastStudiedAt: new Date().toISOString(),
    }));
  }

  reset(): void {
    this.progressState.set(emptyState());
    this.persist();
  }

  getItem(itemId: string): HiraganaItemProgress {
    return this.progressState().items[itemId] ?? emptyItemProgress();
  }

  private updateItem(
    itemId: string,
    updater: (current: HiraganaItemProgress) => HiraganaItemProgress,
  ): void {
    const state = this.progressState();
    const today = this.localDateKey(new Date());
    this.progressState.set({
      version: 1,
      items: {
        ...state.items,
        [itemId]: updater(state.items[itemId] ?? emptyItemProgress()),
      },
      activeDates: Array.from(new Set([...state.activeDates, today])).sort(),
    });
    this.persist();
  }

  private load(): HiraganaProgressState {
    if (typeof localStorage === 'undefined') {
      return emptyState();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return emptyState();
      }
      const parsed = JSON.parse(raw) as Partial<HiraganaProgressState>;
      if (parsed.version !== 1 || !parsed.items || !Array.isArray(parsed.activeDates)) {
        return emptyState();
      }
      return {
        version: 1,
        items: parsed.items as Record<string, HiraganaItemProgress>,
        activeDates: parsed.activeDates.filter((date): date is string => typeof date === 'string'),
      };
    } catch {
      return emptyState();
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progressState()));
    } catch {
      // The learning experience remains usable when storage is unavailable.
    }
  }

  private calculateStreak(activeDates: string[]): number {
    const active = new Set(activeDates);
    const cursor = new Date();
    const today = this.localDateKey(cursor);

    if (!active.has(today)) {
      cursor.setDate(cursor.getDate() - 1);
      if (!active.has(this.localDateKey(cursor))) {
        return 0;
      }
    }

    let streak = 0;
    while (active.has(this.localDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  private localDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export const HIRAGANA_PROGRESS_STORAGE_KEY = STORAGE_KEY;
