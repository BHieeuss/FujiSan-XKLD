import { RecruitmentPosterData } from '../poster-maker.model';
import { AiStructuredOrder } from './ai-order-extraction.model';

/**
 * Ánh xạ (Map) dữ liệu AI trích xuất có cấu trúc sang RecruitmentPosterData của Form hiện tại.
 * Đảm bảo 100% khả năng tương thích và cho phép người dùng tùy ý chỉnh sửa lại trên form.
 */
export function mapAiOrderToPosterData(
  aiOrder: AiStructuredOrder,
  existingPoster?: Partial<RecruitmentPosterData>,
): RecruitmentPosterData {
  const order = aiOrder.order;
  const recruitment = aiOrder.recruitment;
  const salary = aiOrder.salary;
  const selection = aiOrder.selection;
  const departure = aiOrder.departure;

  // 1. Tên công ty tiêu đề
  const companyHeader =
    order.company.value ||
    order.receiving_company.value ||
    order.organization.value ||
    existingPoster?.companyHeader ||
    'CÔNG TY CUNG ỨNG NHÂN LỰC QUỐC TẾ VIEJAP';

  // 2. Mã đơn
  const orderCode =
    order.order_code.value ||
    order.order_name.value ||
    existingPoster?.orderCode ||
    '';

  // 3. Tiêu đề công việc
  const title = (
    order.job_title.value ||
    existingPoster?.title ||
    'ĐƠN TUYỂN DỤNG NHẬT BẢN'
  ).toUpperCase();

  // 4. Nội dung công việc
  const jobDescription =
    order.job_description.value ||
    existingPoster?.jobDescription ||
    'Nội dung công việc chi tiết theo thông báo đơn tuyển';

  // 5. Chuẩn hóa chuỗi Lương hiển thị
  const salaryText = buildSalaryDisplayString(salary, existingPoster?.salary);

  // 6. Quyền lợi và yêu cầu (mỗi dòng 1 gạch đầu dòng, tối ưu 3-4 dòng)
  const requirementsList: string[] = [];

  // Giới tính & số lượng nếu có
  const genderMap: Record<string, string> = {
    male: 'Nam',
    female: 'Nữ',
    both: 'Nam / Nữ',
  };
  const genderStr = recruitment.gender.value ? genderMap[recruitment.gender.value] || '' : '';
  if (recruitment.quantity.value) {
    requirementsList.push(
      `Tuyển ${recruitment.quantity.value} lao động${genderStr ? ` (${genderStr})` : ''}`,
    );
  } else if (genderStr) {
    requirementsList.push(`Đối tượng tuyển dụng: ${genderStr}`);
  }

  // Yêu cầu chi tiết từ thông báo
  if (recruitment.requirements.value && recruitment.requirements.value.length > 0) {
    for (const req of recruitment.requirements.value) {
      if (req && req.trim() && !requirementsList.includes(req.trim())) {
        requirementsList.push(req.trim());
      }
    }
  }

  // Quyền lợi từ ghi chú khác (ăn trưa, ký túc xá...)
  if (aiOrder.notes && Array.isArray(aiOrder.notes) && aiOrder.notes.length > 0) {
    for (const note of aiOrder.notes) {
      if (note && note.trim() && !requirementsList.includes(note.trim())) {
        requirementsList.push(note.trim());
      }
    }
  }

  // Nếu ít hơn 3 dòng, bổ sung các quyền lợi mặc định tiêu chuẩn của VieJap
  if (requirementsList.length < 3) {
    const defaults = [
      'Được đóng đầy đủ bảo hiểm, quyền lợi theo luật lao động Nhật Bản',
      'Hỗ trợ đào tạo tiếng Nhật và kỹ năng trước khi xuất cảnh',
      'Có cơ hội gia hạn hợp đồng và phát triển lâu dài',
    ];
    for (const item of defaults) {
      if (requirementsList.length < 4 && !requirementsList.includes(item)) {
        requirementsList.push(item);
      }
    }
  }

  const requirementsText = requirementsList.slice(0, 4).join('\n');

  // 7. Địa điểm làm việc
  let location = 'NHẬT BẢN';
  if (order.work_location.value && order.work_location.value.length > 0) {
    location = order.work_location.value.join(', ').toUpperCase();
  } else if (existingPoster?.location) {
    location = existingPoster.location;
  }

  // 8. Độ tuổi
  let ageRange = existingPoster?.ageRange || '18–35';
  const ageMin = recruitment.age_min.value;
  const ageMax = recruitment.age_max.value;
  if (ageMin && ageMax) {
    ageRange = `${ageMin}–${ageMax}`;
  } else if (ageMin) {
    ageRange = `${ageMin}+`;
  } else if (ageMax) {
    ageRange = `Dưới ${ageMax}`;
  }

  // 9. Ngày phỏng vấn (YYYY-MM-DD)
  let interviewDate = existingPoster?.interviewDate || '';
  if (selection.interview_date.value) {
    interviewDate = normalizeDateToIso(selection.interview_date.value);
  }

  // 10. Thời gian xuất cảnh
  let departureDate = departure.date.value || existingPoster?.departureDate || '';
  if (!departureDate) {
    departureDate = 'Dự kiến 4-6 tháng sau trúng tuyển';
  }

  return {
    companyHeader,
    orderCode,
    title,
    jobDescription,
    salary: salaryText,
    requirements: requirementsText,
    location,
    ageRange,
    interviewDate,
    departureDate,
    registrationLabel: existingPoster?.registrationLabel || 'ĐĂNG KÝ HỒ SƠ',
    registrationUrl: existingPoster?.registrationUrl || 'https://zalo.me/0966966284',
    hotline: existingPoster?.hotline || '0966 966 284',
    category: order.job_category.value || existingPoster?.category || 'other',
  };
}

