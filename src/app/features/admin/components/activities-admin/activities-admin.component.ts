import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminToastService } from '../../services/admin-toast.service';
import { AdminPaginationComponent } from '../shared/admin-pagination/admin-pagination.component';
import {
  ActivityBlock,
  ActivityCategory,
  ActivityCounts,
  ActivityItem,
  ActivityLevel,
  ActivityStatus,
  ActivityTemplate,
  BlockType,
  DisplayPosition,
  QualityReport,
} from './activities-admin.models';
import { ActivitiesAdminService } from './activities-admin.service';

@Component({
  selector: 'app-activities-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent],
  templateUrl: './activities-admin.component.html',
  styleUrl: './activities-admin.component.scss',
})
export class ActivitiesAdminComponent implements OnInit, OnDestroy {
  readonly auth = inject(AdminAuthService);
  private readonly service = inject(ActivitiesAdminService);
  private readonly toast = inject(AdminToastService);

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  // View state
  currentMode: 'list' | 'designer' = 'list';
  previewDevice: 'desktop' | 'mobile' = 'desktop';

  // Data
  activities: ActivityItem[] = [];
  categories: ActivityCategory[] = [];
  templates: ActivityTemplate[] = [];
  counts: ActivityCounts = {
    all: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    published: 0,
    scheduled: 0,
    archived: 0,
    hot: 0,
    featured: 0,
    special: 0,
  };

  // Pagination & Filters (Standard: 10 items/page)
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  isLoading: boolean = false;
  isSaving: boolean = false;

  searchQuery: string = '';
  filterStatus: string = 'all';
  filterCategory: string = 'all';
  filterLevel: string = 'all';
  filterBadge: string = 'all';
  filterPosition: string = 'all';

  // Designer State
  isEditing: boolean = false;
  editingId: string | null = null;
  activityForm: Partial<ActivityItem> = {};
  qualityReport: QualityReport | null = null;
  activeDesignerTab: 'meta' | 'blocks' | 'display' | 'seo' = 'blocks';

  // Modals & Drawers
  showTemplateModal: boolean = false;
  showQualityDrawer: boolean = false;
  showApprovalModal: boolean = false;
  showDuplicateModal: boolean = false;
  approvalTarget: ActivityItem | null = null;
  approvalAction: 'approve' | 'reject' = 'approve';
  approvalNote: string = '';
  duplicateTarget: ActivityItem | null = null;

  // Available Block Types Palette
  readonly availableBlocks: Array<{ type: BlockType; name: string; icon: string; desc: string }> = [
    { type: 'heading', name: 'Tiêu đề lớn (H2)', icon: 'fas fa-heading', desc: 'Tiêu đề các phần nội dung' },
    { type: 'subheading', name: 'Tiêu đề phụ (H3)', icon: 'fas fa-h-square', desc: 'Đề mục cấp nhỏ hơn' },
    { type: 'paragraph', name: 'Đoạn văn xuôi', icon: 'fas fa-paragraph', desc: 'Nội dung kể chuyện chi tiết' },
    { type: 'image', name: 'Hình ảnh đơn', icon: 'fas fa-image', desc: 'Ảnh minh họa khổ lớn 16:9' },
    { type: 'gallery', name: 'Bộ sưu tập ảnh', icon: 'fas fa-images', desc: 'Lưới ảnh sự kiện sống động' },
    { type: 'video', name: 'Video sự kiện', icon: 'fas fa-video', desc: 'Nhúng video clip hoặc MP4' },
    { type: 'quote', name: 'Trích dẫn / Cảm nghĩ', icon: 'fas fa-quote-left', desc: 'Lời phát biểu của đại biểu/học viên' },
    { type: 'callout', name: 'Hộp nổi bật / Ghi chú', icon: 'fas fa-info-circle', desc: 'Thông điệp ý nghĩa cần nhấn mạnh' },
    { type: 'event_info', name: 'Hộp thông tin sự kiện', icon: 'fas fa-calendar-day', desc: 'Ngày giờ, địa điểm, thành phần' },
    { type: 'bullet_list', name: 'Danh sách gạch đầu dòng', icon: 'fas fa-list-ul', desc: 'Các ý chính, mục tiêu, kết quả' },
    { type: 'divider', name: 'Đường phân cách', icon: 'fas fa-minus', desc: 'Phân tách giữa các chương đoạn' },
    { type: 'button', name: 'Nút bấm liên kết', icon: 'fas fa-arrow-up-right-from-square', desc: 'Đăng ký tham gia hoặc xem thêm' },
  ];

