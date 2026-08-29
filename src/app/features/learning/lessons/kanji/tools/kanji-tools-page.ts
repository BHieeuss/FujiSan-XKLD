import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KANJI_N5_LESSONS, KanjiN5Item } from '../kanji-n5/kanji-n5.data';
import { KanjiN5ProgressService } from '../kanji-n5/kanji-n5-progress.service';
import { KANJI_N5_STROKES } from '../kanji-n5/kanji-n5-strokes.generated';
import {
  KanjiPracticeScreenComponent,
  KanjiProgressTrackerComponent,
  KanjiReminderSettingScreenComponent,
  KanjiReviewScreenComponent,
} from '../kanji-n5/learning/kanji-learning.components';

type KanjiToolScreen = 'home' | 'practice' | 'review' | 'reminder' | 'progress';
type KanjiFeatureScreen = Exclude<KanjiToolScreen, 'home'>;

@Component({
  selector: 'app-kanji-tools-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    KanjiPracticeScreenComponent,
    KanjiReviewScreenComponent,
    KanjiReminderSettingScreenComponent,
    KanjiProgressTrackerComponent,
  ],
  templateUrl: './kanji-tools-page.html',
  styleUrl: './kanji-tools-page.scss',
})
export class KanjiToolsPage implements OnDestroy {
  readonly lessons = KANJI_N5_LESSONS;
  readonly allKanji = this.lessons.flatMap((lesson) => lesson.items);
  readonly kanjiOrderById = new Map(this.allKanji.map((item, index) => [item.id, index + 1]));
  readonly kanjiById = new Map(this.allKanji.map((item) => [item.id, item]));
  readonly strokeData = KANJI_N5_STROKES;
  readonly progress = inject(KanjiN5ProgressService);
  readonly levelOptions: {
    level: string;
    status: string;
    description: string;
    link?: string;
  }[] = [
    {
      level: 'N5',
      status: 'Đã mở',
      description: '80 chữ cơ bản',
      link: '/hoc-kanji-n5/bai-1',
    },
    {
      level: 'N4',
      status: 'Đang cập nhật',
      description: 'Sắp bổ sung',
    },
    {
      level: 'N3',
      status: 'Đang cập nhật',
      description: 'Sắp bổ sung',
    },
    {
      level: 'N2',
      status: 'Đang cập nhật',
      description: 'Sắp bổ sung',
    },
    {
      level: 'N1',
      status: 'Đang cập nhật',
      description: 'Sắp bổ sung',
    },
  ];
  readonly smartFeatures: {
    screen: KanjiFeatureScreen;
    label: string;
    description: string;
    icon: string;
    sticker: string;
  }[] = [
    {
      screen: 'practice',
      label: 'Luyện viết',
      description: 'Chọn bài và chữ bằng dropdown rồi viết theo mức gợi ý.',
      icon: 'fas fa-pen-nib',
      sticker: '✍',
    },
    {
      screen: 'review',
      label: 'Ôn hôm nay',
      description: 'Tự gom những chữ cần ôn theo lịch đã lưu.',
      icon: 'fas fa-bell',
      sticker: '🔔',
    },
    {
      screen: 'reminder',
      label: 'Nhắc hẹn',
      description: 'Đặt giờ ôn, số chữ mỗi ngày và nhóm cần ưu tiên.',
      icon: 'fas fa-clock',
      sticker: '⏰',
    },
    {
      screen: 'progress',
      label: 'Tiến độ',
      description: 'Xem chữ đã thuộc, chữ cần ôn và lịch sử gần đây.',
      icon: 'fas fa-chart-simple',
      sticker: '📈',
    },
  ];

  activeLessonSlug = this.lessons[0].slug;
  activeKanjiId = this.lessons[0].items[0].id;
  smartScreen: KanjiToolScreen = 'home';

  private reminderTimer?: number;

  constructor() {
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.progress.notifyReviewIfDue(this.allKanji), 1200);
      this.reminderTimer = window.setInterval(
        () => this.progress.notifyReviewIfDue(this.allKanji),
        60_000,
      );
    }
  }

  get activeKanji(): KanjiN5Item {
    return this.kanjiById.get(this.activeKanjiId) ?? this.lessons[0].items[0];
  }

  get practiceItems(): KanjiN5Item[] {
    const sessionItems = this.progress
      .state()
      .studySessionIds.map((id) => this.kanjiById.get(id))
      .filter((item): item is KanjiN5Item => Boolean(item));
    return sessionItems.length ? sessionItems : [this.activeKanji];
  }

  get activeSmartFeatureLabel(): string {
    return this.smartFeatures.find((feature) => feature.screen === this.smartScreen)?.label ?? '';
  }

  ngOnDestroy(): void {
    if (this.reminderTimer) {
      window.clearInterval(this.reminderTimer);
    }
  }

  openSmartFeature(screen: KanjiFeatureScreen): void {
    if (this.smartScreen === screen) {
      this.closeSmartFeature();
      return;
    }

    this.smartScreen = screen;
    if (screen === 'practice' && !this.progress.state().studySessionIds.length) {
      this.progress.setStudySession([this.activeKanji.id]);
    }
  }

  closeSmartFeature(): void {
    this.smartScreen = 'home';
  }

  selectPracticeItem(item: KanjiN5Item): void {
    const lesson = this.lessons.find((candidate) =>
      candidate.items.some((lessonItem) => lessonItem.id === item.id),
    );
    if (lesson) {
      this.activeLessonSlug = lesson.slug;
    }
    this.activeKanjiId = item.id;
  }

  trackFeature(_: number, feature: { screen: KanjiFeatureScreen }): string {
    return feature.screen;
  }

  trackLevel(_: number, option: { level: string }): string {
    return option.level;
  }
}
