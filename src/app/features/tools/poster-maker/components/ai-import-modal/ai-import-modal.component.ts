import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AiExtractionValidationResult,
  AiStructuredOrder,
} from '../../models/ai-order-extraction.model';
import { mapAiOrderToPosterData } from '../../models/ai-order-mapper';
import { PosterTemplateDefinition, TemplateId } from '../../models/poster-template.model';
import { RecruitmentPosterAssets, RecruitmentPosterData } from '../../poster-maker.model';
import { exportPosterAsBlob, renderRecruitmentPoster } from '../../poster-renderer';
import { AiOrderExtractorService } from '../../services/ai-order-extractor.service';
import { AiPosterQaService, MAX_AUTO_RETRY, PosterQaReport } from '../../services/ai-poster-qa.service';
import { POSTER_TEMPLATES } from '../../templates/poster-template-registry';
import { TemplateGalleryComponent } from '../template-gallery/template-gallery.component';

export type AiWorkflowStep = 'select_template' | 'upload' | 'scanning' | 'review_data' | 'qa_preview';

@Component({
  selector: 'app-ai-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplateGalleryComponent],
  templateUrl: './ai-import-modal.component.html',
  styleUrl: './ai-import-modal.component.scss',
})
export class AiImportModalComponent implements OnInit {
  @Input() initialTemplateId?: TemplateId;
  @Input() currentPosterData?: RecruitmentPosterData;
  @Input() currentAssets?: RecruitmentPosterAssets;
  @Input() isPageMode = false;

  @Output() applyAndClose = new EventEmitter<{
    data: RecruitmentPosterData;
    assets: RecruitmentPosterAssets;
    templateId: TemplateId;
  }>();

  @Output() createWebsiteOrder = new EventEmitter<{
    data: RecruitmentPosterData;
    assets: RecruitmentPosterAssets;
    templateId: TemplateId;
  }>();

  @Output() modalClosed = new EventEmitter<void>();

  @ViewChild('fileInputRef') fileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('qaCanvasRef') qaCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('reviewCanvasRef') reviewCanvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly router = inject(Router);

  readonly Math = Math;
  readonly Boolean = Boolean;

  currentStep: AiWorkflowStep = 'select_template';
  templateConfirmed = false;
  isDragging = false;
  selectedFile?: File;
  originalImagePreviewUrl = '';
  showOriginalNotice = false;
  private reviewDebounceTimer?: any;
  returnStepAfterChange?: 'review_data' | 'qa_preview';

  // Quản lý API Key Gemini
  hasApiKey = false;
  showApiKeyInput = false;
  inputApiKey = '';
  maskedKey = '';
  savingApiKey = false;
  apiKeyMessage = '';

  // Kết quả AI Extraction
  extractedOrder?: AiStructuredOrder;
  validationResult?: AiExtractionValidationResult;
  processingTimeMs = 0;
  extractionError = '';
  scanProgressText = 'Khởi động mô hình nhận diện thị giác...';
  scanProgressPercent = 15;

  // Template Selection (Khóa template đã xác nhận)
  availableTemplates = POSTER_TEMPLATES;
  selectedTemplateId: TemplateId = 'japan_signature';

  // Preview & QA
  stagedPosterData?: RecruitmentPosterData;
  stagedAssets?: RecruitmentPosterAssets;
  qaReport?: PosterQaReport;
  runningQa = false;
  qaAutoRepaired = false;
  exportMessage = '';
  exporting = false;

