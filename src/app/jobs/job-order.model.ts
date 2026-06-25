export type JobOrderStatus = 'draft' | 'published';
export type JobOrderCategory = 'ky-su' | 'tokutei' | 'thuc-tap-sinh' | 'du-hoc';

export interface JobOrder {
  id: string;
  category: JobOrderCategory;
  imageUrl: string;
  description: string;
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
  description: string;
}

export const JOB_ORDER_CATEGORIES: readonly JobOrderCategoryMeta[] = [
  {
    key: 'ky-su',
    label: 'Kỹ sư',
    shortLabel: 'Kỹ sư',
    icon: 'fas fa-compass-drafting',
    description: 'Đơn theo chuyên môn và phát triển nghề nghiệp.',
  },
  {
    key: 'tokutei',
    label: 'Tokutei',
    shortLabel: 'Tokutei',
    icon: 'fas fa-screwdriver-wrench',
    description: 'Chương trình kỹ năng đặc định.',
  },
  {
    key: 'thuc-tap-sinh',
    label: 'Thực tập sinh',
    shortLabel: 'TTS',
    icon: 'fas fa-helmet-safety',
    description: 'Đơn thực tập sinh Nhật Bản.',
  },
  {
    key: 'du-hoc',
    label: 'Du học',
    shortLabel: 'Du học',
    icon: 'fas fa-graduation-cap',
    description: 'Lộ trình học tập tại Nhật Bản.',
  },
];

export function getJobOrderCategory(category: JobOrderCategory): JobOrderCategoryMeta {
  return JOB_ORDER_CATEGORIES.find((item) => item.key === category) ?? JOB_ORDER_CATEGORIES[2];
}

export function getJobOrderFallbackImage(category: JobOrderCategory): string {
  switch (category) {
    case 'ky-su':
      return '/assets/images/KySu/ks.png';
    case 'tokutei':
      return '/assets/images/TKT/tkt.png';
    case 'du-hoc':
      return '/assets/images/DHS/dhs.png';
    default:
      return '/assets/images/TTS/tts.png';
  }
}

export function createEmptyJobOrder(): JobOrderPayload {
  return {
    category: 'thuc-tap-sinh',
    imageUrl: '',
    description: '',
    status: 'draft',
    isFeatured: false,
  };
}
