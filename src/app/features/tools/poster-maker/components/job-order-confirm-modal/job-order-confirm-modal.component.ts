import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../../admin/services/admin-auth.service';
import {
  getJobOrderCategory,
  getJobOrderFallbackImage,
  getJobOrderTitle,
  JobOrder,
  JobOrderCategory,
  JobOrderPayload,
  JOB_ORDER_CATEGORIES,
} from '../../../../jobs/models/job-order.model';
import {
  JobOrdersApiError,
  JobOrdersApiService,
} from '../../../../jobs/services/job-orders-api.service';
import {
  RecruitmentPosterAssets,
  RecruitmentPosterData,
} from '../../poster-maker.model';
import { exportPosterAsBlob } from '../../poster-renderer';

export type JobConfirmStep =
  | 'ask_prompt' // Bước 1: Hỏi quản trị viên có muốn tạo đơn hàng website không
  | 'confirm_form' // Bước 2: Form xác nhận & chỉnh sửa dữ liệu tự điền
  | 'need_auth' // Phụ: Yêu cầu đăng nhập quản trị nếu chưa có session
  | 'submitting' // Bước 3: Đang tải ảnh & tạo đơn vào database
  | 'success' // Bước 4: Tạo thành công, cung cấp các nút điều hướng
  | 'error'; // Lỗi khi tạo đơn

@Component({
  selector: 'app-job-order-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-order-confirm-modal.component.html',
  styleUrl: './job-order-confirm-modal.component.scss',
})
export class JobOrderConfirmModalComponent implements OnInit {
  @Input() posterData!: RecruitmentPosterData;
  @Input() posterAssets?: RecruitmentPosterAssets;
  @Input() posterCanvas?: HTMLCanvasElement;
  @Input() posterBlob?: Blob;

  @Output() modalClosed = new EventEmitter<void>();
  @Output() orderCreated = new EventEmitter<JobOrder>();
  @Output() backToPoster = new EventEmitter<void>();
  @Output() resetForNewPoster = new EventEmitter<void>();

  readonly categories = JOB_ORDER_CATEGORIES;

  currentStep: JobConfirmStep = 'ask_prompt';

  // Dữ liệu đơn hàng chỉnh sửa
  draft: JobOrderPayload = {
    title: '',
    category: 'thuc-tap-sinh',
    imageUrl: '',
    posterUrl: '',
    description: '',
    status: 'published',
    isFeatured: false,
  };

  // Các trường chi tiết để chỉnh sửa trực quan
  jobLocation = '';
  jobSalary = '';
  jobAgeRange = '';
  jobOrderCode = '';
  jobRequirements = '';
  jobDeparture = '';

  // Quản lý ảnh
  posterPreviewUrl = '';
  selectedThumbnailType: 'poster' | 'category' | 'photo' = 'poster';
  uploadedPosterUrl = '';
  uploadedThumbnailUrl = '';

  // Trạng thái thao tác & Idempotency chống gửi trùng
  submitting = false;
  submissionLock = false;
  idempotencyToken = '';
  errorMessage = '';
  createdOrder?: JobOrder;

  // Đăng nhập quản trị nội bộ nếu cần
  adminUsername = '';
  adminPassword = '';
  loggingIn = false;
  loginError = '';

  // Snapshot dữ liệu poster lúc mở form — dùng để phát hiện poster lỗi thời
  posterDataSnapshot = '';
  posterStale = false;

  // Xem phóng to poster
  showLightbox = false;

  readonly auth = inject(AdminAuthService);
  private readonly ordersApi = inject(JobOrdersApiService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    this.generateIdempotencyToken();
    this.initPosterPreview();
    this.mapDataToDraft();
    await this.checkAuthStatus();
  }

  get previewCategory() {
    return getJobOrderCategory(this.draft.category);
  }

  get isFormValid(): boolean {
    return Boolean(
      this.draft.title?.trim() &&
        this.draft.category &&
        this.draft.description?.trim() &&
        (this.uploadedPosterUrl || this.posterPreviewUrl || this.draft.imageUrl),
    );
  }

  get missingFields(): string[] {
    const missing: string[] = [];
    if (!this.draft.title?.trim()) missing.push('Tiêu đề đơn hàng');
    if (!this.draft.description?.trim()) missing.push('Nội dung mô tả');
    if (!this.draft.category) missing.push('Ngành nghề tuyển dụng');
    return missing;
  }

  /* ── Bước 1: Hỏi quản trị viên ─────────────────────────────────── */

  chooseYesCreateOrder(): void {
    if (!this.auth.session()) {
      this.currentStep = 'need_auth';
      return;
    }
    this.currentStep = 'confirm_form';
  }

  chooseNoKeepPosterOnly(): void {
    this.modalClosed.emit();
  }

