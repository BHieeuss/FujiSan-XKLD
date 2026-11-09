import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminToastService } from '../../services/admin-toast.service';
import { AdminPaginationComponent } from '../shared/admin-pagination/admin-pagination.component';
import {
  EventCategory,
  EventDisplayFormat,
  EventItem,
  EventPriorityLevel,
  EventFrequency,
  EventStats,
  EventStatus,
} from './events-admin.models';
import { EventsAdminService } from './events-admin.service';

type WizardTab = 'basic' | 'formats' | 'cta' | 'schedule' | 'preview';
type PreviewDevice = 'desktop' | 'mobile';
type PreviewFormat = 'popup_center' | 'popup_corner' | 'top_bar' | 'index_banner' | 'floating_button' | 'list';

@Component({
  selector: 'app-events-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent],
  templateUrl: './events-admin.component.html',
  styleUrl: './events-admin.component.scss',
})
export class EventsAdminComponent implements OnInit {
  readonly auth = inject(AdminAuthService);
  private readonly eventsService = inject(EventsAdminService);
  private readonly toast = inject(AdminToastService);

  // View mode
  isEditorOpen = false;
  isSubmitting = false;
  isLoading = false;
  uploadingImage = false;

  // Filter & Pagination state
  events: EventItem[] = [];
  categories: EventCategory[] = [];
  stats: EventStats = {
    total: 0,
    published: 0,
    scheduled: 0,
    paused: 0,
    ended: 0,
    draft: 0,
    totalViews: 0,
    totalClicks: 0,
  };

  searchQuery = '';
  selectedCategory = 'all';
  selectedStatus = 'all';
  selectedFormat = 'all';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly pageSize = 10;

  // Active form state
  activeTab: WizardTab = 'basic';
  editingId: string | null = null;
  formEvent!: EventItem;

  // Live preview state
  previewDevice: PreviewDevice = 'desktop';
  previewFormat: PreviewFormat = 'popup_center';

  // Delete modal
  deletingEvent: EventItem | null = null;
  isDeleting = false;

