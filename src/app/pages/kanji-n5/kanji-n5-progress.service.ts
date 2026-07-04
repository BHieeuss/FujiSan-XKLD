import { computed, Injectable, signal } from '@angular/core';
import { KanjiN5Example, KanjiN5Item } from './kanji-n5.data';
import { KanjiStrokeData } from './kanji-n5-strokes.generated';

export type KanjiLearningStatus =
  | 'new'
  | 'learning'
  | 'almost_remembered'
  | 'remembered'
  | 'need_review';

export type KanjiFilterMode =
  | 'all'
  | KanjiLearningStatus
  | 'due'
  | 'favorite'
  | 'custom';

export interface KanjiLearningRecord {
  status: KanjiLearningStatus;
  hint_level: number;
  review_count: number;
  correct_count: number;
  wrong_count: number;
  last_reviewed_at?: string;
  next_review_at?: string;
  is_favorite: boolean;
}

export interface KanjiStudyRecord extends KanjiLearningRecord {
  id: string;
  kanji: string;
  meaning_vi: string;
  onyomi: string;
  kunyomi: string;
  jlpt_level: 'N5';
  examples: KanjiN5Example[];
  stroke_count: number;
  stroke_order_data?: KanjiStrokeData;
}

export interface KanjiStatusMeta {
  status: KanjiLearningStatus;
  label: string;
  shortLabel: string;
  icon: string;
  tone: 'slate' | 'blue' | 'gold' | 'green' | 'rose';
  description: string;
}

export interface KanjiReminderSettings {
  enabled: boolean;
  time: string;
  dailyLimit: number;
  levels: KanjiLearningStatus[];
  prioritizeNeedReview: boolean;
  useCustomList: boolean;
  lastReminderDate?: string;
}

export interface KanjiReviewHistoryEntry {
  id: string;
  kanji: string;
  result: 'remembered' | 'forgotten' | 'need_review';
  status: KanjiLearningStatus;
  reviewed_at: string;
}

interface KanjiN5ProgressV1 {
  version: 1;
  learnedKanji: string[];
}

interface KanjiN5Progress {
  version: 2;
  records: Record<string, KanjiLearningRecord>;
  customListIds: string[];
  studySessionIds: string[];
  reminder: KanjiReminderSettings;
  history: KanjiReviewHistoryEntry[];
}

const STORAGE_KEY = 'viejap.kanji-n5-progress.v2';
const LEGACY_STORAGE_KEY = 'viejap.kanji-n5-progress.v1';
const MAX_HISTORY = 40;

const STATUS_ORDER: KanjiLearningStatus[] = [
  'new',
  'learning',
  'almost_remembered',
  'remembered',
];

export const KANJI_STATUS_META: KanjiStatusMeta[] = [
  {
    status: 'new',
    label: 'Mới học',
    shortLabel: 'Mới',
    icon: 'fas fa-seedling',
    tone: 'slate',
    description: 'Hiện đầy đủ nét mờ để viết đè theo.',
  },
  {
    status: 'learning',
    label: 'Đang học',
    shortLabel: 'Đang học',
    icon: 'fas fa-pencil',
    tone: 'blue',
    description: 'Hiện khoảng 60-70% nét gợi ý.',
  },
  {
    status: 'almost_remembered',
    label: 'Sắp thuộc',
    shortLabel: 'Sắp thuộc',
    icon: 'fas fa-star-half-stroke',
    tone: 'gold',
    description: 'Chỉ hiện vài nét đầu để tự nhớ phần còn lại.',
  },
  {
    status: 'remembered',
    label: 'Đã thuộc',
    shortLabel: 'Đã thuộc',
    icon: 'fas fa-circle-check',
    tone: 'green',
    description: 'Không hiện nét gợi ý, tự viết lại từ trí nhớ.',
  },
  {
    status: 'need_review',
    label: 'Cần ôn lại',
    shortLabel: 'Cần ôn',
    icon: 'fas fa-rotate-left',
    tone: 'rose',
    description: 'Ưu tiên trong buổi ôn gần nhất và tăng gợi ý.',
  },
];

