import { Injectable } from '@angular/core';
import {
  AiExtractionValidationResult,
  AiStructuredOrder,
  createEmptyAiStructuredOrder,
  createFieldScore,
  validateAiStructuredOrder,
} from '../models/ai-order-extraction.model';

export interface AiExtractionResponse {
  order: AiStructuredOrder;
  validation: AiExtractionValidationResult;
  processingTimeMs: number;
  mode: 'gemini_vision' | 'local_fallback';
}

@Injectable({ providedIn: 'root' })
export class AiOrderExtractorService {
  /**
   * Phân tích ảnh thông báo đơn hàng bằng AI Vision
   */
  async extractOrderFromImage(
    file: File,
    options?: { apiKey?: string; demoProfile?: string },
  ): Promise<AiExtractionResponse> {
    const startTime = performance.now();

    // 1. Kiểm tra tính hợp lệ của file
    this.validateImageFile(file);

    const base64Data = await this.readFileAsDataUrl(file);

    // Lấy API Key từ options hoặc localStorage nếu có
    const effectiveApiKey =
      options?.apiKey ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('viejap_gemini_api_key') || '' : '');

    // 2. Gửi request đến backend AI endpoint
    let structuredOrder: AiStructuredOrder | null = null;
    let mode: 'gemini_vision' | 'local_fallback' = 'gemini_vision';

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (effectiveApiKey) {
        headers['X-AI-API-KEY'] = effectiveApiKey;
      }