  ngOnInit(): void {
    this.resetForm();
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventsService
      .listEvents({
        page: this.currentPage,
        limit: this.pageSize,
        q: this.searchQuery,
        category: this.selectedCategory,
        status: this.selectedStatus,
        format: this.selectedFormat,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.events = res.items || [];
          this.totalItems = res.total || 0;
          this.totalPages = res.totalPages || 1;
          this.stats = res.stats || this.stats;
          this.categories = res.categories || [];
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err?.error?.message || 'Không thể tải danh sách sự kiện.');
        },
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadEvents();
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadEvents();
    }
  }

  openCreateModal(): void {
    this.editingId = null;
    this.resetForm();
    this.activeTab = 'basic';
    this.previewDevice = 'desktop';
    this.previewFormat = (this.formEvent.displayFormats[0] as PreviewFormat) || 'popup_center';
    this.isEditorOpen = true;
  }

  openEditModal(event: EventItem): void {
    this.editingId = event.id;
    // Deep clone event to prevent accidental mutations
    this.formEvent = JSON.parse(JSON.stringify(event));
    this.activeTab = 'basic';
    this.previewDevice = 'desktop';
    const initialFormat = this.formEvent.displayFormats.find((f) => f !== 'list') || 'popup_center';
    this.previewFormat = initialFormat as PreviewFormat;
    this.isEditorOpen = true;
  }

  closeEditor(): void {
    this.isEditorOpen = false;
    this.editingId = null;
  }

  resetForm(): void {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const formatDatetimeLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    this.formEvent = {
      id: '',
      code: '',
      title: '',
      displayTitle: '',
      category: 'activities',
      categoryName: 'Hoạt động VieJap',
      summary: '',
      content: '',
      coverImage: 'assets/images/logo.png',
      bannerImage: '',
      gallery: [],
      activityId: '',
      linkToActivity: false,
      displayFormats: ['popup_center'],
      displayConfig: {
        topBar: {
          bgColor: '#0f2b48',
          textColor: '#ffffff',
          icon: 'fas fa-bullhorn',
          isClosable: true,
        },
        popupCenter: {
          layout: 'banner_top',
          autoCloseSeconds: 0,
          backdropClickClose: true,
        },
        popupCorner: {
          position: 'bottom_right',
          autoMinimize: false,
        },
        indexBanner: {
          position: 'below_hero',
          style: 'highlight',
        },
      },
      cta: {
        enabled: true,
        actionType: 'register',
        label: 'Đăng ký ngay',
        url: '/#lien-he',
        target: '_self',
      },
      schedule: {
        startDate: formatDatetimeLocal(now),
        endDate: formatDatetimeLocal(in30Days),
        timezone: 'Asia/Ho_Chi_Minh',
        autoPublish: true,
        autoEnd: true,
      },
      targeting: {
        pages: ['all'],
        userAudience: 'all',
      },
      delivery: {
        priorityLevel: 'normal',
        priorityOrder: 50,
        frequency: 'per_session',
      },
      status: 'published',
      analytics: {
        views: 0,
        clicks: 0,
        dismisses: 0,
      },
      createdBy: 'admin',
      createdByName: 'Quản trị viên',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  isFormatSelected(format: EventDisplayFormat): boolean {
    return this.formEvent.displayFormats.includes(format);
  }

  toggleFormat(format: EventDisplayFormat): void {
    const idx = this.formEvent.displayFormats.indexOf(format);
    if (idx > -1) {
      if (this.formEvent.displayFormats.length > 1) {
        this.formEvent.displayFormats.splice(idx, 1);
        if (this.previewFormat === format) {
          const next = this.formEvent.displayFormats.find((f) => f !== 'list');
          this.previewFormat = (next as PreviewFormat) || 'popup_center';
        }
      } else {
        this.toast.error('Phải chọn tối thiểu 1 hình thức hiển thị cho sự kiện.');
      }
    } else {
      this.formEvent.displayFormats.push(format);
      if (format !== 'list') {
        this.previewFormat = format as PreviewFormat;
      }
    }
  }

  isPageTargetSelected(page: string): boolean {
    return this.formEvent.targeting.pages.includes(page);
  }

  togglePageTarget(page: string): void {
    if (page === 'all') {
      this.formEvent.targeting.pages = ['all'];
      return;
    }

    const pages = this.formEvent.targeting.pages.filter((p) => p !== 'all');
    const idx = pages.indexOf(page);
    if (idx > -1) {
      pages.splice(idx, 1);
      if (pages.length === 0) {
        pages.push('all');
      }
    } else {
      pages.push(page);
    }
    this.formEvent.targeting.pages = pages;
  }

  saveEvent(statusOverride?: EventStatus): void {
    if (!this.formEvent.title.trim()) {
      this.toast.error('Vui lòng nhập tên sự kiện.');
      this.activeTab = 'basic';
      return;
    }

    if (statusOverride) {
      this.formEvent.status = statusOverride;
    }

    this.isSubmitting = true;

    if (this.editingId) {
      this.eventsService.updateEvent(this.editingId, this.formEvent).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.toast.success(res.message || 'Cập nhật sự kiện thành công.');
          this.closeEditor();
          this.loadEvents();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.error(err?.error?.message || 'Lỗi khi cập nhật sự kiện.');
        },
      });
    } else {
      this.eventsService.createEvent(this.formEvent).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.toast.success(res.message || 'Tạo sự kiện mới thành công.');
          this.closeEditor();
          this.loadEvents();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.error(err?.error?.message || 'Lỗi khi tạo sự kiện.');
        },
      });
    }
  }

  togglePublish(event: EventItem): void {
    if (event.status === 'published') {
      this.eventsService.pauseEvent(event.id).subscribe({
        next: () => {
          this.toast.success('Đã tạm dừng hiển thị sự kiện.');
          this.loadEvents();
        },
        error: (err) => this.toast.error(err?.error?.message || 'Không thể tạm dừng.'),
      });
    } else {
      this.eventsService.publishEvent(event.id).subscribe({
        next: () => {
          this.toast.success('Đã xuất bản sự kiện lên website.');
          this.loadEvents();
        },
        error: (err) => this.toast.error(err?.error?.message || 'Không thể xuất bản.'),
      });
    }
  }

  duplicateEvent(event: EventItem): void {
    this.eventsService.duplicateEvent(event.id).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Đã nhân bản sự kiện thành công.');
        this.loadEvents();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Lỗi khi nhân bản.'),
    });
  }

  confirmDelete(event: EventItem): void {
    this.deletingEvent = event;
  }

  cancelDelete(): void {
    this.deletingEvent = null;
  }

  executeDelete(): void {
    if (!this.deletingEvent) return;
    this.isDeleting = true;
    this.eventsService.deleteEvent(this.deletingEvent.id).subscribe({
      next: (res) => {
        this.isDeleting = false;
        this.toast.success(res.message || 'Đã xóa sự kiện.');
        this.deletingEvent = null;
        this.loadEvents();
      },
      error: (err) => {
        this.isDeleting = false;
        this.toast.error(err?.error?.message || 'Lỗi khi xóa sự kiện.');
      },
    });
  }

  handleImageUpload(event: Event, targetField: 'coverImage' | 'bannerImage'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadingImage = true;

    this.eventsService.uploadImage(file).subscribe({
      next: (res) => {
        this.uploadingImage = false;
        if (targetField === 'coverImage') {
          this.formEvent.coverImage = res.url;
        } else {
          this.formEvent.bannerImage = res.url;
        }
        this.toast.success('Tải ảnh sự kiện thành công.');
      },
      error: (err) => {
        this.uploadingImage = false;
        this.toast.error(err?.error?.message || 'Không thể tải ảnh lên máy chủ.');
      },
    });
  }

  // Format Helper Labels
  getFormatLabel(fmt: EventDisplayFormat): string {
    const map: Record<EventDisplayFormat, string> = {
      popup_center: 'Popup giữa màn hình',
      popup_corner: 'Popup góc',
      top_bar: 'Thanh thông báo',
      index_banner: 'Banner trang chủ',
      floating_button: 'Nút sự kiện nổi',
      list: 'Danh sách sự kiện',
    };
    return map[fmt] || fmt;
  }

  getPositionLabel(position: string): string {
    const map: Record<string, string> = {
      below_hero: 'Ngay dưới Hero Section (Đầu trang chủ)',
      below_orders: 'Ngay dưới Danh sách đơn hàng',
      in_activities: 'Bên trong Góc hoạt động',
      bottom: 'Cuối trang chủ',
    };
    return map[position] || 'Đầu trang chủ';
  }

  getStatusBadgeClass(status: EventStatus): string {
    const map: Record<EventStatus, string> = {
      published: 'badge-published',
      scheduled: 'badge-scheduled',
      paused: 'badge-paused',
      ended: 'badge-ended',
      draft: 'badge-draft',
    };
    return map[status] || 'badge-draft';
  }

  getStatusLabel(status: EventStatus): string {
    const map: Record<EventStatus, string> = {
      published: 'Đang hiển thị',
      scheduled: 'Đã lên lịch',
      paused: 'Tạm dừng',
      ended: 'Đã kết thúc',
      draft: 'Bản nháp',
    };
    return map[status] || status;
  }

  getPriorityLabel(level: EventPriorityLevel): string {
    const map: Record<EventPriorityLevel, string> = {
      high: 'Quan trọng',
      normal: 'Bình thường',
      low: 'Thông tin',
    };
    return map[level] || level;
  }

  calculateCTR(clicks: number, views: number): string {
    if (!views || views === 0) return '0%';
    const ctr = (clicks / views) * 100;
    return ctr.toFixed(1) + '%';
  }

  onPageChange(page: number): void {
    this.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCoverImageUrl(cover: any): string {
    if (!cover) return '/assets/images/logo.png';
    let url = '';
    if (typeof cover === 'string') {
      url = cover.trim();
    } else if (typeof cover === 'object' && cover !== null) {
      url = String(cover.src || cover.url || '').trim();
    }
    if (!url || url === '[object Object]') return '/assets/images/logo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/')) {
      return url;
    }
    return '/' + url;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src && !target.src.includes('logo.png')) {
      target.src = '/assets/images/logo.png';
    }
  }
}
