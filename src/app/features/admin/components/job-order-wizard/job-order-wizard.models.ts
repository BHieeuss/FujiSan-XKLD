export type JobOrderWizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardStepMeta {
  step: JobOrderWizardStep;
  key: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const WIZARD_STEPS: readonly WizardStepMeta[] = [
  {
    step: 1,
    key: 'info',
    title: 'Thông tin chung',
    subtitle: 'Mã đơn, ngành nghề, địa điểm & số lượng',
    icon: 'fas fa-circle-info',
  },
  {
    step: 2,
    key: 'work',
    title: 'Công việc & Yêu cầu',
    subtitle: 'Chi tiết thao tác, môi trường & tiêu chuẩn',
    icon: 'fas fa-screwdriver-wrench',
  },
  {
    step: 3,
    key: 'salary',
    title: 'Lương & Quyền lợi',
    subtitle: 'Lương cơ bản vs thực lĩnh & phụ cấp',
    icon: 'fas fa-sack-dollar',
  },
  {
    step: 4,
    key: 'designer',
    title: 'Hình ảnh & Thiết kế bài',
    subtitle: 'Poster, 9 mẫu bài đăng & xem trước trực tiếp',
    icon: 'fas fa-palette',
  },
  {
    step: 5,
    key: 'review',
    title: 'Kiểm tra & Lưu',
    subtitle: 'Bảng đối chiếu, lưu nháp hoặc xuất bản',
    icon: 'fas fa-clipboard-check',
  },
];

