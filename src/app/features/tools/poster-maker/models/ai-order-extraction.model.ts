/**
 * Schema chuẩn hóa cho dữ liệu trích xuất từ ảnh Thông Báo Đơn Hàng bằng Vision AI.
 * Tuân thủ mục VI, VII, VIII trong quy chuẩn hệ thống.
 */

export interface FieldScore<T> {
  value: T;
  confidence: number; // 0.0 đến 1.0. < 0.80 sẽ kích hoạt cảnh báo
  source_text?: string;
  flagged?: boolean; // Tự động bật nếu confidence < 0.80 hoặc có nghi vấn
}

export type JobCategory =
  | 'automotive' // Sửa chữa, bảo dưỡng ô tô
  | 'food_processing' // Chế biến, đóng gói thực phẩm
  | 'manufacturing' // Cơ khí, gia công kim loại, chế tạo máy
  | 'electronics' // Điện tử, linh kiện ô tô
  | 'agriculture' // Nông nghiệp, trồng trọt, chăn nuôi
  | 'construction' // Xây dựng, cốp pha, giàn giáo
  | 'packaging' // Đóng gói công nghiệp
  | 'logistics' // Kho vận, phân loại hàng hóa
  | 'apparel' // May mặc, dệt may
  | 'restaurant' // Nhà hàng, khách sạn
  | 'other'; // Ngành nghề khác

export interface AiStructuredOrder {
  order: {
    order_code: FieldScore<string | null>;
    order_name: FieldScore<string | null>;
    company: FieldScore<string | null>;
    organization: FieldScore<string | null>;
    receiving_company: FieldScore<string | null>;
    company_address: FieldScore<string | null>;
    work_location: FieldScore<string[]>;
    job_category: FieldScore<JobCategory>;
    job_title: FieldScore<string>;
    job_description: FieldScore<string>;
  };
  recruitment: {
    quantity: FieldScore<number | null>;
    male_quantity: FieldScore<number | null>;
    female_quantity: FieldScore<number | null>;
    gender: FieldScore<'male' | 'female' | 'both' | null>;
    age_min: FieldScore<number | null>;
    age_max: FieldScore<number | null>;
    requirements: FieldScore<string[]>;
  };
  salary: {
    hourly: FieldScore<number | null>;
    basic: FieldScore<number | null>;
    tax: FieldScore<number | null>;
    insurance: FieldScore<number | null>;
    housing: FieldScore<number | null>;
    take_home: FieldScore<number | null>;
    overtime: FieldScore<string | null>;
    currency: string;
  };
  selection: {
    method: FieldScore<string | null>;
    interview_date: FieldScore<string | null>; // Định dạng YYYY-MM-DD
    interview_location: FieldScore<string | null>;
    deadline: FieldScore<string | null>;
  };
  departure: {
    date: FieldScore<string | null>;
  };
  notes: string[];
  extra_fields: Record<string, string>;
  source: {
    filename?: string;
    file_size_bytes?: number;
    mime_type?: string;
    page?: number;
  };
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AiExtractionValidationResult {
  isValid: boolean;
  score: number; // 0.0 - 1.0 tổng thể
  issues: ValidationIssue[];
}

/**
 * Tạo một FieldScore mặc định với giá trị truyền vào
 */
export function createFieldScore<T>(
  value: T,
  confidence = 1.0,
  source_text = '',
  flagged?: boolean,
): FieldScore<T> {
  return {
    value,
    confidence,
    source_text,
    flagged: flagged ?? confidence < 0.8,
  };
}

/**
 * Khởi tạo một mẫu AiStructuredOrder rỗng
 */
export function createEmptyAiStructuredOrder(filename = ''): AiStructuredOrder {
  return {
    order: {
      order_code: createFieldScore(null, 0.5),
      order_name: createFieldScore(null, 0.5),
      company: createFieldScore(null, 0.5),
      organization: createFieldScore(null, 0.5),
      receiving_company: createFieldScore(null, 0.5),
      company_address: createFieldScore(null, 0.5),
      work_location: createFieldScore([], 0.5),
      job_category: createFieldScore<JobCategory>('other', 0.5),
      job_title: createFieldScore('', 0.5),
      job_description: createFieldScore('', 0.5),
    },
    recruitment: {
      quantity: createFieldScore(null, 0.5),
      male_quantity: createFieldScore(null, 0.5),
      female_quantity: createFieldScore(null, 0.5),
      gender: createFieldScore(null, 0.5),
      age_min: createFieldScore(null, 0.5),
      age_max: createFieldScore(null, 0.5),
      requirements: createFieldScore([], 0.5),
    },
    salary: {
      hourly: createFieldScore(null, 0.5),
      basic: createFieldScore(null, 0.5),
      tax: createFieldScore(null, 0.5),
      insurance: createFieldScore(null, 0.5),
      housing: createFieldScore(null, 0.5),
      take_home: createFieldScore(null, 0.5),
      overtime: createFieldScore(null, 0.5),
      currency: 'JPY',
    },
    selection: {
      method: createFieldScore(null, 0.5),
      interview_date: createFieldScore(null, 0.5),
      interview_location: createFieldScore(null, 0.5),
      deadline: createFieldScore(null, 0.5),
    },
    departure: {
      date: createFieldScore(null, 0.5),
    },
    notes: [],
    extra_fields: {},
    source: {
      filename,
    },
  };
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu AI đã trích xuất theo Section VIII
 */
export function validateAiStructuredOrder(order: AiStructuredOrder): AiExtractionValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Kiểm tra Tiêu đề / Công việc
  if (!order.order.job_title.value || order.order.job_title.value.trim().length === 0) {
    issues.push({
      field: 'order.job_title',
      message: 'Thiếu tên công việc hoặc tiêu đề đơn hàng.',
      severity: 'high',
    });
  }

  // 2. Kiểm tra Địa điểm làm việc
  if (
    !order.order.work_location.value ||
    order.order.work_location.value.length === 0
  ) {
    issues.push({
      field: 'order.work_location',
      message: 'Chưa xác định được địa điểm làm việc (Tỉnh/Thành phố tại Nhật).',
      severity: 'medium',
    });
  }

  // 3. Kiểm tra Lương
  const hasSalary =
    (order.salary.hourly.value !== null && order.salary.hourly.value > 0) ||
    (order.salary.basic.value !== null && order.salary.basic.value > 0) ||
    (order.salary.take_home.value !== null && order.salary.take_home.value > 0);
  if (!hasSalary) {
    issues.push({
      field: 'salary',
      message: 'Chưa nhận diện được mức lương (lương giờ, cơ bản hoặc thực lĩnh).',
      severity: 'high',
    });
  }

  // 4. Kiểm tra Độ tuổi
  const ageMin = order.recruitment.age_min.value;
  const ageMax = order.recruitment.age_max.value;
  if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
    issues.push({
      field: 'recruitment.age',
      message: `Độ tuổi tối thiểu (${ageMin}) lớn hơn độ tuổi tối đa (${ageMax}).`,
      severity: 'high',
    });
  }

