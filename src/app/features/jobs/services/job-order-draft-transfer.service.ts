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
import { AiStructuredOrder } from '../../tools/poster-maker/models/ai-order-extraction.model';

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
    aiOrder?: AiStructuredOrder,
  ): JobOrderPayload {
    const category = this.detectCategory(posterData);
    const parsedSalary = this.parseSalary(posterData.salary || '');

    // Trích xuất dữ liệu thực do AI quét nếu có (Chỉ lấy khi thực sự được nhận diện từ ảnh/tài liệu đơn hàng)
    const scannedOvertime = aiOrder?.salary?.overtime?.value?.trim() || '';
    const scannedBasicSalary =
      (aiOrder?.salary?.basic?.value ? `${aiOrder.salary.basic.value.toLocaleString('vi-VN')} Yên/tháng` : '') ||
      parsedSalary.basic ||
      posterData.salary?.trim() ||
      '';
    const scannedTakeHome =
      (aiOrder?.salary?.take_home?.value ? `${aiOrder.salary.take_home.value.toLocaleString('vi-VN')} Yên/tháng` : '') ||
      parsedSalary.takeHome ||
      '';
    const scannedCompany =
      aiOrder?.order?.company?.value?.trim() ||
      aiOrder?.order?.receiving_company?.value?.trim() ||
      (posterData.companyHeader && !posterData.companyHeader.includes('VIEJAP') ? posterData.companyHeader.trim() : '');
    const scannedJobType = aiOrder?.order?.job_title?.value?.trim() || '';
    const scannedQuantity =
      aiOrder?.recruitment?.quantity?.value !== null && aiOrder?.recruitment?.quantity?.value !== undefined
        ? String(aiOrder.recruitment.quantity.value)
        : posterData.quantity?.trim() || '';
    const scannedGender =
      aiOrder?.recruitment?.gender?.value === 'male'
        ? 'Nam'
        : aiOrder?.recruitment?.gender?.value === 'female'
        ? 'Nữ'
        : aiOrder?.recruitment?.gender?.value === 'both'
        ? 'Nam/Nữ'
        : posterData.gender?.trim() || 'Nam/Nữ';

    // Rà soát các ghi chú (notes) thực tế trích xuất được từ đơn
    const aiNotes = aiOrder?.notes || [];
    const findNote = (keywords: string[]): string => {
      const found = aiNotes.find((n) => keywords.some((k) => n.toLowerCase().includes(k.toLowerCase())));
      return found?.trim() || '';
    };

    const scannedMeals = findNote(['ăn', 'cơm', 'bữa ăn', 'suất ăn', 'nhà ăn']);
    const scannedHousing =
      (aiOrder?.salary?.housing?.value ? `Tiền nhà: ${aiOrder.salary.housing.value.toLocaleString('vi-VN')} Yên/tháng` : '') ||
      findNote(['ký túc xá', 'ktx', 'nhà ở', 'phòng ở', 'thuê nhà']);
    const scannedInsurance =
      (aiOrder?.salary?.insurance?.value ? `Bảo hiểm: ${aiOrder.salary.insurance.value.toLocaleString('vi-VN')} Yên/tháng` : '') ||
      findNote(['bảo hiểm', 'bh y tế', 'nenkin']);
    const scannedBonus = findNote(['thưởng', 'tăng lương', 'năng suất']);
    const scannedAllowances = findNote(['trợ cấp', 'phụ cấp']);
    const scannedTransport = findNote(['xe đạp', 'tàu điện', 'đi lại', 'xe buýt']);
    const scannedHours = findNote(['giờ làm', 'ca làm', '08:', '07:', '09:']);
    const scannedHolidays = findNote(['ngày nghỉ', 'thứ 7', 'chủ nhật', 'lễ']);
    const scannedWorkEnv = findNote(['môi trường', 'nhà xưởng', 'ngoài trời', 'xưởng']);

    const draft: JobOrderPayload = {
      ...createEmptyJobOrder(),
      title: posterData.title?.trim() || (posterData.location ? `Đơn tuyển dụng ${posterData.location}` : ''),
      category,
      orderCode: posterData.orderCode?.trim() || aiOrder?.order?.order_code?.value?.trim() || '',
      location: posterData.location?.trim() || aiOrder?.order?.work_location?.value?.join(', ') || '',
      salary: posterData.salary?.trim() || '',
      basicSalary: scannedBasicSalary,
      takeHomeSalary: scannedTakeHome,
      ageRange: posterData.ageRange?.trim() || '',
      description: posterData.jobDescription?.trim() || aiOrder?.order?.job_description?.value?.trim() || '',
      specificWork: posterData.jobDescription?.trim() || aiOrder?.order?.job_description?.value?.trim() || '',
      requirements: posterData.requirements?.trim() || '',
      interviewDate: posterData.interviewDate?.trim() || '',
      departureMonth: posterData.departureDate?.trim() || '',
      company: scannedCompany,
      jobType: scannedJobType,
      quantity: scannedQuantity,
      gender: scannedGender,
      status: 'draft',
      isFeatured: false,

      // NẾU KHÔNG CÓ DỮ LIỆU DO AI QUÉT TỪ ĐƠN THỰC THÌ ĐỂ TRỐNG HOÀN TOÀN ĐỂ QUẢN TRỊ TỰ NHẬP:
      workEnvironment: scannedWorkEnv,
      workingHours: scannedHours,
      holidays: scannedHolidays,
      experience: '',
      healthRequirements: '',
      overtime: scannedOvertime,
      allowances: scannedAllowances,
      bonus: scannedBonus,
      insurance: scannedInsurance,
      accommodation: scannedHousing,
      meals: scannedMeals,
      transport: scannedTransport,
      otherBenefits: '',
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
    const candidates = [assets.secondaryPhotoSrc, assets.tertiaryPhotoSrc, assets.primaryPhotoSrc].filter(
      (src): src is string => Boolean(src && typeof src === 'string' && src.trim())
    );
    for (const src of candidates) {
      if (!list.includes(src)) {
        list.push(src);
      }
      if (list.length >= 2) break;
    }
    return list;
  }
}

