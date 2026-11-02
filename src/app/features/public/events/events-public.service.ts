import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { EventDisplayFormat, EventItem } from '../../admin/components/events-admin/events-admin.models';

export interface PublicEventsResponse {
  total: number;
  events: EventItem[];
  byFormat: Record<EventDisplayFormat, EventItem[]>;
}

@Injectable({
  providedIn: 'root',
})
export class EventsPublicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/orders-api/events.php';

  private readonly STORAGE_PREFIX = 'viejap_evt_';

  getActiveEvents(currentPath: string = '/'): Observable<PublicEventsResponse> {
    const params = new HttpParams().set('path', currentPath);
    return this.http
      .get<PublicEventsResponse>(this.baseUrl, { params })
      .pipe(
        catchError(() =>
          of({
            total: 0,
            events: [],
            byFormat: {
              popup_center: [],
              popup_corner: [],
              top_bar: [],
              index_banner: [],
              floating_button: [],
              list: [],
            },
          })
        )
      );
  }

  trackEvent(eventId: string, type: 'view' | 'click' | 'dismiss', format: string): void {
    if (!eventId) return;

    // Fire and forget, prevent spam
    this.http
      .post(this.baseUrl, {
        action: 'track',
        eventId,
        type,
        format,
      })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  // -------------------------------------------------------------
  // FREQUENCY & DISMISSAL ARBITRATION
  // -------------------------------------------------------------
  canShowEvent(event: EventItem, format: EventDisplayFormat): boolean {
    const frequency = event.delivery.frequency || 'per_session';
    if (frequency === 'always') {
      return true;
    }

    const dismissKey = `${this.STORAGE_PREFIX}dismiss_${event.id}_${format}`;
    const shownKey = `${this.STORAGE_PREFIX}shown_${event.id}_${format}`;
    const now = Date.now();

    // Check if dismissed
    const dismissedTime = this.getStorageItem(dismissKey, frequency);
    if (dismissedTime) {
      return false;
    }

    // Check frequency TTL
    const lastShown = this.getStorageItem(shownKey, frequency);
    if (!lastShown) {
      return true;
    }

    const elapsed = now - Number(lastShown);
    switch (frequency) {
      case 'per_session':
        // Session storage handles per-session automatically
        return false;
      case 'per_day':
        return elapsed > 24 * 60 * 60 * 1000;
      case 'per_week':
        return elapsed > 7 * 24 * 60 * 60 * 1000;
      case 'once_ever':
        return false;
      default:
        return false;
    }
  }

  recordShown(event: EventItem, format: EventDisplayFormat): void {
    const frequency = event.delivery.frequency || 'per_session';
    const shownKey = `${this.STORAGE_PREFIX}shown_${event.id}_${format}`;
    this.setStorageItem(shownKey, String(Date.now()), frequency);
    this.trackEvent(event.id, 'view', format);
  }

  recordDismissed(event: EventItem, format: EventDisplayFormat): void {
    const frequency = event.delivery.frequency || 'per_session';
    const dismissKey = `${this.STORAGE_PREFIX}dismiss_${event.id}_${format}`;
    this.setStorageItem(dismissKey, String(Date.now()), frequency);
    this.trackEvent(event.id, 'dismiss', format);
  }

  recordClick(event: EventItem, format: EventDisplayFormat): void {
    this.trackEvent(event.id, 'click', format);
  }

  private getStorageItem(key: string, frequency: string): string | null {
    try {
      if (frequency === 'per_session') {
        return sessionStorage.getItem(key);
      }
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setStorageItem(key: string, value: string, frequency: string): void {
    try {
      if (frequency === 'per_session') {
        sessionStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // Storage might be disabled in private mode
    }
  }
}