      const response = await fetch('/admin-api/ai-extract.php', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64: base64Data,
          filename: file.name,
          apiKey: effectiveApiKey || undefined,
          demoProfile: options?.demoProfile,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.data?.order) {
          structuredOrder = payload.data as AiStructuredOrder;
          mode = payload.mode === 'simulated_fallback' ? 'local_fallback' : 'gemini_vision';
        }
      } else {
        const errPayload = await response.json().catch(() => null);
        const errCode = errPayload?.code ?? '';
        const errMsg = errPayload?.message || `Lỗi máy chủ (${response.status})`;
        console.warn('[AI Vision]', errCode, errMsg);
        // Luôn ném lỗi cho người dùng biết — không âm thầm fallback sang dữ liệu cứng
        throw new Error(errMsg);
      }
    } catch (err) {
      if (!options?.demoProfile) {
        throw err instanceof Error ? err : new Error('Không thể kết nối đến AI Vision.');
      }
      mode = 'local_fallback';
    }

    if (!structuredOrder) {
      if (options?.demoProfile) {
        structuredOrder = this.fallbackInBrowserExtractor(file.name, options?.demoProfile);
        mode = 'local_fallback';
      } else {
        throw new Error('AI không đọc được dữ liệu đơn hàng từ ảnh.');
      }
    }

    // 3. Chạy bước AI Validation & Confidence Check (Mục VIII)
    const validation = validateAiStructuredOrder(structuredOrder);
    const processingTimeMs = Math.round(performance.now() - startTime);

    return {
      order: structuredOrder,
      validation,
      processingTimeMs,
      mode,
    };
  }

  private validateImageFile(file: File): void {
    if (!file) {
      throw new Error('Vui lòng chọn file ảnh thông báo đơn hàng.');
    }

    if (file.size === 0) {
      throw new Error('File được chọn bị rỗng (0 bytes). Vui lòng kiểm tra lại.');
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error('File ảnh vượt quá 20 MB. Vui lòng giảm kích thước ảnh.');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Định dạng file không hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
    }
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Không thể đọc file ảnh.'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Engine phân tích in-browser dự phòng chuẩn mực khi chạy độc lập
   */
  private fallbackInBrowserExtractor(filename: string, demoProfile?: string): AiStructuredOrder {
    const lower = (filename || '').toLowerCase();
    const isYamawa =
      demoProfile === 'yamawa' ||
      lower.includes('yamawa') ||
      lower.includes('thuc-pham') ||
      lower.includes('20261120');
    const isSankochi =
      demoProfile === 'sankochi' ||
      lower.includes('sankochi') ||
      lower.includes('20261027');

    const empty = createEmptyAiStructuredOrder(filename);

    if (isYamawa) {
      empty.order.order_code = createFieldScore('20261120', 0.98, '20261120 - YAMAWA');
      empty.order.order_name = createFieldScore('YAMAWA', 0.98, 'YAMAWA');
      empty.order.company = createFieldScore('CÔNG TY YAMAWA', 0.97, 'YAMAWA - CHẾ BIẾN THỰC PHẨM');
      empty.order.receiving_company = createFieldScore('Xí nghiệp Yamawa', 0.88);
      empty.order.work_location = createFieldScore(['ISHIKAWA'], 0.99, 'Địa điểm làm việc: ISHIKAWA');
      empty.order.job_category = createFieldScore('food_processing', 0.99);
      empty.order.job_title = createFieldScore('CHẾ BIẾN THỰC PHẨM', 0.99, 'CHẾ BIẾN THỰC PHẨM');
      empty.order.job_description = createFieldScore(
        'Chế biến cơm hộp, sushi, salad, các món ăn kèm, đóng gói cơm hộp',
        0.97,
      );

      empty.recruitment.quantity = createFieldScore(10, 0.99, 'Nữ: 10');
      empty.recruitment.male_quantity = createFieldScore(0, 0.9);
      empty.recruitment.female_quantity = createFieldScore(10, 0.99);
      empty.recruitment.gender = createFieldScore('female', 0.99, 'Nữ');
      empty.recruitment.age_min = createFieldScore(18, 0.99, 'Từ 18 đến 27');
      empty.recruitment.age_max = createFieldScore(27, 0.99, 'Từ 18 đến 27');
      empty.recruitment.requirements = createFieldScore(
        [
          'Nữ độ tuổi 18–27, khỏe mạnh, nhanh nhẹn, thị lực tốt, không viêm gan B',
          'Khi nhập cảnh giao tiếp tiếng Nhật tốt',
          'Chế biến món ăn sẵn, cơm hộp, sushi, salad, đóng gói',
          'Được ăn trưa miễn phí tại công ty. Ký túc xá mới xây 2025 phòng riêng tiện nghi',
        ],
        0.96,
      );

      empty.salary.hourly = createFieldScore(1113, 0.98, '1,113 yên/giờ');
      empty.salary.basic = createFieldScore(192000, 0.99, 'Lương cơ bản: 192,000 yên');
      empty.salary.tax = createFieldScore(4410, 0.96, 'Thuế: 4,410 yên');
      empty.salary.insurance = createFieldScore(27771, 0.96, 'Bảo hiểm: 27,771 yên');
      empty.salary.housing = createFieldScore(23000, 0.96, 'Tiền nhà: 23,000 yên');
      empty.salary.take_home = createFieldScore(136819, 0.99, 'Thực lĩnh: 136,819 yên');
      empty.salary.overtime = createFieldScore(
        'Có nhiều làm thêm khoảng 40 tiếng/ tháng. Mỗi ngày tăng ca 1,5 - 2 tiếng',
        0.95,
      );
      empty.salary.currency = 'JPY';

      empty.selection.interview_date = createFieldScore('2026-11-20', 0.99, '20-11-2026');
      empty.selection.interview_location = createFieldScore('VP Hồ Chí Minh', 0.95);
      empty.departure.date = createFieldScore('05/2027', 0.9);

      return empty;
    }

    if (isSankochi) {
      empty.order.order_code = createFieldScore('20261027', 0.96, '20261027 - SANKOCHI');
      empty.order.order_name = createFieldScore('SANKOCHI', 0.95, 'SANKOCHI');
      empty.order.company = createFieldScore('CÔNG TY SANKOCHI', 0.94, 'SANKOCHI');
      empty.order.receiving_company = createFieldScore('Xí nghiệp Sankochi', 0.9);
      empty.order.work_location = createFieldScore(['AICHI', 'SHIZUOKA'], 0.98, 'AICHI, SHIZUOKA');
      empty.order.job_category = createFieldScore('automotive', 0.98);
      empty.order.job_title = createFieldScore('SỬA CHỮA, BẢO DƯỠNG Ô TÔ', 0.99, 'SỬA CHỮA, BẢO DƯỠNG Ô TÔ');
      empty.order.job_description = createFieldScore(
        'Sửa chữa, bảo dưỡng định kỳ và kiểm tra xe ô tô trong xưởng dịch vụ kỹ thuật',
        0.96,
      );

      empty.recruitment.quantity = createFieldScore(4, 0.95, '4');
      empty.recruitment.gender = createFieldScore('male', 0.98, 'Nam');
      empty.recruitment.age_min = createFieldScore(18, 0.98, '18');
      empty.recruitment.age_max = createFieldScore(30, 0.98, '30');
      empty.recruitment.requirements = createFieldScore(
        [
          'Nam độ tuổi 18–30, sức khỏe tốt, chăm chỉ và có tinh thần trách nhiệm',
          'Được đào tạo bài bản kỹ thuật sửa chữa bảo dưỡng xe theo tiêu chuẩn Nhật',
          'Không yêu cầu kinh nghiệm, tốt nghiệp THPT trở lên',
          'Hỗ trợ chế độ sinh hoạt phí, bảo hiểm và nhà ở tiện nghi',
        ],
        0.92,
      );

      empty.salary.hourly = createFieldScore(1154, 0.98, '1,154 yên/giờ');
      empty.salary.basic = createFieldScore(190410, 0.99, '190,410 yên');
      empty.salary.take_home = createFieldScore(140110, 0.98, '140,110 yên');
      empty.salary.currency = 'JPY';

      empty.selection.interview_date = createFieldScore('2026-10-27', 0.99, '27-10-2026');
      empty.departure.date = createFieldScore('04/2027', 0.92);

      return empty;
    }

    // Mặc định là Tsubama (Cơ khí CNC)
    empty.order.order_code = createFieldScore('TC059M', 0.98, 'MÃ: TC059M');
    empty.order.order_name = createFieldScore('TSUBAMA', 0.97, 'TSUBAMA');
    empty.order.company = createFieldScore('CÔNG TY TSUBAMA', 0.96, 'TÊN CÔNG TY: TSUBAMA');
    empty.order.receiving_company = createFieldScore('Xí nghiệp Tsubama', 0.88);
    empty.order.company_address = createFieldScore('Saitama, Nhật Bản', 0.95);
    empty.order.work_location = createFieldScore(['SAITAMA'], 0.99, 'ĐỊA ĐIỂM LÀM VIỆC: SAITAMA');
    empty.order.job_category = createFieldScore('manufacturing', 0.98);
    empty.order.job_title = createFieldScore('GIA CÔNG CƠ KHÍ', 0.99, 'TIẾNG VIỆT: GIA CÔNG CƠ KHÍ');
    empty.order.job_description = createFieldScore(
      'Sử dụng máy (gia công CNC) để gia công các sản phẩm nhôm, kiểm hàng...',
      0.96,
    );

    empty.recruitment.quantity = createFieldScore(3, 0.98, 'NAM: 3');
    empty.recruitment.male_quantity = createFieldScore(3, 0.98);
    empty.recruitment.female_quantity = createFieldScore(0, 0.9);
    empty.recruitment.gender = createFieldScore('male', 0.99, 'NAM: 3');
    empty.recruitment.age_min = createFieldScore(18, 0.99, 'Từ 18 đến 28 tuổi');
    empty.recruitment.age_max = createFieldScore(28, 0.99, 'Từ 18 đến 28 tuổi');
    empty.recruitment.requirements = createFieldScore(
      [
        'Nam độ tuổi 18–28, sức khỏe tốt, vui vẻ, hòa đồng',
        'Không yêu cầu kinh nghiệm, mong muốn làm việc tại Nhật lâu dài',
        'Sử dụng máy (gia công CNC) gia công các sản phẩm nhôm, kiểm hàng',
        'Môi trường xưởng cơ khí hiện đại, công ty hỗ trợ đào tạo bài bản',
      ],
      0.95,
    );

    empty.salary.hourly = createFieldScore(1196, 0.98, '1,196 YÊN/GIỜ (chưa tính tăng ca)');
    empty.salary.basic = createFieldScore(191090, 0.99, 'Lương cơ bản: 191,090 YÊN/THÁNG');
    empty.salary.tax = createFieldScore(3500, 0.95, 'Thuế: 3,500 yên');
    empty.salary.insurance = createFieldScore(26300, 0.95, 'Bảo hiểm: 26,300 yên');
    empty.salary.housing = createFieldScore(15000, 0.95, 'Tiền nhà: 15,000 yên');
    empty.salary.take_home = createFieldScore(146200, 0.99, 'Thực lĩnh: 146,200 yên');
    empty.salary.overtime = createFieldScore(
      'Công ty có nhiều việc làm thêm khoảng 40 tiếng/ tháng',
      0.95,
    );
    empty.salary.currency = 'JPY';

    empty.selection.interview_date = createFieldScore('2026-10-10', 0.99, 'NGÀY 10/10/2026');
    empty.selection.interview_location = createFieldScore('Trực tiếp', 0.9);
    empty.departure.date = createFieldScore('04/2027', 0.9);

    return empty;
  }
}
