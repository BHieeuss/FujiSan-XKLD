import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminPaginationComponent } from './shared/admin-pagination/admin-pagination.component';
import {
  getJobOrderCategory,
  getJobOrderFallbackImage,
  getJobOrderTitle,
  JobOrder,
  JobOrderCategory,
  JobOrderPayload,
  JobOrderStatus,
  JOB_ORDER_CATEGORIES,
  stripJobOrderHtml,
} from '../../jobs/models/job-order.model';
import { JobOrdersApiError, JobOrdersApiService } from '../../jobs/services/job-orders-api.service';
import { JobOrderDraftTransferService } from '../../jobs/services/job-order-draft-transfer.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminToastService } from '../services/admin-toast.service';
import { JobOrderWizardComponent } from './job-order-wizard/job-order-wizard.component';

export type JobOrderSortBy =
  | 'updated_desc'
  | 'updated_asc'
  | 'code_asc'
  | 'title_asc'
  | 'salary_desc';

export interface ActiveFilterItem {
  id: string;
  label: string;
  remove: () => void;
}

@Component({
  selector: 'app-job-orders-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    JobOrderWizardComponent,
    AdminPaginationComponent,
  ],
  templateUrl: './job-orders-admin.html',
  styleUrl: './job-orders-admin.scss',
})
export class JobOrdersAdmin implements OnInit, OnDestroy {
  readonly categories = JOB_ORDER_CATEGORIES;

  // Master Data & Status
  orders: JobOrder[] = [];
  loading = true;
  actionLoading = false;
  deletingId = '';
  statusChangingId = '';
  duplicatingId = '';
  errorMessage = '';
  successMessage = '';

  // Search & Filtering
  searchTerm = '';
  statusFilter: 'all' | 'published' | 'draft' = 'all';
  categoryFilter: 'all' | JobOrderCategory = 'all';
  genderFilter: 'all' | 'Nam' | 'Nữ' | 'Nam/Nữ' = 'all';
  locationFilter = '';
  hasPosterFilter: 'all' | 'yes' | 'no' = 'all';
  featuredFilter: 'all' | 'yes' | 'no' = 'all';
  sortBy: JobOrderSortBy = 'updated_desc';
  showAdvancedFilters = false;
  viewMode: 'table' | 'cards' = 'table';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Wizard Sub-flow
  showWizard = false;
  wizardInitialData?: JobOrder | JobOrderPayload;
  isEditingWizard = false;
  wizardEditingId?: string;

  // Order Detail Drawer/Modal
  selectedOrder: JobOrder | null = null;
  detailActiveTab: 'overview' | 'work' | 'salary' | 'poster' | 'post' = 'overview';

  // Delete Confirm Modal
  orderToDelete: JobOrder | null = null;
  showDeleteConfirmModal = false;

  // Poster Lightbox
  lightboxImageUrl = '';
  showPosterLightbox = false;

  // Actions Dropdown Menu
  activeDropdownId: string | null = null;