  /* ── Đăng nhập quản trị (nếu chưa có session) ──────────────────── */

  async loginAdmin(): Promise<void> {
    if (!this.adminUsername || !this.adminPassword) {
      this.loginError = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
      return;
    }

    this.loggingIn = true;
    this.loginError = '';
    try {
      await this.auth.login(this.adminUsername, this.adminPassword);
      this.adminPassword = '';
      this.currentStep = 'confirm_form';
    } catch (error) {
      this.loginError =
        error instanceof Error ? error.message : 'Tài khoản hoặc mật khẩu chưa đúng.';
    } finally {
      this.loggingIn = false;
    }
  }

  /* ── Bước 2: Form xác nhận & chỉnh sửa ─────────────────────────── */

  onCategoryChanged(categoryKey: JobOrderCategory): void {
    this.draft.category = categoryKey;
    this.updateThumbnailPreview();
  }

  onFieldChanged(): void {
    this.rebuildHtmlDescription();
    this.checkPosterStaleness();
  }

  selectThumbnailType(type: 'poster' | 'category' | 'photo'): void {
    this.selectedThumbnailType = type;
    this.updateThumbnailPreview();
  }

  /* ── Bước 3: Tạo đơn hàng vào Database ─────────────────────────── */

  async confirmAndCreateOrder(): Promise<void> {
    if (this.submitting || this.submissionLock) {
      return;
    }

    if (!this.isFormValid) {
      this.errorMessage = `Vui lòng bổ sung: ${this.missingFields.join(', ')}`;
      return;
    }

    this.submitting = true;
    this.submissionLock = true;
    this.errorMessage = '';
    this.currentStep = 'submitting';

    try {
      // 1. Tải ảnh poster lên hosting qua API uploads nếu chưa tải
      if (!this.uploadedPosterUrl) {
        const posterFile = await this.getPosterFile();
        if (posterFile) {
          this.uploadedPosterUrl = await this.ordersApi.uploadImage(posterFile);
        }
      }

      // 2. Xác định ảnh đại diện thumbnail ngoài danh sách
      let finalImageUrl = this.uploadedPosterUrl;
      if (this.selectedThumbnailType === 'category') {
        finalImageUrl = getJobOrderFallbackImage(this.draft.category);
      } else if (this.selectedThumbnailType === 'photo' && this.posterAssets?.primaryPhotoSrc) {
        if (this.posterAssets.primaryPhotoSrc.startsWith('data:')) {
          const photoFile = this.dataUrlToFile(
            this.posterAssets.primaryPhotoSrc,
            `photo-${Date.now()}.png`,
          );
          finalImageUrl = await this.ordersApi.uploadImage(photoFile);
        } else {
          finalImageUrl = this.posterAssets.primaryPhotoSrc;
        }
      }

      // Đảm bảo luôn có ít nhất 1 ảnh hợp lệ
      if (!finalImageUrl) {
        finalImageUrl = getJobOrderFallbackImage(this.draft.category);
      }

      this.draft.imageUrl = finalImageUrl;
      this.draft.posterUrl = this.uploadedPosterUrl || finalImageUrl;

      // 3. Đảm bảo mô tả HTML đã được cập nhật đầy đủ
      this.rebuildHtmlDescription();

      // 4. Gọi API tạo đơn hàng hiện có (kèm idempotency key chống gửi trùng)
      const payload: JobOrderPayload = {
        title: (this.draft.title || '').trim(),
        category: this.draft.category || 'khac',
        imageUrl: this.draft.imageUrl || 'assets/images/jobs/job-default.jpg',
        posterUrl: this.draft.posterUrl || '',
        description: (this.draft.description || '').trim(),
        status: this.draft.status || 'draft',
        isFeatured: Boolean(this.draft.isFeatured),
        orderCode: this.jobOrderCode?.trim() || undefined,
        location: this.jobLocation?.trim() || undefined,
        salary: this.jobSalary?.trim() || undefined,
        ageRange: this.jobAgeRange?.trim() || undefined,
        requirements: this.jobRequirements?.trim() || undefined,
        departureMonth: this.jobDeparture?.trim() || undefined,
      };

      const order = await this.ordersApi.create(payload, { idempotencyKey: this.idempotencyToken });
      this.createdOrder = order;
      this.orderCreated.emit(order);
      this.currentStep = 'success';
    } catch (error) {
      console.error(error);
      this.submissionLock = false; // Mở lại khóa để cho phép thử lại
      this.errorMessage =
        error instanceof JobOrdersApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Không thể tạo đơn hàng trên website. Vui lòng thử lại.';
      this.currentStep = 'confirm_form';
    } finally {
      this.submitting = false;
    }
  }

  /* ── Điều hướng sau khi hoàn tất ───────────────────────────────── */