  ngOnInit(): void {
    this.loadMetadata();
    this.loadActivities();

    this.searchSubject$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadActivities();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchSubject$.next(value);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadActivities();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadActivities();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadMetadata(): void {
    this.service.getCategories().subscribe({
      next: (res) => (this.categories = res.categories),
      error: () => this.toast.error('Không tải được danh mục hoạt động.'),
    });

    this.service.getTemplates().subscribe({
      next: (res) => (this.templates = res.templates),
      error: () => this.toast.error('Không tải được mẫu thiết kế.'),
    });
  }

  loadActivities(): void {
    this.isLoading = true;
    const params: Record<string, string | number> = {
      q: this.searchQuery,
      status: this.filterStatus,
      category: this.filterCategory,
      level: this.filterLevel,
      badge: this.filterBadge,
      position: this.filterPosition,
      page: this.currentPage,
      limit: this.pageSize,
    };

    this.service.listActivities(params).subscribe({
      next: (res) => {
        this.activities = (res.items || []).map((item) => this.normalizeActivityPayload(item));
        this.totalItems = res.total || 0;
        this.counts = res.counts || this.counts;
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Lỗi khi tải danh sách hoạt động.');
        this.isLoading = false;
      },
    });
  }

  // --- DESIGNER ACTIONS ---

  openCreate(): void {
    this.isEditing = false;
    this.editingId = null;
    this.activityForm = this.getDefaultActivityPayload();
    this.qualityReport = null;
    this.currentMode = 'designer';
    this.activeDesignerTab = 'blocks';
  }

  openCreateFromTemplate(template: ActivityTemplate): void {
    this.showTemplateModal = false;
    this.isEditing = false;
    this.editingId = null;
    const payload = this.getDefaultActivityPayload();
    payload.title = template.name;
    payload.category = template.category;
    payload.categoryName = this.categories.find((c) => c.id === template.category)?.name || '';
    payload.templateId = template.id;
    payload.blocks = (template.blocks || []).map((b, i) => ({
      id: 'blk-' + Date.now() + '-' + i,
      type: b.type || 'paragraph',
      content: b.content || '',
      order: i + 1,
      isVisible: true,
      meta: b.meta || {},
    }));
    this.activityForm = payload;
    this.qualityReport = null;
    this.currentMode = 'designer';
    this.activeDesignerTab = 'blocks';
    this.toast.info(`Đã áp dụng mẫu: "${template.name}". Bạn có thể tự do chỉnh sửa.`);
  }

  openEdit(activity: ActivityItem): void {
    this.isLoading = true;
    this.service.getActivity(activity.id).subscribe({
      next: (res) => {
        this.isEditing = true;
        this.editingId = res.activity.id;
        this.activityForm = this.normalizeActivityPayload(res.activity);
        this.qualityReport = res.quality;
        this.currentMode = 'designer';
        this.activeDesignerTab = 'blocks';
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Không thể mở trình thiết kế.');
        this.isLoading = false;
      },
    });
  }

  exitDesigner(): void {
    if (this.currentMode === 'designer') {
      this.currentMode = 'list';
      this.loadActivities();
    }
  }

  saveDraft(): void {
    this.saveActivity('draft');
  }

  saveAndPublish(): void {
    if (!this.activityForm.title?.trim()) {
      this.toast.warning('Vui lòng nhập tiêu đề hoạt động.');
      this.activeDesignerTab = 'meta';
      return;
    }
    this.saveActivity('published');
  }

  private normalizeActivityPayload(act: any): any {
    if (!act) return this.getDefaultActivityPayload();
    const cloned = JSON.parse(JSON.stringify(act));
    if (cloned.coverImage && typeof cloned.coverImage === 'object') {
      cloned.coverImage = cloned.coverImage.src || '';
    }
    if (Array.isArray(cloned.blocks)) {
      cloned.blocks = cloned.blocks.map((b: any) => ({
        ...b,
        meta: b.meta || {},
      }));
    }
    if (!cloned.titleColor) {
      cloned.titleColor = '#ffffff';
    }
    if (!cloned.textColor) {
      cloned.textColor = '#334155';
    }
    return cloned;
  }

  private saveActivity(targetStatus?: ActivityStatus): void {
    if (targetStatus) {
      this.activityForm.status = targetStatus;
    }

    this.isSaving = true;
    if (this.isEditing && this.editingId) {
      this.service.updateActivity(this.editingId, this.activityForm).subscribe({
        next: (res) => {
          this.toast.success(res.message || 'Cập nhật thành công!');
          this.activityForm = this.normalizeActivityPayload(res.activity);
          this.isSaving = false;
          this.runQualityCheck();
        },
        error: (err) => {
          this.toast.error(err?.error?.message || 'Lỗi khi lưu hoạt động.');
          this.isSaving = false;
        },
      });
    } else {
      this.service.createActivity(this.activityForm).subscribe({
        next: (res) => {
          this.toast.success(res.message || 'Tạo hoạt động thành công!');
          this.isEditing = true;
          this.editingId = res.activity.id;
          this.activityForm = this.normalizeActivityPayload(res.activity);
          this.isSaving = false;
          this.runQualityCheck();
        },
        error: (err) => {
          this.toast.error(err?.error?.message || 'Lỗi khi tạo hoạt động.');
          this.isSaving = false;
        },
      });
    }
  }

  runQualityCheck(): void {
    if (!this.editingId) return;
    this.service.checkQuality(this.editingId).subscribe({
      next: (res) => (this.qualityReport = res.quality),
      error: () => {},
    });
  }

  // --- BLOCK EDITOR ACTIONS ---

  addBlock(type: BlockType): void {
    if (!this.activityForm.blocks) {
      this.activityForm.blocks = [];
    }
    const order = this.activityForm.blocks.length + 1;
    const newBlock: ActivityBlock = {
      id: 'blk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      type,
      content: this.getDefaultBlockContent(type),
      order,
      isVisible: true,
      meta: this.getDefaultBlockMeta(type),
    };
    this.activityForm.blocks.push(newBlock);
    this.toast.info(`Đã thêm khối: ${this.getBlockTypeName(type)}`);
  }

  moveBlock(index: number, direction: 'up' | 'down'): void {
    if (!this.activityForm.blocks) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.activityForm.blocks.length) return;

    const temp = this.activityForm.blocks[index];
    this.activityForm.blocks[index] = this.activityForm.blocks[targetIndex];
    this.activityForm.blocks[targetIndex] = temp;

    // re-index order
    this.activityForm.blocks.forEach((b, i) => (b.order = i + 1));
  }

