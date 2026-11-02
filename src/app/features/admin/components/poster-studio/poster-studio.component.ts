import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminToastService } from '../../services/admin-toast.service';
import {
  RecruitmentPosterAssets,
  RecruitmentPosterData,
  createRecruitmentPosterData,
} from '../../../tools/poster-maker/poster-maker.model';
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  exportPosterAsBlob,
  renderRecruitmentPoster,
} from '../../../tools/poster-maker/poster-renderer';
import { TemplateId } from '../../../tools/poster-maker/models/poster-template.model';
import { POSTER_TEMPLATES } from '../../../tools/poster-maker/templates/poster-template-registry';
import { AiOrderExtractorService } from '../../../tools/poster-maker/services/ai-order-extractor.service';
import { mapAiOrderToPosterData } from '../../../tools/poster-maker/models/ai-order-mapper';
import { JobOrdersApiService } from '../../../jobs/services/job-orders-api.service';
import { JobOrderDraftTransferService } from '../../../jobs/services/job-order-draft-transfer.service';
import {
  CanvasElement,
  ColorPreset,
  SaveStatus,
  StudioColors,
  StudioSnapshot,
  StudioStockPhoto,
  StudioTab,
  StudioTypography,
} from './poster-studio.models';
import { PosterStudioService } from './poster-studio.service';