  private routeSub?: Subscription;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly draftTransfer = inject(JobOrderDraftTransferService);
  private readonly auth = inject(AdminAuthService);
  private readonly toast = inject(AdminToastService);
  private readonly ordersApi = inject(JobOrdersApiService);
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdowns();
    }
  }

  // ---------------------------------------------------------------------------
  // LIFECYCLE
  // ---------------------------------------------------------------------------
  async ngOnInit(): Promise<void> {
    await this.reload();

    this.routeSub = this.route.queryParams.subscribe((params) => {
      const action = params['action'];
      const source = params['source'];
      const orderId = params['id'] || params['orderId'];
      if (action === 'create' || (source === 'poster' && this.draftTransfer.hasDraft())) {
        this.openCreateWizard();
      } else if (orderId && this.orders.length > 0 && !this.showWizard) {
        const found = this.orders.find((o) => o.id === orderId || o.orderCode === orderId);
        if (found) {
          if (action === 'edit') {
            this.openEditWizard(found);
          } else {
            this.openDetailModal(found);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  // ---------------------------------------------------------------------------
  // PERMISSIONS
  // ---------------------------------------------------------------------------
  canView(): boolean {
    return this.auth.hasPermission('orders.view');
  }

  canCreate(): boolean {
    return this.auth.hasPermission('orders.create');
  }

  canUpdate(): boolean {
    return this.auth.hasPermission('orders.update');
  }

  canDelete(): boolean {
    return this.auth.hasPermission('orders.delete');
  }

  canApprove(): boolean {
    return (
      this.auth.hasPermission('orders.approve') ||
      this.auth.hasPermission('orders.manage_status')
    );
  }

  canExport(): boolean {
    return this.auth.hasPermission('orders.export');
  }

  // ---------------------------------------------------------------------------
  // STATS COMPUTATION
  // ---------------------------------------------------------------------------
  get totalCount(): number {
    return this.orders.length;
  }

  get publishedCount(): number {
    return this.orders.filter((o) => o.status === 'published').length;
  }

  get draftCount(): number {
    return this.orders.filter((o) => o.status === 'draft').length;
  }

  get featuredCount(): number {
    return this.orders.filter((o) => o.isFeatured).length;
  }

  get posterCount(): number {
    return this.orders.filter((o) => !!o.posterUrl && o.posterUrl.trim() !== '').length;
  }

  // ---------------------------------------------------------------------------
  // FILTERING & PAGINATION
  // ---------------------------------------------------------------------------
  get filteredOrders(): JobOrder[] {
    let result = [...this.orders];

    // Search query
    const query = this.searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((order) => {
        const title = (getJobOrderTitle(order) || '').toLowerCase();
        const code = (order.orderCode || '').toLowerCase();
        const company = (order.company || '').toLowerCase();
        const specificWork = (order.specificWork || '').toLowerCase();
        const location = (order.location || '').toLowerCase();
        const salary = (order.salary || order.basicSalary || '').toLowerCase();
        const desc = stripJobOrderHtml(order.description || '').toLowerCase();
        return (
          title.includes(query) ||
          code.includes(query) ||
          company.includes(query) ||
          specificWork.includes(query) ||
          location.includes(query) ||
          salary.includes(query) ||
          desc.includes(query)
        );
      });
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      result = result.filter((o) => o.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter !== 'all') {
      result = result.filter((o) => o.category === this.categoryFilter);
    }

    // Gender filter
    if (this.genderFilter !== 'all') {
      result = result.filter((o) => {
        if (!o.gender) return false;
        if (this.genderFilter === 'Nam/Nữ') {
          return o.gender.includes('Nam') && o.gender.includes('Nữ');
        }
        return o.gender.includes(this.genderFilter);
      });
    }

    // Location filter
    const loc = this.locationFilter.trim().toLowerCase();
    if (loc) {
      result = result.filter((o) => (o.location || '').toLowerCase().includes(loc));
    }

    // Has Poster filter
    if (this.hasPosterFilter === 'yes') {
      result = result.filter((o) => !!o.posterUrl && o.posterUrl.trim() !== '');
    } else if (this.hasPosterFilter === 'no') {
      result = result.filter((o) => !o.posterUrl || o.posterUrl.trim() === '');
    }

    // Featured filter
    if (this.featuredFilter === 'yes') {
      result = result.filter((o) => o.isFeatured);
    } else if (this.featuredFilter === 'no') {
      result = result.filter((o) => !o.isFeatured);
    }

    // Sorting
    result.sort((a, b) => {
      if (this.sortBy === 'updated_desc') {
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      }
      if (this.sortBy === 'updated_asc') {
        return (a.updatedAt || '').localeCompare(b.updatedAt || '');
      }
      if (this.sortBy === 'code_asc') {
        return (a.orderCode || a.id).localeCompare(b.orderCode || b.id);
      }
      if (this.sortBy === 'title_asc') {
        return getJobOrderTitle(a).localeCompare(getJobOrderTitle(b));
      }
      return 0;
    });

    return result;
  }

  get pagedOrders(): JobOrder[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.statusFilter !== 'all' ||
      this.categoryFilter !== 'all' ||
      this.genderFilter !== 'all' ||
      this.locationFilter.trim() !== '' ||
      this.hasPosterFilter !== 'all' ||
      this.featuredFilter !== 'all' ||
      this.sortBy !== 'updated_desc'
    );
  }

  get activeFilterBadges(): ActiveFilterItem[] {
    const badges: ActiveFilterItem[] = [];

    if (this.searchTerm.trim()) {
      badges.push({
        id: 'search',
        label: `Tìm: "${this.searchTerm.trim()}"`,
        remove: () => {
          this.searchTerm = '';
          this.onFilterChange();
        },
      });
    }

    if (this.statusFilter !== 'all') {
      badges.push({
        id: 'status',
        label: `Trạng thái: ${this.statusFilter === 'published' ? 'Đang tuyển' : 'Bản nháp'}`,
        remove: () => {
          this.statusFilter = 'all';
          this.onFilterChange();
        },
      });
    }

    if (this.categoryFilter !== 'all') {
      const cat = getJobOrderCategory(this.categoryFilter);
      badges.push({
        id: 'category',
        label: `Ngành: ${cat.shortLabel}`,
        remove: () => {
          this.categoryFilter = 'all';
          this.onFilterChange();
        },
      });
    }

    if (this.genderFilter !== 'all') {
      badges.push({
        id: 'gender',
        label: `Giới tính: ${this.genderFilter}`,
        remove: () => {
          this.genderFilter = 'all';
          this.onFilterChange();
        },
      });
    }

    if (this.locationFilter.trim()) {
      badges.push({
        id: 'location',
        label: `Địa điểm: ${this.locationFilter.trim()}`,
        remove: () => {
          this.locationFilter = '';
          this.onFilterChange();
        },
      });
    }

    if (this.hasPosterFilter !== 'all') {
      badges.push({
        id: 'poster',
        label: this.hasPosterFilter === 'yes' ? 'Có Poster' : 'Chưa có Poster',
        remove: () => {
          this.hasPosterFilter = 'all';
          this.onFilterChange();
        },
      });
    }

    if (this.featuredFilter !== 'all') {
      badges.push({
        id: 'featured',
        label: this.featuredFilter === 'yes' ? 'Đơn HOT' : 'Đơn thông thường',
        remove: () => {
          this.featuredFilter = 'all';
          this.onFilterChange();
        },
      });
    }

    return badges;
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.categoryFilter = 'all';
    this.genderFilter = 'all';
    this.locationFilter = '';
    this.hasPosterFilter = 'all';
    this.featuredFilter = 'all';
    this.sortBy = 'updated_desc';
    this.currentPage = 1;
    this.toast.show('Đã đặt lại toàn bộ bộ lọc về mặc định.', 'info');
  }

  selectQuickFilter(key: 'all' | 'published' | 'draft' | 'featured' | 'poster'): void {
    this.clearAllFilters();
    if (key === 'published') {
      this.statusFilter = 'published';
    } else if (key === 'draft') {
      this.statusFilter = 'draft';
    } else if (key === 'featured') {
      this.featuredFilter = 'yes';
    } else if (key === 'poster') {
      this.hasPosterFilter = 'yes';
    }
    this.currentPage = 1;
  }

  // ---------------------------------------------------------------------------
  // DATA OPERATIONS
  // ---------------------------------------------------------------------------
  async reload(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.orders = await this.ordersApi.listAdmin();
      this.sortOrders();
      if (this.selectedOrder) {
        const refreshed = this.orders.find((o) => o.id === this.selectedOrder?.id);
        if (refreshed) {
          this.selectedOrder = refreshed;
        }
      }
    } catch (error) {
      this.errorMessage =
        error instanceof JobOrdersApiError || error instanceof Error
          ? error.message
          : 'Không thể tải danh sách đơn hàng.';
      this.toast.error(this.errorMessage, 'Lỗi tải dữ liệu');
    } finally {
      this.loading = false;
    }
  }

  private sortOrders(): void {
    this.orders.sort((left, right) => {
      if (left.isFeatured !== right.isFeatured) {
        return left.isFeatured ? -1 : 1;
      }
      return (right.updatedAt || '').localeCompare(left.updatedAt || '');
    });
  }

  // ---------------------------------------------------------------------------
  // WIZARD INTEGRATION
  // ---------------------------------------------------------------------------
  openCreateWizard(): void {
    if (!this.canCreate()) {
      this.toast.error('Bạn không có quyền tạo đơn hàng mới.', 'Truy cập bị từ chối');
      return;
    }
    this.closeDropdowns();
    this.selectedOrder = null;
    this.wizardInitialData = undefined;
    this.isEditingWizard = false;
    this.wizardEditingId = undefined;
    this.showWizard = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openEditWizard(order?: JobOrder | null, event?: Event): void {
    if (event) event.stopPropagation();
    if (!order) return;
    if (!this.canUpdate()) {
      this.toast.error('Bạn không có quyền chỉnh sửa đơn hàng này.', 'Truy cập bị từ chối');
      return;
    }
    this.closeDropdowns();
    // Keep selectedOrder as this order so that if the wizard is cancelled, it can return smoothly
    this.selectedOrder = order;
    this.wizardInitialData = order;
    this.isEditingWizard = true;
    this.wizardEditingId = order.id;
    this.showWizard = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeWizard(): void {
    this.showWizard = false;
    this.wizardInitialData = undefined;
    this.isEditingWizard = false;
    this.wizardEditingId = undefined;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: 'orders' },
    });
  }

  async onWizardOrderSaved(order: JobOrder): Promise<void> {
    await this.reload();
    this.showWizard = false;
    this.wizardInitialData = undefined;
    this.isEditingWizard = false;
    this.wizardEditingId = undefined;
    const refreshed = this.orders.find((o) => o.id === order.id) || order;
    this.selectedOrder = refreshed;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: 'orders', id: order.id },
    });
    this.toast.success(
      `Đơn hàng "${getJobOrderTitle(order)}" đã được cập nhật thành công vào danh sách.`,
      'Lưu thành công'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async onWizardOrderDeleted(id: string): Promise<void> {
    this.showWizard = false;
    this.wizardEditingId = undefined;
    this.wizardInitialData = undefined;
    this.selectedOrder = null;
    this.orders = this.orders.filter((item) => item.id !== id);
    await this.reload();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: 'orders' },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // DETAIL VIEW / DRAWER
  // ---------------------------------------------------------------------------
  openDetailModal(order: JobOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.closeDropdowns();
    this.selectedOrder = order;
    this.detailActiveTab = 'overview';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetailModal(): void {
    this.selectedOrder = null;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: 'orders' },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // TOGGLE STATUS & FEATURED
  // ---------------------------------------------------------------------------
  async toggleStatus(order: JobOrder, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    this.closeDropdowns();

    if (!this.canApprove() && !this.canUpdate()) {
      this.toast.error('Bạn không có quyền thay đổi trạng thái đơn hàng.', 'Từ chối');
      return;
    }

    const nextStatus: JobOrderStatus = order.status === 'published' ? 'draft' : 'published';
    const nextStatusLabel = nextStatus === 'published' ? 'Đang tuyển' : 'Bản nháp';

    this.statusChangingId = order.id;
    try {
      const updated = await this.ordersApi.update(order.id, {
        ...order,
        status: nextStatus,
      });

      const idx = this.orders.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        this.orders[idx] = updated;
      }
      if (this.selectedOrder && this.selectedOrder.id === order.id) {
        this.selectedOrder = updated;
      }
      this.toast.success(
        `Đã chuyển đơn "${order.orderCode || getJobOrderTitle(order)}" sang trạng thái [${nextStatusLabel}].`,
        'Cập nhật trạng thái'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể thay đổi trạng thái đơn hàng.';
      this.toast.error(msg, 'Lỗi cập nhật');
    } finally {
      this.statusChangingId = '';
    }
  }

  async toggleFeatured(order: JobOrder, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    this.closeDropdowns();

    if (!this.canUpdate()) {
      this.toast.error('Bạn không có quyền chỉnh sửa đơn hàng.', 'Từ chối');
      return;
    }

    const nextFeatured = !order.isFeatured;
    try {
      const updated = await this.ordersApi.update(order.id, {
        ...order,
        isFeatured: nextFeatured,
      });

      const idx = this.orders.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        this.orders[idx] = updated;
      }
      if (this.selectedOrder && this.selectedOrder.id === order.id) {
        this.selectedOrder = updated;
      }
      this.toast.success(
        nextFeatured
          ? `Đã gắn cờ Nổi bật (HOT ⭐) cho đơn "${order.orderCode || getJobOrderTitle(order)}".`
          : `Đã bỏ cờ Nổi bật của đơn "${order.orderCode || getJobOrderTitle(order)}".`,
        'Cập nhật thành công'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật cờ nổi bật.';
      this.toast.error(msg, 'Lỗi cập nhật');
    }
  }

  // ---------------------------------------------------------------------------
  // DUPLICATE ORDER
  // ---------------------------------------------------------------------------
  async duplicateOrder(order: JobOrder, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    this.closeDropdowns();

    if (!this.canCreate()) {
      this.toast.error('Bạn không có quyền tạo đơn hàng mới.', 'Từ chối');
      return;
    }

    this.duplicatingId = order.id;
    try {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newOrderCode = order.orderCode ? `${order.orderCode}-CP${randomSuffix}` : `CP-${randomSuffix}`;

      const payload: JobOrderPayload = {
        title: `${getJobOrderTitle(order)} (Bản sao)`,
        category: order.category,
        imageUrl: order.imageUrl,
        posterUrl: order.posterUrl || '',
        description: order.description,
        status: 'draft',
        isFeatured: false,
        orderCode: newOrderCode,
        location: order.location || '',
        salary: order.salary || '',
        ageRange: order.ageRange || '',
        requirements: order.requirements || '',
        departureMonth: order.departureMonth || '',
        company: order.company || '',
        jobType: order.jobType || '',
        quantity: order.quantity || '',
        gender: order.gender || '',
        education: order.education || '',
        japaneseLevel: order.japaneseLevel || '',
        contractTerm: order.contractTerm || '',
        interviewDate: order.interviewDate || '',
        specificWork: order.specificWork || '',
        workEnvironment: order.workEnvironment || '',
        workingHours: order.workingHours || '',
        holidays: order.holidays || '',
        experience: order.experience || '',
        healthRequirements: order.healthRequirements || '',
        basicSalary: order.basicSalary || '',
        takeHomeSalary: order.takeHomeSalary || '',
        overtime: order.overtime || '',
        allowances: order.allowances || '',
        bonus: order.bonus || '',
        insurance: order.insurance || '',
        accommodation: order.accommodation || '',
        meals: order.meals || '',
        transport: order.transport || '',
        otherBenefits: order.otherBenefits || '',
        postContent: order.postContent || '',
        facebookContent: order.facebookContent || '',
        postTemplateId: order.postTemplateId || '',
        postBlocks: order.postBlocks || [],
        galleryImages: order.galleryImages || [],
      };

      const created = await this.ordersApi.create(payload);
      this.orders.unshift(created);
      this.toast.success(
        `Đã nhân bản đơn hàng thành công! Mã đơn mới: "${newOrderCode}" (Trạng thái: Bản nháp).`,
        'Nhân bản thành công'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể nhân bản đơn hàng.';
      this.toast.error(msg, 'Lỗi nhân bản');
    } finally {
      this.duplicatingId = '';
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE CONFIRMATION
  // ---------------------------------------------------------------------------
  openDeleteConfirm(order?: JobOrder | null, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!order) return;
    this.closeDropdowns();

    if (!this.canDelete()) {
      this.toast.error('Bạn không có quyền xóa đơn hàng này.', 'Truy cập bị từ chối');
      return;
    }
    this.orderToDelete = order;
    this.showDeleteConfirmModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteConfirm(): void {
    this.orderToDelete = null;
    this.showDeleteConfirmModal = false;
    this.cdr.markForCheck();
  }

  onDeleteBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDeleteConfirm();
    }
  }

  async executeDelete(): Promise<void> {
    if (!this.orderToDelete) return;

    const id = this.orderToDelete.id;
    const title = getJobOrderTitle(this.orderToDelete);
    this.deletingId = id;
    this.cdr.markForCheck();
    try {
      await this.ordersApi.remove(id);
      this.orders = this.orders.filter((item) => item.id !== id);

      if (this.selectedOrder && this.selectedOrder.id === id) {
        this.closeDetailModal();
      }

      await this.reload();

      const maxPages = Math.ceil(this.filteredOrders.length / this.pageSize) || 1;
      if (this.currentPage > maxPages) {
        this.currentPage = maxPages;
      }

      this.toast.success(`Đã xóa hoàn toàn đơn hàng "${title}".`, 'Xóa đơn hàng thành công');
      this.closeDeleteConfirm();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể xóa đơn hàng.';
      this.toast.error(msg, 'Lỗi xóa đơn hàng');
    } finally {
      this.deletingId = '';
      this.cdr.markForCheck();
    }
  }

  // ---------------------------------------------------------------------------
  // EXPORT EXCEL / CSV
  // ---------------------------------------------------------------------------
  exportOrdersToExcel(): void {
    if (!this.canExport()) {
      this.toast.error('Bạn không có quyền xuất dữ liệu đơn hàng.', 'Từ chối');
      return;
    }

    const data = this.filteredOrders;
    if (data.length === 0) {
      this.toast.show('Không có đơn hàng nào phù hợp với bộ lọc để xuất tệp.', 'warning');
      return;
    }

    const headers = [
      'Mã đơn hàng',
      'Tiêu đề bài đăng',
      'Ngành nghề',
      'Công ty tiếp nhận',
      'Công việc cụ thể',
      'Địa điểm Nhật Bản',
      'Số lượng tuyển dụng',
      'Giới tính',
      'Độ tuổi',
      'Trình độ tiếng Nhật',
      'Lương cơ bản',
      'Lương thực lĩnh',
      'Trạng thái',
      'Nổi bật (HOT)',
      'Có Poster',
      'Ngày phỏng vấn',
      'Dự kiến xuất cảnh',
      'Thời hạn hợp đồng',
      'Ngày tạo',
      'Cập nhật cuối',
    ];

    const escapeCsv = (val: unknown) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = data.map((o) => {
      const cat = getJobOrderCategory(o.category);
      return [
        escapeCsv(o.orderCode || o.id),
        escapeCsv(getJobOrderTitle(o)),
        escapeCsv(cat.label),
        escapeCsv(o.company || ''),
        escapeCsv(o.specificWork || stripJobOrderHtml(o.description)),
        escapeCsv(o.location || ''),
        escapeCsv(o.quantity || ''),
        escapeCsv(o.gender || ''),
        escapeCsv(o.ageRange || ''),
        escapeCsv(o.japaneseLevel || ''),
        escapeCsv(o.basicSalary || o.salary || ''),
        escapeCsv(o.takeHomeSalary || ''),
        escapeCsv(o.status === 'published' ? 'Đang tuyển' : 'Nháp'),
        escapeCsv(o.isFeatured ? 'Có' : 'Không'),
        escapeCsv(o.posterUrl ? 'Có' : 'Không'),
        escapeCsv(o.interviewDate || ''),
        escapeCsv(o.departureMonth || ''),
        escapeCsv(o.contractTerm || ''),
        escapeCsv(o.createdAt || ''),
        escapeCsv(o.updatedAt || ''),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Don_Hang_VieJap_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast.success(`Đã xuất thành công ${data.length} đơn hàng ra tệp Excel / CSV!`, 'Xuất file thành công');
  }

  // ---------------------------------------------------------------------------
  // SOCIAL POST & POSTER ACTIONS
  // ---------------------------------------------------------------------------
  copyPostContent(order: JobOrder, event?: Event): void {
    if (event) event.stopPropagation();
    const content = order.facebookContent || order.postContent || order.description;
    if (!content) {
      this.toast.show('Đơn hàng này chưa có nội dung bài đăng.', 'warning');
      return;
    }
    const plainText = stripJobOrderHtml(content);
    navigator.clipboard.writeText(plainText).then(
      () => this.toast.success('Đã sao chép nội dung bài đăng vào khay nhớ tạm!', 'Sao chép thành công'),
      () => this.toast.error('Không thể truy cập bộ nhớ tạm của trình duyệt.', 'Lỗi')
    );
  }

  openInPosterMaker(order: JobOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.closeDropdowns();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: 'poster', id: order.id, orderCode: order.orderCode },
    });
    this.toast.show(`Đang mở Thiết kế Poster cho đơn ${order.orderCode || order.title}...`, 'info');
  }

  openPosterLightbox(url: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.lightboxImageUrl = url;
    this.showPosterLightbox = true;
  }

  closePosterLightbox(): void {
    this.lightboxImageUrl = '';
    this.showPosterLightbox = false;
  }

  // ---------------------------------------------------------------------------
  // DROPDOWN MENU
  // ---------------------------------------------------------------------------
  toggleDropdown(orderId: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === orderId ? null : orderId;
  }

  closeDropdowns(): void {
    this.activeDropdownId = null;
  }

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------
  getCategory(order: JobOrder) {
    return getJobOrderCategory(order.category);
  }

  orderTitle(order: JobOrder): string {
    return getJobOrderTitle(order);
  }

  stripHtml(html?: string): string {
    return stripJobOrderHtml(html || '');
  }

  useFallbackImage(event: Event, order: Pick<JobOrder, 'category'>): void {
    const image = event.target as HTMLImageElement;
    const fallback = getJobOrderFallbackImage(order.category);
    if (!image.src.endsWith(fallback)) {
      image.src = fallback;
    }
  }
}
