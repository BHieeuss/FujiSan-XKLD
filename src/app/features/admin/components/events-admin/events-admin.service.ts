import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';
import { EventItem, EventsResponse } from './events-admin.models';

@Injectable({
  providedIn: 'root',
})
export class EventsAdminService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly baseUrl = '/admin-api/events.php';
  private readonly uploadUrl = '/admin-api/event-image.php';

  private getMutationHeaders(): Record<string, string> {
    const csrfToken = this.auth.session()?.csrfToken;
    return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  }

  listEvents(params: Record<string, string | number>): Observable<EventsResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        httpParams = httpParams.set(key, String(val));
      }
    });
    return this.http.get<EventsResponse>(this.baseUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getEvent(id: string): Observable<{ event: EventItem }> {
    const params = new HttpParams().set('id', id);
    return this.http.get<{ event: EventItem }>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }

  createEvent(event: Partial<EventItem>): Observable<{ message: string; event: EventItem }> {
    return this.http.post<{ message: string; event: EventItem }>(
      this.baseUrl,
      { action: 'create', event },
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  updateEvent(id: string, event: Partial<EventItem>): Observable<{ message: string; event: EventItem }> {
    return this.http.post<{ message: string; event: EventItem }>(
      this.baseUrl,
      { action: 'update', id, event },
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.baseUrl,
      { action: 'delete', id },
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  duplicateEvent(id: string): Observable<{ message: string; event: EventItem }> {
    return this.http.post<{ message: string; event: EventItem }>(
      this.baseUrl,
      { action: 'duplicate', id },
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  publishEvent(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.baseUrl,
      { action: 'publish', id },
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  pauseEvent(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.baseUrl,
      { action: 'pause', id },
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  updatePriority(
    id: string,
    priorityOrder: number,
    priorityLevel: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.baseUrl,
      { action: 'priority', id, priorityOrder, priorityLevel },
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }

  uploadImage(file: File): Observable<{ message: string; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ message: string; url: string; filename: string }>(
      this.uploadUrl,
      formData,
      {
        headers: this.getMutationHeaders(),
        withCredentials: true,
      }
    );
  }
}

