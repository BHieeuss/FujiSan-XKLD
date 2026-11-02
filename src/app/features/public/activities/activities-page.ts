import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import {
  ActivityCategory,
  ActivityItem,
} from '../../admin/components/activities-admin/activities-admin.models';
import { ActivitiesPublicService, PublicActivitiesResponse } from './activities-public.service';
import { ScrollNavigationService } from '../../../core/services/scroll-navigation.service';

@Component({
  selector: 'app-activities-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activities-page.html',
  styleUrl: './activities-page.scss',
})
export class ActivitiesPage implements OnInit, OnDestroy {
  private readonly service = inject(ActivitiesPublicService);
  private readonly scrollNav = inject(ScrollNavigationService);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  // State
  isLoading: boolean = true;
  featuredActivity: ActivityItem | null = null;
  hotActivities: ActivityItem[] = [];
  categories: ActivityCategory[] = [];
  activities: ActivityItem[] = [];
  stats = {
    totalPublished: 0,
    totalViews: 0,
    totalEvents: 50,
    satisfiedPartners: 120,
  };

  // Filter & Search
  selectedCategory: string = 'all';
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 1;
  totalActivities: number = 0;

  ngOnInit(): void {
    this.loadData();

    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.search$.next(query);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.loadData();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadData();
    // Scroll to activities grid smoothly without clipping
    this.scrollNav.scrollToElement('#activities-feed', { behavior: 'smooth' });
  }

  loadData(): void {
    this.isLoading = true;
    this.service
      .getActivities({
        category: this.selectedCategory,
        q: this.searchQuery,
        page: this.currentPage,
        limit: this.pageSize,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PublicActivitiesResponse) => {
          this.featuredActivity = res.featured;
          this.hotActivities = res.hot || [];
          this.categories = res.categories || [];
          this.activities = res.items || [];
          this.totalActivities = res.total;
          this.totalPages = res.totalPages;
          this.stats = res.stats || this.stats;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
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

