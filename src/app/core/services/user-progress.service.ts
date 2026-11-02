import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserAuthService } from './user-auth.service';

export interface UserProgressDto {
  userId: string;
  learnedItemIds: number[];
  forgottenItemIds: number[];
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProgressService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(UserAuthService);

  private readonly LOCAL_LEARNED_KEY = 'viejap.progress.learned';
  private readonly LOCAL_FORGOTTEN_KEY = 'viejap.progress.forgotten';

  // State signals
  private readonly _learnedItemIds = signal<number[]>(this.getStoredIds(this.LOCAL_LEARNED_KEY));
  private readonly _forgottenItemIds = signal<number[]>(this.getStoredIds(this.LOCAL_FORGOTTEN_KEY));
  private readonly _isSyncing = signal<boolean>(false);
  private readonly _lastSyncedAt = signal<Date | null>(null);

  readonly learnedItemIds = this._learnedItemIds.asReadonly();
  readonly forgottenItemIds = this._forgottenItemIds.asReadonly();
  readonly isSyncing = this._isSyncing.asReadonly();
  readonly lastSyncedAt = this._lastSyncedAt.asReadonly();

  constructor() {
    // Tự động tải / đồng bộ khi trạng thái đăng nhập thay đổi
    effect(() => {
      if (this.auth.isLoggedIn()) {
        void this.fetchProgressFromBackend();
      }
    });
  }

  /**
   * Đánh dấu 1 bài học / từ vựng đã học thuộc
   */
  async markAsLearned(itemId: number): Promise<void> {
    const currentLearned = new Set(this._learnedItemIds());
    const currentForgotten = new Set(this._forgottenItemIds());

    currentLearned.add(itemId);
    currentForgotten.delete(itemId);

    this.updateLocalState(Array.from(currentLearned), Array.from(currentForgotten));

    if (this.auth.isLoggedIn()) {
      await this.syncToBackend();
    }
  }

  /**
   * Đánh dấu 1 bài học / từ vựng đã quên (cần ôn lại)
   */
  async markAsForgotten(itemId: number): Promise<void> {
    const currentLearned = new Set(this._learnedItemIds());
    const currentForgotten = new Set(this._forgottenItemIds());

    currentForgotten.add(itemId);
    currentLearned.delete(itemId);

    this.updateLocalState(Array.from(currentLearned), Array.from(currentForgotten));

    if (this.auth.isLoggedIn()) {
      await this.syncToBackend();
    }
  }

  /**
   * Kiểm tra xem 1 item đã được học chưa
   */
  isLearned(itemId: number): boolean {
    return this._learnedItemIds().includes(itemId);
  }

  /**
   * Kiểm tra xem 1 item có trong danh sách cần ôn tập không
   */
  isForgotten(itemId: number): boolean {
    return this._forgottenItemIds().includes(itemId);
  }

  /**
   * Tải tiến độ từ backend về khi user đăng nhập
   */
  async fetchProgressFromBackend(): Promise<void> {
    if (!this.auth.isLoggedIn()) return;

    this._isSyncing.set(true);
    try {
      const res = await firstValueFrom(this.http.get<UserProgressDto>('/api/progress'));
      if (res) {
        // Hợp nhất dữ liệu local và dữ liệu từ server
        const mergedLearned = Array.from(new Set([...this._learnedItemIds(), ...res.learnedItemIds]));
        const mergedForgotten = Array.from(new Set([...this._forgottenItemIds(), ...res.forgottenItemIds]))
          .filter(id => !mergedLearned.includes(id));

        this.updateLocalState(mergedLearned, mergedForgotten);
        this._lastSyncedAt.set(new Date(res.updatedAt));

        // Đẩy dữ liệu hợp nhất lên server nếu có thay đổi từ local
        if (mergedLearned.length !== res.learnedItemIds.length || mergedForgotten.length !== res.forgottenItemIds.length) {
          await this.syncToBackend();
        }
      }
    } catch (err) {
      console.warn('Không thể tải tiến độ từ máy chủ, sử dụng dữ liệu cục bộ:', err);
    } finally {
      this._isSyncing.set(false);
    }
  }

  /**
   * Đồng bộ mảng tiến độ lên backend
   */
  private async syncToBackend(): Promise<void> {
    if (!this.auth.isLoggedIn()) return;

    this._isSyncing.set(true);
    try {
      const payload = {
        learnedItemIds: this._learnedItemIds(),
        forgottenItemIds: this._forgottenItemIds(),
      };
      const res = await firstValueFrom(this.http.post<UserProgressDto>('/api/progress', payload));
      if (res) {
        this._lastSyncedAt.set(new Date(res.updatedAt));
      }
    } catch (err) {
      console.warn('Lỗi khi đồng bộ tiến độ lên máy chủ:', err);
    } finally {
      this._isSyncing.set(false);
    }
  }

  private updateLocalState(learned: number[], forgotten: number[]): void {
    this._learnedItemIds.set(learned);
    this._forgottenItemIds.set(forgotten);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.LOCAL_LEARNED_KEY, JSON.stringify(learned));
      window.localStorage.setItem(this.LOCAL_FORGOTTEN_KEY, JSON.stringify(forgotten));
    }
  }

  private getStoredIds(key: string): number[] {
    if (typeof window === 'undefined') return [];
    const json = window.localStorage.getItem(key);
    if (!json) return [];
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
}
