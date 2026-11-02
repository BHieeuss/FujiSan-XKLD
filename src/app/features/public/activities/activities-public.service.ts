import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ActivityCategory,
  ActivityItem,
} from '../../admin/components/activities-admin/activities-admin.models';

export interface PublicActivitiesResponse {
  items: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  featured: ActivityItem | null;
  hot: ActivityItem[];
  homepage: ActivityItem[];
  categories: ActivityCategory[];
  stats: {
    totalPublished: number;
    totalViews: number;
    totalEvents: number;
    satisfiedPartners: number;
  };
}

export interface ActivityDetailResponse {
  activity: ActivityItem;
  related: ActivityItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ActivitiesPublicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/orders-api/activities.php';

  getActivities(params?: {
    category?: string;
    position?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Observable<PublicActivitiesResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.category && params.category !== 'all') {
        httpParams = httpParams.set('category', params.category);
      }
      if (params.position && params.position !== 'all') {
        httpParams = httpParams.set('position', params.position);
      }
      if (params.q) {
        httpParams = httpParams.set('q', params.q);
      }
      if (params.page) {
        httpParams = httpParams.set('page', String(params.page));
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', String(params.limit));
      }
    }
    return this.http.get<PublicActivitiesResponse>(this.baseUrl, { params: httpParams });
  }

  getActivityBySlug(slug: string): Observable<ActivityDetailResponse> {
    const params = new HttpParams().set('slug', slug);
    return this.http.get<ActivityDetailResponse>(this.baseUrl, { params });
  }
}
