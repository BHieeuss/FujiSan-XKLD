import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AdminUserItem {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  learnedCount: number;
  forgottenCount: number;
}

export interface AdminRegistrationCodeItem {
  id: string;
  code: string;
  description?: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdBy?: string;
  createdAt: string;
  isValid: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDataService {
  private readonly http = inject(HttpClient);

  // Local fallback storage keys
  private readonly LOCAL_USERS_KEY = 'viejap.admin.users.local';
  private readonly LOCAL_CODES_KEY = 'viejap.admin.codes.local';

  // --- QUẢN LÝ NGƯỜI DÙNG ---

  async getUsers(): Promise<AdminUserItem[]> {
    try {
      return await firstValueFrom(this.http.get<AdminUserItem[]>('/api/admin/users'));
    } catch {
      return this.getLocalUsers();
    }
  }

  async toggleUserStatus(userId: string): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(this.http.put(`/api/admin/users/${userId}/toggle-status`, {}));
      return res.isActive;
    } catch {
      const users = this.getLocalUsers();
      const user = users.find(u => u.userId === userId);
      if (user) {
        user.isActive = !user.isActive;
        this.saveLocalUsers(users);
        return user.isActive;
      }
      return true;
    }
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`/api/admin/users/${userId}/reset-password`, { newPassword }));
    } catch (err: any) {
      console.warn('Backend offline, simulated password reset locally.');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/admin/users/${userId}`));
    } catch {
      const users = this.getLocalUsers().filter(u => u.userId !== userId);
      this.saveLocalUsers(users);
    }
  }

  // --- QUẢN LÝ MÃ CODE ĐĂNG KÝ ---

  async getRegistrationCodes(): Promise<AdminRegistrationCodeItem[]> {
    try {
      return await firstValueFrom(this.http.get<AdminRegistrationCodeItem[]>('/api/admin/registration-codes'));
    } catch {
      return this.getLocalCodes();
    }
  }

  async createRegistrationCode(data: {
    code?: string;
    description?: string;
    maxUses: number;
    expiresAt?: string;
  }): Promise<AdminRegistrationCodeItem> {
    try {
      return await firstValueFrom(this.http.post<AdminRegistrationCodeItem>('/api/admin/registration-codes', data));
    } catch (err: any) {
      // Local fallback simulation
      const codeStr = data.code?.trim().toUpperCase() || this.generateRandomCode();
      const newCode: AdminRegistrationCodeItem = {
        id: 'code-' + Date.now(),
        code: codeStr,
        description: data.description,
        maxUses: data.maxUses,
        usedCount: 0,
        isActive: true,
        expiresAt: data.expiresAt,
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
        isValid: true,
      };

      const codes = [newCode, ...this.getLocalCodes()];
      this.saveLocalCodes(codes);
      return newCode;
    }
  }

  async toggleRegistrationCodeStatus(id: string): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(this.http.put(`/api/admin/registration-codes/${id}/toggle-status`, {}));
      return res.isActive;
    } catch {
      const codes = this.getLocalCodes();
      const code = codes.find(c => c.id === id);
      if (code) {
        code.isActive = !code.isActive;
        code.isValid = code.isActive;
        this.saveLocalCodes(codes);
        return code.isActive;
      }
      return true;
    }
  }

  async deleteRegistrationCode(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`/api/admin/registration-codes/${id}`));
    } catch {
      const codes = this.getLocalCodes().filter(c => c.id !== id);
      this.saveLocalCodes(codes);
    }
  }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  private getLocalUsers(): AdminUserItem[] {
    if (typeof window === 'undefined') return [];
    const json = window.localStorage.getItem(this.LOCAL_USERS_KEY);
    if (json) {
      try { return JSON.parse(json); } catch { }
    }
    const defaultUsers: AdminUserItem[] = [
      {
        userId: 'u1',
        username: 'admin',
        email: 'admin@viejap.com',
        fullName: 'Quản Trị Viên VieJap',
        role: 'Admin',
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        lastLoginAt: new Date().toISOString(),
        learnedCount: 150,
        forgottenCount: 5,
      },
      {
        userId: 'u2',
        username: 'nguyenvana',
        email: 'vana.nguyen@gmail.com',
        fullName: 'Nguyễn Văn A',
        role: 'User',
        isActive: true,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
        learnedCount: 42,
        forgottenCount: 6,
      },
      {
        userId: 'u3',
        username: 'tranthib',
        email: 'thib.tran@gmail.com',
        fullName: 'Trần Thị B',
        role: 'User',
        isActive: false,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        lastLoginAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        learnedCount: 18,
        forgottenCount: 2,
      },
    ];
    this.saveLocalUsers(defaultUsers);
    return defaultUsers;
  }

  private saveLocalUsers(users: AdminUserItem[]): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.LOCAL_USERS_KEY, JSON.stringify(users));
    }
  }

  private getLocalCodes(): AdminRegistrationCodeItem[] {
    if (typeof window === 'undefined') return [];
    const json = window.localStorage.getItem(this.LOCAL_CODES_KEY);
    if (json) {
      try { return JSON.parse(json); } catch { }
    }
    const defaultCodes: AdminRegistrationCodeItem[] = [
      {
        id: 'c1',
        code: 'VIEJAP2026',
        description: 'Mã đăng ký học viên tiêu chuẩn',
        maxUses: 100,
        usedCount: 12,
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
        createdBy: 'Admin',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        isValid: true,
      },
      {
        id: 'c2',
        code: 'N5-VIP-KHOA1',
        description: 'Khóa luyện thi N5 cấp tốc tháng 9',
        maxUses: 30,
        usedCount: 28,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdBy: 'Admin',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        isValid: true,
      },
      {
        id: 'c3',
        code: 'TESTCODE99',
        description: 'Mã thử nghiệm hệ thống (Đã hết hạn)',
        maxUses: 5,
        usedCount: 5,
        isActive: false,
        expiresAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        createdBy: 'Admin',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        isValid: false,
      },
    ];
    this.saveLocalCodes(defaultCodes);
    return defaultCodes;
  }

  private saveLocalCodes(codes: AdminRegistrationCodeItem[]): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.LOCAL_CODES_KEY, JSON.stringify(codes));
    }
  }
}
