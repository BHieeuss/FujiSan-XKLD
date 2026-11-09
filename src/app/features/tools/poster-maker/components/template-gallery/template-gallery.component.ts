import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { PosterTemplateDefinition, TemplateId } from '../../models/poster-template.model';
import {
  createDefaultPosterAssets,
  RecruitmentPosterAssets,
  RecruitmentPosterData,
} from '../../poster-maker.model';
import { POSTER_HEIGHT, POSTER_WIDTH, renderRecruitmentPoster } from '../../poster-renderer';
import { POSTER_TEMPLATES } from '../../templates/poster-template-registry';
import { renderTemplateLayoutWireframe } from '../../templates/poster-wireframe-renderer';

/**
 * Sinh dữ liệu mẫu thể hiện cấu trúc bố cục rõ ràng của template (Placeholder layout).
 * Sử dụng placeholder cấu trúc chuẩn theo đúng yêu cầu hệ thống.
 * Không giả mạo thông tin đơn hàng cụ thể.
 */
export function createTemplateLayoutPlaceholderData(): RecruitmentPosterData {
  return {
    companyHeader: 'CÔNG TY CUNG ỨNG NHÂN LỰC QUỐC TẾ VIEJAP',
    orderCode: 'MÃ ĐƠN HÀNG',
    title: 'TÊN ĐƠN HÀNG TUYỂN DỤNG',
    jobDescription: 'Vị trí công việc & mô tả môi trường làm việc thực tế tại xí nghiệp Nhật Bản',
    salary: 'Lương cơ bản: [Mức lương cơ bản]\nLương thực lĩnh: [Mức lương thực lĩnh]',
    requirements: [
      'Yêu cầu độ tuổi, giới tính và tiêu chuẩn tiếp nhận',
      'Yêu cầu sức khỏe tốt, chăm chỉ, kỷ luật lao động cao',
      'Được đào tạo tay nghề và tiếng Nhật bài bản trước khi xuất cảnh',
    ].join('\n'),
    location: 'ĐỊA ĐIỂM / TỈNH TẠI NHẬT BẢN',
    ageRange: 'Độ tuổi quy định',
    interviewDate: '2026-12-31',
    departureDate: 'Thời gian xuất cảnh dự kiến',
    registrationLabel: 'QUÉT MÃ ĐĂNG KÝ',
    registrationUrl: 'https://viejap.com',
    hotline: '0966 966 284',
    category: 'other',
  };
}

@Component({
  selector: 'app-template-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-gallery.component.html',
  styleUrl: './template-gallery.component.scss',
})
export class TemplateGalleryComponent implements AfterViewInit, OnChanges {
  @Input() selectedTemplateId: TemplateId = 'japan_signature';
  @Input() existingPosterData?: RecruitmentPosterData;
  @Input() existingAssets?: RecruitmentPosterAssets;

  @Output() templateSelected = new EventEmitter<PosterTemplateDefinition>();
  @Output() templateConfirmed = new EventEmitter<PosterTemplateDefinition>();

  @ViewChildren('thumbCanvas') thumbCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('modalPreviewCanvas') modalPreviewCanvasList!: QueryList<ElementRef<HTMLCanvasElement>>;

  readonly templates = POSTER_TEMPLATES;
  readonly posterWidth = POSTER_WIDTH;
  readonly posterHeight = POSTER_HEIGHT;

  // Chế độ dữ liệu xem trước: Bố cục mẫu (placeholder) hoặc dữ liệu hiện có
  previewDataMode: 'placeholder' | 'existing' = 'placeholder';

  // Trạng thái modal xem trước bố cục lớn
  previewingTemplate?: PosterTemplateDefinition;
  renderingPreview = false;

  get currentSelectedTemplate(): PosterTemplateDefinition {
    return (
      this.templates.find((t) => t.id === this.selectedTemplateId) || this.templates[0]
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      void this.renderAllThumbnails();
    }, 150);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTemplateId'] && !changes['selectedTemplateId'].firstChange) {
      if (this.previewingTemplate) {
        this.previewingTemplate = this.currentSelectedTemplate;
        setTimeout(() => void this.renderModalPreview(), 100);
      }
    }
  }

  selectTemplate(template: PosterTemplateDefinition): void {
    this.selectedTemplateId = template.id;
    this.templateSelected.emit(template);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const confirmBar = document.querySelector('.template-confirmation-bar');
        if (confirmBar) {
          confirmBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }

  confirmSelection(): void {
    this.templateConfirmed.emit(this.currentSelectedTemplate);
  }

  openLayoutPreview(template: PosterTemplateDefinition, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.previewingTemplate = template;
    setTimeout(() => {
      void this.renderModalPreview();
    }, 100);
  }

  closeLayoutPreview(): void {
    this.previewingTemplate = undefined;
  }

  selectAndConfirmFromModal(template: PosterTemplateDefinition): void {
    this.selectTemplate(template);
    this.closeLayoutPreview();
    this.confirmSelection();
  }

  get hasExistingData(): boolean {
    return Boolean(
      this.existingPosterData?.title &&
      this.existingPosterData.title !== 'TÊN ĐƠN HÀNG TUYỂN DỤNG'
    );
  }

  setPreviewDataMode(mode: 'placeholder' | 'existing'): void {
    if (this.previewDataMode === mode) return;
    this.previewDataMode = mode;
    void this.renderAllThumbnails();
    if (this.previewingTemplate) {
      void this.renderModalPreview();
    }
  }

  private async renderAllThumbnails(): Promise<void> {
    const canvasArray = this.thumbCanvases?.toArray();
    if (!canvasArray || canvasArray.length === 0) {
      return;
    }

    // Khi ở chế độ Bố cục dự kiến: Render sơ đồ wireframe blueprint trực tiếp
    if (this.previewDataMode === 'placeholder') {
      for (let i = 0; i < this.templates.length; i++) {
        const canvasEl = canvasArray[i]?.nativeElement;
        if (canvasEl) {
          try {
            await renderTemplateLayoutWireframe(canvasEl, this.templates[i].id);
          } catch (e) {
            console.warn(`Lỗi render wireframe thumbnail cho template ${this.templates[i].name}:`, e);
          }
        }
      }
      return;
    }

    // Khi người dùng chọn xem theo dữ liệu đơn hàng hiện có
    const dataToUse = this.existingPosterData!;
    const assetsToUse =
      this.existingAssets || createDefaultPosterAssets(dataToUse.category);

    for (let i = 0; i < this.templates.length; i++) {
      const canvasEl = canvasArray[i]?.nativeElement;
      if (canvasEl) {
        try {
          await renderRecruitmentPoster(canvasEl, dataToUse, assetsToUse, this.templates[i].id);
        } catch (e) {
          console.warn(`Lỗi render thumbnail cho template ${this.templates[i].name}:`, e);
        }
      }
    }
  }

  private async renderModalPreview(): Promise<void> {
    if (!this.previewingTemplate) return;

    const canvas = this.modalPreviewCanvasList?.first?.nativeElement;
    if (!canvas) return;

    this.renderingPreview = true;
    try {
      if (this.previewDataMode === 'placeholder') {
        await renderTemplateLayoutWireframe(canvas, this.previewingTemplate.id);
        return;
      }

      const dataToUse = this.existingPosterData!;
      const assetsToUse =
        this.existingAssets || createDefaultPosterAssets(dataToUse.category);

      await renderRecruitmentPoster(canvas, dataToUse, assetsToUse, this.previewingTemplate.id);
    } finally {
      this.renderingPreview = false;
    }
  }
}

