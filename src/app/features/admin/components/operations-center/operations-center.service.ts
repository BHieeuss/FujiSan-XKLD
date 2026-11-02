import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';
import {
  AdminActivityLogItem,
  AdminNotificationItem,
  AdminStaffItem,
  AdminTaskItem,
  OperationsDashboardPayload,
} from './operations-center.models';

@Injectable({
  providedIn: 'root',
})
export class OperationsCenterService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);

  private readonly endpoint = '/admin-api/notifications.php';

  private getCsrfHeaders(): HttpHeaders {
    const token = this.auth.session()?.csrfToken || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    });
  }

  async getDashboardData(
    tab = 'all',
    priority = 'all',
    search = '',
    limit = 10,
    offset = 0,
    view = 'inbox'
  ): Promise<OperationsDashboardPayload> {
    const params = new URLSearchParams({
      view,
      tab,
      priority,
      search,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return await firstValueFrom(
      this.http.get<OperationsDashboardPayload>(`${this.endpoint}?${params.toString()}`)
    );
  }

  async checkUnread(): Promise<{ unreadCount: number; trashCount?: number; latest: AdminNotificationItem[]; timestamp: string }> {
    return await firstValueFrom(
      this.http.get<{ unreadCount: number; trashCount?: number; latest: AdminNotificationItem[]; timestamp: string }>(
        `${this.endpoint}?action=check-unread`
      )
    );
  }

  async markAsRead(id: string): Promise<{ success: boolean; unreadCount: number }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; unreadCount: number }>(
        `${this.endpoint}?action=mark-read`,
        { id },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async markMultipleAsRead(ids: string[]): Promise<{ success: boolean; unreadCount: number }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; unreadCount: number }>(
        `${this.endpoint}?action=mark-read`,
        { ids },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async markAsUnread(id: string): Promise<{ success: boolean; unreadCount: number }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; unreadCount: number }>(
        `${this.endpoint}?action=mark-unread`,
        { id },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async moveToTrash(id: string): Promise<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }>(
        `${this.endpoint}?action=trash`,
        { id },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async bulkTrash(ids: string[]): Promise<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }>(
        `${this.endpoint}?action=bulk-trash`,
        { ids },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async restoreFromTrash(id: string): Promise<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }>(
        `${this.endpoint}?action=restore`,
        { id },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async bulkRestore(ids: string[]): Promise<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }>(
        `${this.endpoint}?action=bulk-restore`,
        { ids },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async permanentDelete(id: string): Promise<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }>(
        `${this.endpoint}?action=permanent-delete`,
        { id },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async bulkPermanentDelete(ids: string[]): Promise<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }>(
        `${this.endpoint}?action=bulk-permanent-delete`,
        { ids },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async emptyTrash(): Promise<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; count: number; unreadCount: number; trashCount: number; message: string }>(
        `${this.endpoint}?action=empty-trash`,
        {},
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async purgeExpiredTrash(): Promise<{ success: boolean; purgedCount: number; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; purgedCount: number; message: string }>(
        `${this.endpoint}?action=purge-expired`,
        {},
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async deleteNotification(id: string): Promise<{ success: boolean; unreadCount: number; message: string }> {
    return await firstValueFrom(
      this.http.delete<{ success: boolean; unreadCount: number; message: string }>(
        `${this.endpoint}?id=${encodeURIComponent(id)}`,
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async markAllAsRead(): Promise<{ success: boolean; markedCount: number; unreadCount: number }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; markedCount: number; unreadCount: number }>(
        `${this.endpoint}?action=mark-all-read`,
        {},
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async createTask(taskData: Partial<AdminTaskItem>): Promise<{ success: boolean; task: AdminTaskItem }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; task: AdminTaskItem }>(
        `${this.endpoint}?action=create-task`,
        taskData,
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async updateTask(id: string, updates: Partial<AdminTaskItem>): Promise<{ success: boolean; task: AdminTaskItem }> {
    return await firstValueFrom(
      this.http.put<{ success: boolean; task: AdminTaskItem }>(
        this.endpoint,
        { id, ...updates },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async assignStaff(
    targetType: 'student' | 'task',
    targetId: string,
    staffId: string
  ): Promise<{ success: boolean; message: string }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean; message: string }>(
        `${this.endpoint}?action=assign-staff`,
        { targetType, targetId, staffId },
        { headers: this.getCsrfHeaders() }
      )
    );
  }

  async getStaffList(): Promise<AdminStaffItem[]> {
    const res = await firstValueFrom(
      this.http.get<{ staff: AdminStaffItem[] }>(`${this.endpoint}?action=staff`)
    );
    return res.staff || [];
  }

  async getActivityLogs(targetType = 'all', search = '', limit = 30): Promise<AdminActivityLogItem[]> {
    const params = new URLSearchParams({
      action: 'activities',
      targetType,
      search,
      limit: limit.toString(),
    });
    const res = await firstValueFrom(
      this.http.get<{ activities: AdminActivityLogItem[] }>(`${this.endpoint}?${params.toString()}`)
    );
    return res.activities || [];
  }
}

