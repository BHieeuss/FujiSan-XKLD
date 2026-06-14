import { Injectable, signal } from '@angular/core';

export interface AdminSession {
  authenticated: true;
  username: string;
  csrfToken: string;
}

interface AdminApiResponse {
  authenticated?: boolean;
  username?: string;
  csrfToken?: string;
  message?: string;
  retryAfter?: number;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter = 0,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  readonly session = signal<AdminSession | null>(null);

  private readonly apiRoot = '/admin-api';
  private sessionRequest?: Promise<boolean>;

  async checkSession(force = false): Promise<boolean> {
    if (!force && this.session()) {
      return true;
    }

    if (!force && this.sessionRequest) {
      return this.sessionRequest;
    }

    this.sessionRequest = this.fetchSession();
    try {
      return await this.sessionRequest;
    } finally {
      this.sessionRequest = undefined;
    }
  }

  async login(username: string, password: string): Promise<void> {
    const response = await this.request('login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.storeAuthenticatedSession(response);
  }

  async logout(): Promise<void> {
    const csrfToken = this.session()?.csrfToken;
    if (!csrfToken) {
      this.session.set(null);
      return;
    }

    try {
      await this.request('logout.php', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
      });
    } finally {
      this.session.set(null);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const csrfToken = this.session()?.csrfToken;
    if (!csrfToken) {
      throw new AdminApiError('Phiên đăng nhập đã hết hạn.', 401);
    }

    const response = await this.request('change-password.php', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    this.storeAuthenticatedSession(response);
  }

  private async fetchSession(): Promise<boolean> {
    try {
      const response = await this.request('session.php');
      if (response.authenticated) {
        this.storeAuthenticatedSession(response);
        return true;
      }
    } catch {
      // The route guard treats an unavailable or expired session as signed out.
    }

    this.session.set(null);
    return false;
  }

  private storeAuthenticatedSession(response: AdminApiResponse): void {
    if (!response.authenticated || !response.username || !response.csrfToken) {
      throw new AdminApiError('Phản hồi xác thực không hợp lệ.', 500);
    }

    this.session.set({
      authenticated: true,
      username: response.username,
      csrfToken: response.csrfToken,
    });
  }

  private async request(endpoint: string, init: RequestInit = {}): Promise<AdminApiResponse> {
    let response: Response;
    try {
      response = await fetch(`${this.apiRoot}/${endpoint}`, {
        ...init,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
      });
    } catch {
      throw new AdminApiError(
        'Không thể kết nối máy chủ quản trị. Khi chạy local, hãy khởi động bằng npm start.',
        0,
      );
    }

    let payload: AdminApiResponse = {};
    try {
      payload = (await response.json()) as AdminApiResponse;
    } catch {
      throw new AdminApiError(
        'API quản trị chưa được PHP xử lý. Khi chạy local, hãy dừng máy chủ cũ rồi chạy npm start.',
        response.status,
      );
    }

    if (!response.ok) {
      if (response.status === 401 && endpoint !== 'login.php') {
        this.session.set(null);
      }
      throw new AdminApiError(
        payload.message || 'Yêu cầu quản trị không thành công.',
        response.status,
        payload.retryAfter ?? 0,
      );
    }

    return payload;
  }
}
