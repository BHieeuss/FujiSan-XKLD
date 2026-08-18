import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  createEmptyJobOrder,
  getJobOrderFallbackImage,
  getJobOrderCategory,
  getJobOrderTitle,
  JobOrder,
  JobOrderPayload,
  JOB_ORDER_CATEGORIES,
  stripJobOrderHtml,
} from '../jobs/job-order.model';
import { JobOrdersApiError, JobOrdersApiService } from '../jobs/job-orders-api.service';

type StatusFilter = 'all' | JobOrder['status'];
type DescriptionCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'formatBlock'
  | 'removeFormat';

@Component({
  selector: 'app-job-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-orders-admin.html',
  styleUrl: './job-orders-admin.scss',
})
export class JobOrdersAdmin implements AfterViewInit, OnInit, OnDestroy {
  readonly categories = JOB_ORDER_CATEGORIES;
  @ViewChild('descriptionEditor') private descriptionEditor?: ElementRef<HTMLDivElement>;
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
  descriptionEmpty = true;

  constructor(private readonly ordersApi: JobOrdersApiService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  ngAfterViewInit(): void {
    this.syncDescriptionEditor();
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

  get previewTitle(): string {
    return getJobOrderTitle(this.draft);
  }

  get previewCategory() {
    return getJobOrderCategory(this.draft.category);
  }

  startCreate(): void {
    this.editingId = null;
    this.draft = createEmptyJobOrder();
    this.selectedImage = undefined;
    this.releaseImagePreview();
    this.clearMessages();
    this.syncDescriptionEditor();
  }

  startEdit(order: JobOrder): void {
    this.editingId = order.id;
    this.draft = {
      title: order.title ?? '',
      imageUrl: order.imageUrl,
      category: order.category,
      description: order.description,
      status: order.status,
      isFeatured: order.isFeatured,
    };
    this.selectedImage = undefined;
    this.releaseImagePreview();
    this.clearMessages();
    this.syncDescriptionEditor();
  }

  onEditorToolbarMouseDown(event: MouseEvent): void {
    // Keep the current text selection while the toolbar button receives the click.
    event.preventDefault();
  }

  formatDescription(command: DescriptionCommand, value?: string): void {
    const editor = this.descriptionEditor?.nativeElement;
    if (!editor) {
      return;
    }

    editor.focus();
    editor.ownerDocument.execCommand(command, false, value);
    this.updateDraftFromEditor();
  }

  onDescriptionInput(event: Event): void {
    const editor = event.target as HTMLDivElement;
    this.draft.description = editor.innerHTML;
    this.descriptionEmpty = this.isDescriptionEmpty(editor.innerHTML);
  }

  orderTitle(order: JobOrder): string {
    return getJobOrderTitle(order);
  }

  stripHtml(html: string): string {
    return stripJobOrderHtml(html);
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
      this.updateDraftFromEditor();
      if (!this.draft.title?.trim()) {
        throw new Error('Vui lòng nhập tiêu đề cho đơn hàng.');
      }
      if (this.descriptionEmpty) {
        throw new Error('Vui lòng nhập nội dung mô tả cho đơn hàng.');
      }

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
      const wasEditing = !!this.editingId;
      this.draft = this.payloadFromOrder(order);
      this.syncDescriptionEditor();
      this.successMessage = wasEditing ? 'Đã cập nhật đơn hàng.' : 'Đã thêm đơn hàng.';
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

  useFallbackImage(event: Event, order: Pick<JobOrder, 'category'>): void {
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

  private payloadFromOrder(order: JobOrder): JobOrderPayload {
    return {
      title: order.title ?? '',
      imageUrl: order.imageUrl,
      category: order.category,
      description: order.description,
      status: order.status,
      isFeatured: order.isFeatured,
    };
  }

  private updateDraftFromEditor(): void {
    const editor = this.descriptionEditor?.nativeElement;
    if (!editor) {
      return;
    }

    this.draft.description = editor.innerHTML;
    this.descriptionEmpty = this.isDescriptionEmpty(editor.innerHTML);
  }

  private syncDescriptionEditor(): void {
    const editor = this.descriptionEditor?.nativeElement;
    if (!editor) {
      return;
    }

    const value = this.editorHtmlFor(this.draft.description);
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
    this.descriptionEmpty = this.isDescriptionEmpty(this.draft.description);
  }

  private editorHtmlFor(value: string): string {
    if (!value) {
      return '';
    }
    if (/<\/?[a-z][^>]*>/i.test(value)) {
      return value;
    }

    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r\n|\r|\n/g, '<br>');
  }

  private isDescriptionEmpty(value: string): boolean {
    return stripJobOrderHtml(value).length === 0;
  }

  private messageFor(error: unknown): string {
    if (error instanceof JobOrdersApiError || error instanceof Error) {
      return error.message;
    }
    return 'Không thể cập nhật đơn hàng. Vui lòng thử lại.';
  }
}
