import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivityItem } from '../../../../admin/components/activities-admin/activities-admin.models';
import { ActivitiesPublicService } from '../../../activities/activities-public.service';

@Component({
  selector: 'app-home-activities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-activities.component.html',
  styleUrl: './home-activities.component.scss',
})
export class HomeActivitiesComponent implements OnInit {
  private readonly activitiesService = inject(ActivitiesPublicService);

  activities: ActivityItem[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.fetchHomepageActivities();
  }

  fetchHomepageActivities(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.activitiesService.getActivities({ limit: 6 }).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Prioritize homepage-designated items, or fallback to published items
        const homepageList = res.homepage && res.homepage.length > 0 ? res.homepage : res.items || [];
        this.activities = homepageList.slice(0, 6);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Không thể tải danh sách hoạt động';
      },
    });
  }

  getCoverImageUrl(cover: any): string {
    if (!cover) return '/assets/images/logo.png';
    let url = '';
    if (typeof cover === 'string') {
      url = cover.trim();
    } else if (typeof cover === 'object' && cover !== null) {
      url = String(cover.src || cover.url || '').trim();
    }
    if (!url || url === '[object Object]') return '/assets/images/logo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/')) {
      return url;
    }
    return '/' + url;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src && !target.src.includes('logo.png')) {
      target.src = '/assets/images/logo.png';
    }
  }
}
