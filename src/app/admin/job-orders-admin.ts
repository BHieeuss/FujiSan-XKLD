import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  createEmptyJobOrder,
  getJobOrderCategory,
  JobOrder,
  JobOrderCategory,
  JobOrderPayload,
  JOB_ORDER_CATEGORIES,
} from '../jobs/job-order.model';
import { JobOrdersApiError, JobOrdersApiService } from '../jobs/job-orders-api.service';

type CategoryFilter = 'all' | JobOrderCategory;
type StatusFilter = 'all' | JobOrder['status'];

@Component({
  selector: 'app-job-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-orders-admin.html',
  styleUrl: './job-orders-admin.scss',
})
export class JobOrdersAdmin implements OnInit {
  readonly categories = JOB_ORDER_CATEGORIES;
  orders: JobOrder[] = [];
  draft: JobOrderPayload = createEmptyJobOrder();
  editingId: string | null = null;
  categoryFilter: CategoryFilter = 'all';
  statusFilter: StatusFilter = 'all';
  loading = true;
  saving = false;
  deletingId = '';
  errorMessage = '';
  successMessage = '';

  constructor(private readonly ordersApi: JobOrdersApiService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  get visibleOrders(): JobOrder[] {
    return this.orders.filter(
      (order) =>
        (this.categoryFilter === 'all' || order.category === this.categoryFilter) &&
        (this.statusFilter === 'all' || order.status === this.statusFilter),
    );
  }

  get publishedCount(): number {
    return this.orders.filter((order) => order.status === 'published').length;
  }

  getCategory(order: JobOrder) {
    return getJobOrderCategory(order.category);
  }

  startCreate(): void {
    this.editingId = null;
    this.draft = createEmptyJobOrder();
    this.clearMessages();
  }

  startEdit(order: JobOrder): void {
    this.editingId = order.id;
    this.draft = {
      orderCode: order.orderCode,
      title: order.title,
      category: order.category,
      location: order.location,
      salary: order.salary,
      ageRange: order.ageRange,
      summary: order.summary,
      requirements: order.requirements,
      departureMonth: order.departureMonth,
      status: order.status,
      isFeatured: order.isFeatured,
    };
    this.clearMessages();
  }

  async save(): Promise<void> {
    if (this.saving) {
      return;
    }

    this.clearMessages();
    this.saving = true;
    try {
      const order = this.editingId
        ? await this.ordersApi.update(this.editingId, this.draft)
        : await this.ordersApi.create(this.draft);

      const existingIndex = this.orders.findIndex((item) => item.id === order.id);
      if (existingIndex >= 0) {
        this.orders[existingIndex] = order;
      } else {
        this.orders.unshift(order);
      }
      this.sortOrders();
      this.successMessage = this.editingId ? 'Đã cập nhật đơn hàng.' : 'Đã thêm đơn hàng mới.';
      this.editingId = order.id;
    } catch (error) {
      this.errorMessage = this.messageFor(error);
    } finally {
      this.saving = false;
    }
  }

  async remove(order: JobOrder): Promise<void> {
    if (this.deletingId || !window.confirm(`Xóa đơn “${order.title}”? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    this.clearMessages();
    this.deletingId = order.id;
    try {
      await this.ordersApi.remove(order.id);
      this.orders = this.orders.filter((item) => item.id !== order.id);
      if (this.editingId === order.id) {
        this.startCreate();
      }
      this.successMessage = 'Đã xóa đơn hàng.';
    } catch (error) {
      this.errorMessage = this.messageFor(error);
    } finally {
      this.deletingId = '';
    }
  }

  setCategoryFilter(filter: CategoryFilter): void {
    this.categoryFilter = filter;
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
  }

  private async reload(): Promise<void> {
    this.loading = true;
    try {
      this.orders = await this.ordersApi.listAdmin();
      this.sortOrders();
    } catch (error) {
      this.errorMessage = this.messageFor(error);
    } finally {
      this.loading = false;
    }
  }

  private sortOrders(): void {
    this.orders.sort((left, right) => {
      if (left.isFeatured !== right.isFeatured) {
        return left.isFeatured ? -1 : 1;
      }
      return right.updatedAt.localeCompare(left.updatedAt);
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private messageFor(error: unknown): string {
    return error instanceof JobOrdersApiError
      ? error.message
      : 'Không thể cập nhật dữ liệu đơn hàng. Vui lòng thử lại.';
  }
}
