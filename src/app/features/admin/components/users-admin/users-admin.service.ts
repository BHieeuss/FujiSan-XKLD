import { Injectable, inject } from '@angular/core';
import { AdminAuthService } from '../../services/admin-auth.service';
import {
  AdminRole,
  AdminUser,
  PermissionItem,
  UserAuditLog,
  UserDetailResponse,
  UserOverride,
  UsersResponse,
} from './users-admin.models';

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private readonly auth = inject(AdminAuthService);
  private readonly apiRoot = '/admin-api';

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const csrfToken = this.auth.session()?.csrfToken;
    const response = await fetch(`${this.apiRoot}/${endpoint}`, {
      ...init,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        ...init.headers,
      },
    });

    let payload: any = {};
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Lỗi máy chủ (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(payload.message || 'Yêu cầu không thành công.');
    }

    return payload as T;
  }

  // 1. Users
  async getUsers(search = '', role = 'all', status = 'all'): Promise<UsersResponse> {
    const params = new URLSearchParams({ action: 'list', search, role, status });
    return this.request<UsersResponse>(`users.php?${params.toString()}`);
  }

  async getUserDetail(id: string): Promise<UserDetailResponse> {
    const params = new URLSearchParams({ action: 'detail', id });
    return this.request<UserDetailResponse>(`users.php?${params.toString()}`);
  }

  async createUser(payload: {
    username: string;
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    roleId: string;
    department?: string;
    status: 'active' | 'locked';
    notes?: string;
    avatarUrl?: string;
  }): Promise<{ user: AdminUser; message: string }> {
    return this.request<{ user: AdminUser; message: string }>('users.php?action=create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateUser(
    id: string,
    payload: {
      username?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      roleId?: string;
      department?: string;
      status?: 'active' | 'locked';
      notes?: string;
      password?: string;
      avatarUrl?: string;
    },
  ): Promise<{ user: AdminUser; message: string }> {
    return this.request<{ user: AdminUser; message: string }>('users.php?action=update', {
      method: 'POST',
      body: JSON.stringify({ id, ...payload }),
    });
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string; message: string }> {
    const csrfToken = this.auth.session()?.csrfToken;
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.apiRoot}/users.php?action=upload_avatar`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      body: formData,
    });

    let payload: any = {};
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Lỗi máy chủ (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(payload.message || 'Không thể tải ảnh đại diện.');
    }

    return payload as { avatarUrl: string; message: string };
  }

  async toggleUserStatus(id: string): Promise<{ user: AdminUser; message: string }> {
    return this.request<{ user: AdminUser; message: string }>('users.php?action=toggle_status', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async resetPassword(id: string, password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('users.php?action=reset_password', {
      method: 'POST',
      body: JSON.stringify({ id, password }),
    });
  }

  async deleteUser(id: string): Promise<{ deleted: boolean; message: string }> {
    return this.request<{ deleted: boolean; message: string }>('users.php?action=delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  // 2. Roles
  async getRoles(): Promise<AdminRole[]> {
    const res = await this.request<{ roles: AdminRole[] }>('users.php?action=roles');
    return res.roles;
  }

  async saveRole(payload: {
    id?: string;
    name: string;
    description: string;
    dataScope: string;
    permissions: string[];
  }): Promise<{ role: AdminRole; message: string }> {
    return this.request<{ role: AdminRole; message: string }>('users.php?action=role_save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async copyRole(sourceId: string, name: string): Promise<{ role: AdminRole; message: string }> {
    return this.request<{ role: AdminRole; message: string }>('users.php?action=role_copy', {
      method: 'POST',
      body: JSON.stringify({ sourceId, name }),
    });
  }

  async deleteRole(id: string): Promise<{ deleted: boolean; message: string }> {
    return this.request<{ deleted: boolean; message: string }>('users.php?action=role_delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  // 3. Permission Registry
  async getRegistry(): Promise<{ registry: PermissionItem[]; allKeys: string[] }> {
    return this.request<{ registry: PermissionItem[]; allKeys: string[] }>('users.php?action=registry');
  }

  // 4. Overrides
  async getOverrides(userId: string): Promise<UserDetailResponse> {
    return this.request<UserDetailResponse>(`users.php?action=overrides&user_id=${encodeURIComponent(userId)}`);
  }

  async saveOverrides(payload: {
    userId: string;
    allowPermissions: string[];
    denyPermissions: string[];
    dataScope?: string;
    reason?: string;
  }): Promise<{ override: UserOverride; message: string }> {
    return this.request<{ override: UserOverride; message: string }>('users.php?action=overrides_save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resetOverrides(userId: string): Promise<{ reset: boolean; message: string }> {
    return this.request<{ reset: boolean; message: string }>('users.php?action=overrides_reset', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // 5. Audit Logs
  async getAuditLogs(limit = 50, search = ''): Promise<UserAuditLog[]> {
    const params = new URLSearchParams({ action: 'audit_logs', limit: String(limit), search });
    const res = await this.request<{ logs: UserAuditLog[] }>(`users.php?${params.toString()}`);
    return res.logs;
  }
}

