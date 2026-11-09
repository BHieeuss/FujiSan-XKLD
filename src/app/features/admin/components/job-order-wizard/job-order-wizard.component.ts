import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  createEmptyJobOrder,
  getJobOrderCategory,
  getJobOrderFallbackImage,
  getJobOrderTitle,
  JobOrder,
  JobOrderCategory,
  JobOrderPayload,
  JOB_ORDER_CATEGORIES,
  stripJobOrderHtml,
} from '../../../jobs/models/job-order.model';
import {
  JobOrdersApiError,
  JobOrdersApiService,
} from '../../../jobs/services/job-orders-api.service';
import { JobOrderDraftTransferService } from '../../../jobs/services/job-order-draft-transfer.service';
import { AdminToastService } from '../../services/admin-toast.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import {
  JobOrderWizardStep,
  WIZARD_STEPS,
  WizardStepMeta,
} from './job-order-wizard.models';
import {
  POST_TEMPLATES_REGISTRY,
  PostTemplateDef,
} from './job-post-templates.data';
import { JobPostComposerService } from './job-post-composer.service';
import {
  PostAuditIssue,
  PostLayoutId,
  PostLayoutMeta,
  PostProposalDiff,
  PostRiskCheckResult,
  PostRiskLevel,
  PostSection,
  PostSectionKey,
  PostVersion,
  PostWritingStyleId,
  PostWritingStyleMeta,
} from './job-post-layouts.models';

@Component({
  selector: 'app-job-order-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-order-wizard.component.html',
  styleUrl: './job-order-wizard.component.scss',
})
export class JobOrderWizardComponent implements OnInit, OnDestroy {
  @Input() initialData?: JobOrder | JobOrderPayload;
  @Input() isEditing = false;
  @Input() editingId?: string;

  @Output() orderSaved = new EventEmitter<JobOrder>();
  @Output() orderDeleted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  showDeleteConfirmModal = false;
  isDeleting = false;

  readonly categories = JOB_ORDER_CATEGORIES;
  readonly wizardSteps = WIZARD_STEPS;
  readonly templates = POST_TEMPLATES_REGISTRY;

  currentStep: JobOrderWizardStep = 1;
  draft: JobOrderPayload = createEmptyJobOrder();

  // Step 4 Designer state
  previewDevice: 'website' | 'mobile' | 'facebook' = 'facebook';
  mobileDesignerTab: 'edit' | 'preview' = 'edit';
  selectedTemplateId = 'standard_general';
  customHtmlOverride = false;

  // AI 5 Layouts & 5 Writing Styles State
  readonly composer = inject(JobPostComposerService);
  readonly layoutTemplates: readonly PostLayoutMeta[] = this.composer.layouts;
  readonly writingStyles: readonly PostWritingStyleMeta[] = this.composer.styles;

