import { Injectable } from '@angular/core';
import { AdminAuthService, AdminApiError } from '../../services/admin-auth.service';
import {
  StudentProfileDetail,
  StudentProfileFilters,
  StudentProfilesListResult,
  StudentProfileSummary,
} from './student-profiles-admin.models';

export type { StudentProfilesListResult };

@Injectable({ providedIn: 'root' })
export class StudentProfilesAdminService {
  private readonly endpoint = '/admin-api/student-profiles.php';

  constructor(private readonly auth: AdminAuthService) {}

  async getProfiles(
    filters: Partial<StudentProfileFilters> = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<StudentProfilesListResult> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.from_date) params.set('from_date', filters.from_date);
    if (filters.to_date) params.set('to_date', filters.to_date);
    if (filters.sort) params.set('sort', filters.sort);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const url = `${this.endpoint}?${params.toString()}`;
    const res = await this.request(url);
    const profiles = (res['profiles'] as StudentProfileSummary[]) || [];
    const total = typeof res['total'] === 'number' ? res['total'] : profiles.length;
    const resPage = typeof res['page'] === 'number' ? res['page'] : page;
    const resLimit = typeof res['limit'] === 'number' ? res['limit'] : limit;
    const totalPages =
      typeof res['totalPages'] === 'number'
        ? res['totalPages']
        : Math.max(1, Math.ceil(total / resLimit));
    const trashCount = typeof res['trashCount'] === 'number' ? res['trashCount'] : 0;

    return {
      profiles,
      total,
      page: resPage,
      limit: resLimit,
      totalPages,
      trashCount,
    };
  }

  async getProfile(id: string): Promise<StudentProfileDetail> {
    const url = `${this.endpoint}?id=${encodeURIComponent(id)}`;
    const res = await this.request(url);
    if (!res['profile']) {
      throw new Error('Không tìm thấy thông tin hồ sơ học viên.');
    }
    return res['profile'] as StudentProfileDetail;
  }

  async updateProfile(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<StudentProfileDetail> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }

    const url = `${this.endpoint}?id=${encodeURIComponent(id)}`;
    const res = await this.request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(updates),
    });

    return res['profile'] as StudentProfileDetail;
  }

  async moveToTrash(id: string): Promise<{ message: string; trashCount: number }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }
    const res = await this.request(
      `${this.endpoint}?action=trash&id=${encodeURIComponent(id)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ id }),
      },
    );
    return {
      message: (res['message'] as string) || 'Đã chuyển hồ sơ vào thùng rác.',
      trashCount: (res['trashCount'] as number) || 0,
    };
  }

  async restoreProfile(
    id: string,
  ): Promise<{ message: string; profile: StudentProfileDetail; trashCount: number }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }
    const res = await this.request(
      `${this.endpoint}?action=restore&id=${encodeURIComponent(id)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ id }),
      },
    );
    return {
      message: (res['message'] as string) || 'Đã khôi phục hồ sơ.',
      profile: res['profile'] as StudentProfileDetail,
      trashCount: (res['trashCount'] as number) || 0,
    };
  }

  async deletePermanent(id: string): Promise<{ message: string; trashCount: number }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }
    const res = await this.request(
      `${this.endpoint}?action=delete-permanent&id=${encodeURIComponent(id)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ id }),
      },
    );
    return {
      message: (res['message'] as string) || 'Đã xóa vĩnh viễn hồ sơ.',
      trashCount: (res['trashCount'] as number) || 0,
    };
  }

  async emptyTrash(): Promise<{ message: string; deletedCount: number; trashCount: number }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }
    const res = await this.request(`${this.endpoint}?action=empty-trash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({}),
    });
    return {
      message: (res['message'] as string) || 'Đã dọn sạch thùng rác.',
      deletedCount: (res['deletedCount'] as number) || 0,
      trashCount: 0,
    };
  }

  async uploadExcelVersion(
    id: string,
    workbookBlob: Blob,
    filename: string,
  ): Promise<{ profile: StudentProfileDetail; newVersion: number }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }

    const formData = new FormData();
    formData.append('workbook', workbookBlob, filename);
    formData.append('id', id);

    const url = `${this.endpoint}?action=upload-excel-version&id=${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });

    const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok) {
      throw new Error(
        (json?.['message'] as string) || 'Không thể lưu phiên bản Excel mới lên máy chủ.',
      );
    }

    return {
      profile: json?.['profile'] as StudentProfileDetail,
      newVersion: (json?.['newVersion'] as number) || 1,
    };
  }

  async uploadFile(
    id: string,
    fileType: 'photo' | 'document',
    file: File,
  ): Promise<{ profile: StudentProfileDetail; fileName: string }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('fileType', fileType);
    formData.append('id', id);

    const url = `${this.endpoint}?action=upload-file&id=${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });

    const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok) {
      throw new Error((json?.['message'] as string) || 'Không thể tải file lên máy chủ.');
    }

    return {
      profile: json?.['profile'] as StudentProfileDetail,
      fileName: (json?.['fileName'] as string) || file.name,
    };
  }

  async deleteFile(
    profileId: string,
    fileId: string,
  ): Promise<{ profile: StudentProfileDetail; message: string }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }

    const res = await this.request(
      `${this.endpoint}?action=delete-file&profile_id=${encodeURIComponent(
        profileId,
      )}&file_id=${encodeURIComponent(fileId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ profileId, fileId }),
      },
    );

    return {
      profile: res['profile'] as StudentProfileDetail,
      message: (res['message'] as string) || 'Đã xóa tệp tin thành công.',
    };
  }

  getDownloadUrl(profileId: string, fileId: string): string {
    return `${this.endpoint}?action=download-file&profile_id=${encodeURIComponent(
      profileId,
    )}&file_id=${encodeURIComponent(fileId)}`;
  }

  async createSupplementCode(profileId: string): Promise<{
    success: boolean;
    code: string;
    codeId: string;
    studentName: string;
    studentCode: string;
    expiresAt: string;
    directUrl: string;
    message: string;
  }> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }
    const res = await this.request(
      `${this.endpoint}?action=create-supplement-code&id=${encodeURIComponent(profileId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ profileId }),
      },
    );
    return res as unknown as {
      success: boolean;
      code: string;
      codeId: string;
      studentName: string;
      studentCode: string;
      expiresAt: string;
      directUrl: string;
      message: string;
    };
  }

  async fetchFileBlob(profileId: string, fileId: string): Promise<Blob> {
    const url = `${this.endpoint}?action=download-file&profile_id=${encodeURIComponent(
      profileId,
    )}&file_id=${encodeURIComponent(fileId)}&preview=1`;
    const response = await fetch(url, {
      credentials: 'same-origin',
    });
    if (!response.ok) {
      throw new Error('Không thể tải file xem trước.');
    }
    return await response.blob();
  }

  private async request(
    url: string,
    init: RequestInit = {},
  ): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          ...init.headers,
        },
      });
    } catch {
      throw new AdminApiError('Không thể kết nối đến máy chủ quản trị.', 0);
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = (await response.json()) as Record<string, unknown>;
    } catch {
      throw new AdminApiError('Máy chủ trả về dữ liệu không hợp lệ.', response.status);
    }

    if (!response.ok) {
      throw new AdminApiError(
        (payload['message'] as string) || 'Yêu cầu quản trị không thành công.',
        response.status,
      );
    }

    return payload;
  }
}
