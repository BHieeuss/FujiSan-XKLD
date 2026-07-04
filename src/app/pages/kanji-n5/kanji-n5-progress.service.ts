import { computed, Injectable, signal } from '@angular/core';

interface KanjiN5Progress {
  version: 1;
  learnedKanji: string[];
}

const STORAGE_KEY = 'viejap.kanji-n5-progress.v1';
const emptyProgress = (): KanjiN5Progress => ({
  version: 1,
  learnedKanji: [],
});

@Injectable({ providedIn: 'root' })
export class KanjiN5ProgressService {
  private readonly progress = signal<KanjiN5Progress>(this.load());

  readonly state = this.progress.asReadonly();
  readonly learnedCount = computed(() => this.progress().learnedKanji.length);

  toggleKanji(id: string): void {
    const current = this.progress();
    const learned = new Set(current.learnedKanji);
    learned.has(id) ? learned.delete(id) : learned.add(id);
    this.update({ learnedKanji: Array.from(learned) });
  }

  markKanji(id: string): void {
    const current = this.progress();
    if (!current.learnedKanji.includes(id)) {
      this.update({ learnedKanji: [...current.learnedKanji, id] });
    }
  }

  isKanjiLearned(id: string): boolean {
    return this.progress().learnedKanji.includes(id);
  }

  reset(): void {
    this.progress.set(emptyProgress());
    this.persist();
  }

  private update(update: Partial<KanjiN5Progress>): void {
    this.progress.set({ ...this.progress(), ...update });
    this.persist();
  }

  private load(): KanjiN5Progress {
    if (typeof localStorage === 'undefined') {
      return emptyProgress();
    }

    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as KanjiN5Progress;
      return parsed.version === 1 && Array.isArray(parsed.learnedKanji)
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
      // The page remains usable when browser storage is unavailable.
    }
  }
}

export const KANJI_N5_PROGRESS_STORAGE_KEY = STORAGE_KEY;