  removeBlock(index: number): void {
    if (!this.activityForm.blocks) return;
    this.activityForm.blocks.splice(index, 1);
    this.activityForm.blocks.forEach((b, i) => (b.order = i + 1));
  }

  toggleBlockVisibility(block: ActivityBlock): void {
    block.isVisible = !block.isVisible;
  }

  setBlockTextColor(block: ActivityBlock, color: string): void {
    if (!block.meta) {
      block.meta = {};
    }
    block.meta.textColor = color;
  }

  readonly titleColorPresets = [
    { label: 'Trắng tinh khôi', value: '#ffffff' },
    { label: 'Vàng ánh kim', value: '#fbbf24' },
    { label: 'Đỏ son / Ruby', value: '#ef4444' },
    { label: 'Xanh băng / Cyan', value: '#38bdf8' },
    { label: 'Xanh ngọc bích', value: '#34d399' },
    { label: 'Xanh Navy hoàng gia', value: '#1e3a8a' },
    { label: 'Đen than / Slate', value: '#0f172a' },
  ];

  readonly textColorPresets = [
    { label: 'Xám đen chuẩn', value: '#334155' },
    { label: 'Đen than', value: '#0f172a' },
    { label: 'Xanh Navy', value: '#1e3a8a' },
    { label: 'Xanh dương thương hiệu', value: '#0284c7' },
    { label: 'Xanh lá tươi', value: '#16a34a' },
    { label: 'Đỏ đậm', value: '#dc2626' },
  ];