  selectedLayoutId: PostLayoutId = 'highlight';
  selectedStyleId: PostWritingStyleId = 'engaging';
  currentSections: PostSection[] = [];
  postVersions: PostVersion[] = [];
  // RBAC Authentication
  readonly auth = inject(AdminAuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  activeSectionTab: 'sections' | 'fulltext' | 'risk' | 'proposal' | 'html' = 'sections';
  isDraftModified = false;
  isReferenceSectionCollapsed = false;
  isPaidAdsMode = false;
  riskResult: PostRiskCheckResult | null = null;
  aiProposal: PostProposalDiff | null = null;
  isComparingProposal = false;
  confirmChangeModal: {
    isOpen: boolean;
    pendingLayoutId?: PostLayoutId;
    pendingStyleId?: PostWritingStyleId;
  } = { isOpen: false };
  viewingOutlineLayout: PostLayoutMeta | null = null;
  private sectionRegenSeed: Record<string, number> = {};

  get canViewContent(): boolean {
    return this.auth.hasPermission('orders.facebook_content.view') || this.auth.hasPermission('orders.view');
  }

  get canCreateContent(): boolean {
    return this.auth.hasPermission('orders.facebook_content.create') || this.auth.hasPermission('orders.create');
  }

  get canUpdateContent(): boolean {
    return this.auth.hasPermission('orders.facebook_content.update') || this.auth.hasPermission('orders.update');
  }

  get canAiGenerate(): boolean {
    return this.auth.hasPermission('orders.facebook_content.ai_generate') || this.auth.hasPermission('orders.create');
  }

  get canAiReview(): boolean {
    return this.auth.hasPermission('orders.facebook_content.ai_review') || this.auth.hasPermission('orders.view');
  }

  get canCopyContent(): boolean {
    return this.auth.hasPermission('orders.facebook_content.copy') || this.auth.hasPermission('orders.view');
  }

  // Code validation state
  codeCheckStatus: 'idle' | 'checking' | 'valid' | 'duplicate' = 'idle';
  codeCheckMessage = '';
  private codeCheckDebounce?: ReturnType<typeof setTimeout>;

  // Upload previews
  selectedThumbnailFile?: File;
  thumbnailPreview = '';
  selectedPosterFile?: File;
  posterPreview = '';
  lightboxImage = '';

  // Saving state
  isSaving = false;
  savingStatusText = '';
  errorMessage = '';
  copyFeedback = '';
  successOrder?: JobOrder;

  private readonly ordersApi = inject(JobOrdersApiService);
  private readonly draftTransfer = inject(JobOrderDraftTransferService);
  private readonly toast = inject(AdminToastService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.initialData) {
      this.draft = { ...createEmptyJobOrder(), ...this.initialData };
      if (!this.editingId && (this.initialData as JobOrder).id) {
        this.editingId = (this.initialData as JobOrder).id;
      }
      if ((this.initialData as JobOrder).posterUrl) {
        this.posterPreview = (this.initialData as JobOrder).posterUrl || '';
      }
      if (this.initialData.imageUrl) {
        this.thumbnailPreview = this.initialData.imageUrl;
      }
    } else if (this.draftTransfer.hasDraft()) {
      const transferred = this.draftTransfer.getDraft();
      if (transferred) {
        this.draft = { ...transferred };
        const preview = this.draftTransfer.getPosterPreview();
        if (preview) {
          this.posterPreview = preview;
        } else if (this.draft.posterUrl) {
          this.posterPreview = this.draft.posterUrl;
        }
        if (this.draft.imageUrl) {
          this.thumbnailPreview = this.draft.imageUrl;
        }
      }
    }

    if (this.draft.postTemplateId) {
      this.selectedTemplateId = this.draft.postTemplateId;
    }

    // Auto-generate post content if not yet generated
    if (!this.draft.postContent) {
      this.applyTemplate(this.selectedTemplateId);
    }

    this.initComposerSections();
  }

  ngOnDestroy(): void {
    clearTimeout(this.codeCheckDebounce);
  }

  get currentCategory() {
    return getJobOrderCategory(this.draft.category);
  }