  constructor(
    private readonly extractorService: AiOrderExtractorService,
    private readonly qaService: AiPosterQaService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.initialTemplateId) {
      this.selectedTemplateId = this.initialTemplateId;
    }
    await this.checkApiKeyStatus();
    this.scrollToFocusArea();
  }

  get hasExistingOrderData(): boolean {
    return Boolean(
      this.currentPosterData?.title &&
      this.currentPosterData.title !== 'TÊN ĐƠN HÀNG TUYỂN DỤNG'
    );
  }

  get selectedTemplateName(): string {
    const tpl = this.availableTemplates.find((t) => t.id === this.selectedTemplateId);
    return tpl?.name || 'Mẫu Tiêu Chuẩn';
  }

  useExistingData(): void {
    if (!this.hasExistingOrderData) return;
    this.stagedPosterData = { ...this.currentPosterData! };
    this.assembleStagedAssets();
    this.currentStep = 'review_data';
    this.scrollToFocusArea();
    setTimeout(() => {
      void this.renderReviewPoster();
    }, 150);
  }

  async checkApiKeyStatus(): Promise<void> {
    const local = typeof localStorage !== 'undefined' ? localStorage.getItem('viejap_gemini_api_key') || '' : '';
    if (local) {
      this.hasApiKey = true;
      this.inputApiKey = local;
      this.maskedKey = local.length > 8 ? local.slice(0, 4) + '...' + local.slice(-4) : '****';
    }
    try {
      const res = await fetch('/admin-api/ai-config.php');
      if (res.ok) {
        const json = await res.json();
        if (json?.has_key) {
          this.hasApiKey = true;
          this.maskedKey = json.masked_key || this.maskedKey;
        }
      }
    } catch {
      // offline / mock
    }
  }

  toggleApiKeyInput(): void {
    this.showApiKeyInput = !this.showApiKeyInput;
    this.apiKeyMessage = '';
  }

  async saveApiKey(): Promise<void> {
    const key = this.inputApiKey.trim();
    if (!key) {
      this.apiKeyMessage = 'Vui lòng nhập API Key hợp lệ.';
      return;
    }
    this.savingApiKey = true;
    this.apiKeyMessage = '';
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('viejap_gemini_api_key', key);
      }
      const res = await fetch('/admin-api/ai-config.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      if (res.ok) {
        this.hasApiKey = true;
        this.maskedKey = key.length > 8 ? key.slice(0, 4) + '...' + key.slice(-4) : '****';
        this.apiKeyMessage = '✓ Đã lưu và kích hoạt Gemini Vision API thành công!';
        setTimeout(() => {
          this.showApiKeyInput = false;
          this.apiKeyMessage = '';
        }, 1200);
      } else {
        this.hasApiKey = true;
        this.apiKeyMessage = '✓ Đã lưu trong trình duyệt.';
      }
    } catch {
      this.hasApiKey = true;
      this.apiKeyMessage = '✓ Đã lưu trong trình duyệt.';
    } finally {
      this.savingApiKey = false;
    }
  }

  async loadDemoSample(profile: 'tsubama' | 'yamawa' | 'sankochi'): Promise<void> {
    const filename =
      profile === 'yamawa'
        ? '20261120-yamawa-thuc-pham.jpg'
        : profile === 'tsubama'
          ? 'tc059m-tsubama-co-khi.jpg'
          : '20261027-sankochi-o-to.jpg';
    const blob = new Blob(['sample-content'], { type: 'image/jpeg' });
    const dummyFile = new File([blob], filename, { type: 'image/jpeg' });
    this.selectedFile = dummyFile;
    await this.startAiScanning(dummyFile, { demoProfile: profile });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      void this.handleFileSelected(files[0]);
    }
  }

  onFileInputChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      void this.handleFileSelected(file);
    }
  }

  async handleFileSelected(file: File): Promise<void> {
    this.selectedFile = file;
    this.extractionError = '';

    // Tạo preview ảnh gốc
    const reader = new FileReader();
    reader.onload = () => {
      this.originalImagePreviewUrl = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);

    // Bắt đầu workflow AI trích xuất dữ liệu
    await this.startAiScanning(file);
  }

  async startAiScanning(file: File, options?: { demoProfile?: string }): Promise<void> {
    this.currentStep = 'scanning';
    this.scrollToFocusArea();
    this.scanProgressPercent = 20;
    this.scanProgressText = 'Đang tải ảnh lên hệ thống...';

    const progressTimer = setInterval(() => {
      if (this.scanProgressPercent < 85) {
        this.scanProgressPercent += 15;
        if (this.scanProgressPercent === 35) {
          this.scanProgressText = 'Đang đọc chữ tiếng Việt và tiếng Nhật...';
        } else if (this.scanProgressPercent === 50) {
          this.scanProgressText = 'Đang tìm mức lương và trợ cấp...';
        } else if (this.scanProgressPercent === 65) {
          this.scanProgressText = 'Đang đọc yêu cầu tuyển dụng, độ tuổi, ngày thi...';
        } else if (this.scanProgressPercent === 80) {
          this.scanProgressText = 'Đang điền thông tin vào mẫu poster...';
        }
      }
    }, 450);

    try {
      const response = await this.extractorService.extractOrderFromImage(file, {
        apiKey: this.inputApiKey,
        demoProfile: options?.demoProfile,
      });
      clearInterval(progressTimer);
      this.scanProgressPercent = 100;
      this.scanProgressText = 'Đã đọc xong thông tin đơn hàng!';

      this.extractedOrder = response.order;
      this.validationResult = response.validation;
      this.processingTimeMs = response.processingTimeMs;

      // Chuẩn bị dữ liệu form
      this.stagedPosterData = mapAiOrderToPosterData(this.extractedOrder, this.currentPosterData);
      this.assembleStagedAssets();

      // Giữ nguyên template do người dùng đã chọn từ Bước 1.
      setTimeout(() => {
        this.currentStep = 'review_data';
        this.scrollToFocusArea();
        setTimeout(() => {
          void this.renderReviewPoster();
        }, 150);
      }, 500);
    } catch (error) {
      clearInterval(progressTimer);
      this.currentStep = 'upload';
      this.scrollToFocusArea();
      this.extractionError =
        error instanceof Error ? error.message : 'Có lỗi khi phân tích ảnh đơn hàng.';
    }
  }

  onTemplateConfirmed(template: PosterTemplateDefinition): void {
    this.templateConfirmed = true;
    this.selectedTemplateId = template.id;
    if (this.returnStepAfterChange === 'qa_preview') {
      this.currentStep = 'qa_preview';
      this.returnStepAfterChange = undefined;
      setTimeout(() => {
        void this.renderAndRunQa();
      }, 100);
    } else if (this.returnStepAfterChange === 'review_data') {
      this.currentStep = 'review_data';
      this.returnStepAfterChange = undefined;
      setTimeout(() => {
        void this.renderReviewPoster();
      }, 100);
    } else {
      this.currentStep = 'upload';
    }
    this.scrollToFocusArea();
  }

  changeTemplate(fromStep: 'review_data' | 'qa_preview' = 'review_data'): void {
    this.returnStepAfterChange = fromStep;
    this.currentStep = 'select_template';
    this.scrollToFocusArea();
  }

  selectTemplate(template: PosterTemplateDefinition): void {
    this.selectedTemplateId = template.id;
  }

  get is3PhotoTemplate(): boolean {
    const tpl = this.availableTemplates.find((t) => t.id === this.selectedTemplateId);
    return (tpl?.recommendedPhotoCount ?? 2) === 3;
  }

  assignPhotoPathToSlot(slot: 'primary' | 'secondary' | 'tertiary', path: string): void {
    this.assembleStagedAssets();
    if (!this.stagedAssets) return;
    if (slot === 'primary') {
      this.stagedAssets.primaryPhotoSrc = path;
    } else if (slot === 'secondary') {
      this.stagedAssets.secondaryPhotoSrc = path;
    } else if (slot === 'tertiary') {
      this.stagedAssets.tertiaryPhotoSrc = path;
    }
    this.scheduleReviewRender();
  }

  onLocalBatchFileSelected(event: Event, slot: 'primary' | 'secondary' | 'tertiary'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      this.assignPhotoPathToSlot(slot, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  applyDirectlyToForm(): void {
    if (!this.stagedPosterData) {
      return;
    }
    this.assembleStagedAssets();
    const assets = this.stagedAssets || {
      logoSrc: 'assets/images/logo.png',
      backgroundSrc: 'assets/images/poster/fuji-sakura-background.jpg',
      primaryPhotoSrc: 'assets/images/KySu/1.png',
      secondaryPhotoSrc: 'assets/images/KySu/2.png',
      tertiaryPhotoSrc: 'assets/images/KySu/3.png',
    };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        'viejap_applied_poster',
        JSON.stringify({
          data: this.stagedPosterData,
          assets,
          templateId: this.selectedTemplateId,
        })
      );
    }
    this.applyAndClose.emit({
      data: this.stagedPosterData,
      assets,
      templateId: this.selectedTemplateId,
    });
    if (this.isPageMode) {
      this.router.navigate(['/quan-tri-viejap'], { queryParams: { section: 'poster' } });
    }
  }

  applyAndCreateWebsiteOrder(): void {
    if (!this.stagedPosterData) {
      return;
    }
    this.assembleStagedAssets();
    const assets = this.stagedAssets || {
      logoSrc: 'assets/images/logo.png',
      backgroundSrc: 'assets/images/poster/fuji-sakura-background.jpg',
      primaryPhotoSrc: 'assets/images/KySu/1.png',
      secondaryPhotoSrc: 'assets/images/KySu/2.png',
      tertiaryPhotoSrc: 'assets/images/KySu/3.png',
    };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        'viejap_applied_poster',
        JSON.stringify({
          data: this.stagedPosterData,
          assets,
          templateId: this.selectedTemplateId,
        })
      );
    }
    this.createWebsiteOrder.emit({
      data: this.stagedPosterData,
      assets,
      templateId: this.selectedTemplateId,
    });
    if (this.isPageMode) {
      this.router.navigate(['/quan-tri-viejap'], {
        queryParams: { section: 'orders', action: 'create' },
      });
    }
  }

  async proceedToQaAndPreview(): Promise<void> {
    this.currentStep = 'qa_preview';
    this.assembleStagedAssets();
    this.scrollToFocusArea();

    setTimeout(() => {
      void this.renderAndRunQa();
    }, 100);
  }

  assembleStagedAssets(): void {
    this.stagedAssets = {
      logoSrc: this.stagedAssets?.logoSrc || this.currentAssets?.logoSrc || 'assets/images/logo.png',
      backgroundSrc:
        this.stagedAssets?.backgroundSrc || this.currentAssets?.backgroundSrc || 'assets/images/poster/fuji-sakura-background.jpg',
      primaryPhotoSrc: this.stagedAssets?.primaryPhotoSrc || this.currentAssets?.primaryPhotoSrc || 'assets/images/KySu/1.png',
      secondaryPhotoSrc: this.stagedAssets?.secondaryPhotoSrc || this.currentAssets?.secondaryPhotoSrc || 'assets/images/KySu/2.png',
      tertiaryPhotoSrc: this.stagedAssets?.tertiaryPhotoSrc || this.currentAssets?.tertiaryPhotoSrc || 'assets/images/KySu/3.png',
    };
  }

  async renderAndRunQa(retryCount = 0): Promise<void> {
    const canvas = this.qaCanvasRef?.nativeElement;
    if (!canvas || !this.stagedPosterData || !this.stagedAssets) {
      return;
    }

    this.runningQa = true;
    try {
      await renderRecruitmentPoster(
        canvas,
        this.stagedPosterData,
        this.stagedAssets,
        this.selectedTemplateId,
      );

      // Chạy kiểm định chất lượng AI Poster QA
      const report = await this.qaService.inspectPoster(
        canvas,
        this.stagedPosterData,
        retryCount,
      );
      this.qaReport = report;

      // Tự động sửa lỗi nếu phát hiện vấn đề có thể auto-repair
      if (
        report.status === 'FAIL' &&
        report.issues.some((i) => i.autoFixable) &&
        retryCount < MAX_AUTO_RETRY
      ) {
        const repairResult = this.qaService.autoRepair(this.stagedPosterData, report.issues);
        if (repairResult.modified) {
          this.stagedPosterData = repairResult.repairedData;
          this.qaAutoRepaired = true;
          await this.renderAndRunQa(retryCount + 1);
        }
      }
    } finally {
      this.runningQa = false;
    }
  }

  async downloadDirectly(format: 'png' | 'jpg' | 'pdf'): Promise<void> {
    const canvas = this.qaCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    this.exporting = true;
    this.exportMessage = '';
    try {
      const blob = await exportPosterAsBlob(canvas, format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const orderCode = this.stagedPosterData?.orderCode || 'don-hang';
      anchor.download = `poster-${orderCode}.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
      this.exportMessage = `Đã xuất thành công file ${anchor.download}!`;
    } catch (error) {
      this.exportMessage = error instanceof Error ? error.message : 'Lỗi khi tải file.';
    } finally {
      this.exporting = false;
    }
  }

  resetToUpload(): void {
    this.currentStep = 'upload';
    this.selectedFile = undefined;
    this.originalImagePreviewUrl = '';
    this.extractionError = '';
  }

  async renderReviewPoster(): Promise<void> {
    const canvas = this.reviewCanvasRef?.nativeElement;
    if (!canvas || !this.stagedPosterData) return;
    this.assembleStagedAssets();
    if (!this.stagedAssets) return;
    try {
      await renderRecruitmentPoster(
        canvas,
        this.stagedPosterData,
        this.stagedAssets,
        this.selectedTemplateId,
      );
    } catch (err) {
      console.warn('Lỗi render poster xem trước:', err);
    }
  }

  scheduleReviewRender(): void {
    if (this.reviewDebounceTimer) {
      clearTimeout(this.reviewDebounceTimer);
    }
    this.reviewDebounceTimer = setTimeout(() => {
      void this.renderReviewPoster();
    }, 150);
  }

  onFieldChanged(): void {
    this.scheduleReviewRender();
  }

  navigateBack(): void {
    this.close();
  }

  close(): void {
    if (this.isPageMode) {
      this.router.navigate(['/quan-tri-viejap'], { queryParams: { section: 'poster' } });
    }
    this.modalClosed.emit();
  }

  goToStep(step: AiWorkflowStep): void {
    this.currentStep = step;
    if (step === 'review_data') {
      setTimeout(() => {
        void this.renderReviewPoster();
      }, 100);
    }
    this.scrollToFocusArea();
  }

  scrollToFocusArea(): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const focalElement =
        document.querySelector('.step-panel') ||
        document.querySelector('.ai-stepper') ||
        document.querySelector('.auto-poster-page-card') ||
        document.querySelector('.ai-modal-dialog');
      if (focalElement) {
        focalElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  }
}
