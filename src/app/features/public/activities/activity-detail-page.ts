import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ActivityItem } from '../../admin/components/activities-admin/activities-admin.models';
import { ActivitiesPublicService, ActivityDetailResponse } from './activities-public.service';
import { ScrollNavigationService } from '../../../core/services/scroll-navigation.service';

@Component({
  selector: 'app-activity-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activity-detail-page.html',
  styleUrl: './activity-detail-page.scss',
})
export class ActivityDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ActivitiesPublicService);
  private readonly scrollNav = inject(ScrollNavigationService);
  private readonly destroy$ = new Subject<void>();

  isLoading: boolean = true;
  activity: ActivityItem | null = null;
  relatedActivities: ActivityItem[] = [];
  errorMessage: string = '';

  // Lightbox for photos
  lightboxImage: string | null = null;
  copiedNotification: boolean = false;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug') || '';
          this.isLoading = true;
          this.errorMessage = '';
          return this.service.getActivityBySlug(slug);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: ActivityDetailResponse) => {
          this.activity = res.activity;
          this.relatedActivities = res.related || [];
          this.isLoading = false;
          this.scrollNav.scrollToTop('auto');
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Không tìm thấy hoạt động hoặc bài viết chưa được xuất bản.';
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openLightbox(url: string): void {
    this.lightboxImage = url;
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }

  copyPageUrl(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this.copiedNotification = true;
      setTimeout(() => (this.copiedNotification = false), 2500);
    }
  }

  shareFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  }

  shareZalo(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://sp.zalo.me/share_inline?link=${url}`, '_blank', 'width=600,height=500');
  }

  getCoverImageUrl(cover: any): string {
    if (!cover) return '/assets/images/logo.png';
    if (typeof cover === 'string') {
      const trimmed = cover.trim();
      if (!trimmed) return '/assets/images/logo.png';
      if (!trimmed.startsWith('/') && !trimmed.startsWith('http')) {
        return '/' + trimmed;
      }
      return trimmed;
    }
    if (typeof cover === 'object') {
      const src = cover.src || cover.url || '';
      if (!src) return '/assets/images/logo.png';
      if (!src.startsWith('/') && !src.startsWith('http')) {
        return '/' + src;
      }
      return src;
    }
    return '/assets/images/logo.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('logo.png')) {
      target.src = '/assets/images/logo.png';
    }
  }
}

