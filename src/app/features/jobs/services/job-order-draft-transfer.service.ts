import { Injectable, signal } from '@angular/core';
import {
  createEmptyJobOrder,
  JobOrderCategory,
  JobOrderPayload,
  JOB_ORDER_CATEGORIES,
} from '../models/job-order.model';
import {
  RecruitmentPosterAssets,
  RecruitmentPosterData,
} from '../../tools/poster-maker/poster-maker.model';

const STORAGE_KEY = 'viejap_order_draft_transfer';
const POSTER_PREVIEW_KEY = 'viejap_order_poster_preview';

@Injectable({ providedIn: 'root' })
export class JobOrderDraftTransferService {
  private readonly draftSignal = signal<JobOrderPayload | null>(null);
  private readonly posterPreviewSignal = signal<string | null>(null);

  constructor() {
    this.restoreFromStorage();
  }

  readonly currentDraft = this.draftSignal.asReadonly();
  readonly posterPreview = this.posterPreviewSignal.asReadonly();

  hasDraft(): boolean {
    return this.draftSignal() !== null;
  }

  getDraft(): JobOrderPayload | null {
    return this.draftSignal();
  }

  getPosterPreview(): string | null {
    return this.posterPreviewSignal();
  }

  setDraftFromPoster(
    posterData: RecruitmentPosterData,
    assets?: RecruitmentPosterAssets,
    posterDataUrl?: string,
  ): JobOrderPayload {
    const category = this.detectCategory(posterData);
    const parsedSalary = this.parseSalary(posterData.salary || '');

    const draft: JobOrderPayload = {
      ...createEmptyJobOrder(),
      title: posterData.title?.trim() || `Đơn tuyển dụng ${posterData.location || 'Nhật Bản'}`,
      category,
      orderCode: posterData.orderCode?.trim() || '',
      location: posterData.location?.trim() || 'Nhật Bản',
      salary: posterData.salary?.trim() || '',
      basicSalary: parsedSalary.basic || posterData.salary?.trim() || '',
      takeHomeSalary: parsedSalary.takeHome || '',
      ageRange: posterData.ageRange?.trim() || '18 - 35 tuổi',
      description: posterData.jobDescription?.trim() || '',
      specificWork: posterData.jobDescription?.trim() || '',
      requirements: posterData.requirements?.trim() || '',
      interviewDate: posterData.interviewDate?.trim() || '',
      departureMonth: posterData.departureDate?.trim() || '',
      company: '',
      status: 'draft',
      isFeatured: false,
      workEnvironment: this.suggestWorkEnvironment(category),
      workingHours: '08:00 - 17:00 (Nghỉ trưa 60 phút, có tăng ca 20 - 40h/tháng)',
      holidays: 'Nghỉ Thứ 7, Chủ Nhật và các ngày Lễ theo lịch Nhật Bản (105-115 ngày/năm)',
      experience: 'Không yêu cầu kinh nghiệm, tiếp nhận đào tạo bài bản từ đầu',
      healthRequirements: 'Sức khỏe tốt, không mắc bệnh truyền nhiễm, thị lực tốt, không mù màu',
      overtime: 'Nhiều việc làm thêm, bình quân 25 - 40 giờ/tháng, nhân hệ số 125% - 150%',
      allowances: 'Trợ cấp đào tạo tháng đầu 60.000 Yên, phụ cấp ca kíp, chuyên cần',
      bonus: 'Xét tăng lương hàng năm, thưởng theo năng suất làm việc',
      insurance: 'Đầy đủ BH Y tế, Nenkin hưu trí, Tai nạn lao động, Thất nghiệp theo Luật Nhật Bản',
      accommodation: 'Ký túc xá đầy đủ tiện nghi: điều hòa, máy giặt, bếp nấu, wifi, gần công ty',
      meals: 'Bếp tự nấu ăn tại KTX, hỗ trợ bữa ăn ca tại nhà máy',
      transport: 'Cung cấp xe đạp hoặc hỗ trợ 100% vé tháng tàu điện',
      otherBenefits: 'Hỗ trợ thủ tục hoàn thuế Nenkin khi hết hạn hợp đồng về nước',
      postTemplateId: this.suggestTemplateId(category),
      galleryImages: this.extractGalleryImages(assets),
      imageUrl: assets?.primaryPhotoSrc || '',
      posterUrl: posterDataUrl || '',
    };

    this.draftSignal.set(draft);
    if (posterDataUrl) {
      this.posterPreviewSignal.set(posterDataUrl);
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      if (posterDataUrl) {
        // Only save if data URL is not excessively huge for sessionStorage
        if (posterDataUrl.length < 2 * 1024 * 1024) {
          sessionStorage.setItem(POSTER_PREVIEW_KEY, posterDataUrl);
        }
      }
    } catch {
      // Ignore quota errors in storage
    }

    return draft;
  }

