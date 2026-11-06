import { Injectable } from '@angular/core';
import { AdminAuthService } from '../../admin/services/admin-auth.service';
import { JobOrder, JobOrderPayload } from '../models/job-order.model';

interface JobOrdersResponse {
  orders?: JobOrder[];
  order?: JobOrder;
  imageUrl?: string;
  deleted?: boolean;
  message?: string;
}

export class JobOrdersApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class JobOrdersApiService {
  constructor(private readonly auth: AdminAuthService) {}

  async listPublic(): Promise<JobOrder[]> {
    const response = await this.request('/orders-api/orders.php');
    return response.orders ?? [];
  }

  async getPublic(id: string): Promise<JobOrder> {
    const response = await this.request(`/orders-api/orders.php?id=${encodeURIComponent(id)}`);
    if (!response.order) {
      throw new JobOrdersApiError('Không tìm thấy đơn hàng.', 404);
    }
    return response.order;
  }

  async listAdmin(): Promise<JobOrder[]> {
    const response = await this.request('/admin-api/orders.php', {}, true);
    return response.orders ?? [];
  }

  async create(payload: JobOrderPayload, opts?: { idempotencyKey?: string }): Promise<JobOrder> {
    const extraHeaders: Record<string, string> = {};
    if (opts?.idempotencyKey) {
      extraHeaders['X-Idempotency-Key'] = opts.idempotencyKey;
    }
    const response = await this.request(
      '/admin-api/orders.php',
      { method: 'POST', body: JSON.stringify(payload), headers: extraHeaders },
      true,
    );
    if (!response.order) {
      throw new JobOrdersApiError('Không thể tạo đơn hàng.', 500);
    }
    return response.order;
  }

  async update(id: string, payload: JobOrderPayload): Promise<JobOrder> {
    const response = await this.request(
      `/admin-api/orders.php?action=update&id=${encodeURIComponent(id)}`,
      {
        method: 'POST',
        body: JSON.stringify({ ...payload, action: 'update', id }),
      },
      true,
    );
    if (!response.order) {
      throw new JobOrdersApiError('Không thể cập nhật đơn hàng.', 500);
    }
    return response.order;
  }

  async remove(id: string): Promise<void> {
    await this.request(
      `/admin-api/orders.php?action=delete&id=${encodeURIComponent(id)}`,
      {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id }),
      },
      true,
    );
  }

  async checkOrderCode(code: string, excludeId?: string): Promise<boolean> {
    const params = new URLSearchParams({ action: 'check_code', code });
    if (excludeId) {
      params.append('excludeId', excludeId);
    }
    const response = await this.request(`/admin-api/orders.php?${params.toString()}`, {}, true);
    return Boolean((response as any).exists);
  }

  async saveDraft(draft: JobOrderPayload): Promise<void> {
    await this.request(
      '/admin-api/orders.php?action=draft_save',
      { method: 'POST', body: JSON.stringify(draft) },
      true,
    );
  }

  async getDraft(): Promise<JobOrderPayload | null> {
    const response = await this.request('/admin-api/orders.php?action=draft_get', {}, true);
    return (response as any).draft ?? null;
  }

  async clearDraft(): Promise<void> {
    await this.request('/admin-api/orders.php?action=draft_clear', { method: 'POST', body: '{}' }, true);
  }

  async uploadImage(file: File): Promise<string> {
    const body = new FormData();
    body.append('image', file, file.name);
    const response = await this.request(
      '/admin-api/order-image.php',
      { method: 'POST', body },
      true,
    );
    if (!response.imageUrl) {
      throw new JobOrdersApiError('Không thể tải ảnh đơn hàng lên.', 500);
    }
    return response.imageUrl;
  }

  private async request(
    url: string,
    init: RequestInit = {},
    requiresAdminSession = false,
  ): Promise<JobOrdersResponse> {
    const csrfToken = this.auth.session()?.csrfToken;
    if (requiresAdminSession && !csrfToken) {
      throw new JobOrdersApiError('Phiên đăng nhập đã hết hạn.', 401);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
          ...(requiresAdminSession ? { 'X-CSRF-Token': csrfToken! } : {}),
          ...init.headers,
        },
      });
    } catch {
      throw new JobOrdersApiError('Không thể kết nối máy chủ đơn hàng.', 0);
    }

    let payload: JobOrdersResponse = {};
    try {
      payload = (await response.json()) as JobOrdersResponse;
    } catch {
      throw new JobOrdersApiError('Máy chủ trả về dữ liệu không hợp lệ.', response.status);
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.auth.session.set(null);
      }
      throw new JobOrdersApiError(payload.message || 'Không thể tải dữ liệu đơn hàng.', response.status);
    }

    return payload;
  }
}
