import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  getJobOrderFallbackImage,
  JobOrder,
  JobOrderCategory,
  JOB_ORDER_CATEGORIES,
} from './job-order.model';
import { JobOrdersApiService } from './job-orders-api.service';

type JobOrderFilter = 'all' | JobOrderCategory;

@Component({
  selector: 'app-job-order-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-order-board.html',
  styleUrl: './job-order-board.scss',
})
export class JobOrderBoard implements OnInit {
  @Input() home = false;
  @Input() limit?: number;
  @Input() pageSize = 8;

  readonly categories = JOB_ORDER_CATEGORIES;
  activeFilter: JobOrderFilter = 'all';
  currentPage = 1;
  orders: JobOrder[] = [];
  selectedOrder?: JobOrder;
  loading = true;
  errorMessage = '';

  constructor(private readonly ordersApi: JobOrdersApiService) {}

  async ngOnInit(): Promise<void> {
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

  openOrder(order: JobOrder): void {
    this.selectedOrder = order;
  }

  closeOrder(): void {
    this.selectedOrder = undefined;
  }

  setFilter(filter: JobOrderFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
  }

  setPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  previousPage(): void {
    this.setPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  useFallbackImage(event: Event, order: JobOrder): void {
    const image = event.target as HTMLImageElement;
    const fallback = getJobOrderFallbackImage(order.category);
    if (!image.src.endsWith(fallback)) {
      image.src = fallback;
    }
  }

  categoryCount(category: JobOrderCategory): number {
    return this.orders.filter((order) => order.category === category).length;
  }
}
