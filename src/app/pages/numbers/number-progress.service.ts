import { computed, Injectable, signal } from '@angular/core';
import { NumberGroup } from './japanese-number';

interface GroupProgress {
  attempts: number;
  correct: number;
  lastResult: boolean | null;
}

interface NumberProgressState {
  version: 1;
  groups: Partial<Record<NumberGroup, GroupProgress>>;
  activeDates: string[];
}

const STORAGE_KEY = 'viejap.number-progress.v1';
const emptyState = (): NumberProgressState => ({ version: 1, groups: {}, activeDates: [] });

@Injectable({ providedIn: 'root' })
export class NumberProgressService {
  private readonly progressState = signal<NumberProgressState>(this.load());

  readonly attempts = computed(() =>
    Object.values(this.progressState().groups).reduce(
      (total, group) => total + (group?.attempts ?? 0),
      0,
    ),
  );
  readonly correct = computed(() =>
    Object.values(this.progressState().groups).reduce(
      (total, group) => total + (group?.correct ?? 0),
      0,
    ),
  );
  readonly accuracy = computed(() =>
    this.attempts() ? Math.round((this.correct() / this.attempts()) * 100) : 0,
  );
  readonly masteredCount = computed(
    () =>
      Object.values(this.progressState().groups).filter(
        (group) => group && group.attempts >= 5 && group.correct / group.attempts >= 0.8,
      ).length,
  );
  readonly weakGroups = computed(() =>
    Object.entries(this.progressState().groups)
      .filter(([, group]) => {
        if (!group) {
          return false;
        }
        return group.lastResult === false || (group.attempts >= 3 && group.correct / group.attempts < 0.8);
      })
      .map(([group]) => group as NumberGroup),
  );
  readonly streak = computed(() => this.calculateStreak(this.progressState().activeDates));

  record(group: NumberGroup, isCorrect: boolean): void {
    const state = this.progressState();
    const current = state.groups[group] ?? { attempts: 0, correct: 0, lastResult: null };
    this.progressState.set({
      version: 1,
      groups: {
        ...state.groups,
        [group]: {
          attempts: current.attempts + 1,
          correct: current.correct + (isCorrect ? 1 : 0),
          lastResult: isCorrect,
        },
      },
      activeDates: Array.from(new Set([...state.activeDates, this.localDateKey(new Date())])).sort(),
    });
    this.persist();
  }

  reset(): void {
    this.progressState.set(emptyState());
    this.persist();
  }

  private load(): NumberProgressState {
    if (typeof localStorage === 'undefined') {
      return emptyState();
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as NumberProgressState;
      return parsed.version === 1 && parsed.groups && Array.isArray(parsed.activeDates)
        ? parsed
        : emptyState();
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
      // Practice remains available when browser storage is unavailable.
    }
  }

  private calculateStreak(activeDates: string[]): number {
    const active = new Set(activeDates);
    const cursor = new Date();
    if (!active.has(this.localDateKey(cursor))) {
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
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}

export const NUMBER_PROGRESS_STORAGE_KEY = STORAGE_KEY;
