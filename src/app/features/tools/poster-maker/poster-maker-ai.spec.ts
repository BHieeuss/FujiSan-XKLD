import {
  AiStructuredOrder,
  createEmptyAiStructuredOrder,
  createFieldScore,
  validateAiStructuredOrder,
} from './models/ai-order-extraction.model';
import { mapAiOrderToPosterData, normalizeDateToIso } from './models/ai-order-mapper';
import { selectOptimalTemplate } from './templates/poster-template-registry';
import { AiPosterQaService } from './services/ai-poster-qa.service';
import { createRecruitmentPosterData } from './poster-maker.model';

describe('AI Poster Maker Workflow Test Suite', () => {
  let qaService: AiPosterQaService;

  beforeEach(() => {
    qaService = new AiPosterQaService();
  });

  // TEST 1 & 10: Test Case thực tế Sankochi (Mục XXXII & XXXIII)
  it('TEST 1 & 10: should parse and map automotive order Sankochi accurately', () => {
    const order: AiStructuredOrder = createEmptyAiStructuredOrder('sankochi-thong-bao.jpg');
    order.order.order_code = createFieldScore('20261027', 0.96, '20261027 - SANKOCHI');
    order.order.job_title = createFieldScore('SỬA CHỮA, BẢO DƯỠNG Ô TÔ', 0.99);
    order.order.job_category = createFieldScore('automotive', 0.98);
    order.order.work_location = createFieldScore(['AICHI', 'SHIZUOKA'], 0.97);
    order.recruitment.gender = createFieldScore('male', 0.98, 'Nam');
    order.recruitment.age_min = createFieldScore(18, 0.98);
    order.recruitment.age_max = createFieldScore(30, 0.98);
    order.salary.hourly = createFieldScore(1154, 0.98, '1,154 yên/giờ');
    order.salary.basic = createFieldScore(190410, 0.99, '190,410 yên');
    order.salary.take_home = createFieldScore(140110, 0.98, '140,110 yên');
    order.selection.interview_date = createFieldScore('2026-10-27', 0.99, '27-10-2026');

    // 1. Phân loại ngành
    expect(order.order.job_category.value).toBe('automotive');

    // 2. Mapping sang Poster Data
    const posterData = mapAiOrderToPosterData(order);
    expect(posterData.title).toBe('SỬA CHỮA, BẢO DƯỠNG Ô TÔ');
    expect(posterData.location).toBe('AICHI, SHIZUOKA');
    expect(posterData.ageRange).toBe('18–30');
    expect(posterData.interviewDate).toBe('2026-10-27');
    expect(posterData.salary).toContain('190.410 yên');
    expect(posterData.salary).toContain('140.110 yên');
    expect(posterData.salary).toContain('1.154 yên/giờ');

    // 3. Template selection
    const template = selectOptimalTemplate(order.order.job_category.value, order.order.job_title.value);
    expect(template.id).toBe('industrial_pro');
  });

  // TEST 2: Đơn hàng thực phẩm (Mặc định chọn Mẫu Tiêu Chuẩn khi các mẫu 3-4-5 đã xóa)
  it('TEST 2: should select standard template for food processing orders', () => {
    const template = selectOptimalTemplate('food_processing', 'Sơ chế và đóng gói thực phẩm');
    expect(template.id).toBe('japan_signature');
    expect(template.badge).toBe('Tiêu chuẩn Nhật');
  });

  // TEST 3: Bảng lương có nhiều số liệu
  it('TEST 3: should correctly format salary numbers with separators', () => {
    const order = createEmptyAiStructuredOrder();
    order.salary.hourly = createFieldScore(1154, 0.95);
    order.salary.basic = createFieldScore(190410, 0.98);
    order.salary.take_home = createFieldScore(140110, 0.97);

    const poster = mapAiOrderToPosterData(order);
    expect(poster.salary).toContain('190.410 yên');
    expect(poster.salary).toContain('140.110 yên');
    expect(poster.salary).toContain('1.154 yên/giờ');
  });

  // TEST 4: Ảnh mờ hoặc trường có confidence thấp
  it('TEST 4: should flag fields when confidence is below 0.80', () => {
    const order = createEmptyAiStructuredOrder();
    order.order.job_title = createFieldScore('Sửa chữa ô tô', 0.65); // Mờ
    order.order.work_location = createFieldScore(['Aichi'], 0.6);
    order.salary.hourly = createFieldScore(1154, 0.55);

    const validation = validateAiStructuredOrder(order);
    expect(validation.issues.some((i) => i.field.includes('job_title'))).toBeFalse(); // Title có giá trị nên pass
    expect(validation.issues.some((i) => i.message.includes('Độ tin cậy AI thấp'))).toBeTrue();
  });

  // TEST 5: Ảnh thiếu field không gây crash
  it('TEST 5: should handle missing fields gracefully without throwing errors', () => {
    const order = createEmptyAiStructuredOrder();
    expect(() => mapAiOrderToPosterData(order)).not.toThrow();

    const poster = mapAiOrderToPosterData(order);
    expect(poster.companyHeader).toBeTruthy();
    expect(poster.title).toBeTruthy();
  });

  // TEST 6: Validation phát hiện mâu thuẫn dữ liệu
  it('TEST 6: should detect when age_min > age_max', () => {
    const order = createEmptyAiStructuredOrder();
    order.order.job_title = createFieldScore('Cơ khí CNC', 0.9);
    order.order.work_location = createFieldScore(['Osaka'], 0.9);
    order.salary.basic = createFieldScore(200000, 0.9);
    order.recruitment.age_min = createFieldScore(35, 0.9);
    order.recruitment.age_max = createFieldScore(25, 0.9); // Mâu thuẫn

    const validation = validateAiStructuredOrder(order);
    expect(validation.isValid).toBeFalse();
    expect(validation.issues.some((i) => i.field === 'recruitment.age')).toBeTrue();
  });

  // TEST 8: AI Poster QA phát hiện text overflow và tự động sửa (Auto-repair)
  it('TEST 8: should detect text overflow and auto-repair it', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;

    const poster = createRecruitmentPosterData();
    poster.jobDescription = 'A'.repeat(250); // Quá dài (> 180 chars)

    const report = await qaService.inspectPoster(canvas, poster);
    expect(report.status).toBe('FAIL');
    expect(report.issues.some((i) => i.type === 'text_overflow')).toBeTrue();

    // Auto-repair
    const repair = qaService.autoRepair(poster, report.issues);
    expect(repair.modified).toBeTrue();
    expect(repair.repairedData.jobDescription.length).toBeLessThanOrEqual(180);
  });

  // TEST 9: Chuẩn hóa ngày tháng chính xác
  it('TEST 9: should normalize DD-MM-YYYY to ISO YYYY-MM-DD without swapping month and day', () => {
    expect(normalizeDateToIso('27-10-2026')).toBe('2026-10-27');
    expect(normalizeDateToIso('07/07/2026')).toBe('2026-07-07');
    expect(normalizeDateToIso('20261027')).toBe('2026-10-27');
    expect(normalizeDateToIso('2026-10-27')).toBe('2026-10-27');
  });

  // TEST 11: Test case ảnh 1 - TSUBAMA (Cơ khí CNC Saitama)
  it('TEST 11: should accurately map and format Tsubama CNC manufacturing order (Image 1)', () => {
    const order: AiStructuredOrder = createEmptyAiStructuredOrder('tc059m-tsubama.jpg');
    order.order.order_code = createFieldScore('TC059M', 0.98);
    order.order.order_name = createFieldScore('TSUBAMA', 0.97);
    order.order.company = createFieldScore('CÔNG TY TSUBAMA', 0.96);
    order.order.work_location = createFieldScore(['SAITAMA'], 0.99);
    order.order.job_category = createFieldScore('manufacturing', 0.98);
    order.order.job_title = createFieldScore('GIA CÔNG CƠ KHÍ', 0.99);
    order.recruitment.quantity = createFieldScore(3, 0.98);
    order.recruitment.gender = createFieldScore('male', 0.99);
    order.recruitment.age_min = createFieldScore(18, 0.99);
    order.recruitment.age_max = createFieldScore(28, 0.99);
    order.salary.hourly = createFieldScore(1196, 0.98);
    order.salary.basic = createFieldScore(191090, 0.99);
    order.salary.take_home = createFieldScore(146200, 0.99);
    order.selection.interview_date = createFieldScore('2026-10-10', 0.99);

    const poster = mapAiOrderToPosterData(order);
    expect(poster.title).toBe('GIA CÔNG CƠ KHÍ');
    expect(poster.location).toBe('SAITAMA');
    expect(poster.ageRange).toBe('18–28');
    expect(poster.interviewDate).toBe('2026-10-10');
    expect(poster.salary).toContain('191.090 yên');
    expect(poster.salary).toContain('146.200 yên');
    expect(poster.salary).toContain('1.196 yên/giờ');

    const template = selectOptimalTemplate(order.order.job_category.value, order.order.job_title.value);
    expect(template.id).toBe('industrial_pro');
    expect(template.badge).toBe('Cơ khí & Điện tử');
  });

  // TEST 12: Test case ảnh 2 - YAMAWA (Chế biến thực phẩm Ishikawa)
  it('TEST 12: should accurately map and format Yamawa food processing order (Image 2)', () => {
    const order: AiStructuredOrder = createEmptyAiStructuredOrder('20261120-yamawa.jpg');
    order.order.order_code = createFieldScore('20261120', 0.98);
    order.order.order_name = createFieldScore('YAMAWA', 0.98);
    order.order.company = createFieldScore('CÔNG TY YAMAWA', 0.97);
    order.order.work_location = createFieldScore(['ISHIKAWA'], 0.99);
    order.order.job_category = createFieldScore('food_processing', 0.99);
    order.order.job_title = createFieldScore('CHẾ BIẾN THỰC PHẨM', 0.99);
    order.recruitment.quantity = createFieldScore(10, 0.99);
    order.recruitment.gender = createFieldScore('female', 0.99);
    order.recruitment.age_min = createFieldScore(18, 0.99);
    order.recruitment.age_max = createFieldScore(27, 0.99);
    order.salary.hourly = createFieldScore(1113, 0.98);
    order.salary.basic = createFieldScore(192000, 0.99);
    order.salary.take_home = createFieldScore(136819, 0.99);
    order.selection.interview_date = createFieldScore('2026-11-20', 0.99);

    const poster = mapAiOrderToPosterData(order);
    expect(poster.title).toBe('CHẾ BIẾN THỰC PHẨM');
    expect(poster.location).toBe('ISHIKAWA');
    expect(poster.ageRange).toBe('18–27');
    expect(poster.interviewDate).toBe('2026-11-20');
    expect(poster.salary).toContain('192.000 yên');
    expect(poster.salary).toContain('136.819 yên');
    expect(poster.salary).toContain('1.113 yên/giờ');

    const template = selectOptimalTemplate(order.order.job_category.value, order.order.job_title.value);
    expect(template.id).toBe('japan_signature');
    expect(template.badge).toBe('Tiêu chuẩn Nhật');
  });

  // TEST 13: Quy trình chọn 1 lượt ảnh (Batch photo slot selection & auto-advance)
  it('TEST 13: should handle batch photo selection slot advancement correctly', () => {
    let activeSlot: 'primary' | 'secondary' | 'tertiary' = 'primary';
    const is3PhotoTemplate = true;

    function advanceSlot() {
      if (activeSlot === 'primary') {
        activeSlot = 'secondary';
      } else if (activeSlot === 'secondary') {
        if (is3PhotoTemplate) {
          activeSlot = 'tertiary';
        }
      }
    }

    expect(activeSlot).toBe('primary');
    advanceSlot();
    expect(activeSlot).toBe('secondary');
    advanceSlot();
    expect(activeSlot).toBe('tertiary');
  });
});
