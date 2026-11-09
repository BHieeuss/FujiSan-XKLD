export type JobOrderStatus = 'draft' | 'published';

export type JobOrderCategory =
  | 'nong-nghiep'
  | 'thuc-pham'
  | 'co-khi'
  | 'xay-dung'
  | 'dien-tu'
  | 'khac'
  | 'ky-su'
  | 'tokutei'
  | 'thuc-tap-sinh'
  | 'du-hoc';

export interface JobPostContentBlock {
  id: string;
  key: string;
  title: string;
  icon: string;
  content: string;
  enabled: boolean;
  order: number;
}

export interface JobPostTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  icon: string;
  initialBlocks: Omit<JobPostContentBlock, 'id'>[];
  facebookFormat: (data: Partial<JobOrder>) => string;
}

export interface JobOrder {
  id: string;
  title?: string;
  category: JobOrderCategory;
  imageUrl: string;
  posterUrl?: string;
  description: string;
  status: JobOrderStatus;
  isFeatured: boolean;
  orderCode?: string;
  location?: string;
  salary?: string;
  ageRange?: string;
  requirements?: string;
  departureMonth?: string;

  // Trường mở rộng chi tiết
  company?: string;
  jobType?: string;
  quantity?: string;
  gender?: string;
  education?: string;
  japaneseLevel?: string;
  contractTerm?: string;
  interviewDate?: string;
  specificWork?: string;
  workEnvironment?: string;
  workingHours?: string;
  holidays?: string;
  experience?: string;
  healthRequirements?: string;

  // Lương & Quyền lợi phân tách
  basicSalary?: string;
  takeHomeSalary?: string;
  overtime?: string;
  allowances?: string;
  bonus?: string;
  insurance?: string;
  accommodation?: string;
  meals?: string;
  transport?: string;
  otherBenefits?: string;

  // Trình thiết kế bài đăng & Media
  postContent?: string;
  facebookContent?: string;
  postTemplateId?: string;
  postBlocks?: JobPostContentBlock[];
  galleryImages?: string[];

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
    key: 'nong-nghiep',
    label: 'Nông nghiệp',
    shortLabel: 'Nông nghiệp',
    icon: 'fas fa-leaf',
    description: 'Trồng trọt, thu hoạch nông sản trong nhà kính và trang trại Nhật Bản.',
  },
  {
    key: 'thuc-pham',
    label: 'Chế biến thực phẩm',
    shortLabel: 'Thực phẩm',
    icon: 'fas fa-utensils',
    description: 'Chế biến thủy hải sản, cơm hộp, thực phẩm đóng gói trong nhà máy.',
  },
  {
    key: 'co-khi',
    label: 'Cơ khí',
    shortLabel: 'Cơ khí',
    icon: 'fas fa-gear',
    description: 'Vận hành máy CNC, tiện, phay, hàn, bảo trì máy móc công nghiệp.',
  },
  {
    key: 'xay-dung',
    label: 'Xây dựng',
    shortLabel: 'Xây dựng',
    icon: 'fas fa-building',
    description: 'Thi công xây dựng, cốt pha, hoàn thiện công trình, giám sát kỹ thuật.',
  },
  {
    key: 'dien-tu',
    label: 'Điện tử',
    shortLabel: 'Điện tử',
    icon: 'fas fa-microchip',
    description: 'Lắp ráp linh kiện, sản xuất bo mạch và thiết bị điện tử chính xác.',
  },
  {
    key: 'khac',
    label: 'Khác',
    shortLabel: 'Khác',
    icon: 'fas fa-ellipsis',
    description: 'Các ngành nghề dịch vụ, đóng gói công nghiệp và logistics.',
  },
  {
    key: 'ky-su',
    label: 'Kỹ sư',
    shortLabel: 'Kỹ sư',
    icon: 'fas fa-compass-drafting',
    description: 'Đơn theo chuyên môn kỹ thuật và phát triển nghề nghiệp lâu dài.',
  },
  {
    key: 'tokutei',
    label: 'Tokutei',
    shortLabel: 'Tokutei',
    icon: 'fas fa-screwdriver-wrench',
    description: 'Chương trình kỹ năng đặc định với mức lương tương đương người Nhật.',
  },
  {
    key: 'thuc-tap-sinh',
    label: 'Thực tập sinh',
    shortLabel: 'TTS',
    icon: 'fas fa-helmet-safety',
    description: 'Chương trình thực tập sinh kỹ năng Nhật Bản chuẩn 3 - 5 năm.',
  },
  {
    key: 'du-hoc',
    label: 'Du học',
    shortLabel: 'Du học',
    icon: 'fas fa-graduation-cap',
    description: 'Lộ trình du học vừa học vừa làm tại các trường Nhật ngữ uy tín.',
  },
];

export function getJobOrderCategory(category: JobOrderCategory): JobOrderCategoryMeta {
  return JOB_ORDER_CATEGORIES.find((item) => item.key === category) ?? JOB_ORDER_CATEGORIES[0];
}

export function getJobOrderTitle(order: Pick<JobOrder, 'title' | 'category'>): string {
  const title = order.title?.trim();
  return title || `Đơn ${getJobOrderCategory(order.category).label}`;
}

export function getJobOrderFallbackImage(category: JobOrderCategory): string {
  switch (category) {
    case 'nong-nghiep':
      return 'assets/images/jobs/job-nong-nghiep.jpg';
    case 'thuc-pham':
      return 'assets/images/jobs/job-thuc-pham.jpg';
    case 'co-khi':
    case 'ky-su':
      return 'assets/images/jobs/job-co-khi.jpg';
    case 'xay-dung':
      return 'assets/images/jobs/job-xay-dung.jpg';
    case 'dien-tu':
      return 'assets/images/jobs/job-dien-tu.jpg';
    case 'tokutei':
      return 'assets/images/jobs/job-thuc-pham.jpg';
    case 'thuc-tap-sinh':
      return 'assets/images/jobs/job-thuc-pham.jpg';
    case 'du-hoc':
      return 'assets/images/DHS/dhs.png';
    default:
      return 'assets/images/jobs/job-thuc-pham.jpg';
  }
}

export function stripJobOrderHtml(html: string): string {
  if (!html) {
    return '';
  }

  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>|<\/div>|<\/li>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createEmptyJobOrder(): JobOrderPayload {
  return {
    title: '',
    category: 'thuc-tap-sinh',
    imageUrl: '',
    posterUrl: '',
    description: '',
    status: 'draft',
    isFeatured: false,
    orderCode: '',
    location: '',
    salary: '',
    ageRange: '',
    requirements: '',
    departureMonth: '',
    company: '',
    jobType: '',
    quantity: '',
    gender: 'Nam/Nữ',
    education: '',
    japaneseLevel: '',
    contractTerm: '',
    interviewDate: '',
    specificWork: '',
    workEnvironment: '',
    workingHours: '',
    holidays: '',
    experience: '',
    healthRequirements: '',
    basicSalary: '',
    takeHomeSalary: '',
    overtime: '',
    allowances: '',
    bonus: '',
    insurance: '',
    accommodation: '',
    meals: '',
    transport: '',
    otherBenefits: '',
    postContent: '',
    facebookContent: '',
    postTemplateId: 'standard_general',
    postBlocks: [],
    galleryImages: [],
  };
}
