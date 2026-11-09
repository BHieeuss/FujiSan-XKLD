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

    this.activitiesService.getActivities({ limit: 12 }).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Prioritize homepage-designated items, or fallback to published items
        const homepageList = res.homepage && res.homepage.length > 0 ? res.homepage : res.items || [];
        this.activities = homepageList.slice(0, 10);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Không thể tải danh sách hoạt động';
      },
    });
  }

  /**
   * Sort activities descending by date: publishedAt -> createdAt -> eventDate
   */
  get sortedActivitiesByDate(): ActivityItem[] {
    return [...this.activities].sort((a, b) => {
      const parseDate = (item: ActivityItem): number => {
        if (item.publishedAt) {
          const t = new Date(item.publishedAt.replace(/-/g, '/')).getTime();
          if (!isNaN(t)) return t;
        }
        if (item.createdAt) {
          const t = new Date(item.createdAt.replace(/-/g, '/')).getTime();
          if (!isNaN(t)) return t;
        }
        if (item.eventDate) {
          if (item.eventDate.includes('/')) {
            const parts = item.eventDate.split('/');
            if (parts.length === 3) {
              const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
              if (!isNaN(d)) return d;
            }
          }
          const t = new Date(item.eventDate).getTime();
          if (!isNaN(t)) return t;
        }
        return 0;
      };
      return parseDate(b) - parseDate(a);
    });
  }

  /* ── Desktop Newspaper Layout Getters ── */

  /**
   * Desktop: 1 Main Featured Article (Top Left)
   */
  get desktopMainFeatured(): ActivityItem | null {
    return this.sortedActivitiesByDate[0] || null;
  }

  /**
   * Desktop: 3 Sub-Grid Articles directly below Main Featured
   */
  get desktopSubActivities(): ActivityItem[] {
    return this.sortedActivitiesByDate.slice(1, 4);
  }

  /**
   * Desktop: Right Column Sidebar Articles (Vertical news list)
   */
  get desktopSidebarActivities(): ActivityItem[] {
    return this.sortedActivitiesByDate.slice(4);
  }

  /* ── Mobile Layout Getters ── */

  /**
   * Mobile Featured: The 1 most recently published activity
   */
  get mobileLatestActivity(): ActivityItem | null {
    return this.sortedActivitiesByDate[0] || null;
  }

  /**
   * Mobile Sub-activities: The next 3 activities in order
   */
  get mobileNextActivities(): ActivityItem[] {
    return this.sortedActivitiesByDate.slice(1, 4);
  }

  /**
   * Format display date nicely (DD/MM/YYYY)
   */
  formatDisplayDate(act?: ActivityItem | null): string {
    if (!act) return '';
    if (act.eventDate) return act.eventDate;
    if (act.publishedAt) {
      const d = new Date(act.publishedAt.replace(/-/g, '/'));
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return act.publishedAt.slice(0, 10);
    }
    if (act.createdAt) {
      const d = new Date(act.createdAt.replace(/-/g, '/'));
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    return '';
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
