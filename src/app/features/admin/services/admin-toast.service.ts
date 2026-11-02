import { Injectable, signal } from '@angular/core';

export interface AdminToast {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  icon?: string;
  actionUrl?: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminToastService {
  readonly toasts = signal<AdminToast[]>([]);

  show(
    message: string,
    type: 'info' | 'success' | 'warning' | 'danger' = 'info',
    title?: string,
    actionUrl?: string,
    durationMs = 4500
  ): string {
    const id = Math.random().toString(36).substring(2, 9);
    const icons: Record<string, string> = {
      info: 'fas fa-circle-info',
      success: 'fas fa-circle-check',
      warning: 'fas fa-triangle-exclamation',
      danger: 'fas fa-circle-exclamation',
    };

    const newToast: AdminToast = {
      id,
      title: title || (type === 'success' ? 'Thành công' : type === 'warning' ? 'Cảnh báo' : 'Thông báo'),
      message,
      type,
      icon: icons[type] || 'fas fa-bell',
      actionUrl,
      createdAt: Date.now(),
    };

    this.toasts.update((current) => [newToast, ...current].slice(0, 5));

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }

    return id;
  }

  success(message: string, title = 'Thành công'): string {
    return this.show(message, 'success', title);
  }

  error(message: string, title = 'Lỗi'): string {
    return this.show(message, 'danger', title);
  }

  warning(message: string, title = 'Cảnh báo'): string {
    return this.show(message, 'warning', title);
  }

  info(message: string, title = 'Thông báo'): string {
    return this.show(message, 'info', title);
  }

  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }
}