/**
 * Xây dựng chuỗi hiển thị lương dễ hiểu, hấp dẫn và chính xác
 */
function buildSalaryDisplayString(
  salary: AiStructuredOrder['salary'],
  fallback?: string,
): string {
  const parts: string[] = [];

  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  if (salary.basic.value && salary.basic.value > 0) {
    parts.push(`Lương cơ bản: ${formatMoney(salary.basic.value)} yên`);
  }

  if (salary.take_home.value && salary.take_home.value > 0) {
    parts.push(`Thực lĩnh: ~${formatMoney(salary.take_home.value)} yên`);
  }

  if (salary.hourly.value && salary.hourly.value > 0) {
    parts.push(`Lương giờ: ${formatMoney(salary.hourly.value)} yên/giờ`);
  }

  if (parts.length > 0) {
    return parts.join('\n');
  }

  if (salary.hourly.source_text) {
    return salary.hourly.source_text;
  }

  return fallback || 'Lương theo quy định tiếp nhận Nhật Bản';
}

/**
 * Chuẩn hóa chuỗi ngày tháng bất kỳ (DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD) sang ISO YYYY-MM-DD
 */
export function normalizeDateToIso(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Định dạng DD-MM-YYYY hoặc DD/MM/YYYY
  const matchDmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (matchDmy) {
    const day = matchDmy[1].padStart(2, '0');
    const month = matchDmy[2].padStart(2, '0');
    const year = matchDmy[3];
    return `${year}-${month}-${day}`;
  }

  // Định dạng YYYY/MM/DD
  const matchYmd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (matchYmd) {
    const year = matchYmd[1];
    const month = matchYmd[2].padStart(2, '0');
    const day = matchYmd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Định dạng compact YYYYMMDD (ví dụ: 20261027)
  const matchCompact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (matchCompact) {
    return `${matchCompact[1]}-${matchCompact[2]}-${matchCompact[3]}`;
  }

  return trimmed;
}
