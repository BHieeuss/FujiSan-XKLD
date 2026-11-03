import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONTACT_INFO } from '../../../core/config/app.config';
import {
  getJobOrderCategory,
  getJobOrderFallbackImage,
  getJobOrderTitle,
  JobOrder,
  JobOrderCategory,
  JobOrderCategoryMeta,
  JOB_ORDER_CATEGORIES,
  stripJobOrderHtml,
} from '../models/job-order.model';
import { JobOrdersApiService } from '../services/job-orders-api.service';

type JobOrderFilter = 'all' | JobOrderCategory;

@Component({
  selector: 'app-job-order-board',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-order-board.html',
  styleUrl: './job-order-board.scss',
})
export class JobOrderBoard implements OnInit {
  readonly contactInfo = APP_CONTACT_INFO;
  @Input() home = false;
  @Input() limit?: number;
  @Input() pageSize = 8;

  readonly categories = JOB_ORDER_CATEGORIES;
  readonly getJobOrderFallbackImage = getJobOrderFallbackImage;
  readonly displayCategories = JOB_ORDER_CATEGORIES.filter((c) =>
    ['nong-nghiep', 'thuc-pham', 'co-khi', 'xay-dung', 'dien-tu', 'khac'].includes(c.key),
  );
  activeFilter: JobOrderFilter = 'all';
  currentPage = 1;
  orders: JobOrder[] = [];
  loading = true;
  errorMessage = '';

  favorites = signal<Set<string>>(new Set());
  activeMobileIndex = signal(0);
  @ViewChild('orderGrid') orderGridRef?: ElementRef<HTMLElement>;

  constructor(private readonly ordersApi: JobOrdersApiService) {}

  async ngOnInit(): Promise<void> {
    this.loadFavorites();
    try {
      this.orders = await this.ordersApi.listPublic();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng.';
    } finally {
      this.loading = false;
    }
  }

  get filteredOrders(): JobOrder[] {
    return this.orders.filter(
      (order) => this.activeFilter === 'all' || order.category === this.activeFilter,
    );
  }

  get visibleOrders(): JobOrder[] {
    const filtered = this.filteredOrders;

    if (this.home) {
      return this.limit ? filtered.slice(0, this.limit) : filtered;
    }

    const start = (this.currentPage - 1) * this.safePageSize;
    return filtered.slice(start, start + this.safePageSize);
  }

  get hasHiddenOrders(): boolean {
    return this.home && !!this.limit && this.filteredOrders.length > this.limit;
  }

