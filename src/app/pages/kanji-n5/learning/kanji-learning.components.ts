import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KanjiN5Item, KanjiN5Lesson } from '../kanji-n5.data';
import {
  KANJI_STATUS_META,
  KanjiFilterMode,
  KanjiLearningRecord,
  KanjiLearningStatus,
  KanjiN5ProgressService,
} from '../kanji-n5-progress.service';
import { KanjiStrokeData } from '../kanji-n5-strokes.generated';
import { KanjiWritingCanvasComponent } from './kanji-writing-canvas.component';

@Component({
  selector: 'app-kanji-level-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="smart-filter">
      <label class="smart-search">
        <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
        <input
          type="search"
          [ngModel]="query"
          (ngModelChange)="queryChange.emit($event)"
          placeholder="Tìm Kanji, nghĩa, âm On, âm Kun"
          aria-label="Tìm kiếm Kanji"
        />
      </label>

      <div class="smart-filter-row" aria-label="Bộ lọc trạng thái Kanji">
        <button
          type="button"
          *ngFor="let option of filterOptions"
          [class.active]="filter === option.value"
          (click)="filterChange.emit(option.value)"
        >
          <i [class]="option.icon" aria-hidden="true"></i>
          <span>{{ option.label }}</span>
          <b>{{ countFor(option.value) }}</b>
        </button>
      </div>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiLevelFilterComponent {
  @Input() filter: KanjiFilterMode = 'all';
  @Input() query = '';
  @Input() counts: Partial<Record<KanjiFilterMode, number>> = {};
  @Output() filterChange = new EventEmitter<KanjiFilterMode>();
  @Output() queryChange = new EventEmitter<string>();

  readonly filterOptions: { value: KanjiFilterMode; label: string; icon: string }[] = [
    { value: 'all', label: 'Tất cả', icon: 'fas fa-layer-group' },
    { value: 'new', label: 'Mới học', icon: 'fas fa-seedling' },
    { value: 'learning', label: 'Đang học', icon: 'fas fa-pencil' },
    { value: 'almost_remembered', label: 'Sắp thuộc', icon: 'fas fa-star-half-stroke' },
    { value: 'remembered', label: 'Đã thuộc', icon: 'fas fa-circle-check' },
    { value: 'need_review', label: 'Cần ôn lại', icon: 'fas fa-rotate-left' },
    { value: 'due', label: 'Cần ôn hôm nay', icon: 'fas fa-bell' },
    { value: 'favorite', label: 'Yêu thích', icon: 'fas fa-star' },
    { value: 'custom', label: 'Tự chọn', icon: 'fas fa-bookmark' },
  ];

  countFor(filter: KanjiFilterMode): number {
    return this.counts[filter] ?? 0;
  }
}

@Component({
  selector: 'app-kanji-status-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="status-selector" [ngClass]="'status-' + record.status">
      <div>
        <span>Trạng thái</span>
        <strong>
          <i [class]="meta(record.status).icon" aria-hidden="true"></i>
          {{ meta(record.status).label }}
        </strong>
      </div>

      <div class="status-actions">
        <button type="button" class="remember" (click)="remember.emit()">
          <i class="fas fa-check"></i>
          <span>Đã nhớ</span>
        </button>
        <button type="button" (click)="forgot.emit()">
          <i class="fas fa-rotate-left"></i>
          <span>Chưa nhớ</span>
        </button>
        <button type="button" class="review" (click)="needReview.emit()">
          <i class="fas fa-bell"></i>
          <span>Cần ôn lại</span>
        </button>
        <button type="button" class="favorite" [class.active]="record.is_favorite" (click)="favorite.emit()">
          <i class="fas fa-star"></i>
          <span>{{ record.is_favorite ? 'Đã yêu thích' : 'Thêm yêu thích' }}</span>
        </button>
      </div>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiStatusSelectorComponent {
  @Input({ required: true }) record!: KanjiLearningRecord;
  @Output() remember = new EventEmitter<void>();
  @Output() forgot = new EventEmitter<void>();
  @Output() needReview = new EventEmitter<void>();
  @Output() favorite = new EventEmitter<void>();

  readonly progress = inject(KanjiN5ProgressService);

  meta(status: KanjiLearningStatus) {
    return this.progress.statusMeta(status);
  }
}

@Component({
  selector: 'app-kanji-info-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="smart-info-card" [ngClass]="'status-' + record.status">
      <div class="smart-info-kanji">
        <span>Số {{ order }}</span>
        <strong lang="ja">{{ item.kanji }}</strong>
      </div>

      <div class="smart-info-copy">
        <div class="smart-info-heading">
          <span>
            <i [class]="meta(record.status).icon" aria-hidden="true"></i>
            {{ meta(record.status).label }}
          </span>
          <b>{{ item.hanViet | uppercase }}</b>
        </div>
        <h3>{{ item.meaning }}</h3>
        <dl>
          <div>
            <dt>Âm On</dt>
            <dd lang="ja">{{ item.onyomi }}</dd>
          </div>
          <div>
            <dt>Âm Kun</dt>
            <dd lang="ja">{{ item.kunyomi }}</dd>
          </div>
          <div>
            <dt>Số nét</dt>
            <dd>{{ item.strokes }}</dd>
          </div>
          <div>
            <dt>Gợi ý</dt>
            <dd>{{ record.hint_level }}%</dd>
          </div>
        </dl>
        <p class="next-review">{{ nextReviewLabel }}</p>
      </div>
    </article>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiInfoCardComponent {
  @Input({ required: true }) item!: KanjiN5Item;
  @Input({ required: true }) record!: KanjiLearningRecord;
  @Input() order = 0;

  readonly progress = inject(KanjiN5ProgressService);

  get nextReviewLabel(): string {
    return `Ôn tiếp: ${this.progress.nextReviewLabel(this.item.id)}`;
  }

  meta(status: KanjiLearningStatus) {
    return this.progress.statusMeta(status);
  }
}

@Component({
  selector: 'app-kanji-list-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, KanjiLevelFilterComponent],
  template: `
    <section class="smart-screen">
      <header class="smart-section-head">
        <div>
          <span>Học Kanji</span>
          <h3>Chọn chữ muốn luyện</h3>
        </div>
        <button type="button" class="smart-primary" [disabled]="!selectedIds.length" (click)="startSelected()">
          <i class="fas fa-play"></i>
          <span>Luyện {{ selectedIds.length || '' }} chữ</span>
        </button>
      </header>

      <app-kanji-level-filter
        [filter]="filter"
        [query]="query"
        [counts]="counts()"
        (filterChange)="filter = $event"
        (queryChange)="query = $event"
      ></app-kanji-level-filter>

      <div class="smart-list-tools">
        <span>{{ filteredItems().length }} chữ phù hợp</span>
        <div>
          <button type="button" (click)="selectFiltered()">Chọn kết quả lọc</button>
          <button type="button" (click)="clearSelection()">Bỏ chọn</button>
        </div>
      </div>

      <div class="smart-kanji-list">
        <article
          *ngFor="let item of filteredItems(); trackBy: trackKanji"
          class="smart-kanji-card"
          [class.selected]="selectedIds.includes(item.id)"
          [ngClass]="'status-' + record(item).status"
        >
          <label>
            <input
              type="checkbox"
              [checked]="selectedIds.includes(item.id)"
              (change)="toggleSelected(item.id)"
              [attr.aria-label]="'Chọn ' + item.kanji"
            />
            <span class="card-order">{{ orderFor(item) }}</span>
          </label>

          <button type="button" class="card-main" (click)="practice.emit(item)">
            <small>{{ item.hanViet }}</small>
            <strong lang="ja">{{ item.kanji }}</strong>
            <span>{{ item.meaning }}</span>
          </button>

          <div class="card-meta">
            <span>
              <i [class]="meta(item).icon" aria-hidden="true"></i>
              {{ meta(item).shortLabel }}
            </span>
            <b>{{ record(item).hint_level }}%</b>
          </div>

          <div class="card-actions">
            <button type="button" [class.active]="progress.isFavorite(item.id)" (click)="progress.toggleFavorite(item.id)">
              <i class="fas fa-star"></i>
            </button>
            <button type="button" [class.active]="progress.isInCustomList(item.id)" (click)="progress.toggleCustomKanji(item.id)">
              <i class="fas fa-bookmark"></i>
            </button>
          </div>
        </article>
      </div>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiListScreenComponent {
  @Input() items: KanjiN5Item[] = [];
  @Input() orderById = new Map<string, number>();
  @Output() practice = new EventEmitter<KanjiN5Item>();
  @Output() startSession = new EventEmitter<string[]>();

  readonly progress = inject(KanjiN5ProgressService);
  readonly statusMeta = KANJI_STATUS_META;

  filter: KanjiFilterMode = 'all';
  query = '';
  selectedIds: string[] = [];

  filteredItems(): KanjiN5Item[] {
    this.progress.state();
    return this.progress.filteredItems(this.items, this.filter, this.query);
  }

  counts(): Partial<Record<KanjiFilterMode, number>> {
    const statusCounts = this.progress.statusCounts(this.items);
    return {
      all: this.items.length,
      ...statusCounts,
      due: this.progress.dueItems(this.items).length,
      favorite: this.items.filter((item) => this.progress.isFavorite(item.id)).length,
      custom: this.items.filter((item) => this.progress.isInCustomList(item.id)).length,
    };
  }

  record(item: KanjiN5Item): KanjiLearningRecord {
    return this.progress.recordFor(item.id);
  }

  meta(item: KanjiN5Item) {
    return this.progress.statusMeta(this.record(item).status);
  }

  orderFor(item: KanjiN5Item): number {
    return this.orderById.get(item.id) ?? 0;
  }

  toggleSelected(id: string): void {
    this.selectedIds = this.selectedIds.includes(id)
      ? this.selectedIds.filter((selectedId) => selectedId !== id)
      : [...this.selectedIds, id];
  }

  selectFiltered(): void {
    this.selectedIds = Array.from(new Set([...this.selectedIds, ...this.filteredItems().map((item) => item.id)]));
  }

  clearSelection(): void {
    this.selectedIds = [];
  }

  startSelected(): void {
    this.progress.setStudySession(this.selectedIds);
    this.startSession.emit(this.selectedIds);
  }

  trackKanji(_: number, item: KanjiN5Item): string {
    return item.id;
  }
}

@Component({
  selector: 'app-kanji-practice-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KanjiInfoCardComponent,
    KanjiStatusSelectorComponent,
    KanjiWritingCanvasComponent,
  ],
  template: `
    <section class="smart-screen" *ngIf="currentItem as item">
      <header class="smart-section-head">
        <div>
          <span>Luyện viết</span>
          <h3>Chọn chữ theo từng bài</h3>
        </div>
        <div class="smart-practice-nav">
          <button type="button" (click)="move(-1)" [disabled]="selectedLessonItems.length < 2">
            <i class="fas fa-chevron-left"></i>
            <span>Trước</span>
          </button>
          <button type="button" (click)="move(1)" [disabled]="selectedLessonItems.length < 2">
            <span>Sau</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </header>

      <div class="practice-select-grid" *ngIf="lessons.length">
        <label class="practice-select">
          <span>Bài luyện</span>
          <select [ngModel]="selectedLessonSlug" (ngModelChange)="selectLesson($event)">
            <option *ngFor="let lesson of lessons; trackBy: trackLesson" [value]="lesson.slug">
              Bài {{ lesson.number }} - {{ lesson.title }}
            </option>
          </select>
        </label>

        <label class="practice-select">
          <span>Chữ luyện</span>
          <select [ngModel]="selectedKanjiId" (ngModelChange)="selectKanjiId($event)">
            <option *ngFor="let kanji of selectedLessonItems; trackBy: trackKanji" [value]="kanji.id">
              {{ orderFor(kanji) }}. {{ kanji.kanji }} - {{ kanji.hanViet | uppercase }} - {{ kanji.meaning }}
            </option>
          </select>
        </label>
      </div>

      <div class="smart-practice-grid">
        <div class="smart-practice-left">
          <app-kanji-info-card
            [item]="item"
            [record]="record(item)"
            [order]="orderFor(item)"
          ></app-kanji-info-card>

          <section class="smart-example-card">
            <h4>Từ vựng liên quan</h4>
            <article *ngFor="let example of item.examples; trackBy: trackExample">
              <strong lang="ja">{{ example.word }}</strong>
              <span lang="ja">{{ example.reading }}</span>
              <p>{{ example.meaning }}</p>
            </article>
            <p class="sentence" *ngIf="item.examples[0]">
              Câu ngắn: <b lang="ja">{{ item.examples[0].word }}を 書きます。</b>
            </p>
          </section>

          <app-kanji-status-selector
            [record]="record(item)"
            (remember)="remember(item)"
            (forgot)="forgot(item)"
            (needReview)="needReview(item)"
            (favorite)="progress.toggleFavorite(item.id)"
          ></app-kanji-status-selector>
        </div>

        <app-kanji-writing-canvas
          class="smart-practice-canvas"
          [kanji]="item.kanji"
          [strokeData]="strokeDataFor(item)"
          [status]="record(item).status"
          [hintLevel]="record(item).hint_level"
        ></app-kanji-writing-canvas>
      </div>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiPracticeScreenComponent implements OnChanges {
  @Input() items: KanjiN5Item[] = [];
  @Input() lessons: KanjiN5Lesson[] = [];
  @Input() activeItem?: KanjiN5Item;
  @Input() orderById = new Map<string, number>();
  @Input() strokes: Record<string, KanjiStrokeData> = {};
  @Output() selected = new EventEmitter<KanjiN5Item>();

  readonly progress = inject(KanjiN5ProgressService);
  selectedLessonSlug = '';
  selectedKanjiId = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeItem'] || changes['items'] || changes['lessons']) {
      this.syncSelection();
    }
  }

  get selectedLesson(): KanjiN5Lesson | undefined {
    return (
      this.lessons.find((lesson) => lesson.slug === this.selectedLessonSlug) ??
      this.lessons.find((lesson) => lesson.items.some((item) => item.id === this.activeItem?.id)) ??
      this.lessons[0]
    );
  }

  get selectedLessonItems(): KanjiN5Item[] {
    return this.selectedLesson?.items ?? this.items;
  }

  get currentItem(): KanjiN5Item | undefined {
    return (
      this.selectedLessonItems.find((item) => item.id === this.selectedKanjiId) ??
      this.selectedLessonItems.find((item) => item.id === this.activeItem?.id) ??
      this.selectedLessonItems[0] ??
      this.items.find((item) => item.id === this.activeItem?.id) ??
      this.items[0] ??
      this.activeItem
    );
  }

  selectLesson(slug: string): void {
    const lesson = this.lessons.find((item) => item.slug === slug);
    if (!lesson) {
      return;
    }
    this.selectedLessonSlug = lesson.slug;
    this.selectedKanjiId = lesson.items[0]?.id ?? '';
    const next = lesson.items[0];
    if (next) {
      this.selected.emit(next);
    }
  }

  selectKanjiId(id: string): void {
    this.selectedKanjiId = id;
    const item = this.selectedLessonItems.find((candidate) => candidate.id === id);
    if (item) {
      this.selected.emit(item);
    }
  }

  record(item: KanjiN5Item): KanjiLearningRecord {
    return this.progress.recordFor(item.id);
  }

  orderFor(item: KanjiN5Item): number {
    return this.orderById.get(item.id) ?? 0;
  }

  strokeDataFor(item: KanjiN5Item): KanjiStrokeData | undefined {
    return this.strokes[item.kanji];
  }

  move(offset: number): void {
    const current = this.currentItem;
    const pool = this.selectedLessonItems.length ? this.selectedLessonItems : this.items;
    if (!current || !pool.length) {
      return;
    }
    const index = Math.max(pool.findIndex((item) => item.id === current.id), 0);
    const next = pool[(index + offset + pool.length) % pool.length];
    this.selectedKanjiId = next.id;
    this.selected.emit(next);
  }

  remember(item: KanjiN5Item): void {
    this.progress.markRemembered(item.id, item.kanji);
  }

  forgot(item: KanjiN5Item): void {
    this.progress.markForgotten(item.id, item.kanji);
  }

  needReview(item: KanjiN5Item): void {
    this.progress.markNeedReview(item.id, item.kanji);
  }

  trackExample(index: number): number {
    return index;
  }

  trackLesson(_: number, lesson: KanjiN5Lesson): string {
    return lesson.slug;
  }

  trackKanji(_: number, item: KanjiN5Item): string {
    return item.id;
  }

  private syncSelection(): void {
    const active = this.activeItem ?? this.items[0] ?? this.lessons[0]?.items[0];
    const activeLesson =
      this.lessons.find((lesson) => lesson.items.some((item) => item.id === active?.id)) ??
      this.selectedLesson ??
      this.lessons[0];

    if (!this.selectedLessonSlug || activeLesson?.items.some((item) => item.id === active?.id)) {
      this.selectedLessonSlug = activeLesson?.slug ?? '';
    }

    const pool = this.selectedLessonItems;
    if (!pool.some((item) => item.id === this.selectedKanjiId)) {
      this.selectedKanjiId =
        pool.find((item) => item.id === active?.id)?.id ?? pool[0]?.id ?? active?.id ?? '';
    }
  }
}

@Component({
  selector: 'app-kanji-review-screen',
  standalone: true,
  imports: [
    CommonModule,
    KanjiInfoCardComponent,
    KanjiStatusSelectorComponent,
    KanjiWritingCanvasComponent,
  ],
  template: `
    <section class="smart-screen">
      <header class="smart-section-head">
        <div>
          <span>Ôn tập hôm nay</span>
          <h3>{{ dueItems().length }} chữ cần ôn</h3>
        </div>
        <button type="button" class="smart-primary" [disabled]="!dueItems().length" (click)="startReview()">
          <i class="fas fa-play"></i>
          <span>Bắt đầu ôn tập</span>
        </button>
      </header>

      <div class="review-summary">
        <article>
          <span>Tổng cần ôn</span>
          <strong>{{ dueItems().length }}</strong>
        </article>
        <article>
          <span>Mới học</span>
          <strong>{{ dueCount('new') }}</strong>
        </article>
        <article>
          <span>Đang học</span>
          <strong>{{ dueCount('learning') }}</strong>
        </article>
        <article>
          <span>Cần ôn lại</span>
          <strong>{{ dueCount('need_review') }}</strong>
        </article>
      </div>

      <div class="review-empty" *ngIf="!reviewStarted && !dueItems().length">
        <i class="fas fa-circle-check"></i>
        <p>Hôm nay chưa có chữ nào đến hạn. Bạn có thể mở Luyện viết để chọn thêm chữ theo từng bài.</p>
      </div>

      <div class="smart-practice-grid" *ngIf="reviewStarted && currentReviewItem() as item">
        <div class="smart-practice-left">
          <app-kanji-info-card
            [item]="item"
            [record]="record(item)"
            [order]="orderFor(item)"
          ></app-kanji-info-card>
          <app-kanji-status-selector
            [record]="record(item)"
            (remember)="answer(item, 'remembered')"
            (forgot)="answer(item, 'forgotten')"
            (needReview)="answer(item, 'need_review')"
            (favorite)="progress.toggleFavorite(item.id)"
          ></app-kanji-status-selector>
        </div>
        <app-kanji-writing-canvas
          [kanji]="item.kanji"
          [strokeData]="strokeDataFor(item)"
          [status]="record(item).status"
          [hintLevel]="record(item).hint_level"
        ></app-kanji-writing-canvas>
      </div>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiReviewScreenComponent {
  @Input() items: KanjiN5Item[] = [];
  @Input() orderById = new Map<string, number>();
  @Input() strokes: Record<string, KanjiStrokeData> = {};

  readonly progress = inject(KanjiN5ProgressService);
  reviewStarted = false;
  reviewIndex = 0;

  dueItems(): KanjiN5Item[] {
    this.progress.state();
    return this.progress.dueItems(this.items);
  }

  dueCount(status: KanjiLearningStatus): number {
    return this.dueItems().filter((item) => this.progress.recordFor(item.id).status === status).length;
  }

  currentReviewItem(): KanjiN5Item | undefined {
    return this.dueItems()[this.reviewIndex] ?? this.dueItems()[0];
  }

  record(item: KanjiN5Item): KanjiLearningRecord {
    return this.progress.recordFor(item.id);
  }

  orderFor(item: KanjiN5Item): number {
    return this.orderById.get(item.id) ?? 0;
  }

  strokeDataFor(item: KanjiN5Item): KanjiStrokeData | undefined {
    return this.strokes[item.kanji];
  }

  startReview(): void {
    this.reviewStarted = true;
    this.reviewIndex = 0;
  }

  answer(item: KanjiN5Item, result: 'remembered' | 'forgotten' | 'need_review'): void {
    if (result === 'remembered') {
      this.progress.markRemembered(item.id, item.kanji);
    } else if (result === 'forgotten') {
      this.progress.markForgotten(item.id, item.kanji);
    } else {
      this.progress.markNeedReview(item.id, item.kanji);
    }
    this.reviewIndex = Math.min(this.reviewIndex, Math.max(this.dueItems().length - 1, 0));
    if (!this.dueItems().length) {
      this.reviewStarted = false;
    }
  }
}

@Component({
  selector: 'app-kanji-reminder-setting-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="smart-screen">
      <header class="smart-section-head">
        <div>
          <span>Nhắc hẹn</span>
          <h3>Lịch ôn Kanji hằng ngày</h3>
        </div>
        <button type="button" class="smart-primary" (click)="requestPermission()">
          <i class="fas fa-bell"></i>
          <span>Bật quyền thông báo</span>
        </button>
      </header>

      <div class="reminder-grid">
        <label>
          <span>Bật nhắc ôn</span>
          <input
            type="checkbox"
            [ngModel]="settings().enabled"
            (ngModelChange)="progress.updateReminder({ enabled: $event })"
          />
        </label>
        <label>
          <span>Giờ nhắc hằng ngày</span>
          <input
            type="time"
            [ngModel]="settings().time"
            (ngModelChange)="progress.updateReminder({ time: $event })"
          />
        </label>
        <label>
          <span>Số chữ mỗi ngày</span>
          <input
            type="number"
            min="1"
            max="80"
            [ngModel]="settings().dailyLimit"
            (ngModelChange)="progress.updateReminder({ dailyLimit: toNumber($event) })"
          />
        </label>
        <label>
          <span>Ưu tiên chữ cần ôn lại</span>
          <input
            type="checkbox"
            [ngModel]="settings().prioritizeNeedReview"
            (ngModelChange)="progress.updateReminder({ prioritizeNeedReview: $event })"
          />
        </label>
        <label>
          <span>Chỉ nhắc danh sách tự chọn</span>
          <input
            type="checkbox"
            [ngModel]="settings().useCustomList"
            (ngModelChange)="progress.updateReminder({ useCustomList: $event })"
          />
        </label>
      </div>

      <section class="reminder-levels">
        <h4>Chọn trạng thái muốn ôn</h4>
        <button
          type="button"
          *ngFor="let meta of statusMeta"
          [class.active]="settings().levels.includes(meta.status)"
          (click)="toggleLevel(meta.status)"
        >
          <i [class]="meta.icon"></i>
          <span>{{ meta.label }}</span>
        </button>
      </section>

      <p class="reminder-note">
        Khi mở ứng dụng và đến giờ nhắc, hệ thống sẽ gửi: “Đến giờ ôn Kanji rồi. Hôm nay bạn có
        {{ reminderCount() }} chữ cần ôn.”
      </p>
      <p class="reminder-permission">{{ permissionMessage }}</p>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiReminderSettingScreenComponent {
  @Input() items: KanjiN5Item[] = [];

  readonly progress = inject(KanjiN5ProgressService);
  readonly statusMeta = KANJI_STATUS_META;
  permissionMessage = '';

  settings() {
    return this.progress.state().reminder;
  }

  toggleLevel(status: KanjiLearningStatus): void {
    const levels = new Set(this.settings().levels);
    levels.has(status) ? levels.delete(status) : levels.add(status);
    this.progress.updateReminder({ levels: Array.from(levels) });
  }

  reminderCount(): number {
    return this.progress.reminderItems(this.items).length;
  }

  toNumber(value: number | string): number {
    return Math.max(1, Number(value) || 1);
  }

  async requestPermission(): Promise<void> {
    const allowed = await this.progress.requestReminderPermission();
    this.permissionMessage = allowed
      ? 'Thông báo đã được bật trên trình duyệt này.'
      : 'Trình duyệt chưa cấp quyền thông báo. Bạn vẫn có thể xem danh sách ôn trong ứng dụng.';
  }
}

@Component({
  selector: 'app-kanji-progress-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="smart-screen">
      <header class="smart-section-head">
        <div>
          <span>Tiến độ</span>
          <h3>Theo dõi học Kanji N5</h3>
        </div>
      </header>

      <div class="progress-grid">
        <article>
          <span>Tổng đã học</span>
          <strong>{{ studiedCount() }}</strong>
        </article>
        <article>
          <span>Đã thuộc</span>
          <strong>{{ counts().remembered }}</strong>
        </article>
        <article>
          <span>Cần ôn</span>
          <strong>{{ progress.dueItems(items).length }}</strong>
        </article>
        <article>
          <span>Hoàn thành N5</span>
          <strong>{{ progress.completionPercent(items) }}%</strong>
        </article>
      </div>

      <section class="level-progress">
        <div>
          <span>JLPT N5</span>
          <b>{{ counts().remembered }}/{{ items.length }} chữ</b>
        </div>
        <div class="smart-progress-track">
          <span [style.width.%]="progress.completionPercent(items)"></span>
        </div>
      </section>

      <section class="status-breakdown">
        <article *ngFor="let meta of statusMeta" [ngClass]="'status-' + meta.status">
          <i [class]="meta.icon"></i>
          <span>{{ meta.label }}</span>
          <strong>{{ counts()[meta.status] }}</strong>
        </article>
      </section>

      <section class="history-list">
        <h4>Lịch sử ôn gần đây</h4>
        <article *ngFor="let entry of progress.state().history.slice(0, 8)">
          <span lang="ja">{{ entry.kanji }}</span>
          <p>{{ resultLabel(entry.result) }} · {{ progress.statusMeta(entry.status).label }}</p>
          <time>{{ entry.reviewed_at | date: 'dd/MM HH:mm' }}</time>
        </article>
        <p *ngIf="!progress.state().history.length">Chưa có lịch sử ôn tập.</p>
      </section>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiProgressTrackerComponent {
  @Input() items: KanjiN5Item[] = [];
  @Input() lessons: KanjiN5Lesson[] = [];

  readonly progress = inject(KanjiN5ProgressService);
  readonly statusMeta = KANJI_STATUS_META;

  counts(): Record<KanjiLearningStatus, number> {
    return this.progress.statusCounts(this.items);
  }

  studiedCount(): number {
    return this.items.filter((item) => this.progress.recordFor(item.id).review_count > 0).length;
  }

  resultLabel(result: 'remembered' | 'forgotten' | 'need_review'): string {
    if (result === 'remembered') {
      return 'Đã nhớ';
    }
    if (result === 'forgotten') {
      return 'Chưa nhớ';
    }
    return 'Cần ôn lại';
  }
}