  viewCreatedOrder(): void {
    if (this.createdOrder?.id) {
      this.modalClosed.emit();
      void this.router.navigate(['/don-hang', this.createdOrder.id]);
    } else {
      this.modalClosed.emit();
      void this.router.navigate(['/don-hang']);
    }
  }

  goToAdminOrders(): void {
    this.modalClosed.emit();
    void this.router.navigate(['/quan-tri-viejap'], {
      queryParams: { section: 'orders' },
    });
  }

  continueWithAnotherPoster(): void {
    this.modalClosed.emit();
    this.resetForNewPoster.emit();
  }

  goBackToEditPoster(): void {
    this.modalClosed.emit();
    this.backToPoster.emit();
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  toggleLightbox(show: boolean): void {
    this.showLightbox = show;
  }

  /* ── Helper: Khởi tạo & Ánh xạ dữ liệu ─────────────────────────── */

  private mapDataToDraft(): void {
    if (!this.posterData) {
      return;
    }

    const data = this.posterData;

    // Phân loại ngành nghề từ poster data
    this.draft.category = this.detectCategory(data);

    // Tiêu đề đơn tuyển
    const rawTitle = (data.title || '').trim();
    this.draft.title = rawTitle || `ĐƠN TUYỂN DỤNG ${data.location ? '- ' + data.location : 'NHẬT BẢN'}`;

    // Các trường chi tiết
    this.jobLocation = data.location || 'Nhật Bản';
    this.jobSalary = data.salary || 'Theo quy định tiếp nhận Nhật Bản';
    this.jobAgeRange = data.ageRange || '18–35 tuổi';
    this.jobOrderCode = data.orderCode || '';
    this.jobRequirements = data.requirements || '';
    this.jobDeparture = data.departureDate || 'Dự kiến 4-6 tháng sau trúng tuyển';

    this.draft.status = 'draft';
    this.draft.isFeatured = false;

    this.posterDataSnapshot = this.snapshotPosterData();
    this.posterStale = false;
    this.rebuildHtmlDescription();
    this.updateThumbnailPreview();
  }

  private detectCategory(data: RecruitmentPosterData): JobOrderCategory {
    const rawCat = (data.category || '').toLowerCase();
    if (rawCat.includes('nong') || rawCat === 'agriculture') return 'nong-nghiep';
    if (rawCat.includes('thuc') || rawCat === 'food_processing') return 'thuc-pham';
    if (rawCat.includes('khi') || rawCat === 'manufacturing') return 'co-khi';
    if (rawCat.includes('dung') || rawCat === 'construction') return 'xay-dung';
    if (rawCat.includes('dien') || rawCat === 'electronics') return 'dien-tu';
    if (rawCat.includes('su') || rawCat === 'engineer') return 'ky-su';
    if (rawCat.includes('tokutei')) return 'tokutei';
    if (rawCat.includes('hoc')) return 'du-hoc';
    if (rawCat.includes('khac') || rawCat === 'other') return 'khac';

    const text = `${data.title || ''} ${data.jobDescription || ''}`.toLowerCase();
    if (text.includes('nông nghiệp') || text.includes('trồng') || text.includes('rau') || text.includes('nhà kính') || text.includes('trang trại')) {
      return 'nong-nghiep';
    }
    if (text.includes('thực phẩm') || text.includes('thủy sản') || text.includes('cơm hộp') || text.includes('đóng gói')) {
      return 'thuc-pham';
    }
    if (text.includes('cơ khí') || text.includes('tiện') || text.includes('cnc') || text.includes('phay') || text.includes('hàn') || text.includes('bảo dưỡng')) {
      return 'co-khi';
    }
    if (text.includes('xây dựng') || text.includes('cốt pha') || text.includes('cốp pha') || text.includes('giàn giáo') || text.includes('công trình')) {
      return 'xay-dung';
    }
    if (text.includes('điện tử') || text.includes('bo mạch') || text.includes('linh kiện')) {
      return 'dien-tu';
    }
    if (text.includes('kỹ sư')) {
      return 'ky-su';
    }
    if (text.includes('tokutei')) {
      return 'tokutei';
    }
    if (text.includes('du học')) {
      return 'du-hoc';
    }

    return 'thuc-tap-sinh';
  }

  private rebuildHtmlDescription(): void {
    const parts: string[] = [];

    if (this.posterData?.companyHeader) {
      parts.push(`<p><strong>Xí nghiệp tiếp nhận:</strong> ${this.posterData.companyHeader}</p>`);
    }

    if (this.jobOrderCode) {
      parts.push(`<p><strong>Mã đơn tuyển:</strong> ${this.jobOrderCode}</p>`);
    }

    if (this.jobLocation) {
      parts.push(`<p><strong>Địa điểm làm việc:</strong> ${this.jobLocation}</p>`);
    }

    if (this.jobSalary) {
      const salaryLines = this.jobSalary
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (salaryLines.length > 1) {
        parts.push(`<p><strong>Mức lương & Thu nhập:</strong></p><ul>`);
        salaryLines.forEach((line) => parts.push(`<li>${line}</li>`));
        parts.push(`</ul>`);
      } else {
        parts.push(`<p><strong>Mức lương dự kiến:</strong> ${this.jobSalary}</p>`);
      }
    }

    if (this.posterData?.jobDescription) {
      parts.push(`<p><strong>Nội dung công việc:</strong> ${this.posterData.jobDescription}</p>`);
    }

    if (this.jobAgeRange) {
      parts.push(`<p><strong>Độ tuổi tuyển dụng:</strong> ${this.jobAgeRange}</p>`);
    }

    if (this.jobRequirements) {
      const reqLines = this.jobRequirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);
      if (reqLines.length > 0) {
        parts.push(`<p><strong>Quyền lợi và yêu cầu ứng tuyển:</strong></p><ul>`);
        reqLines.forEach((line) => parts.push(`<li>${line}</li>`));
        parts.push(`</ul>`);
      }
    }

    if (this.jobDeparture) {
      parts.push(`<p><strong>Thời gian xuất cảnh dự kiến:</strong> ${this.jobDeparture}</p>`);
    }

    if (this.posterData?.interviewDate) {
      parts.push(`<p><strong>Ngày phỏng vấn:</strong> ${this.posterData.interviewDate}</p>`);
    }

    if (this.posterData?.hotline) {
      parts.push(`<p><strong>Hotline tư vấn hỗ trợ:</strong> ${this.posterData.hotline}</p>`);
    }

    this.draft.description = parts.join('');
  }

