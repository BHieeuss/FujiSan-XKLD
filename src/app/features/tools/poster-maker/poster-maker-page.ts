import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  createRecruitmentPosterData,
  RecruitmentPosterAssets,
  RecruitmentPosterData,
} from './poster-maker.model';
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  renderRecruitmentPoster,
} from './poster-renderer';

type PhotoSlot = 'primary' | 'secondary';

@Component({
  selector: 'app-poster-maker-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poster-maker-page.html',
  styleUrl: './poster-maker-page.scss',
})
export class PosterMakerPage implements AfterViewInit, OnDestroy {
  @Input() embedded = false;

  @ViewChild('posterCanvas') posterCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('primaryPhotoInput') primaryPhotoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('secondaryPhotoInput') secondaryPhotoInput?: ElementRef<HTMLInputElement>;

  readonly posterWidth = POSTER_WIDTH;
  readonly posterHeight = POSTER_HEIGHT;

  data: RecruitmentPosterData = createRecruitmentPosterData();
  assets: RecruitmentPosterAssets = this.createDefaultAssets();
  primaryPhotoName = 'Ảnh mẫu kỹ sư tại công trường';
  secondaryPhotoName = 'Ảnh mẫu kỹ sư làm việc';
  rendering = false;
  renderError = '';
  downloadMessage = '';

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
      } else {
        this.assets = { ...this.assets, secondaryPhotoSrc: result };
        this.secondaryPhotoName = file.name;
      }
      this.renderError = '';
      this.scheduleRender();
    };
    reader.onerror = () => {
      this.renderError = 'Không thể đọc ảnh đã chọn. Vui lòng thử lại với ảnh khác.';
    };
    reader.readAsDataURL(file);
  }

  async downloadPoster(): Promise<void> {
    await this.renderPoster();
    const canvas = this.posterCanvas?.nativeElement;
    if (!canvas || this.renderError) {
      return;
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      this.renderError = 'Không thể tạo file PNG. Vui lòng thử lại.';
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.createFilename();
    anchor.click();
    URL.revokeObjectURL(url);
    this.downloadMessage = `Đã tạo ${anchor.download}`;
  }

  resetPoster(): void {
    this.data = createRecruitmentPosterData();
    this.assets = this.createDefaultAssets();
    this.primaryPhotoName = 'Ảnh mẫu kỹ sư tại công trường';
    this.secondaryPhotoName = 'Ảnh mẫu kỹ sư làm việc';
    this.renderError = '';
    this.downloadMessage = '';
    if (this.primaryPhotoInput) {
      this.primaryPhotoInput.nativeElement.value = '';
    }
    if (this.secondaryPhotoInput) {
      this.secondaryPhotoInput.nativeElement.value = '';
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
      await renderRecruitmentPoster(canvas, this.data, this.assets);
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
    };
  }

  private createFilename(): string {
    const base = this.data.orderCode || this.data.title || 'don-tuyen';
    const safeBase = base
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return `don-hang-${safeBase || 'don-tuyen'}.png`;
  }
}
