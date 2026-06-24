export type JobOrderCategory = 'ky-su' | 'tokutei' | 'thuc-tap-sinh' | 'du-hoc';
export type JobOrderStatus = 'draft' | 'published';

export interface JobOrder {
  id: string;
  orderCode: string;
  title: string;
  category: JobOrderCategory;
  location: string;
  salary: string;
  ageRange: string;
  summary: string;
  requirements: string;
  departureMonth: string;
  status: JobOrderStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type JobOrderPayload = Omit<JobOrder, 'id' | 'createdAt' | 'updatedAt'>;

export interface JobOrderCategoryMeta {
  key: JobOrderCategory;
  label: string;
  shortLabel: string;
  icon: string;
  image: string;
  description: string;
}

export const JOB_ORDER_CATEGORIES: readonly JobOrderCategoryMeta[] = [
  {
    key: 'ky-su',
    label: 'Kỹ sư',
    shortLabel: 'Kỹ sư',
    icon: 'fas fa-compass-drafting',
    image: 'assets/images/KySu/1.png',
    description: 'Làm việc theo chuyên môn và phát triển nghề nghiệp.',
  },
  {
    key: 'tokutei',
    label: 'Tokutei',
    shortLabel: 'Tokutei',
    icon: 'fas fa-screwdriver-wrench',
    image: 'assets/images/TKT/2.png',
    description: 'Chương trình kỹ năng đặc định cho người có tay nghề.',
  },
  {
    key: 'thuc-tap-sinh',
    label: 'Thực tập sinh',
    shortLabel: 'TTS',
    icon: 'fas fa-helmet-safety',
    image: 'assets/images/TTS/1.png',
    description: 'Học nghề, tích lũy kinh nghiệm làm việc thực tế.',
  },
  {
    key: 'du-hoc',
    label: 'Du học',
    shortLabel: 'Du học',
    icon: 'fas fa-graduation-cap',
    image: 'assets/images/DHS/3.png',
    description: 'Học tiếng, chuẩn bị hồ sơ và chọn trường phù hợp.',
  },
];

export function getJobOrderCategory(category: JobOrderCategory): JobOrderCategoryMeta {
  return JOB_ORDER_CATEGORIES.find((item) => item.key === category) ?? JOB_ORDER_CATEGORIES[0];
}

export function createEmptyJobOrder(): JobOrderPayload {
  return {
    orderCode: '',
    title: '',
    category: 'thuc-tap-sinh',
    location: '',
    salary: '',
    ageRange: '',
    summary: '',
    requirements: '',
    departureMonth: '',
    status: 'draft',
    isFeatured: false,
  };
}