  private updateThumbnailPreview(): void {
    if (this.selectedThumbnailType === 'poster') {
      this.draft.imageUrl = this.posterPreviewUrl;
    } else if (this.selectedThumbnailType === 'category') {
      this.draft.imageUrl = getJobOrderFallbackImage(this.draft.category);
    } else if (this.selectedThumbnailType === 'photo') {
      this.draft.imageUrl = this.posterAssets?.primaryPhotoSrc || this.posterPreviewUrl;
    }
  }

  private initPosterPreview(): void {
    if (this.posterCanvas) {
      try {
        this.posterPreviewUrl = this.posterCanvas.toDataURL('image/png');
      } catch {
        // fallback
      }
    } else if (this.posterBlob) {
      this.posterPreviewUrl = URL.createObjectURL(this.posterBlob);
    }
  }

  private async getPosterFile(): Promise<File | null> {
    if (this.posterBlob) {
      const orderCode = this.draft.title ? this.sanitizeSlug(this.draft.title) : 'don-hang';
      return new File([this.posterBlob], `poster-${orderCode}-${Date.now()}.png`, {
        type: 'image/png',
      });
    }

    if (this.posterCanvas) {
      try {
        const blob = await exportPosterAsBlob(this.posterCanvas, 'png');
        const orderCode = this.draft.title ? this.sanitizeSlug(this.draft.title) : 'don-hang';
        return new File([blob], `poster-${orderCode}-${Date.now()}.png`, {
          type: 'image/png',
        });
      } catch (err) {
        console.error('Không thể trích xuất blob từ canvas:', err);
      }
    }

    return null;
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  private sanitizeSlug(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 30);
  }

  private generateIdempotencyToken(): void {
    this.idempotencyToken = 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  }

  private snapshotPosterData(): string {
    return JSON.stringify({
      title: this.posterData?.title ?? '',
      location: this.posterData?.location ?? '',
      salary: this.posterData?.salary ?? '',
      ageRange: this.posterData?.ageRange ?? '',
      requirements: this.posterData?.requirements ?? '',
      departureDate: this.posterData?.departureDate ?? '',
      orderCode: this.posterData?.orderCode ?? '',
      jobDescription: this.posterData?.jobDescription ?? '',
    });
  }

  private checkPosterStaleness(): void {
    if (!this.posterDataSnapshot) {
      this.posterStale = false;
      return;
    }
    const current = JSON.stringify({
      title: this.draft.title ?? '',
      location: this.jobLocation ?? '',
      salary: this.jobSalary ?? '',
      ageRange: this.jobAgeRange ?? '',
      requirements: this.jobRequirements ?? '',
      departureDate: this.jobDeparture ?? '',
      orderCode: this.jobOrderCode ?? '',
      jobDescription: this.posterData?.jobDescription ?? '',
    });
    this.posterStale = current !== this.posterDataSnapshot;
  }

  private async checkAuthStatus(): Promise<void> {
    try {
      await this.auth.checkSession();
    } catch {
      // offline / mock session
    }
  }
}