  // Image upload helpers
  isUploadingCover = false;
  isUploadingBlock: Record<string, boolean> = {};

  readonly sampleMediaLibrary = [
    'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133499906629_819c6a8040435c62a85fcec08c21ab9d.jpg',
    'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500170124_f1204241d27bc43f961d4146ef533e37.jpg',
    'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505656699_7c20f3b8ec5dcbb3717ec769adbee73d.jpg',
    'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505695509_5d85fc6c09e336a1c80fdd2c6a07e6c6.jpg',
    'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501551421_1ca85205498f768989b213f438dddc47.jpg',
    'assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725006271_49da3d4db7b2ad24c0a668cbd8d2c836.jpg',
    'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725127195_3fc576093e8144da3a67d8737550dc9d.jpg',
    'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725367310_d53a8d452083693145c48ade5175e9af.jpg',
    'assets/images/jobs/job-co-khi.jpg',
    'assets/images/jobs/job-dien-tu.jpg',
  ];

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.isUploadingCover = true;
    this.service.uploadImage(file).subscribe({
      next: (res) => {
        this.activityForm.coverImage = res.imageUrl;
        this.toast.success('Đã tải ảnh bìa lên thành công!');
        this.isUploadingCover = false;
        input.value = '';
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Không thể tải ảnh bìa lên.');
        this.isUploadingCover = false;
        input.value = '';
      },
    });
  }

  onBlockFileSelected(block: ActivityBlock, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.isUploadingBlock[block.id] = true;
    this.service.uploadImage(file).subscribe({
      next: (res) => {
        if (!block.meta) block.meta = {};
        block.meta.url = res.imageUrl;
        this.toast.success('Đã tải ảnh khối thành công!');
        this.isUploadingBlock[block.id] = false;
        input.value = '';
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Không thể tải ảnh khối lên.');
        this.isUploadingBlock[block.id] = false;
        input.value = '';
      },
    });
  }

  onGalleryFileSelected(block: ActivityBlock, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.isUploadingBlock[block.id] = true;
    this.service.uploadImage(file).subscribe({
      next: (res) => {
        this.addGalleryImageToBlock(block, res.imageUrl);
        this.toast.success('Đã thêm ảnh vào bộ sưu tập!');
        this.isUploadingBlock[block.id] = false;
        input.value = '';
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Không thể tải ảnh vào bộ sưu tập.');
        this.isUploadingBlock[block.id] = false;
        input.value = '';
      },
    });
  }

  // Gallery helpers inside block
  addGalleryImageToBlock(block: ActivityBlock, url: string): void {
    if (!url.trim()) return;
    if (!block.meta) block.meta = {};
    if (!block.meta.images) block.meta.images = [];
    block.meta.images.push({ url: url.trim(), caption: '' });
  }

  removeGalleryImageFromBlock(block: ActivityBlock, imgIndex: number): void {
    if (block.meta?.images) {
      block.meta.images.splice(imgIndex, 1);
    }
  }

  // Bullet list helpers
  addBulletItem(block: ActivityBlock, itemText: string): void {
    if (!itemText.trim()) return;
    if (!block.meta) block.meta = {};
    if (!block.meta.items) block.meta.items = [];
    block.meta.items.push(itemText.trim());
  }

  removeBulletItem(block: ActivityBlock, itemIndex: number): void {
    if (block.meta?.items) {
      block.meta.items.splice(itemIndex, 1);
    }
  }

  // --- LIST ROW QUICK ACTIONS ---

  confirmDelete(activity: ActivityItem): void {
    if (!confirm(`Bạn có chắc muốn xóa hoạt động "${activity.title}" không? Hành động này không thể hoàn tác!`)) {
      return;
    }
    this.service.deleteActivity(activity.id).subscribe({
      next: () => {
        this.toast.success('Đã xóa hoạt động.');
        this.loadActivities();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Không thể xóa hoạt động.'),
    });
  }

  openDuplicateModal(activity: ActivityItem): void {
    this.duplicateTarget = activity;
    this.showDuplicateModal = true;
  }

  executeDuplicate(): void {
    if (!this.duplicateTarget) return;
    this.service.duplicateActivity(this.duplicateTarget.id).subscribe({
      next: (res) => {
        this.toast.success('Đã nhân bản hoạt động thành bản nháp!');
        this.showDuplicateModal = false;
        this.duplicateTarget = null;
        this.loadActivities();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Lỗi khi nhân bản.'),
    });
  }

  openApproval(activity: ActivityItem, action: 'approve' | 'reject'): void {
    this.approvalTarget = activity;
    this.approvalAction = action;
    this.approvalNote = '';
    this.showApprovalModal = true;
  }

  executeApproval(): void {
    if (!this.approvalTarget) return;
    const isApproved = this.approvalAction === 'approve';
    this.service.approveActivity(this.approvalTarget.id, isApproved, this.approvalNote).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.showApprovalModal = false;
        this.approvalTarget = null;
        this.loadActivities();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Lỗi khi duyệt hoạt động.'),
    });
  }

  quickPublish(activity: ActivityItem): void {
    this.service.publishActivity(activity.id).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Xuất bản thành công!');
        this.loadActivities();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Không thể xuất bản.'),
    });
  }

  quickArchive(activity: ActivityItem): void {
    this.service.archiveActivity(activity.id).subscribe({
      next: (res) => {
        this.toast.info(res.message || 'Đã lưu trữ hoạt động.');
        this.loadActivities();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Không thể lưu trữ.'),
    });
  }

  // --- DISPLAY POSITIONS TOGGLES ---

  hasPosition(pos: DisplayPosition): boolean {
    return (this.activityForm.displayConfig?.positions || []).includes(pos);
  }

  togglePosition(pos: DisplayPosition): void {
    if (!this.activityForm.displayConfig) {
      this.activityForm.displayConfig = { positions: ['latest'], priorityOrder: 99, autoRemoveEnded: true };
    }
    const current = this.activityForm.displayConfig.positions || [];
    const idx = current.indexOf(pos);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(pos);
    }
    this.activityForm.displayConfig.positions = current;
  }

  // --- HELPERS & LABELS ---

  getBlockTypeName(type: BlockType): string {
    const found = this.availableBlocks.find((b) => b.type === type);
    return found ? found.name : type;
  }

  getBlockTypeIcon(type: BlockType): string {
    const found = this.availableBlocks.find((b) => b.type === type);
    return found ? found.icon : 'fas fa-cube';
  }

  getLevelBadgeClass(level: ActivityLevel): string {
    switch (level) {
      case 'special':
        return 'badge-level-special';
      case 'hot':
        return 'badge-level-hot';
      case 'featured':
        return 'badge-level-featured';
      default:
        return 'badge-level-standard';
    }
  }

  getLevelLabel(level: ActivityLevel): string {
    switch (level) {
      case 'special':
        return 'Đặc biệt';
      case 'hot':
        return 'HOT';
      case 'featured':
        return 'Nổi bật';
      default:
        return 'Tiêu chuẩn';
    }
  }

  getPositionLabel(pos: string): string {
    switch (pos) {
      case 'featured':
        return 'Nổi bật';
      case 'hot':
        return 'Tin nóng';
      case 'homepage':
        return 'Trang chủ';
      case 'latest':
        return 'Mới nhất';
      case 'category':
        return 'Theo chủ đề';
      default:
        return pos;
    }
  }

  getStatusBadgeClass(status: ActivityStatus): string {
    switch (status) {
      case 'published':
        return 'badge-status-published';
      case 'approved':
        return 'badge-status-approved';
      case 'pending':
        return 'badge-status-pending';
      case 'scheduled':
        return 'badge-status-scheduled';
      case 'archived':
        return 'badge-status-archived';
      case 'ended':
        return 'badge-status-ended';
      default:
        return 'badge-status-draft';
    }
  }

  getStatusLabel(status: ActivityStatus): string {
    switch (status) {
      case 'published':
        return 'Đã xuất bản';
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'scheduled':
        return 'Đã lên lịch';
      case 'archived':
        return 'Đã lưu trữ';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return 'Bản nháp';
    }
  }

  // Generate slug automatically when title changes
  onTitleBlur(): void {
    if (!this.activityForm.title) return;
    if (!this.activityForm.slug || !this.isEditing) {
      this.activityForm.slug = this.slugify(this.activityForm.title);
    }
    if (!this.activityForm.seo) {
      this.activityForm.seo = {
        title: this.activityForm.title,
        description: this.activityForm.summary || '',
        keywords: 'VieJap, hoạt động, ' + (this.activityForm.categoryName || ''),
        ogImage: this.activityForm.coverImage || '',
      };
    }
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substr(0, 80);
  }

  private getDefaultActivityPayload(): Partial<ActivityItem> {
    return {
      title: '',
      slug: '',
      category: 'student',
      categoryName: 'Hoạt động học viên',
      level: 'standard',
      status: 'draft',
      eventDate: new Date().toISOString().split('T')[0],
      location: 'Trụ sở VieJap, Trà Vinh',
      organizer: 'VieJap Education',
      participants: 'Tập thể học viên và cán bộ',
      summary: '',
      titleColor: '#ffffff',
      textColor: '#334155',
      metric: '100%',
      metricLabel: 'Hài lòng',
      highlights: [],
      coverImage: 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/3.jpg',
      gallery: [],
      videoUrl: '',
      videoThumbnail: '',
      blocks: [
        {
          id: 'blk-init-1',
          type: 'heading',
          content: 'Tổng quan chương trình',
          order: 1,
          isVisible: true,
          meta: { level: 2 },
        },
        {
          id: 'blk-init-2',
          type: 'paragraph',
          content: 'Nội dung chi tiết về chương trình hoạt động của VieJap...',
          order: 2,
          isVisible: true,
        },
      ],
      hotBadge: {
        enabled: false,
        title: 'HOT',
        color: '#ef4444',
        expiresAt: '',
        autoExpire: true,
      },
      featuredBadge: {
        enabled: false,
        title: 'NỔI BẬT',
        color: '#0284c7',
      },
      displayConfig: {
        positions: ['latest', 'category'],
        priorityOrder: 50,
        autoRemoveEnded: false,
      },
      seo: {
        title: '',
        description: '',
        keywords: 'VieJap, hoạt động, du học, xuất khẩu lao động',
        ogImage: '',
      },
    };
  }

  private getDefaultBlockContent(type: BlockType): string {
    switch (type) {
      case 'heading':
        return 'Tiêu đề đề mục mới';
      case 'subheading':
        return 'Tiêu đề phụ chi tiết';
      case 'paragraph':
        return 'Nhập văn bản chia sẻ chi tiết nội dung sự kiện tại đây...';
      case 'quote':
        return 'VieJap luôn là nơi thắp sáng ước mơ và mang đến hành trang vững chắc cho từng học viên.';
      case 'callout':
        return 'Lưu ý: Tất cả hoạt động đều được ghi hình và truyền thông rộng rãi trên các kênh chính thức của VieJap.';
      case 'event_info':
        return 'Thông tin lịch trình & Địa điểm';
      case 'divider':
        return '---';
      case 'button':
        return 'Xem thêm chi tiết';
      default:
        return '';
    }
  }

  private getDefaultBlockMeta(type: BlockType): any {
    switch (type) {
      case 'heading':
        return { level: 2 };
      case 'subheading':
        return { level: 3 };
      case 'quote':
        return { author: 'Đại diện VieJap', role: 'Ban Đào tạo' };
      case 'callout':
        return { calloutType: 'info' };
      case 'button':
        return { buttonStyle: 'primary', buttonLink: '/lien-he' };
      case 'gallery':
        return { layout: 'grid', images: [] };
      case 'bullet_list':
        return { items: ['Mục tiêu trọng tâm 1', 'Kết quả đạt được 2'] };
      case 'image':
        return { url: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/1.jpg', caption: 'Hình ảnh hoạt động thực tế' };
      default:
        return {};
    }
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

