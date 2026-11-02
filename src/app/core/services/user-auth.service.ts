import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  fullName: string;
  password: string;
  registrationCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private readonly http = inject(HttpClient);

  private readonly TOKEN_KEY = 'viejap.auth.token';
  private readonly USER_KEY = 'viejap.auth.user';

  // State signals
  private readonly _currentUser = signal<UserProfile | null>(this.getStoredUser());
  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _isLoading = signal<boolean>(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token() && !!this._currentUser());

  /**
   * Đăng nhập bằng Tên đăng nhập / Email và Mật khẩu
   */
  async login(payload: LoginPayload): Promise<UserProfile> {
    this._isLoading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>('/api/auth/login', payload)
      );

      const user: UserProfile = {
        userId: res.userId,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
        avatarUrl: res.avatarUrl,
      };

      this.saveSession(res.token, user);
      return user;
    } catch (error: any) {
      const msg = error?.error?.message || error?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      throw new Error(msg);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Đăng ký tài khoản học viên mới với Mã Code đăng ký
   */
  async register(payload: RegisterPayload): Promise<UserProfile> {
    this._isLoading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>('/api/auth/register', payload)
      );

      const user: UserProfile = {
        userId: res.userId,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
        avatarUrl: res.avatarUrl,
      };

      this.saveSession(res.token, user);
      return user;
    } catch (error: any) {
      const msg = error?.error?.message || error?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin và mã code.';
      throw new Error(msg);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Đăng xuất tài khoản
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.TOKEN_KEY);
      window.localStorage.removeItem(this.USER_KEY);
    }

    this._token.set(null);
    this._currentUser.set(null);
  }

  saveSession(token: string, user: UserProfile): void {
    this._token.set(token);
    this._currentUser.set(user);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.TOKEN_KEY, token);
      window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const json = window.localStorage.getItem(this.USER_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json) as UserProfile;
    } catch {
      return null;
    }
  }
}