  // 5. Kiểm tra định dạng ngày phỏng vấn (YYYY-MM-DD)
  const interviewDate = order.selection.interview_date.value;
  if (interviewDate && !/^\d{4}-\d{2}-\d{2}$/.test(interviewDate)) {
    issues.push({
      field: 'selection.interview_date',
      message: `Định dạng ngày phỏng vấn chưa chuẩn YYYY-MM-DD (${interviewDate}).`,
      severity: 'medium',
    });
  }

  // 6. Kiểm tra các trường có confidence thấp
  const checkLowConfidence = (fieldPath: string, field: FieldScore<unknown>) => {
    if (field.confidence < 0.8) {
      issues.push({
        field: fieldPath,
        message: `Độ tin cậy AI thấp (${Math.round(field.confidence * 100)}%). Cần kiểm tra lại.`,
        severity: 'low',
      });
    }
  };

  checkLowConfidence('order.order_code', order.order.order_code);
  checkLowConfidence('salary.hourly', order.salary.hourly);
  checkLowConfidence('salary.basic', order.salary.basic);
  checkLowConfidence('salary.take_home', order.salary.take_home);
  checkLowConfidence('selection.interview_date', order.selection.interview_date);

  const score = Math.max(0, 1 - issues.filter((i) => i.severity === 'high').length * 0.3 - issues.filter((i) => i.severity === 'medium').length * 0.15);

  return {
    isValid: issues.filter((i) => i.severity === 'high').length === 0,
    score,
    issues,
  };
}
