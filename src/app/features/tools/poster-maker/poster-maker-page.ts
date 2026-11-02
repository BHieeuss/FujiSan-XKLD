import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../admin/services/admin-auth.service';
import { JobOrderDraftTransferService } from '../../jobs/services/job-order-draft-transfer.service';
import { JobOrdersApiService } from '../../jobs/services/job-orders-api.service';
import {
  createRecruitmentPosterData,
  RecruitmentPosterAssets,
  RecruitmentPosterData,
} from './poster-maker.model';
import {
  exportPosterAsBlob,
  POSTER_HEIGHT,
  POSTER_WIDTH,
  renderRecruitmentPoster,
} from './poster-renderer';
import { AiImportModalComponent } from './components/ai-import-modal/ai-import-modal.component';
import { JobOrderConfirmModalComponent } from './components/job-order-confirm-modal/job-order-confirm-modal.component';
import { TemplateId } from './models/poster-template.model';
import { POSTER_TEMPLATES } from './templates/poster-template-registry';

type PhotoSlot = 'primary' | 'secondary' | 'tertiary';

@Component({
  selector: 'app-poster-maker-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JobOrderConfirmModalComponent,
  ],
  templateUrl: './poster-maker-page.html',
  styleUrl: './poster-maker-page.scss',
})
export class PosterMakerPage implements OnInit, AfterViewInit, OnDestroy {
  @Input() embedded = false;

  @ViewChild('posterCanvas') posterCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('primaryPhotoInput') primaryPhotoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('secondaryPhotoInput') secondaryPhotoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('tertiaryPhotoInput') tertiaryPhotoInput?: ElementRef<HTMLInputElement>;

  readonly posterWidth = POSTER_WIDTH;
  readonly posterHeight = POSTER_HEIGHT;
  readonly availableTemplates = POSTER_TEMPLATES;

  private readonly router = inject(Router);
  private readonly auth = inject(AdminAuthService);
  private readonly draftTransfer = inject(JobOrderDraftTransferService);
  private readonly ordersApi = inject(JobOrdersApiService);

  data: RecruitmentPosterData = createRecruitmentPosterData();
  assets: RecruitmentPosterAssets = this.createDefaultAssets();
  primaryPhotoName = 'Ảnh mẫu công việc chính';
  secondaryPhotoName = 'Ảnh mẫu môi trường làm việc';
  tertiaryPhotoName = 'Ảnh mẫu công việc bổ sung';
  selectedTemplateId: TemplateId = 'japan_signature';
  showAiModal = false;
  showJobConfirmModal = false;
  lastExportedBlob?: Blob;
  rendering = false;
  renderError = '';
  downloadMessage = '';