  get isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return Boolean(
          this.draft.title?.trim() &&
            this.draft.category &&
            this.codeCheckStatus !== 'duplicate'
        );
      case 2:
        return Boolean(
          this.draft.description?.trim() || this.draft.specificWork?.trim()
        );
      case 3:
        return Boolean(
          this.draft.basicSalary?.trim() || this.draft.salary?.trim()
        );
      case 4:
        return true;
      case 5:
        return Boolean(
          this.draft.title?.trim() &&
            (this.thumbnailPreview || this.draft.imageUrl || this.posterPreview)
        );
      default:
        return true;
    }
  }

  goToStep(step: JobOrderWizardStep): void {
    if (step < this.currentStep || this.isCurrentStepValid) {
      this.currentStep = step;
      this.errorMessage = '';
      if (step === 4) {
        if (!this.draft.postContent) {
          this.applyTemplate(this.selectedTemplateId);
        }
        this.initComposerSections();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.errorMessage = 'Vui lòng điền đủ các trường bắt buộc ở bước hiện tại.';
    }
  }

  nextStep(): void {
    if (this.currentStep < 5) {
      this.goToStep((this.currentStep + 1) as JobOrderWizardStep);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.goToStep((this.currentStep - 1) as JobOrderWizardStep);
    }
  }

  /* ── Bước 1: Validate Duplicate Code ───────────────────────────── */

  onOrderCodeInput(): void {
    clearTimeout(this.codeCheckDebounce);
    const code = this.draft.orderCode?.trim() || '';
    if (!code) {
      this.codeCheckStatus = 'idle';
      this.codeCheckMessage = '';
      return;
    }

    this.codeCheckStatus = 'checking';
    this.codeCheckDebounce = setTimeout(async () => {
      try {
        const excludeId = this.editingId || (this.initialData as JobOrder)?.id;
        const exists = await this.ordersApi.checkOrderCode(code, excludeId);
        if (exists) {
          this.codeCheckStatus = 'duplicate';
          this.codeCheckMessage = `Mã "${code}" đã tồn tại! Vui lòng chọn mã khác.`;
        } else {
          this.codeCheckStatus = 'valid';
          this.codeCheckMessage = 'Mã đơn hợp lệ, có thể sử dụng.';
        }
      } catch {
        this.codeCheckStatus = 'idle';
      }
    }, 450);
  }

  generateSuggestedCode(): void {
    const cat = this.draft.category || 'tts';
    const prefixMap: Record<string, string> = {
      'thuc-pham': 'TP',
      'nong-nghiep': 'NN',
      'co-khi': 'CK',
      'xay-dung': 'XD',
      'dien-tu': 'DT',
      'ky-su': 'KS',
      'tokutei': 'TKT',
      'thuc-tap-sinh': 'TTS',
      'du-hoc': 'DH',
      'khac': 'VJ',
    };
    const prefix = prefixMap[cat] || 'VJ';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.draft.orderCode = `${prefix}-${randomSuffix}`;
    this.onOrderCodeInput();
  }

  /* ── Bước 4: Designer & 5 Bố Cục x 5 Phong Cách ──────────────── */

  initComposerSections(forceNew: boolean = false): void {
    if (this.currentSections.length > 0 && !forceNew) {
      return;
    }
    this.generatePostWithComposer(this.selectedLayoutId, this.selectedStyleId, forceNew);
  }

  generatePostWithComposer(
    layoutId: PostLayoutId,
    styleId: PostWritingStyleId,
    forceOverwriteHtml: boolean = false,
  ): void {
    const result = this.composer.composePost(this.draft, layoutId, styleId);
    this.currentSections = result.sections;
    if (!this.draft.facebookContent || forceOverwriteHtml) {
      this.draft.facebookContent = result.fullText;
    }
    if (!this.draft.postContent || forceOverwriteHtml) {
      this.draft.postContent = result.htmlContent;
    }
    this.isDraftModified = false;

    // Lưu version ban đầu nếu danh sách rỗng
    if (this.postVersions.length === 0) {
      this.postVersions.push({
        id: `v-init-${Date.now()}`,
        versionNumber: 1,
        layoutId,
        styleId,
        sections: JSON.parse(JSON.stringify(this.currentSections)),
        fullText: result.fullText,
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        note: 'Bản tạo tự động ban đầu',
      });
    }
  }

  onSelectLayout(layoutId: PostLayoutId): void {
    if (this.selectedLayoutId === layoutId) {
      return;
    }
    if (this.isDraftModified) {
      this.confirmChangeModal = { isOpen: true, pendingLayoutId: layoutId };
      return;
    }
    this.selectedLayoutId = layoutId;
    this.selectedStyleId = this.composer.getLayout(layoutId).recommendedStyle;
    this.generatePostWithComposer(this.selectedLayoutId, this.selectedStyleId, true);
  }

  onSelectStyle(styleId: PostWritingStyleId): void {
    if (this.selectedStyleId === styleId) {
      return;
    }
    if (this.isDraftModified) {
      this.confirmChangeModal = { isOpen: true, pendingStyleId: styleId };
      return;
    }
    this.selectedStyleId = styleId;
    this.generatePostWithComposer(this.selectedLayoutId, this.selectedStyleId, true);
  }

  confirmModalKeepAndChange(): void {
    const targetLayoutId = this.confirmChangeModal.pendingLayoutId || this.selectedLayoutId;
    const targetStyleId = this.confirmChangeModal.pendingStyleId || this.selectedStyleId;

    // 1. Snapshot bản hiện tại vào lịch sử
    const vNum = this.postVersions.length + 1;
    this.postVersions.unshift({
      id: `v-${Date.now()}`,
      versionNumber: vNum,
      layoutId: this.selectedLayoutId,
      styleId: this.selectedStyleId,
      sections: JSON.parse(JSON.stringify(this.currentSections)),
      fullText: this.draft.facebookContent || '',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      note: `Bản đã sửa thủ công (#${vNum})`,
    });

    // 2. Chuyển sang mẫu mới
    this.selectedLayoutId = targetLayoutId;
    this.selectedStyleId = targetStyleId;
    this.generatePostWithComposer(this.selectedLayoutId, this.selectedStyleId, true);
    this.confirmChangeModal = { isOpen: false };
    this.toast.show(`Đã lưu bản sửa cũ vào Lịch sử và áp dụng mẫu mới!`, 'success');
  }

  confirmModalOverwrite(): void {
    const targetLayoutId = this.confirmChangeModal.pendingLayoutId || this.selectedLayoutId;
    const targetStyleId = this.confirmChangeModal.pendingStyleId || this.selectedStyleId;

    this.selectedLayoutId = targetLayoutId;
    this.selectedStyleId = targetStyleId;
    this.generatePostWithComposer(this.selectedLayoutId, this.selectedStyleId, true);
    this.confirmChangeModal = { isOpen: false };
    this.toast.show('Đã ghi đè và áp dụng mẫu bài đăng mới.', 'info');
  }

  confirmModalCancel(): void {
    this.confirmChangeModal = { isOpen: false };
  }

  onSectionTextChange(section: PostSection, newText: string): void {
    section.content = newText;
    section.isModified = true;
    this.isDraftModified = true;
    this.draft.facebookContent = this.composer.assembleFullText(this.currentSections);
  }

  regenerateSection(section: PostSection): void {
    this.sectionRegenSeed[section.key] = (this.sectionRegenSeed[section.key] || 0) + 1;
    const newText = this.composer.regenerateSingleSection(
      section.key,
      this.draft,
      this.selectedStyleId,
      this.selectedLayoutId,
      this.sectionRegenSeed[section.key],
    );
    section.content = newText;
    section.isModified = true;
    this.isDraftModified = true;
    this.draft.facebookContent = this.composer.assembleFullText(this.currentSections);
    this.toast.show(`Đã làm mới đoạn: ${section.label}`, 'success');
  }

  saveNewVersion(): void {
    const vNum = this.postVersions.length + 1;
    const newVer: PostVersion = {
      id: `v-${Date.now()}`,
      versionNumber: vNum,
      layoutId: this.selectedLayoutId,
      styleId: this.selectedStyleId,
      sections: JSON.parse(JSON.stringify(this.currentSections)),
      fullText: this.draft.facebookContent || '',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      note: `Phiên bản #${vNum}`,
    };
    this.postVersions.unshift(newVer);
    this.toast.show(`Đã lưu Phiên bản #${vNum} vào lịch sử bài đăng!`, 'success');
  }

  restoreVersion(v: PostVersion): void {
    this.selectedLayoutId = v.layoutId;
    this.selectedStyleId = v.styleId;
    this.currentSections = JSON.parse(JSON.stringify(v.sections));
    this.draft.facebookContent = v.fullText;
    this.isDraftModified = false;
    this.toast.show(`Đã khôi phục ${v.note || 'Phiên bản #' + v.versionNumber}`, 'info');
  }

  toggleReferenceSectionCollapse(): void {
    this.isReferenceSectionCollapsed = !this.isReferenceSectionCollapsed;
  }

  togglePaidAdsMode(): void {
    this.isPaidAdsMode = !this.isPaidAdsMode;
    if (this.riskResult) {
      this.runRiskCheck();
    }
  }

  runRiskCheck(): void {
    if (!this.canAiReview) {
      this.toast.show('Bạn không có quyền kiểm tra rủi ro nội dung bài đăng', 'danger');
      return;
    }
    this.riskResult = this.composer.checkPostRisk(
      this.draft.facebookContent || '',
      this.draft,
      this.isPaidAdsMode,
    );
    this.activeSectionTab = 'risk';
  }

  requestAiProposal(): void {
    if (!this.canAiGenerate) {
      this.toast.show('Bạn không có quyền sử dụng AI tạo & đề xuất nội dung', 'danger');
      return;
    }
    this.aiProposal = this.composer.generateAiProposal(
      this.draft.facebookContent || '',
      this.currentSections,
      this.draft,
      this.selectedLayoutId,
      this.selectedStyleId,
    );
    this.isComparingProposal = true;
    this.activeSectionTab = 'proposal';
    this.toast.show('AI đã tạo đề xuất chỉnh sửa tối ưu hóa nội dung!', 'info');
  }

  acceptFullAiProposal(): void {
    if (!this.aiProposal) return;
    this.currentSections = JSON.parse(JSON.stringify(this.aiProposal.proposedSections));
    this.draft.facebookContent = this.aiProposal.proposedText;
    this.isDraftModified = true;
    this.isComparingProposal = false;
    this.activeSectionTab = 'sections';
    this.riskResult = this.composer.checkPostRisk(
      this.draft.facebookContent,
      this.draft,
      this.isPaidAdsMode,
    );
    this.toast.show('Đã chấp nhận và áp dụng toàn bộ đề xuất của AI!', 'success');
  }

  acceptProposalSection(idx: number): void {
    if (
      !this.aiProposal ||
      !this.aiProposal.proposedSections[idx] ||
      !this.currentSections[idx]
    ) {
      return;
    }
    this.currentSections[idx].content = this.aiProposal.proposedSections[idx].content;
    this.currentSections[idx].isModified = true;
    this.isDraftModified = true;
    this.draft.facebookContent = this.composer.assembleFullText(this.currentSections);
    this.toast.show(`Đã áp dụng đề xuất cho đoạn: ${this.currentSections[idx].label}`, 'success');
  }

  discardAiProposal(): void {
    this.isComparingProposal = false;
    this.activeSectionTab = 'sections';
  }

  applyIssueSuggestion(issue: PostAuditIssue): void {
    const raw = this.draft.facebookContent || '';
    if (issue.flaggedText && raw.toLowerCase().includes(issue.flaggedText.toLowerCase())) {
      for (const sec of this.currentSections) {
        if (sec.content.toLowerCase().includes(issue.flaggedText.toLowerCase())) {
          sec.content = sec.content.replace(new RegExp(issue.flaggedText, 'gi'), issue.suggestion);
          sec.isModified = true;
          this.isDraftModified = true;
        }
      }
      this.draft.facebookContent = this.composer.assembleFullText(this.currentSections);
      this.runRiskCheck();
      this.toast.show('Đã áp dụng gợi ý chỉnh sửa trực tiếp!', 'success');
    }
  }

  openOutlineModal(layout: PostLayoutMeta, event: Event): void {
    event.stopPropagation();
    this.viewingOutlineLayout = layout;
  }

  closeOutlineModal(): void {
    this.viewingOutlineLayout = null;
  }

  getSectionLabel(key: PostSectionKey): string {
    return this.composer.getSectionMeta(key).label;
  }

  getSectionIcon(key: PostSectionKey): string {
    return this.composer.getSectionMeta(key).icon;
  }

  selectTemplate(tplId: string): void {
    this.selectedTemplateId = tplId;
    this.draft.postTemplateId = tplId;
    this.applyTemplate(tplId);
  }

  applyTemplate(tplId: string): void {
    const tpl = this.templates.find((t) => t.id === tplId) || this.templates[0];
    this.draft.postContent = tpl.generateHtml(this.draft);
    if (!this.draft.facebookContent) {
      this.draft.facebookContent = tpl.generateFacebookText(this.draft);
    }
  }

  setPreviewDevice(device: 'website' | 'mobile' | 'facebook'): void {
    this.previewDevice = device;
  }

  setMobileDesignerTab(tab: 'edit' | 'preview'): void {
    this.mobileDesignerTab = tab;
  }

  async copyFacebookText(): Promise<void> {
    if (!this.canCopyContent) {
      this.toast.show('Bạn không có quyền sao chép nội dung bài đăng', 'danger');
      return;
    }
    const text = this.draft.facebookContent?.trim() || '';
    if (!text) {
      this.toast.show('Chưa có nội dung để sao chép', 'warning');
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      this.copyFeedback = 'Đã sao chép nội dung bài đăng tham khảo!';
      this.toast.show('Đã sao chép nội dung bài đăng tham khảo', 'success');
      setTimeout(() => {
        this.copyFeedback = '';
      }, 3000);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.copyFeedback = 'Đã sao chép nội dung bài đăng tham khảo!';
        this.toast.show('Đã sao chép nội dung bài đăng tham khảo', 'success');
        setTimeout(() => {
          this.copyFeedback = '';
        }, 3000);
      } catch {
        this.copyFeedback = 'Không thể tự động sao chép, vui lòng chọn bôi đen.';
      }
    }
  }

  /* ── Upload & Lightbox ─────────────────────────────────────────── */

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Chỉ hỗ trợ file ảnh JPG, PNG hoặc WebP.';
      return;
    }
    this.selectedThumbnailFile = file;
    this.thumbnailPreview = URL.createObjectURL(file);
    this.errorMessage = '';
  }

  onPosterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Chỉ hỗ trợ file ảnh poster JPG, PNG hoặc WebP.';
      return;
    }
    this.selectedPosterFile = file;
    this.posterPreview = URL.createObjectURL(file);
    this.errorMessage = '';
  }

  openLightbox(imageUrl: string): void {
    this.lightboxImage = imageUrl;
  }

  closeLightbox(): void {
    this.lightboxImage = '';
  }

  /* ── Lưu đơn hàng (Hỗ trợ lưu nhanh mọi bước hoặc lưu theo trạng thái) ── */

  async saveOrder(status: 'draft' | 'published' | 'keep_current' = 'keep_current'): Promise<void> {
    if (this.isSaving) return;

    this.errorMessage = '';

    // Nếu chọn 'keep_current', giữ nguyên trạng thái cũ của đơn hàng
    if (status === 'keep_current') {
      const existingStatus = (this.initialData as JobOrder)?.status;
      this.draft.status = existingStatus || this.draft.status || 'published';
    } else {
      this.draft.status = status;
    }

    // Validate minimum requirements
    if (!this.draft.title?.trim()) {
      this.errorMessage = 'Vui lòng nhập Tiêu đề đơn hàng.';
      this.currentStep = 1;
      return;
    }
    if (this.codeCheckStatus === 'duplicate') {
      this.errorMessage = 'Mã đơn hàng bị trùng, vui lòng đổi mã khác.';
      this.currentStep = 1;
      return;
    }

    // Đồng bộ lương cơ bản và trường salary
    if (this.draft.basicSalary?.trim() && !this.draft.salary?.trim()) {
      this.draft.salary = this.draft.basicSalary.trim();
    } else if (this.draft.salary?.trim() && !this.draft.basicSalary?.trim()) {
      this.draft.basicSalary = this.draft.salary.trim();
    }

    this.isSaving = true;
    this.savingStatusText = 'Đang xử lý dữ liệu và hình ảnh...';

    try {
      // 1. Upload thumbnail file if selected
      if (this.selectedThumbnailFile) {
        this.savingStatusText = 'Đang tải ảnh đại diện lên máy chủ...';
        this.draft.imageUrl = await this.ordersApi.uploadImage(this.selectedThumbnailFile);
      } else if (!this.draft.imageUrl && this.posterPreview) {
        // Fallback thumbnail to poster image
        if (this.posterPreview.startsWith('data:')) {
          this.savingStatusText = 'Đang xử lý ảnh đại diện từ poster...';
          const posterBlob = this.dataUrlToFile(this.posterPreview, `thumb-${Date.now()}.jpg`);
          this.draft.imageUrl = await this.ordersApi.uploadImage(posterBlob);
        } else {
          this.draft.imageUrl = this.posterPreview;
        }
      }

      // If still empty, use fallback image for category
      if (!this.draft.imageUrl) {
        this.draft.imageUrl = getJobOrderFallbackImage(this.draft.category);
      }

      // 2. Upload poster file if selected
      if (this.selectedPosterFile) {
        this.savingStatusText = 'Đang tải poster chính thức...';
        this.draft.posterUrl = await this.ordersApi.uploadImage(this.selectedPosterFile);
      } else if (this.posterPreview && this.posterPreview.startsWith('data:') && !this.draft.posterUrl) {
        this.savingStatusText = 'Đang tải poster chính thức...';
        const posterFile = this.dataUrlToFile(this.posterPreview, `poster-${Date.now()}.jpg`);
        this.draft.posterUrl = await this.ordersApi.uploadImage(posterFile);
      }

      // 3. Ensure description and post content are generated
      if (!this.draft.description?.trim()) {
        this.draft.description =
          this.draft.specificWork?.trim() ||
          this.draft.title?.trim() ||
          'Đơn hàng tuyển dụng Nhật Bản VieJap.';
      }
      if (!this.draft.postContent) {
        this.applyTemplate(this.selectedTemplateId);
      }

      // 4. Save to API
      this.savingStatusText = this.draft.status === 'published' ? 'Đang cập nhật & xuất bản đơn hàng...' : 'Đang lưu đơn hàng...';
      const targetEditId = this.editingId || (this.initialData as JobOrder)?.id;
      const order = this.isEditing && targetEditId
        ? await this.ordersApi.update(targetEditId, this.draft)
        : await this.ordersApi.create(this.draft);

      // Clear draft transfer storage
      this.draftTransfer.clearDraft();

      this.successOrder = order;
      this.orderSaved.emit(order);
      this.toast.show(
        this.isEditing
          ? `Đã cập nhật đơn hàng "${order.title}" thành công!`
          : this.draft.status === 'published'
            ? `Đã xuất bản đơn hàng "${order.title}" thành công!`
            : `Đã lưu bản nháp đơn hàng "${order.title}" thành công!`,
        'success'
      );
    } catch (error) {
      console.error(error);
      this.errorMessage =
        error instanceof JobOrdersApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Không thể lưu đơn hàng. Vui lòng kiểm tra lại.';
      this.toast.show(this.errorMessage, 'danger');
    } finally {
      this.isSaving = false;
      this.savingStatusText = '';
    }
  }

  viewPublishedOrder(): void {
    if (this.successOrder?.id) {
      void this.router.navigate(['/don-hang', this.successOrder.id]);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  canDelete(): boolean {
    return this.auth.hasPermission('orders.delete');
  }

  openDeleteConfirm(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.canDelete()) {
      this.toast.error('Bạn không có quyền xóa đơn hàng này.', 'Truy cập bị từ chối');
      return;
    }
    this.showDeleteConfirmModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirmModal = false;
    this.cdr.markForCheck();
  }

  onDeleteBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDeleteConfirm();
    }
  }

  async executeDelete(): Promise<void> {
    const targetId = this.editingId || (this.initialData as any)?.id;
    if (!targetId) return;

    this.isDeleting = true;
    this.cdr.markForCheck();
    try {
      await this.ordersApi.remove(targetId);
      this.toast.success('Đã xóa vĩnh viễn đơn hàng thành công.', 'Xóa thành công');
      this.showDeleteConfirmModal = false;
      this.orderDeleted.emit(targetId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể xóa đơn hàng.';
      this.toast.error(msg, 'Lỗi xóa đơn hàng');
    } finally {
      this.isDeleting = false;
      this.cdr.markForCheck();
    }
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}
