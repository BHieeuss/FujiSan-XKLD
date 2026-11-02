import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface ScrollOptions {
  offset?: number;
  behavior?: 'auto' | 'smooth';
  focus?: boolean;
  highlight?: boolean;
  block?: ScrollLogicalPosition;
}

export interface StoredListContext {
  page: number;
  searchTerm?: string;
  filters?: Record<string, any>;
  scrollY?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScrollNavigationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly contextStorage = new Map<string, StoredListContext>();
  private lastScrollPositions = new Map<string, number>();

  constructor() {
    if (this.isBrowser) {
      this.initAutoRouteScroll();
    }
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Kiểm tra người dùng có bật chế độ giảm chuyển động trong hệ điều hành không
   */
  get prefersReducedMotion(): boolean {
    if (!this.isBrowser) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Kiểm tra thiết bị có phải màn hình cảm ứng di động không
   */
  get isMobile(): boolean {
    if (!this.isBrowser) return false;
    return window.innerWidth < 768 || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
  }

  /**
   * Lấy chiều cao thực tế của thanh Header cố định để tính khoảng bù trừ cuộn
   */
  getHeaderHeight(): number {
    if (!this.isBrowser) return 76;

    // Header quản trị admin
    const adminTopbar = document.querySelector<HTMLElement>('.admin-topbar');
    if (adminTopbar && adminTopbar.offsetHeight > 0) {
      return adminTopbar.offsetHeight;
    }

    // Header website chính
    const mainHeader = document.querySelector<HTMLElement>('.main-header');
    if (mainHeader && mainHeader.offsetHeight > 0) {
      return mainHeader.offsetHeight;
    }

    return 76;
  }

  /**
   * Cuộn về đầu trang hoặc đầu nội dung chính
   * @param behavior 'auto' (tức thời - mặc định cho trang quản trị) hoặc 'smooth' (mượt mà)
   */
  scrollToTop(behavior: 'auto' | 'smooth' = 'auto'): void {
    if (!this.isBrowser) return;

    const actualBehavior = this.prefersReducedMotion ? 'auto' : behavior;

    // Kiểm tra xem có container nội dung riêng không
    const adminContent = document.querySelector<HTMLElement>('.admin-content');
    if (adminContent && adminContent.scrollTop > 0) {
      adminContent.scrollTo({ top: 0, behavior: actualBehavior });
    }

    window.scrollTo({ top: 0, behavior: actualBehavior });
  }

  /**
   * Cuộn đến một phần tử mục tiêu (Tiêu đề, Bảng, Thẻ, Biểu mẫu)
   */
  scrollToElement(
    target: string | HTMLElement | null,
    options: ScrollOptions = {}
  ): boolean {
    if (!this.isBrowser || !target) return false;

    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return false;

    const offset = options.offset !== undefined ? options.offset : this.getHeaderHeight() + 16;
    const behavior = this.prefersReducedMotion ? 'auto' : (options.behavior || 'smooth');
    const block = options.block || 'start';

    // Tính toán tọa độ cuộn tuyệt đối an toàn
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    let targetTop = rect.top + scrollTop - offset;
    if (block === 'center') {
      targetTop = rect.top + scrollTop - (window.innerHeight / 2) + (rect.height / 2);
    }

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior,
    });

    // Làm nổi bật nhẹ phần tử mục tiêu (Visual Feedback)
    if (options.highlight) {
      el.classList.add('nav-target-highlight');
      window.setTimeout(() => el.classList.remove('nav-target-highlight'), 1800);
    }

    // Quản lý tiêu điểm (Focus) an toàn, tránh bật bàn phím ảo vô ý trên mobile
    if (options.focus) {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
      if (!isInput || !this.isMobile) {
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', '-1');
        }
        try {
          el.focus({ preventScroll: true });
        } catch {
          // Tránh lỗi trình duyệt cũ
        }
      }
    }

