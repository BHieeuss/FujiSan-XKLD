import { Injectable, inject } from '@angular/core';
import { AdminAuthService, AdminApiError } from './admin-auth.service';

export interface StudentRegistrationCodeItem {
  id: string;
  code: string;
  studentName: string;
  phone: string;
  email: string;
  status: 'pending' | 'in_progress' | 'used' | 'expired' | 'revoked';
  statusLabel?: string;
  progressStatus: 'not_started' | 'filling' | 'draft_saved' | 'submitted' | 'checking' | 'need_info' | 'approved';
  progressStatusLabel?: string;
  progressPercent: number;
  currentStep: number;
  assignedTo: string;
  assignedStaffName: string;
  notes: string;
  accessToken?: string;
  expiresAt: string;
  firstUsedAt: string | null;
  completedAt: string | null;
  usedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reissuedFromId: string | null;
  reissuedToId: string | null;
  reissueReason?: string;
  revokeReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  ipAddresses?: string[];
  lastDraftSavedAt?: string;
  profileId?: string;
}

export interface StudentRegistrationStats {
  total: number;
  pending: number;
  in_progress: number;
  inProgress?: number;
  used: number;
  expiring_soon: number;
  expiringSoon?: number;
  expired: number;
  revoked: number;
  completionRate: number;
}

export interface StudentRegistrationListResult {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  codes: StudentRegistrationCodeItem[];
}

export interface BulkCreateResult {
  totalProcessed: number;
  successCount: number;
  createdCount: number;
  failedCount: number;
  created: StudentRegistrationCodeItem[];
  failed: Array<{ index: number; studentName: string; phone: string; reason: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class StudentRegistrationAdminService {
  private readonly auth = inject(AdminAuthService);
  private readonly apiEndpoint = '/admin-api/student-registration-codes.php';

  private async request<T = any>(
    url: string,
    init: RequestInit = {}
  ): Promise<T> {
    const csrfToken = this.auth.session()?.csrfToken || '';
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-CSRF-Token': csrfToken,
          ...(init.body && !(init.body instanceof FormData)
            ? { 'Content-Type': 'application/json' }
            : {}),
          ...init.headers,
        },
      });
    } catch {
      throw new AdminApiError('Không thể kết nối đến máy chủ quản trị.', 0);
    }

    let payload: any = {};
    try {
      payload = await response.json();
    } catch {
      throw new AdminApiError('Máy chủ trả về dữ liệu không hợp lệ.', response.status);
    }

    if (!response.ok || payload.success === false) {
      throw new AdminApiError(
        payload.message || 'Yêu cầu quản trị không thành công.',
        response.status
      );
    }

    return payload as T;
  }

  async getStats(): Promise<StudentRegistrationStats> {
    const res = await this.request<{ success: boolean; data: any }>(
      `${this.apiEndpoint}?action=stats`
    );
    const d = res.data || {};
    return {
      total: d.total || 0,
      pending: d.pending || 0,
      in_progress: d.in_progress ?? d.inProgress ?? 0,
      inProgress: d.in_progress ?? d.inProgress ?? 0,
      used: d.used || 0,
      expiring_soon: d.expiring_soon ?? d.expiringSoon ?? 0,
      expiringSoon: d.expiring_soon ?? d.expiringSoon ?? 0,
      expired: d.expired || 0,
      revoked: d.revoked || 0,
      completionRate: d.completionRate || 0,
    };
  }

  async getCodes(filters: {
    search?: string;
    status?: string;
    progressStatus?: string;
    assignedTo?: string;
    page?: number;
    pageSize?: number;
    from_date?: string;
    to_date?: string;
  } = {}): Promise<StudentRegistrationListResult> {
    const params = new URLSearchParams();
    params.set('action', 'list');
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.progressStatus && filters.progressStatus !== 'all') params.set('progressStatus', filters.progressStatus);
    if (filters.assignedTo && filters.assignedTo !== 'all') params.set('assignedTo', filters.assignedTo);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    if (filters.from_date) params.set('from_date', filters.from_date);
    if (filters.to_date) params.set('to_date', filters.to_date);

    const res = await this.request<{ success: boolean; data: any }>(
      `${this.apiEndpoint}?${params.toString()}`
    );
    const d = res.data || {};
    const codesList: StudentRegistrationCodeItem[] = d.codes || d.items || [];
    return {
      total: typeof d.total === 'number' ? d.total : codesList.length,
      page: typeof d.page === 'number' ? d.page : 1,
      pageSize: typeof d.pageSize === 'number' ? d.pageSize : 10,
      totalPages: typeof d.totalPages === 'number' ? d.totalPages : 1,
      codes: codesList,
    };
  }

  async createCode(payload: {
    studentName: string;
    phone?: string;
    email?: string;
    notes?: string;
    assignedTo?: string;
    assignedStaffName?: string;
    validityHours?: number;
  }): Promise<StudentRegistrationCodeItem> {
    const res = await this.request<{ success: boolean; message: string; data: StudentRegistrationCodeItem }>(
      `${this.apiEndpoint}?action=create`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  }

  async createBulk(students: Array<{
    studentName: string;
    phone?: string;
    email?: string;
    notes?: string;
    assignedTo?: string;
    assignedStaffName?: string;
  }>): Promise<BulkCreateResult> {
    const res = await this.request<{ success: boolean; message: string; data: BulkCreateResult }>(
      `${this.apiEndpoint}?action=create_bulk`,
      {
        method: 'POST',
        body: JSON.stringify({ students }),
      }
    );
    return res.data;
  }

  async revokeCode(id: string, reason: string): Promise<StudentRegistrationCodeItem> {
    const res = await this.request<{ success: boolean; message: string; data: StudentRegistrationCodeItem }>(
      `${this.apiEndpoint}?action=revoke`,
      {
        method: 'POST',
        body: JSON.stringify({ id, reason }),
      }
    );
    return res.data;
  }

  async reissueCode(id: string): Promise<StudentRegistrationCodeItem> {
    const res = await this.request<{ success: boolean; message: string; data: StudentRegistrationCodeItem }>(
      `${this.apiEndpoint}?action=reissue`,
      {
        method: 'POST',
        body: JSON.stringify({ id }),
      }
    );
    return res.data;
  }

  async exportCodes(filters: { search?: string; status?: string; progressStatus?: string } = {}): Promise<any[]> {
    const params = new URLSearchParams();
    params.set('action', 'export');
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.progressStatus && filters.progressStatus !== 'all') params.set('progressStatus', filters.progressStatus);

    const res = await this.request<{ success: boolean; data: any[] }>(
      `${this.apiEndpoint}?${params.toString()}`
    );
    return res.data;
  }

  async getHistory(): Promise<any[]> {
    const res = await this.request<{ success: boolean; data: any[] }>(
      `${this.apiEndpoint}?action=history`
    );
    return res.data;
  }

  async updateProgress(id: string, progressStatus: string): Promise<void> {
    await this.request(
      `${this.apiEndpoint}?action=update_progress`,
      {
        method: 'POST',
        body: JSON.stringify({ id, progressStatus }),
      }
    );
  }
}