  get showPagination(): boolean {
    return !this.home && this.filteredOrders.length > this.safePageSize;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.safePageSize));
  }

  get paginationPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginationSummary(): string {
    const total = this.filteredOrders.length;
    const start = total ? (this.currentPage - 1) * this.safePageSize + 1 : 0;
    const end = Math.min(this.currentPage * this.safePageSize, total);
    return `Hiển thị ${start}-${end} trong ${total} đơn`;
  }

  private get safePageSize(): number {
    return Math.max(1, this.pageSize || 8);
  }

  setFilter(filter: JobOrderFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.activeMobileIndex.set(0);
    this.orderGridRef?.nativeElement.scrollTo({ left: 0, behavior: 'instant' });
  }

  setPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
    this.activeMobileIndex.set(0);
    this.orderGridRef?.nativeElement.scrollTo({ left: 0, behavior: 'instant' });
  }

  previousPage(): void {
    this.setPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  /* ── Mobile Horizontal Swipe / Carousel Navigation ── */

  onGridScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const children = el.children;
    if (!children.length) return;

    let closestIndex = 0;
    let minDiff = Infinity;
    const baseOffset = (children[0] as HTMLElement).offsetLeft;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const diff = Math.abs((child.offsetLeft - baseOffset) - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (this.activeMobileIndex() !== closestIndex) {
      this.activeMobileIndex.set(closestIndex);
    }
  }

  scrollToMobileSlide(index: number): void {
    const el = this.orderGridRef?.nativeElement;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, this.visibleOrders.length - 1));
    const children = el.children;
    const target = children[clamped] as HTMLElement | undefined;
    if (target) {
      const baseOffset = (children[0] as HTMLElement).offsetLeft;
      el.scrollTo({
        left: target.offsetLeft - baseOffset,
        behavior: 'smooth',
      });
      this.activeMobileIndex.set(clamped);
    }
  }

  prevMobileSlide(): void {
    this.scrollToMobileSlide(this.activeMobileIndex() - 1);
  }

  nextMobileSlide(): void {
    this.scrollToMobileSlide(this.activeMobileIndex() + 1);
  }

  useFallbackImage(event: Event, order: JobOrder): void {
    const image = event.target as HTMLImageElement;
    const categoryFallbacks: Record<JobOrderCategory, string> = {
      'nong-nghiep': 'assets/images/jobs/job-nong-nghiep.jpg',
      'thuc-pham': 'assets/images/jobs/job-thuc-pham.jpg',
      'co-khi': 'assets/images/jobs/job-co-khi.jpg',
      'xay-dung': 'assets/images/jobs/job-xay-dung.jpg',
      'dien-tu': 'assets/images/jobs/job-dien-tu.jpg',
      'khac': 'assets/images/jobs/job-khac.jpg',
      'ky-su': 'assets/images/jobs/job-co-khi.jpg',
      'thuc-tap-sinh': 'assets/images/jobs/job-thuc-pham.jpg',
      'tokutei': 'assets/images/jobs/job-thuc-pham.jpg',
      'du-hoc': 'assets/images/DHS/dhs.png',
    };
    const targetSrc = categoryFallbacks[order.category] || getJobOrderFallbackImage(order.category);
    if (!image.src.endsWith(targetSrc)) {
      image.src = targetSrc;
    }
  }

  hasBakedVisual(_order: JobOrder): boolean {
    return false;
  }

  categoryCount(category: JobOrderCategory): number {
    return this.orders.filter((order) => order.category === category).length;
  }

  orderTitle(order: JobOrder): string {
    return getJobOrderTitle(order);
  }

  orderCategory(order: JobOrder): JobOrderCategoryMeta {
    return getJobOrderCategory(order.category);
  }

  stripHtml(html: string): string {
    return stripJobOrderHtml(html);
  }

  /* ── Specification & metadata extractors for rich card view ── */

  orderLocation(order: JobOrder): string {
    const text = `${order.title || ''} ${order.description || ''}`;
    const cities = [
      'Tokyo', 'Chiba', 'Aichi', 'Kagoshima', 'Osaka', 'Kanagawa', 
      'Saitama', 'Fukuoka', 'Hiroshima', 'Shizuoka', 'Hyogo', 'Kyoto',
      'Ibaraki', 'Gunma', 'Mie', 'Gifu', 'Tochigi', 'Nagano', 'Okayama'
    ];
    for (const city of cities) {
      if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
        return `${city} - Nhật Bản`;
      }
    }
    // Category sensible defaults in Japan
    const defaults: Record<JobOrderCategory, string> = {
      'nong-nghiep': 'Kagoshima - Nhật Bản',
      'thuc-pham': 'Chiba - Nhật Bản',
      'co-khi': 'Aichi - Nhật Bản',
      'xay-dung': 'Tokyo - Nhật Bản',
      'dien-tu': 'Osaka - Nhật Bản',
      'khac': 'Fukuoka - Nhật Bản',
      'ky-su': 'Tokyo - Nhật Bản',
      'tokutei': 'Aichi - Nhật Bản',
      'thuc-tap-sinh': 'Kagoshima - Nhật Bản',
      'du-hoc': 'Osaka - Nhật Bản',
    };
    return defaults[order.category] || 'Nhật Bản';
  }

  orderHighlight(order: JobOrder): string {
    const text = `${order.title || ''} ${order.description || ''}`.toLowerCase();
    if (text.includes('lương cao') || text.includes('thu nhập cao')) {
      return 'Lương cao';
    }
    if (text.includes('tay nghề') || text.includes('chuyên môn')) {
      return 'Tay nghề cao';
    }
    if (text.includes('nhà máy') || text.includes('ổn định')) {
      return 'Lương ổn định';
    }
    if (text.includes('hấp dẫn') || text.includes('đãi ngộ')) {
      return 'Thu nhập hấp dẫn';
    }
    const defaults: Record<JobOrderCategory, string> = {
      'nong-nghiep': 'Lương cao',
      'thuc-pham': 'Lương ổn định',
      'co-khi': 'Tay nghề cao',
      'xay-dung': 'Thu nhập hấp dẫn',
      'dien-tu': 'Môi trường tốt',
      'khac': 'Đãi ngộ tốt',
      'ky-su': 'Tay nghề cao',
      'tokutei': 'Thu nhập hấp dẫn',
      'thuc-tap-sinh': 'Lương ổn định',
      'du-hoc': 'Lộ trình tốt',
    };
    return defaults[order.category] || 'Tuyển chọn';
  }

  orderSalary(order: JobOrder): string {
    let val = (order.basicSalary || order.salary || '').trim();
    if (val) {
      val = val.replace(/\s*\([^)]*(?:triệu|vnđ|vnd|đồng)[^)]*\)/gi, '').trim();
      if (val.match(/(?:yên|¥|man|vạn)/i)) {
        return val;
      }
    }
    const text = order.description || '';
    const matchYen = text.match(/(\d{1,3}(?:[.,]\d{3})*|\d+[\s–-]+\d+)\s*(?:yên|¥|man|vạn)(?:\/tháng)?/i);
    if (matchYen) {
      return matchYen[0].trim();
    }
    const defaults: Record<JobOrderCategory, string> = {
      'nong-nghiep': '165.000 ~ 180.000 Yên/tháng',
      'thuc-pham': '175.000 ~ 195.000 Yên/tháng',
      'co-khi': '190.000 ~ 230.000 Yên/tháng',
      'xay-dung': '185.000 ~ 220.000 Yên/tháng',
      'dien-tu': '170.000 ~ 195.000 Yên/tháng',
      'khac': '165.000 ~ 185.000 Yên/tháng',
      'ky-su': '220.000 ~ 300.000 Yên/tháng',
      'tokutei': '195.000 ~ 250.000 Yên/tháng',
      'thuc-tap-sinh': '170.000 ~ 195.000 Yên/tháng',
      'du-hoc': '120.000 ~ 150.000 Yên/tháng',
    };
    return defaults[order.category] || '175.000 ~ 200.000 Yên/tháng';
  }

  orderDuration(order: JobOrder): string {
    const text = order.description || '';
    const match = text.match(/([1-5]\s*năm)/i);
    if (match) {
      return match[1].trim();
    }
    const defaults: Record<JobOrderCategory, string> = {
      'nong-nghiep': '3 năm',
      'thuc-pham': '3 năm',
      'co-khi': '3 năm',
      'xay-dung': '3 năm',
      'dien-tu': '3 năm',
      'khac': '3 năm',
      'ky-su': 'Dài hạn',
      'tokutei': '5 năm',
      'thuc-tap-sinh': '3 năm',
      'du-hoc': '1 - 2 năm',
    };
    return defaults[order.category] || '3 năm';
  }

  orderDeparture(order: JobOrder): string {
    const text = order.description || '';
    const match = text.match(/(202[5-7])/);
    if (match) {
      return `Dự kiến ${match[1]}`;
    }
    return 'Dự kiến 2025';
  }

  /* ── Functional favorites system ── */

  toggleFavorite(orderId: string, event: Event): void {
    event.stopPropagation();
    const current = new Set(this.favorites());
    if (current.has(orderId)) {
      current.delete(orderId);
    } else {
      current.add(orderId);
    }
    this.favorites.set(current);
    this.saveFavorites(current);
  }

  isFavorite(orderId: string): boolean {
    return this.favorites().has(orderId);
  }

  private loadFavorites(): void {
    try {
      const stored = localStorage.getItem('viejap_fav_orders');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          this.favorites.set(new Set(arr));
        }
      }
    } catch {}
  }

  private saveFavorites(favs: Set<string>): void {
    try {
      localStorage.setItem('viejap_fav_orders', JSON.stringify(Array.from(favs)));
    } catch {}
  }
}