    return true;
  }

  /**
   * Cuộn đến đầu bảng hoặc danh sách dữ liệu (Dùng cho Phân trang, Tìm kiếm, Lọc)
   * Chỉ cuộn nếu người dùng đang ở sâu bên dưới, không giật màn hình nếu đã ở gần bảng
   */
  scrollToTableOrList(
    selector = '.admin-data-table, .table-card, .job-order-grid, .data-table-container',
    minScrollThreshold = 250
  ): void {
    if (!this.isBrowser) return;

    const el = document.querySelector<HTMLElement>(selector);
    if (!el) {
      this.scrollToTop('smooth');
      return;
    }

    const rect = el.getBoundingClientRect();
    const headerHeight = this.getHeaderHeight();

    // Nếu đỉnh bảng đang nằm ngoài tầm mắt phía trên (bị cuộn qua), cuộn nhẹ đưa bảng về tầm nhìn
    if (rect.top < headerHeight + 20 || window.scrollY > minScrollThreshold) {
      this.scrollToElement(el, {
        offset: headerHeight + 16,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Tự động tìm và cuộn đến trường nhập liệu không hợp lệ đầu tiên trong biểu mẫu
   */
  scrollToFirstError(
    formSelector = 'form, .student-form, .job-wizard-form',
    container?: HTMLElement
  ): HTMLElement | null {
    if (!this.isBrowser) return null;

    const root = container || (document.querySelector<HTMLElement>(formSelector) || document.body);
    
    // Tìm các trường lỗi thông qua các class và selector chuẩn
    const errorSelectors = [
      '.ng-invalid.ng-touched:not(form)',
      '.ng-invalid[required]:not(form)',
      '.is-invalid',
      '.has-error input',
      '.has-error select',
      '.has-error textarea',
      '[aria-invalid="true"]',
      '.field-error-target'
    ];

    const firstInvalid = root.querySelector<HTMLElement>(errorSelectors.join(', '));
    if (!firstInvalid) return null;

    // Cuộn mượt đến trường lỗi và đặt vào vùng nhìn giữa màn hình
    this.scrollToElement(firstInvalid, {
      offset: this.getHeaderHeight() + 32,
      behavior: 'smooth',
      block: 'center',
      highlight: true,
      focus: !this.isMobile,
    });

    // Thêm hiệu ứng rung nhẹ viền đỏ để thu hút sự chú ý của người dùng
    firstInvalid.classList.add('field-error-shake');
    window.setTimeout(() => firstInvalid.classList.remove('field-error-shake'), 1200);

    return firstInvalid;
  }

  /**
   * Ghi nhớ ngữ cảnh danh sách (Trang số mấy, từ khóa, bộ lọc, vị trí cuộn)
   */
  saveListContext(key: string, context: { page: number; searchTerm?: string; filters?: Record<string, any> }): void {
    if (!this.isBrowser) return;

    const currentY = window.pageYOffset || document.documentElement.scrollTop;
    this.contextStorage.set(key, {
      ...context,
      scrollY: currentY,
      timestamp: Date.now(),
    });
  }

  /**
   * Lấy lại ngữ cảnh danh sách đã lưu (trong vòng 15 phút)
   */
  getListContext(key: string): StoredListContext | null {
    const ctx = this.contextStorage.get(key);
    if (!ctx) return null;

    // Hết hạn sau 15 phút
    if (Date.now() - ctx.timestamp > 15 * 60 * 1000) {
      this.contextStorage.delete(key);
      return null;
    }

    return ctx;
  }

  /**
   * Xóa ngữ cảnh danh sách
   */
  clearListContext(key: string): void {
    this.contextStorage.delete(key);
  }

  /**
   * Khôi phục vị trí cuộn trước đó
   */
  restoreScrollY(y?: number, behavior: 'auto' | 'smooth' = 'auto'): void {
    if (!this.isBrowser || y === undefined || y < 0) return;
    const actualBehavior = this.prefersReducedMotion ? 'auto' : behavior;
    window.scrollTo({ top: y, behavior: actualBehavior });
  }

  /**
   * Lắng nghe router chuyển trang tự động để đưa người dùng về đầu nội dung chính
   */
  private initAutoRouteScroll(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        // Nếu có fragment (#id) thì để anchor scrolling xử lý riêng
        if (event.urlAfterRedirects.includes('#')) {
          const fragment = event.urlAfterRedirects.split('#')[1];
          if (fragment) {
            window.setTimeout(() => {
              this.scrollToElement(`#${fragment}`, { behavior: 'smooth' });
            }, 100);
          }
          return;
        }

        // Nếu chuyển sang trang mới thông thường: cuộn về đầu nội dung
        const isChildOrAdmin = event.urlAfterRedirects.startsWith('/quan-tri-viejap');
        this.scrollToTop(isChildOrAdmin ? 'auto' : 'auto');
      });
  }
}