@Component({
  selector: 'app-poster-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poster-studio.component.html',
  styleUrl: './poster-studio.component.scss',
})
export class PosterStudioComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialOrderId?: string;
  @Input()
  set orderId(val: string | undefined | null) {
    this._orderId = val || null;
    if (this._orderId) {
      this.loadOrderData(this._orderId);
    }
  }
  get orderId(): string | null {
    return this._orderId;
  }
  private _orderId: string | null = null;

  @Input() embedded: boolean = false;
  @Output() closed = new EventEmitter<void>();
  @Output() onExit = new EventEmitter<void>();

  @ViewChild('posterCanvas') posterCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('primaryPhotoInput') primaryPhotoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('secondaryPhotoInput') secondaryPhotoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('tertiaryPhotoInput') tertiaryPhotoInput?: ElementRef<HTMLInputElement>;

  readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly studioService = inject(PosterStudioService);
  private readonly ordersApi = inject(JobOrdersApiService);
  private readonly draftTransfer = inject(JobOrderDraftTransferService);
  private readonly toast = inject(AdminToastService);

  private readonly destroy$ = new Subject<void>();
  private readonly autoSaveSubject$ = new Subject<void>();

  readonly Math = Math;
  readonly posterWidth = POSTER_WIDTH;
  readonly posterHeight = POSTER_HEIGHT;
  readonly availableTemplates = POSTER_TEMPLATES;

  // Studio Workspace State
  orderTitle: string = 'Đơn hàng mới';
  orderCode: string = '';
  activeTab: StudioTab = 'content';
  zoomLevel: number = 0.42; // default fit ratio
  selectedElementId: string | null = null;
  saveStatus: SaveStatus = 'saved';
  isApplyingToOrder: boolean = false;
  isExporting: boolean = false;
  showPreviewModal: boolean = false;
  isMobilePanelOpen: boolean = false;

  // Undo / Redo History
  undoStack: StudioSnapshot[] = [];
  redoStack: StudioSnapshot[] = [];
  private isApplyingHistory = false;

  // Core Poster Data & Assets
  data: RecruitmentPosterData = createRecruitmentPosterData();
  assets: RecruitmentPosterAssets = this.createDefaultAssets();
  selectedTemplateId: TemplateId = 'japan_signature';

  // Typography Options
  typography: StudioTypography = {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    titleScale: 1.0,
    bodyScale: 1.0,
    salaryScale: 1.0,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
    lineHeight: 1.4,
  };

  // Color Options
  colors: StudioColors = {
    primary: '#103B63',
    secondary: '#082B49',
    accent: '#0B5F9E',
    bgStart: '#FBFDFF',
    bgEnd: '#EAF3FA',
    cardBg: 'rgba(255, 255, 255, 0.94)',
    textHeading: '#103B63',
    textBody: '#12283E',
  };

  // Color Presets
  readonly colorPresets: ColorPreset[] = [
    {
      id: 'viejap_navy',
      name: 'VieJap Signature',
      preview: ['#103B63', '#0B5F9E', '#F5A623'],
      colors: {
        primary: '#103B63',
        secondary: '#082B49',
        accent: '#0B5F9E',
        bgStart: '#FBFDFF',
        bgEnd: '#EAF3FA',
        cardBg: 'rgba(255, 255, 255, 0.94)',
        textHeading: '#103B63',
        textBody: '#12283E',
      },
    },
    {
      id: 'corporate_blue',
      name: 'Corporate Ocean',
      preview: ['#0284c7', '#0369a1', '#38bdf8'],
      colors: {
        primary: '#0284c7',
        secondary: '#0369a1',
        accent: '#0ea5e9',
        bgStart: '#f0f9ff',
        bgEnd: '#e0f2fe',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        textHeading: '#0369a1',
        textBody: '#0f172a',
      },
    },
    {
      id: 'sakura_red',
      name: 'Nhật Bản Sakura',
      preview: ['#be185d', '#ec4899', '#fdf2f8'],
      colors: {
        primary: '#be185d',
        secondary: '#9d174d',
        accent: '#f43f5e',
        bgStart: '#fff1f2',
        bgEnd: '#ffe4e6',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        textHeading: '#9d174d',
        textBody: '#4c0519',
      },
    },
    {
      id: 'modern_dark',
      name: 'Executive Dark',
      preview: ['#0f172a', '#334155', '#38bdf8'],
      colors: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#38bdf8',
        bgStart: '#1e293b',
        bgEnd: '#0f172a',
        cardBg: 'rgba(30, 41, 59, 0.85)',
        textHeading: '#f8fafc',
        textBody: '#cbd5e1',
      },
    },
    {
      id: 'warm_gold',
      name: 'Sunrise Gold',
      preview: ['#b45309', '#d97706', '#fef3c7'],
      colors: {
        primary: '#b45309',
        secondary: '#92400e',
        accent: '#f59e0b',
        bgStart: '#fffbeb',
        bgEnd: '#fef3c7',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        textHeading: '#78350f',
        textBody: '#451a03',
      },
    },
  ];

  // Stock Photos
  stockPhotos: StudioStockPhoto[] = [];

  // Canvas Interactive Elements & Layers
  elements: CanvasElement[] = [
    { id: 'logo', name: 'Logo VieJap & Nhãn Thương Hiệu', icon: 'fas fa-stamp', tab: 'images', topPct: 2.2, leftPct: 5.5, widthPct: 28, heightPct: 4.8, isVisible: true, isLocked: false, zIndex: 10 },
    { id: 'orderCode', name: 'Mã Đơn Tuyển', icon: 'fas fa-barcode', tab: 'content', topPct: 2.6, leftPct: 72, widthPct: 22, heightPct: 3.5, isVisible: true, isLocked: false, zIndex: 9 },
    { id: 'companyHeader', name: 'Tên Công Ty Tiếp Nhận', icon: 'fas fa-building', tab: 'content', topPct: 7.5, leftPct: 5.5, widthPct: 89, heightPct: 3.8, isVisible: true, isLocked: false, zIndex: 8 },
    { id: 'title', name: 'Tiêu Đề Tuyển Dụng', icon: 'fas fa-heading', tab: 'content', topPct: 11.5, leftPct: 5.5, widthPct: 89, heightPct: 6.8, isVisible: true, isLocked: false, zIndex: 7 },
    { id: 'jobDescription', name: 'Nội Dung Công Việc', icon: 'fas fa-briefcase', tab: 'content', topPct: 18.5, leftPct: 5.5, widthPct: 89, heightPct: 5.8, isVisible: true, isLocked: false, zIndex: 6 },
    { id: 'photos', name: 'Cụm Ảnh Công Việc & Môi Trường', icon: 'fas fa-images', tab: 'images', topPct: 24.8, leftPct: 5.5, widthPct: 89, heightPct: 22.5, isVisible: true, isLocked: false, zIndex: 5 },
    { id: 'requirements', name: 'Điều Kiện (SL, Giới tính, Tuổi, Nơi làm)', icon: 'fas fa-user-check', tab: 'content', topPct: 47.8, leftPct: 5.5, widthPct: 89, heightPct: 14.5, isVisible: true, isLocked: false, zIndex: 4 },
    { id: 'salary', name: 'Mức Lương Cơ Bản & Trợ Cấp', icon: 'fas fa-hand-holding-dollar', tab: 'content', topPct: 62.5, leftPct: 5.5, widthPct: 89, heightPct: 13, isVisible: true, isLocked: false, zIndex: 3 },
    { id: 'timeline', name: 'Lịch Thi Tuyển & Xuất Cảnh', icon: 'fas fa-calendar-days', tab: 'content', topPct: 75.8, leftPct: 5.5, widthPct: 89, heightPct: 8.8, isVisible: true, isLocked: false, zIndex: 2 },
    { id: 'contact', name: 'Thông Tin Liên Hệ & Hotline', icon: 'fas fa-phone', tab: 'content', topPct: 84.8, leftPct: 5.5, widthPct: 89, heightPct: 12.8, isVisible: true, isLocked: false, zIndex: 1 },
  ];

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const qOrderId = params['id'] || params['orderId'] || this.initialOrderId || this.orderId;
      if (qOrderId) {
        this.orderId = qOrderId;
        this.loadOrderData(qOrderId);
      } else if (this.draftTransfer.hasDraft()) {
        const tr = this.draftTransfer.getDraft();
        if (tr) {
          this.applyOrderPayloadToPoster(tr);
        }
      } else {
        this.loadSavedDraft();
      }
    });

    this.loadStockPhotos();

    // Auto-save debounced stream
    this.autoSaveSubject$
      .pipe(debounceTime(1800), takeUntil(this.destroy$))
      .subscribe(() => {
        this.persistDraft();
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.takeSnapshot();
      this.render();
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get previewDataUrl(): string {
    return this.posterCanvas?.nativeElement ? this.posterCanvas.nativeElement.toDataURL('image/png') : '';
  }

  // --- DATA LOADING & INITIALIZATION ---

  private loadOrderData(id: string): void {
    this.ordersApi
      .getPublic(id)
      .then((order: any) => {
        if (order) {
          this.orderTitle = order.title;
          this.orderCode = order.code || order.orderCode || '';
          this.applyOrderPayloadToPoster(order);
          this.render();
          this.toast.info(`Đã tải dữ liệu đơn hàng: "${order.title}" vào Poster Studio.`);
        }
      })
      .catch(() => {
        this.loadSavedDraft();
      });
  }

  private applyOrderPayloadToPoster(order: any): void {
    this.data.companyHeader = order.companyHeader || order.companyName || this.data.companyHeader;
    this.data.orderCode = order.code || order.orderCode || this.data.orderCode;
    this.data.title = order.title || this.data.title;
    this.data.jobDescription = order.jobDescription || order.workContent || this.data.jobDescription;
    this.data.location = order.workLocation || order.location || this.data.location;
    this.data.workLocation = this.data.location;
    this.data.gender = order.gender || this.data.gender;
    this.data.quantity = order.quantity || this.data.quantity;
    this.data.ageRange = order.ageRange || order.age || this.data.ageRange;
    this.data.age = this.data.ageRange;
    this.data.interviewDate = order.interviewDate || this.data.interviewDate;
    this.data.departureDate = order.departureDate || this.data.departureDate;
    if (order.salary) {
      this.data.salary = typeof order.salary === 'string' ? order.salary : String(order.salary);
    }
    if (order.requirements) {
      this.data.requirements = order.requirements;
    }
    if (order.benefits) {
      this.data.benefits = order.benefits;
    }
    if (order.imageUrl && !this.assets.primaryPhotoSrc.includes(order.imageUrl)) {
      this.assets.primaryPhotoSrc = order.imageUrl;
    }
    if (order.posterTemplateId) {
      this.selectedTemplateId = order.posterTemplateId as TemplateId;
    }
  }

  private loadSavedDraft(): void {
    this.studioService.getDraft(this.orderId || undefined).subscribe({
      next: (res) => {
        if (res?.draft) {
          const d = res.draft;
          if (d.data) this.data = { ...this.data, ...d.data };
          if (d.assets) this.assets = { ...this.assets, ...d.assets };
          if (d.templateId) this.selectedTemplateId = d.templateId;
          if (d.typography) this.typography = { ...this.typography, ...d.typography };
          if (d.colors) this.colors = { ...this.colors, ...d.colors };
          this.render();
        }
      },
      error: () => {},
    });
  }

  private loadStockPhotos(): void {
    this.studioService.getStockPhotos().subscribe({
      next: (res) => (this.stockPhotos = res.photos || []),
      error: () => {},
    });
  }

  // --- RENDER & CANVAS SYNC ---

  scheduleRender(recordHistory = true): void {
    if (recordHistory && !this.isApplyingHistory) {
      this.takeSnapshot();
    }
    this.saveStatus = 'dirty';
    this.autoSaveSubject$.next();
    this.render();
  }

  async render(): Promise<void> {
    if (!this.posterCanvas) return;
    try {
      await renderRecruitmentPoster(
        this.posterCanvas.nativeElement,
        this.data,
        this.assets,
        this.selectedTemplateId
      );
    } catch (err) {
      console.error('[PosterStudio] Canvas render error:', err);
    }
  }

  // --- INTERACTIVE ELEMENT SELECTION ON CANVAS ---

  selectElement(elementId: string): void {
    this.selectedElementId = elementId;
    const found = this.elements.find((el) => el.id === elementId);
    if (found) {
      this.activeTab = found.tab;
    }
  }

  clearSelection(): void {
    this.selectedElementId = null;
  }

  toggleLayerVisibility(el: CanvasElement, event?: Event): void {
    if (event) event.stopPropagation();
    el.isVisible = !el.isVisible;
    this.scheduleRender();
  }

  toggleLayerLock(el: CanvasElement, event?: Event): void {
    if (event) event.stopPropagation();
    el.isLocked = !el.isLocked;
  }

  moveLayer(index: number, direction: 'up' | 'down', event?: Event): void {
    if (event) event.stopPropagation();
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= this.elements.length) return;
    const temp = this.elements[index];
    this.elements[index] = this.elements[target];
    this.elements[target] = temp;
    this.scheduleRender();
  }

  resetLayout(): void {
    this.typography = {
      fontFamily: '"Be Vietnam Pro", sans-serif',
      titleScale: 1.0,
      bodyScale: 1.0,
      salaryScale: 1.0,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0,
      lineHeight: 1.4,
    };
    this.elements.forEach((el) => {
      el.isVisible = true;
      el.isLocked = false;
    });
    this.scheduleRender();
    this.toast.info('Đã khôi phục bố cục mặc định.');
  }

  // --- ZOOM & WORKSPACE NAVIGATION ---

  zoomIn(): void {
    if (this.zoomLevel < 1.2) {
      this.zoomLevel = Math.round((this.zoomLevel + 0.08) * 100) / 100;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.25) {
      this.zoomLevel = Math.round((this.zoomLevel - 0.08) * 100) / 100;
    }
  }

  fitScreen(): void {
    this.zoomLevel = 0.42;
  }

  // --- TEMPLATE & COLOR CONTROLS ---

  changeTemplate(templateId: TemplateId): void {
    this.selectedTemplateId = templateId;
    this.scheduleRender();
    this.toast.success(`Đã chuyển sang mẫu: "${this.getTemplateName(templateId)}". Dữ liệu được bảo toàn.`);
  }

  applyColorPreset(preset: ColorPreset): void {
    this.colors = JSON.parse(JSON.stringify(preset.colors));
    this.scheduleRender();
    this.toast.info(`Đã áp dụng bảng màu: ${preset.name}`);
  }

  getTemplateName(id: TemplateId): string {
    return this.availableTemplates.find((t) => t.id === id)?.name || id;
  }

  // --- IMAGE MANAGEMENT & STOCK PHOTOS ---

  triggerPhotoUpload(slot: 'primary' | 'secondary' | 'tertiary'): void {
    if (slot === 'primary') this.primaryPhotoInput?.nativeElement.click();
    else if (slot === 'secondary') this.secondaryPhotoInput?.nativeElement.click();
    else if (slot === 'tertiary') this.tertiaryPhotoInput?.nativeElement.click();
  }

  onPhotoSelected(event: Event, slot: 'primary' | 'secondary' | 'tertiary'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Ảnh quá lớn (> 10MB). Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (slot === 'primary') this.assets.primaryPhotoSrc = url;
      else if (slot === 'secondary') this.assets.secondaryPhotoSrc = url;
      else if (slot === 'tertiary') this.assets.tertiaryPhotoSrc = url;
      this.scheduleRender();
      this.toast.success('Đã tải ảnh lên thành công!');
    };
    reader.readAsDataURL(file);
  }

  removePhoto(slot: 'primary' | 'secondary' | 'tertiary'): void {
    if (slot === 'primary') this.assets.primaryPhotoSrc = '';
    else if (slot === 'secondary') this.assets.secondaryPhotoSrc = '';
    else if (slot === 'tertiary') this.assets.tertiaryPhotoSrc = '';
    this.scheduleRender();
  }

  selectStockPhoto(photo: StudioStockPhoto, slot: 'primary' | 'secondary' = 'primary'): void {
    if (slot === 'primary') {
      this.assets.primaryPhotoSrc = photo.url;
    } else {
      this.assets.secondaryPhotoSrc = photo.url;
    }
    this.scheduleRender();
    this.toast.info(`Đã chọn ảnh thư viện: ${photo.title}`);
  }

  // --- AI OCR AUTO-EXTRACTION ---

  // --- UNDO / REDO STATE STACK ---

  takeSnapshot(): void {
    const snap: StudioSnapshot = {
      data: JSON.parse(JSON.stringify(this.data)),
      assets: JSON.parse(JSON.stringify(this.assets)),
      templateId: this.selectedTemplateId,
      typography: JSON.parse(JSON.stringify(this.typography)),
      colors: JSON.parse(JSON.stringify(this.colors)),
      elements: JSON.parse(JSON.stringify(this.elements)),
      timestamp: Date.now(),
    };
    this.undoStack.push(snap);
    if (this.undoStack.length > 30) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo(): void {
    if (this.undoStack.length <= 1) return;
    const current = this.undoStack.pop();
    if (current) this.redoStack.push(current);

    const prev = this.undoStack[this.undoStack.length - 1];
    if (prev) {
      this.applySnapshot(prev);
    }
  }

  redo(): void {
    if (this.redoStack.length === 0) return;
    const next = this.redoStack.pop();
    if (next) {
      this.undoStack.push(next);
      this.applySnapshot(next);
    }
  }

  private applySnapshot(snap: StudioSnapshot): void {
    this.isApplyingHistory = true;
    this.data = JSON.parse(JSON.stringify(snap.data));
    this.assets = JSON.parse(JSON.stringify(snap.assets));
    this.selectedTemplateId = snap.templateId;
    this.typography = JSON.parse(JSON.stringify(snap.typography));
    this.colors = JSON.parse(JSON.stringify(snap.colors));
    this.elements = JSON.parse(JSON.stringify(snap.elements));
    this.render().then(() => (this.isApplyingHistory = false));
  }

  // --- PERSISTENCE & AUTO-SAVE ---

  persistDraft(): void {
    this.saveStatus = 'saving';
    const payload = {
      orderId: this.orderId,
      templateId: this.selectedTemplateId,
      data: this.data,
      assets: this.assets,
      typography: this.typography,
      colors: this.colors,
      layers: this.elements,
    };

    // Save to local storage for crash-proof recovery
    try {
      localStorage.setItem('viejap_poster_studio_backup', JSON.stringify(payload));
    } catch {
      // Ignore local storage quota
    }

    this.studioService.saveDraft(payload).subscribe({
      next: () => (this.saveStatus = 'saved'),
      error: () => (this.saveStatus = 'dirty'),
    });
  }

  manualSave(): void {
    this.persistDraft();
    this.toast.success('Đã lưu bản nháp Poster Studio thành công.');
  }

  // --- EXPORT & APPLY TO ORDER ---

  async exportPoster(format: 'png' | 'jpg' | 'pdf'): Promise<void> {
    if (!this.posterCanvas) return;
    this.isExporting = true;
    try {
      const blob = await exportPosterAsBlob(this.posterCanvas.nativeElement, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `Poster-${(this.data.orderCode || 'VieJap').replace(/\s+/g, '-')}-${Date.now()}.${format === 'pdf' ? 'png' : format}`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      this.toast.success(`Đã xuất poster thành công (${format.toUpperCase()})!`);
    } catch {
      this.toast.error('Có lỗi xảy ra khi xuất Poster.');
    } finally {
      this.isExporting = false;
    }
  }

  async applyToCurrentOrder(): Promise<void> {
    if (!this.orderId) {
      this.toast.warning('Đây là bản thiết kế độc lập chưa gắn với mã đơn hàng cụ thể. Vui lòng bấm Xuất ảnh.');
      return;
    }

    if (!this.posterCanvas) return;
    this.isApplyingToOrder = true;

    try {
      const blob = await exportPosterAsBlob(this.posterCanvas.nativeElement, 'png');
      this.studioService.uploadPosterBlob(blob, `order-${this.orderId}.png`).subscribe({
        next: (upRes) => {
          if (upRes?.imageUrl) {
            this.studioService.applyToOrder(this.orderId!, upRes.imageUrl).subscribe({
              next: () => {
                this.toast.success('Đã áp dụng Poster mới vào đơn hàng thành công!');
                this.isApplyingToOrder = false;
              },
              error: () => {
                this.toast.error('Lỗi khi cập nhật Poster vào đơn hàng.');
                this.isApplyingToOrder = false;
              },
            });
          }
        },
        error: () => {
          this.toast.error('Lỗi khi tải ảnh Poster lên hosting.');
          this.isApplyingToOrder = false;
        },
      });
    } catch {
      this.isApplyingToOrder = false;
    }
  }

  exitStudio(): void {
    if (this.saveStatus === 'dirty') {
      if (!confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi Poster Studio không?')) {
        return;
      }
    }
    this.closed.emit();
    this.onExit.emit();
    if (!this.embedded) {
      this.router.navigate(['/quan-tri-viejap'], { queryParams: { section: 'orders' } });
    }
  }

  private createDefaultAssets(): RecruitmentPosterAssets {
    return {
      logoSrc: 'assets/images/logo.png',
      backgroundSrc: '',
      primaryPhotoSrc: 'assets/images/jobs/job-dien-tu.jpg',
      secondaryPhotoSrc: 'assets/images/jobs/job-co-khi.jpg',
      tertiaryPhotoSrc: '',
    };
  }
}
