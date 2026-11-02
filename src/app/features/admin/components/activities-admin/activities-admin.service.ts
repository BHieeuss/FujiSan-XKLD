import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';
import {
  ActivityCategory,
  ActivityItem,
  ActivityListResponse,
  ActivityTemplate,
  QualityReport,
} from './activities-admin.models';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesAdminService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly baseUrl = '/admin-api/activities.php';

  private getMutationHeaders(): Record<string, string> {
    const csrfToken = this.auth.session()?.csrfToken;
    return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  }

  listActivities(params: Record<string, string | number>): Observable<ActivityListResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        httpParams = httpParams.set(key, String(val));
      }
    });
    return this.http.get<ActivityListResponse>(this.baseUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getActivity(id: string): Observable<{ activity: ActivityItem; quality: QualityReport }> {
    const params = new HttpParams().set('action', 'get').set('id', id);
    return this.http.get<{ activity: ActivityItem; quality: QualityReport }>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }

  createActivity(payload: Partial<ActivityItem>): Observable<{ message: string; activity: ActivityItem }> {
    return this.http.post<{ message: string; activity: ActivityItem }>(this.baseUrl, payload, {
      headers: this.getMutationHeaders(),
      withCredentials: true,
    });
  }

  updateActivity(id: string, payload: Partial<ActivityItem>): Observable<{ message: string; activity: ActivityItem }> {
    const params = new HttpParams().set('id', id);
    return this.http.put<{ message: string; activity: ActivityItem }>(this.baseUrl, payload, {
      headers: this.getMutationHeaders(),
      params,
      withCredentials: true,
    });
  }

  uploadImage(file: File): Observable<{ success: boolean; imageUrl: string; message: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ success: boolean; imageUrl: string; message: string }>(
      '/admin-api/activity-image.php',
      formData,
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  deleteActivity(id: string): Observable<{ message: string }> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<{ message: string }>(this.baseUrl, {
      headers: this.getMutationHeaders(),
      params,
      withCredentials: true,
    });
  }

  duplicateActivity(id: string): Observable<{ message: string; activity: ActivityItem }> {
    const params = new HttpParams().set('action', 'duplicate');
    return this.http.post<{ message: string; activity: ActivityItem }>(
      this.baseUrl,
      { id },
      {
        headers: this.getMutationHeaders(),
        params,
        withCredentials: true,
      }
    );
  }

  approveActivity(id: string, isApproved: boolean, note: string = ''): Observable<{ message: string; activity: ActivityItem }> {
    const params = new HttpParams().set('action', 'approve');
    return this.http.post<{ message: string; activity: ActivityItem }>(
      this.baseUrl,
      { id, isApproved, note },
      {
        headers: this.getMutationHeaders(),
        params,
        withCredentials: true,
      }
    );
  }

  publishActivity(id: string, scheduledAt?: string): Observable<{ message: string; activity: ActivityItem }> {
    const params = new HttpParams().set('action', 'publish');
    return this.http.post<{ message: string; activity: ActivityItem }>(
      this.baseUrl,
      { id, scheduledAt },
      {
        headers: this.getMutationHeaders(),
        params,
        withCredentials: true,
      }
    );
  }

  archiveActivity(id: string): Observable<{ message: string; activity: ActivityItem }> {
    const params = new HttpParams().set('action', 'archive');
    return this.http.post<{ message: string; activity: ActivityItem }>(
      this.baseUrl,
      { id },
      {
        headers: this.getMutationHeaders(),
        params,
        withCredentials: true,
      }
    );
  }

  reorderActivities(orderedIds: string[], position: string = 'latest'): Observable<{ message: string }> {
    const params = new HttpParams().set('action', 'reorder');
    return this.http.post<{ message: string }>(
      this.baseUrl,
      { orderedIds, position },
      {
        headers: this.getMutationHeaders(),
        params,
        withCredentials: true,
      }
    );
  }

  checkQuality(id: string): Observable<{ quality: QualityReport }> {
    const params = new HttpParams().set('action', 'quality-check').set('id', id);
    return this.http.get<{ quality: QualityReport }>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }

  getTemplates(): Observable<{ templates: ActivityTemplate[] }> {
    const params = new HttpParams().set('action', 'templates');
    return this.http.get<{ templates: ActivityTemplate[] }>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }

  getCategories(): Observable<{ categories: ActivityCategory[] }> {
    const params = new HttpParams().set('action', 'categories');
    return this.http.get<{ categories: ActivityCategory[] }>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }
}