const emptyProgress = (): KanjiN5Progress => ({
  version: 2,
  records: {},
  customListIds: [],
  studySessionIds: [],
  reminder: {
    enabled: false,
    time: '20:00',
    dailyLimit: 10,
    levels: ['new', 'learning', 'almost_remembered', 'need_review'],
    prioritizeNeedReview: true,
    useCustomList: false,
  },
  history: [],
});

const defaultRecord = (): KanjiLearningRecord => ({
  status: 'new',
  hint_level: hintLevelForStatus('new'),
  review_count: 0,
  correct_count: 0,
  wrong_count: 0,
  is_favorite: false,
});

export function hintLevelForStatus(status: KanjiLearningStatus): number {
  switch (status) {
    case 'new':
      return 100;
    case 'learning':
      return 66;
    case 'almost_remembered':
      return 25;
    case 'remembered':
      return 0;
    case 'need_review':
      return 85;
  }
}

export function hintStrokeCount(strokeCount: number, status: KanjiLearningStatus): number {
  if (status === 'remembered') {
    return 0;
  }
  if (status === 'new') {
    return strokeCount;
  }
  if (status === 'almost_remembered') {
    return Math.max(1, Math.ceil(strokeCount * 0.25));
  }
  if (status === 'need_review') {
    return Math.max(1, Math.ceil(strokeCount * 0.85));
  }
  return Math.max(1, Math.ceil(strokeCount * 0.66));
}

@Injectable({ providedIn: 'root' })
export class KanjiN5ProgressService {
  private readonly progress = signal<KanjiN5Progress>(this.load());

  readonly state = this.progress.asReadonly();
  readonly learnedCount = computed(
    () =>
      Object.values(this.progress().records).filter((record) => record.status === 'remembered')
        .length,
  );

  recordFor(id: string): KanjiLearningRecord {
    return this.progress().records[id] ?? defaultRecord();
  }

  studyRecordFor(item: KanjiN5Item, strokeData?: KanjiStrokeData): KanjiStudyRecord {
    return {
      ...this.recordFor(item.id),
      id: item.id,
      kanji: item.kanji,
      meaning_vi: item.meaning,
      onyomi: item.onyomi,
      kunyomi: item.kunyomi,
      jlpt_level: 'N5',
      examples: item.examples,
      stroke_count: item.strokes,
      stroke_order_data: strokeData,
    };
  }

  isKanjiLearned(id: string): boolean {
    return this.recordFor(id).status === 'remembered';
  }

  isFavorite(id: string): boolean {
    return this.recordFor(id).is_favorite;
  }

  isInCustomList(id: string): boolean {
    return this.progress().customListIds.includes(id);
  }

  toggleKanji(id: string): void {
    this.setStatus(id, this.isKanjiLearned(id) ? 'new' : 'remembered');
  }

  markKanji(id: string): void {
    this.markRemembered(id);
  }

  markRemembered(id: string, kanji = ''): void {
    this.review(id, kanji, 'remembered');
  }

  markForgotten(id: string, kanji = ''): void {
    this.review(id, kanji, 'forgotten');
  }

  markNeedReview(id: string, kanji = ''): void {
    this.review(id, kanji, 'need_review');
  }

  setStatus(id: string, status: KanjiLearningStatus): void {
    const record = this.recordFor(id);
    this.updateRecord(id, {
      ...record,
      status,
      hint_level: hintLevelForStatus(status),
      next_review_at: this.nextReviewDate(status).toISOString(),
    });
  }

  toggleFavorite(id: string): void {
    const record = this.recordFor(id);
    this.updateRecord(id, { ...record, is_favorite: !record.is_favorite });
  }

  toggleCustomKanji(id: string): void {
    const current = this.progress();
    const custom = new Set(current.customListIds);
    custom.has(id) ? custom.delete(id) : custom.add(id);
    this.update({ customListIds: Array.from(custom) });
  }

  setCustomList(ids: string[]): void {
    this.update({ customListIds: Array.from(new Set(ids)) });
  }