  setDraft(draft: JobOrderPayload): void {
    this.draftSignal.set(draft);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage errors
    }
  }

  clearDraft(): void {
    this.draftSignal.set(null);
    this.posterPreviewSignal.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(POSTER_PREVIEW_KEY);
    } catch {
      // Ignore
    }
  }

  private restoreFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as JobOrderPayload;
        this.draftSignal.set(parsed);
      }
      const poster = sessionStorage.getItem(POSTER_PREVIEW_KEY);
      if (poster) {
        this.posterPreviewSignal.set(poster);
      }
    } catch {
      // Storage unavailable or invalid JSON
    }
  }

  private detectCategory(data: RecruitmentPosterData): JobOrderCategory {
    const text = `${data.title || ''} ${data.jobDescription || ''} ${data.requirements || ''}`.toLowerCase();

    if (text.includes('kỹ sư') || text.includes('ky su') || text.includes('it') || text.includes('thiết kế')) {
      return 'ky-su';
    }
    if (text.includes('tokutei') || text.includes('đặc định') || text.includes('dac dinh')) {
      return 'tokutei';
    }
    if (text.includes('du học') || text.includes('du hoc') || text.includes('học bổng')) {
      return 'du-hoc';
    }
    if (
      text.includes('thực phẩm') ||
      text.includes('thủy sản') ||
      text.includes('cơm hộp') ||
      text.includes('bánh mì') ||
      text.includes('chế biến') ||
      text.includes('đóng gói')
    ) {
      return 'thuc-pham';
    }
    if (
      text.includes('nông nghiệp') ||
      text.includes('rau') ||
      text.includes('hoa') ||
      text.includes('trái cây') ||
      text.includes('trang trại') ||
      text.includes('nhà kính')
    ) {
      return 'nong-nghiep';
    }
    if (
      text.includes('cơ khí') ||
      text.includes('cnc') ||
      text.includes('hàn') ||
      text.includes('tiện') ||
      text.includes('phay') ||
      text.includes('bảo trì') ||
      text.includes('kim loại')
    ) {
      return 'co-khi';
    }
    if (
      text.includes('xây dựng') ||
      text.includes('cốt pha') ||
      text.includes('giàn giáo') ||
      text.includes('sơn') ||
      text.includes('hoàn thiện') ||
      text.includes('lắp đặt')
    ) {
      return 'xay-dung';
    }
    if (
      text.includes('điện tử') ||
      text.includes('bo mạch') ||
      text.includes('linh kiện') ||
      text.includes('lắp ráp')
    ) {
      return 'dien-tu';
    }

    return 'thuc-tap-sinh';
  }

  private parseSalary(salaryText: string): { basic: string; takeHome: string } {
    const lines = salaryText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let basic = '';
    let takeHome = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('cơ bản') || lower.includes('co ban') || lower.includes('gross')) {
        basic = line;
      } else if (lower.includes('thực lĩnh') || lower.includes('thuc linh') || lower.includes('thực nhận') || lower.includes('net')) {
        takeHome = line;
      }
    }

    if (!basic && lines.length > 0) {
      basic = lines[0];
    }
    if (!takeHome && lines.length > 1) {
      takeHome = lines[1];
    }

    return { basic, takeHome };
  }

  private suggestWorkEnvironment(cat: JobOrderCategory): string {
    switch (cat) {
      case 'thuc-pham':
        return 'Nhà máy chế biến hiện đại, dây chuyền sạch sẽ, nhiệt độ ổn định, vô trùng';
      case 'co-khi':
        return 'Xưởng cơ khí tự động hóa, trang bị đầy đủ bảo hộ, hệ thống hút lọc không khí';
      case 'dien-tu':
        return 'Phòng sạch (Clean room) tiêu chuẩn cao, điều hòa mát mẻ, môi trường nhẹ nhàng';
      case 'nong-nghiep':
        return 'Trang trại hiện đại & nhà kính công nghệ cao, môi trường thoáng mát, gần gũi thiên nhiên';
      case 'xay-dung':
        return 'Công trường đảm bảo quy chuẩn an toàn lao động Nhật Bản, phụ cấp ngoài trời';
      default:
        return 'Trong nhà xưởng sạch sẽ, điều hòa, trang thiết bị an toàn lao động tiêu chuẩn';
    }
  }

  private suggestTemplateId(cat: JobOrderCategory): string {
    switch (cat) {
      case 'thuc-pham':
        return 'food_processing';
      case 'co-khi':
        return 'mechanical_cnc';
      case 'xay-dung':
        return 'construction';
      case 'nong-nghiep':
        return 'agriculture';
      case 'dien-tu':
        return 'electronics';
      default:
        return 'standard_general';
    }
  }

  private extractGalleryImages(assets?: RecruitmentPosterAssets): string[] {
    if (!assets) return [];
    const list: string[] = [];
    if (assets.primaryPhotoSrc) list.push(assets.primaryPhotoSrc);
    if (assets.secondaryPhotoSrc) list.push(assets.secondaryPhotoSrc);
    if (assets.tertiaryPhotoSrc) list.push(assets.tertiaryPhotoSrc);
    return list;
  }
}