  ngOnInit(): void {
    if (typeof sessionStorage !== 'undefined') {
      const saved = sessionStorage.getItem('viejap_applied_poster');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.data) {
            this.data = { ...this.data, ...parsed.data };
          }
          if (parsed?.assets) {
            this.assets = { ...this.assets, ...parsed.assets };
          }
          if (parsed?.templateId) {
            this.selectedTemplateId = parsed.templateId;
          }
          sessionStorage.removeItem('viejap_applied_poster');
        } catch (e) {
          console.warn('Không thể khôi phục poster đã lưu', e);
        }
      }
    }
  }

  get is3PhotoTemplate(): boolean {
    const tpl = this.availableTemplates.find((t) => t.id === this.selectedTemplateId);
    return (tpl?.recommendedPhotoCount ?? 2) === 3;
  }

  get photoCountSelected(): number {
    let count = 0;
    if (this.assets.primaryPhotoSrc) count++;
    if (this.assets.secondaryPhotoSrc) count++;
    if (this.assets.tertiaryPhotoSrc) count++;
    return count;
  }

  get hasAllRequiredPhotos(): boolean {
    if (this.is3PhotoTemplate) {
      return Boolean(
        this.assets.primaryPhotoSrc &&
        this.assets.secondaryPhotoSrc &&
        this.assets.tertiaryPhotoSrc
      );
    }
    return Boolean(this.assets.primaryPhotoSrc && this.assets.secondaryPhotoSrc);
  }

  canDownloadPoster(): boolean {
    return this.hasAllRequiredPhotos && !this.rendering;
  }

  private renderTimer?: ReturnType<typeof setTimeout>;
  private renderVersion = 0;

  ngAfterViewInit(): void {
    this.renderTimer = setTimeout(() => {
      void this.renderPoster();
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.renderTimer);
  }

  scheduleRender(): void {
    this.downloadMessage = '';
    clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => {
      void this.renderPoster();
    }, 180);
  }

  onPhotoSelected(event: Event, slot: PhotoSlot): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.renderError = 'Vui lòng chọn file ảnh JPG, PNG hoặc WebP.';
      input.value = '';
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      this.renderError = 'Ảnh vượt quá 12 MB. Vui lòng chọn ảnh có dung lượng nhỏ hơn.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        return;
      }

      if (slot === 'primary') {
        this.assets = { ...this.assets, primaryPhotoSrc: result };
        this.primaryPhotoName = file.name;
      } else if (slot === 'secondary') {
        this.assets = { ...this.assets, secondaryPhotoSrc: result };
        this.secondaryPhotoName = file.name;
      } else {
        this.assets = { ...this.assets, tertiaryPhotoSrc: result };
        this.tertiaryPhotoName = file.name;
      }
      this.renderError = '';
      this.scheduleRender();
    };
    reader.onerror = () => {
      this.renderError = 'Không thể đọc ảnh đã chọn. Vui lòng thử lại với ảnh khác.';
    };
    reader.readAsDataURL(file);
  }

  removePhoto(slot: PhotoSlot): void {
    if (slot === 'primary') {
      this.assets = { ...this.assets, primaryPhotoSrc: '' };
      this.primaryPhotoName = '';
      if (this.primaryPhotoInput) {
        this.primaryPhotoInput.nativeElement.value = '';
      }
    } else if (slot === 'secondary') {
      this.assets = { ...this.assets, secondaryPhotoSrc: '' };
      this.secondaryPhotoName = '';
      if (this.secondaryPhotoInput) {
        this.secondaryPhotoInput.nativeElement.value = '';
      }
    } else {
      this.assets = { ...this.assets, tertiaryPhotoSrc: '' };
      this.tertiaryPhotoName = '';
      if (this.tertiaryPhotoInput) {
        this.tertiaryPhotoInput.nativeElement.value = '';
      }
    }
    this.scheduleRender();
  }

  openAiImportModal(): void {
    this.router.navigate(['/quan-tri-viejap/tao-poster-tu-dong']);
  }

  closeAiImportModal(): void {
    this.showAiModal = false;
  }

  onAiImportApplied(result: {
    data: RecruitmentPosterData;
    assets: RecruitmentPosterAssets;
    templateId: TemplateId;
  }): void {
    this.data = result.data;
    if (result.templateId) {
      this.selectedTemplateId = result.templateId;
    }
    this.closeAiImportModal();
    this.scheduleRender();
  }

  async onAiCreateWebsiteOrder(result: {
    data: RecruitmentPosterData;
    assets: RecruitmentPosterAssets;
    templateId: TemplateId;
  }): Promise<void> {
    this.data = result.data;
    if (result.templateId) {
      this.selectedTemplateId = result.templateId;
    }
    this.closeAiImportModal();
    await this.exportToJobOrder();
  }

  async exportToJobOrder(): Promise<void> {
    try {
      this.rendering = true;
      this.renderError = '';
      await this.renderPoster();
      const canvas = this.posterCanvas?.nativeElement;
      let dataUrl = '';
      if (canvas) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      }
      const draft = this.draftTransfer.setDraftFromPoster(this.data, this.assets, dataUrl);

      // Best-effort auto sync with server draft if logged in
      if (this.auth.session()) {
        try {
          await this.ordersApi.saveDraft(draft);
        } catch {
          // ignore
        }
      }

      this.downloadMessage = 'Đang chuyển toàn bộ dữ liệu poster sang Form tạo đơn hàng...';
      void this.router.navigate(['/quan-tri-viejap'], {
        queryParams: { section: 'orders', action: 'create', source: 'poster' },
      });
    } catch (err) {
      this.renderError = err instanceof Error ? err.message : 'Không thể chuyển dữ liệu sang đơn hàng.';
    } finally {
      this.rendering = false;
    }
  }

  onTemplateChanged(id: TemplateId): void {
    this.selectedTemplateId = id;
    this.scheduleRender();
  }

  async downloadPoster(format: 'png' | 'jpg' | 'pdf' = 'png'): Promise<void> {
    if (!this.canDownloadPoster()) {
      this.renderError = 'Mẫu thiết kế này yêu cầu đủ 3 ảnh bắt buộc. Vui lòng bổ sung đầy đủ trước khi tải poster.';
      return;
    }

    await this.renderPoster();
    const canvas = this.posterCanvas?.nativeElement;
    if (!canvas || this.renderError) {
      return;
    }

    try {
      const blob = await exportPosterAsBlob(canvas, format);
      this.lastExportedBlob = blob;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = this.createFilename(format);
      anchor.click();
      URL.revokeObjectURL(url);
      this.downloadMessage = `Đã tạo ${anchor.download}. Bạn có thể đăng đơn hàng lên website ngay!`;

      // Sau khi tạo và tải poster thành công, hiển thị câu hỏi tích hợp tạo đơn hàng
      setTimeout(() => {
        this.openJobOrderConfirmModal();
      }, 500);
    } catch (error) {
      this.renderError = error instanceof Error ? error.message : 'Không thể xuất file.';
    }
  }

  openJobOrderConfirmModal(): void {
    this.showJobConfirmModal = true;
  }

  closeJobOrderConfirmModal(): void {
    this.showJobConfirmModal = false;
  }

  onJobOrderCreated(order: any): void {
    this.downloadMessage = `Đã xuất bản đơn hàng "${order.title || 'Mới'}" thành công!`;
  }

  resetPoster(): void {
    this.data = createRecruitmentPosterData();
    this.assets = this.createDefaultAssets();
    this.selectedTemplateId = 'japan_signature';
    this.primaryPhotoName = 'Ảnh mẫu công việc chính';
    this.secondaryPhotoName = 'Ảnh mẫu môi trường làm việc';
    this.tertiaryPhotoName = 'Ảnh mẫu công việc bổ sung';
    this.renderError = '';
    this.downloadMessage = '';
    if (this.primaryPhotoInput) {
      this.primaryPhotoInput.nativeElement.value = '';
    }
    if (this.secondaryPhotoInput) {
      this.secondaryPhotoInput.nativeElement.value = '';
    }
    if (this.tertiaryPhotoInput) {
      this.tertiaryPhotoInput.nativeElement.value = '';
    }
    void this.renderPoster();
  }

  private async renderPoster(): Promise<void> {
    const canvas = this.posterCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const version = ++this.renderVersion;
    this.rendering = true;
    this.renderError = '';
    try {
      await renderRecruitmentPoster(canvas, this.data, this.assets, this.selectedTemplateId);
    } catch (error) {
      console.error(error);
      if (version === this.renderVersion) {
        this.renderError =
          error instanceof Error
            ? error.message
            : 'Không thể tạo bản xem trước đơn hàng.';
      }
    } finally {
      if (version === this.renderVersion) {
        this.rendering = false;
      }
    }
  }

  private createDefaultAssets(): RecruitmentPosterAssets {
    return {
      logoSrc: 'assets/images/logo.png',
      backgroundSrc: 'assets/images/poster/fuji-sakura-background.jpg',
      primaryPhotoSrc: 'assets/images/KySu/1.png',
      secondaryPhotoSrc: 'assets/images/KySu/2.png',
      tertiaryPhotoSrc: 'assets/images/KySu/3.png',
    };
  }

  private createFilename(extension = 'png'): string {
    const base = this.data.orderCode || this.data.title || 'don-tuyen';
    const safeBase = base
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return `don-hang-${safeBase || 'don-tuyen'}.${extension}`;
  }
}
