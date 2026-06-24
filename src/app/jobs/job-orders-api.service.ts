import { Injectable } from '@angular/core';
import { AdminAuthService } from '../admin/admin-auth.service';
import { JobOrder, JobOrderPayload } from './job-order.model';

interface JobOrdersResponse {
  orders?: JobOrder[];
  order?: JobOrder;
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

  async create(payload: JobOrderPayload): Promise<JobOrder> {
    const response = await this.request(
      '/admin-api/orders.php',
      { method: 'POST', body: JSON.stringify(payload) },
      true,
    );
    if (!response.order) {
      throw new JobOrdersApiError('Không thể tạo đơn hàng.', 500);
    }
    return response.order;
  }

  async update(id: string, payload: JobOrderPayload): Promise<JobOrder> {
    const response = await this.request(
      `/admin-api/orders.php?id=${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      true,
    );
    if (!response.order) {
      throw new JobOrdersApiError('Không thể cập nhật đơn hàng.', 500);
    }
    return response.order;
  }

  async remove(id: string): Promise<void> {
    await this.request(
      `/admin-api/orders.php?id=${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      true,
    );
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
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
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