  setStudySession(ids: string[]): void {
    this.update({ studySessionIds: Array.from(new Set(ids)) });
  }

  clearStudySession(): void {
    this.update({ studySessionIds: [] });
  }

  updateReminder(settings: Partial<KanjiReminderSettings>): void {
    this.update({ reminder: { ...this.progress().reminder, ...settings } });
  }

  dueItems(items: KanjiN5Item[], now = new Date()): KanjiN5Item[] {
    return items
      .filter((item) => this.isDue(item.id, now))
      .sort((left, right) => this.reviewPriority(left.id) - this.reviewPriority(right.id));
  }

  filteredItems(items: KanjiN5Item[], filter: KanjiFilterMode, query: string): KanjiN5Item[] {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const record = this.recordFor(item.id);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'due' && this.isDue(item.id)) ||
        (filter === 'favorite' && record.is_favorite) ||
        (filter === 'custom' && this.isInCustomList(item.id)) ||
        record.status === filter;
      if (!matchesFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return [item.kanji, item.meaning, item.hanViet, item.onyomi, item.kunyomi]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }

  statusCounts(items: KanjiN5Item[]): Record<KanjiLearningStatus, number> {
    return KANJI_STATUS_META.reduce(
      (counts, meta) => ({
        ...counts,
        [meta.status]: items.filter((item) => this.recordFor(item.id).status === meta.status)
          .length,
      }),
      {} as Record<KanjiLearningStatus, number>,
    );
  }

  completionPercent(items: KanjiN5Item[]): number {
    if (!items.length) {
      return 0;
    }
    const remembered = items.filter((item) => this.recordFor(item.id).status === 'remembered');
    return Math.round((remembered.length / items.length) * 100);
  }

