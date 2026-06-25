import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  createEmptyJobOrder,
  getJobOrderFallbackImage,
  getJobOrderCategory,
  JobOrder,
  JobOrderPayload,
  JOB_ORDER_CATEGORIES,
} from '../jobs/job-order.model';
import { JobOrdersApiError, JobOrdersApiService } from '../jobs/job-orders-api.service';

type StatusFilter = 'all' | JobOrder['status'];

@Component({
  selector: 'app-job-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-orders-admin.html',
  styleUrl: './job-orders-admin.scss',
})
export class JobOrdersAdmin implements OnInit, OnDestroy {
  readonly categories = JOB_ORDER_CATEGORIES;
  orders: JobOrder[] = [];
  draft: JobOrderPayload = createEmptyJobOrder();
  editingId: string | null = null;
  statusFilter: StatusFilter = 'all';
  selectedImage?: File;
  imagePreview = '';
  loading = true;
  saving = false;
  deletingId = '';
  errorMessage = '';
  successMessage = '';

  constructor(private readonly ordersApi: JobOrdersApiService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  ngOnDestroy(): void {
    this.releaseImagePreview();
  }

  get visibleOrders(): JobOrder[] {
    return this.orders.filter(
      (order) => this.statusFilter === 'all' || order.status === this.statusFilter,
    );
  }

  get publishedCount(): number {
    return this.orders.filter((order) => order.status === 'published').length;
  }

  get previewImage(): string {
    return this.imagePreview || this.draft.imageUrl;
  }

  startCreate(): void {
    this.editingId = null;
    this.draft = createEmptyJobOrder();
    this.selectedImage = undefined;
    this.releaseImagePreview();
    this.clearMessages();
  }

  startEdit(order: JobOrder): void {
    this.editingId = order.id;
    this.draft = {
      imageUrl: order.imageUrl,
      category: order.category,
      description: order.description,
      status: order.status,
      isFeatured: order.isFeatured,
    };
    this.selectedImage = undefined;
    this.releaseImagePreview();
    this.clearMessages();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.errorMessage = 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.';
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'Ảnh đơn hàng cần nhỏ hơn 10 MB.';
      input.value = '';
      return;
    }

    this.releaseImagePreview();
    this.selectedImage = file;
    this.imagePreview = URL.createObjectURL(file);
    this.clearMessages();
  }

  async save(): Promise<void> {
    if (this.saving) {
      return;
    }

    this.clearMessages();
    this.saving = true;
    try {
      if (this.selectedImage) {
        const imageUrl = await this.ordersApi.uploadImage(this.selectedImage);
        this.draft = { ...this.draft, imageUrl };
        this.selectedImage = undefined;
        this.releaseImagePreview();
      }
      if (!this.draft.imageUrl) {
        throw new Error('Vui lòng chọn ảnh đơn hàng trước khi lưu.');
      }

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
      this.draft = {
        imageUrl: order.imageUrl,
        category: order.category,
        description: order.description,
        status: order.status,
        isFeatured: order.isFeatured,
      };
      this.successMessage = this.editingId ? 'Đã cập nhật đơn hàng.' : 'Đã thêm đơn hàng.';
      this.editingId = order.id;
    } catch (error) {
      this.errorMessage = this.messageFor(error);
    } finally {
      this.saving = false;
    }
  }

  async remove(order: JobOrder): Promise<void> {
    if (this.deletingId || !window.confirm('Xóa đơn hàng này? Thao tác này không thể hoàn tác.')) {
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

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
  }

  getCategory(order: JobOrder) {
    return getJobOrderCategory(order.category);
  }

  useFallbackImage(event: Event, order: JobOrder): void {
    const image = event.target as HTMLImageElement;
    const fallback = getJobOrderFallbackImage(order.category);
    if (!image.src.endsWith(fallback)) {
      image.src = fallback;
    }
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

  private releaseImagePreview(): void {
    if (this.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreview);
    }
    this.imagePreview = '';
  }

  private messageFor(error: unknown): string {
    if (error instanceof JobOrdersApiError || error instanceof Error) {
      return error.message;
    }
    return 'Không thể cập nhật đơn hàng. Vui lòng thử lại.';
  }
}