  nextReviewLabel(id: string): string {
    const next = this.recordFor(id).next_review_at;
    if (!next) {
      return 'Chưa có lịch ôn';
    }
    const date = new Date(next);
    if (Number.isNaN(date.getTime())) {
      return 'Chưa có lịch ôn';
    }
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  statusMeta(status: KanjiLearningStatus): KanjiStatusMeta {
    return KANJI_STATUS_META.find((meta) => meta.status === status) ?? KANJI_STATUS_META[0];
  }

  async requestReminderPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission === 'denied') {
      return false;
    }
    return (await Notification.requestPermission()) === 'granted';
  }

  notifyReviewIfDue(items: KanjiN5Item[], now = new Date()): void {
    const reminder = this.progress().reminder;
    if (!reminder.enabled || reminder.lastReminderDate === this.dayKey(now)) {
      return;
    }
    const [hour, minute] = reminder.time.split(':').map((part) => Number(part));
    if (now.getHours() < hour || (now.getHours() === hour && now.getMinutes() < minute)) {
      return;
    }
    const due = this.reminderItems(items, now);
    if (!due.length) {
      return;
    }
    const message = `Đến giờ ôn Kanji rồi. Hôm nay bạn có ${due.length} chữ cần ôn.`;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('VieJap Kanji', { body: message });
    }
    this.updateReminder({ lastReminderDate: this.dayKey(now) });
  }

  reminderItems(items: KanjiN5Item[], now = new Date()): KanjiN5Item[] {
    const reminder = this.progress().reminder;
    const source = reminder.useCustomList
      ? items.filter((item) => this.isInCustomList(item.id))
      : items;
    const filtered = source.filter((item) => {
      const status = this.recordFor(item.id).status;
      return reminder.levels.includes(status) || (reminder.prioritizeNeedReview && status === 'need_review');
    });
    const due = this.dueItems(filtered, now);
    return due.slice(0, Math.max(1, reminder.dailyLimit));
  }

  reset(): void {
    this.progress.set(emptyProgress());
    this.persist();
  }

  private review(id: string, kanji: string, result: KanjiReviewHistoryEntry['result']): void {
    const current = this.recordFor(id);
    const status =
      result === 'remembered'
        ? this.promoteStatus(current)
        : result === 'forgotten'
          ? this.demoteStatus(current)
          : 'need_review';
    const now = new Date();
    const nextRecord: KanjiLearningRecord = {
      ...current,
      status,
      hint_level: hintLevelForStatus(status),
      review_count: current.review_count + 1,
      correct_count: current.correct_count + (result === 'remembered' ? 1 : 0),
      wrong_count: current.wrong_count + (result !== 'remembered' ? 1 : 0),
      last_reviewed_at: now.toISOString(),
      next_review_at: this.nextReviewDate(status, now).toISOString(),
    };
    const historyEntry: KanjiReviewHistoryEntry = {
      id,
      kanji,
      result,
      status,
      reviewed_at: now.toISOString(),
    };
    this.updateRecord(id, nextRecord, historyEntry);
  }

  private promoteStatus(record: KanjiLearningRecord): KanjiLearningStatus {
    if (record.status === 'need_review') {
      return 'learning';
    }
    const index = STATUS_ORDER.indexOf(record.status);
    if (index < 0) {
      return 'learning';
    }
    if (record.status === 'learning' && record.correct_count < 1) {
      return 'learning';
    }
    if (record.status === 'almost_remembered' && record.correct_count < 2) {
      return 'almost_remembered';
    }
    return STATUS_ORDER[Math.min(index + 1, STATUS_ORDER.length - 1)];
  }

  private demoteStatus(record: KanjiLearningRecord): KanjiLearningStatus {
    if (record.wrong_count >= 1 || record.status === 'new') {
      return 'need_review';
    }
    if (record.status === 'remembered') {
      return 'almost_remembered';
    }
    if (record.status === 'almost_remembered') {
      return 'learning';
    }
    return 'new';
  }

  private isDue(id: string, now = new Date()): boolean {
    const record = this.recordFor(id);
    if (record.status === 'need_review') {
      return true;
    }
    if (!record.next_review_at) {
      return false;
    }
    return new Date(record.next_review_at).getTime() <= now.getTime();
  }

  private reviewPriority(id: string): number {
    const record = this.recordFor(id);
    if (record.status === 'need_review') {
      return 0;
    }
    if (!record.next_review_at) {
      return 9_999_999_999;
    }
    return new Date(record.next_review_at).getTime();
  }

  private nextReviewDate(status: KanjiLearningStatus, base = new Date()): Date {
    const next = new Date(base);
    if (status === 'need_review') {
      next.setHours(next.getHours() + 6);
      return next;
    }
    const days =
      status === 'new' ? 1 : status === 'learning' ? 3 : status === 'almost_remembered' ? 7 : 21;
    next.setDate(next.getDate() + days);
    return next;
  }

  private updateRecord(
    id: string,
    record: KanjiLearningRecord,
    historyEntry?: KanjiReviewHistoryEntry,
  ): void {
    const current = this.progress();
    this.progress.set({
      ...current,
      records: {
        ...current.records,
        [id]: record,
      },
      history: historyEntry ? [historyEntry, ...current.history].slice(0, MAX_HISTORY) : current.history,
    });
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
      if (parsed.version === 2 && parsed.records && parsed.reminder) {
        return {
          ...emptyProgress(),
          ...parsed,
          reminder: { ...emptyProgress().reminder, ...parsed.reminder },
        };
      }
    } catch {
      // Fall through to legacy migration.
    }

    return this.loadLegacyProgress();
  }

  private loadLegacyProgress(): KanjiN5Progress {
    if (typeof localStorage === 'undefined') {
      return emptyProgress();
    }

    try {
      const parsed = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? '') as KanjiN5ProgressV1;
      if (parsed.version !== 1 || !Array.isArray(parsed.learnedKanji)) {
        return emptyProgress();
      }
      const records = Object.fromEntries(
        parsed.learnedKanji.map((id) => [
          id,
          {
            ...defaultRecord(),
            status: 'remembered',
            hint_level: hintLevelForStatus('remembered'),
            correct_count: 1,
            review_count: 1,
          } satisfies KanjiLearningRecord,
        ]),
      );
      return { ...emptyProgress(), records };
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

  private dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}

export const KANJI_N5_PROGRESS_STORAGE_KEY = STORAGE_KEY;
