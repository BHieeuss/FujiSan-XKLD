import { JobOrder } from '../../../jobs/models/job-order.model';

export type PostLayoutId =
  | 'highlight'
  | 'clear_info'
  | 'salary_benefits'
  | 'storytelling'
  | 'concise_shareable';

export type PostWritingStyleId =
  | 'concise'
  | 'professional'
  | 'friendly'
  | 'engaging'
  | 'detailed';

export type PostSectionKey =
  | 'headline'
  | 'company_location'
  | 'job_work'
  | 'recruitment_quantity'
  | 'requirements'
  | 'salary_benefits'
  | 'allowances_perks'
  | 'timeline'
  | 'story_intro'
  | 'story_opportunity'
  | 'cta_contact';

export interface PostSection {
  id: string;
  key: PostSectionKey;
  label: string;
  icon: string;
  content: string;
  isModified?: boolean;
}

export interface PostVersion {
  id: string;
  versionNumber: number;
  layoutId: PostLayoutId;
  styleId: PostWritingStyleId;
  sections: PostSection[];
  fullText: string;
  createdAt: string;
  note?: string;
}

export interface PostLayoutMeta {
  id: PostLayoutId;
  name: string;
  shortName: string;
  badge: string;
  purpose: string;
  description: string;
  wireframeSvg: string;
  recommendedStyle: PostWritingStyleId;
  sectionKeys: PostSectionKey[];
}

export interface PostWritingStyleMeta {
  id: PostWritingStyleId;
  name: string;
  shortDesc: string;
  badge: string;
  icon: string;
  tone: string;
}

export type PostRiskLevel = 'low' | 'medium' | 'high'; // 'Ít rủi ro phát hiện' | 'Cần xem xét' | 'Rủi ro cao'

export interface PostAuditIssue {
  id: string;
  category: 'commitment' | 'discrimination' | 'urgency' | 'inconsistency' | 'missing_info' | 'ads_policy';
  categoryLabel: string;
  riskLevel: PostRiskLevel;
  riskLabel: string; // 'Ít rủi ro' | 'Cần xem xét' | 'Rủi ro cao'
  flaggedText: string;
  positionHint?: string;
  reason: string;
  suggestion: string;
}

export interface PostPaidAdsCheckItem {
  item: string;
  passed: boolean;
  detail: string;
}

export interface PostRiskCheckResult {
  hasRisk: boolean;
  score: number;
  overallRisk: PostRiskLevel;
  overallLabel: string; // 'Ít rủi ro phát hiện' | 'Cần xem xét' | 'Rủi ro cao'
  issues: PostAuditIssue[];
  passedChecks: string[];
  warnings: string[];
  recommendations: string[];
  isPaidAdsMode?: boolean;
  paidAdsChecklist?: PostPaidAdsCheckItem[];
}

export interface PostProposalDiff {
  originalText: string;
  proposedText: string;
  proposedSections: PostSection[];
  improvementsSummary: string[];
  createdAt: string;
}

export const POST_LAYOUT_TEMPLATES: readonly PostLayoutMeta[] = [
  {
    id: 'highlight',
    name: 'Mẫu 1: Tuyển dụng nổi bật',
    shortName: 'Tuyển dụng nổi bật',
    badge: 'Thu hút chú ý',
    purpose: 'Thu hút sự chú ý ngay từ những dòng đầu tiên trên bảng tin Facebook.',
    description: 'Tiêu đề bắt mắt, thông tin quan trọng xuất hiện sớm, biểu tượng vừa phải, dễ đọc trên điện thoại.',
    wireframeSvg: `<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" class="wireframe-svg">
      <rect width="120" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <rect x="10" y="8" width="100" height="14" rx="4" fill="#EF4444" fill-opacity="0.9"/>
      <rect x="10" y="26" width="70" height="7" rx="3" fill="#3B82F6"/>
      <rect x="10" y="37" width="55" height="6" rx="3" fill="#94A3B8"/>
      <rect x="10" y="47" width="90" height="6" rx="3" fill="#94A3B8"/>
      <rect x="10" y="57" width="100" height="12" rx="4" fill="#10B981" fill-opacity="0.8"/>
      <rect x="10" y="73" width="60" height="8" rx="3" fill="#6366F1"/>
    </svg>`,
    recommendedStyle: 'engaging',
    sectionKeys: [
      'headline',
      'company_location',
      'recruitment_quantity',
      'requirements',
      'salary_benefits',
      'timeline',
      'cta_contact',
    ],
  },
  {
    id: 'clear_info',
    name: 'Mẫu 2: Thông tin đơn hàng rõ ràng',
    shortName: 'Thông tin rõ ràng',
    badge: 'Chi tiết & Chuẩn mực',
    purpose: 'Cung cấp đầy đủ chi tiết cho người lao động, chia nhóm tiêu đề phụ rõ ràng.',
    description: 'Ưu tiên danh sách gạch đầu dòng, không viết thành đoạn dài, không bỏ sót dữ liệu quan trọng.',
    wireframeSvg: `<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" class="wireframe-svg">
      <rect width="120" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <rect x="10" y="8" width="80" height="10" rx="3" fill="#0284C7"/>
      <rect x="10" y="22" width="40" height="6" rx="2" fill="#64748B"/>
      <rect x="14" y="31" width="96" height="5" rx="2" fill="#CBD5E1"/>
      <rect x="14" y="39" width="85" height="5" rx="2" fill="#CBD5E1"/>
      <rect x="10" y="48" width="45" height="6" rx="2" fill="#64748B"/>
      <rect x="14" y="57" width="96" height="5" rx="2" fill="#CBD5E1"/>
      <rect x="14" y="65" width="80" height="5" rx="2" fill="#CBD5E1"/>
      <rect x="10" y="74" width="70" height="8" rx="3" fill="#0284C7" fill-opacity="0.8"/>
    </svg>`,
    recommendedStyle: 'detailed',
    sectionKeys: [
      'headline',
      'company_location',
      'job_work',
      'recruitment_quantity',
      'salary_benefits',
      'timeline',
      'cta_contact',
    ],
  },
  {
    id: 'salary_benefits',
    name: 'Mẫu 3: Tập trung lương & quyền lợi',
    shortName: 'Lương & Quyền lợi',
    badge: 'Minh bạch thu nhập',
    purpose: 'Làm nổi bật mức lương thực tế và các chế độ đãi ngộ, không gây hiểu lầm.',
    description: 'Phân biệt rõ ràng lương cơ bản, thực lĩnh và trợ cấp. Không cam kết thu nhập tuyệt đối.',
    wireframeSvg: `<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" class="wireframe-svg">
      <rect width="120" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <rect x="10" y="8" width="75" height="10" rx="3" fill="#059669"/>
      <rect x="10" y="22" width="60" height="6" rx="2" fill="#94A3B8"/>
      <rect x="10" y="31" width="100" height="24" rx="4" fill="#ECFDF5" stroke="#10B981" stroke-dasharray="2 2"/>
      <rect x="18" y="36" width="84" height="6" rx="2" fill="#059669"/>
      <rect x="18" y="45" width="65" height="5" rx="2" fill="#10B981"/>
      <rect x="10" y="59" width="90" height="6" rx="2" fill="#94A3B8"/>
      <rect x="10" y="68" width="75" height="6" rx="2" fill="#94A3B8"/>
      <rect x="10" y="77" width="55" height="6" rx="2" fill="#059669"/>
    </svg>`,
    recommendedStyle: 'professional',
    sectionKeys: [
      'headline',
      'company_location',
      'salary_benefits',
      'allowances_perks',
      'requirements',
      'timeline',
      'cta_contact',
    ],
  },
  {
    id: 'storytelling',
    name: 'Mẫu 4: Kể chuyện, gần gũi',
    shortName: 'Kể chuyện gần gũi',
    badge: 'Tự nhiên & Chân thành',
    purpose: 'Tạo cảm giác thân thiện, tự nhiên như lời tâm sự, dễ nhận được tương tác.',
    description: 'Ngôn ngữ người thật viết, mở đầu bằng câu hỏi/lời chia sẻ, không giật gân, không tạo áp lực.',
    wireframeSvg: `<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" class="wireframe-svg">
      <rect width="120" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <path d="M12 12C12 9.79086 13.7909 8 16 8H40C42.2091 8 44 9.79086 44 12V20C44 22.2091 42.2091 24 40 24H20L12 28V12Z" fill="#F59E0B" fill-opacity="0.3"/>
      <rect x="10" y="32" width="100" height="6" rx="3" fill="#64748B"/>
      <rect x="10" y="41" width="85" height="6" rx="3" fill="#94A3B8"/>
      <rect x="10" y="50" width="95" height="6" rx="3" fill="#64748B"/>
      <rect x="10" y="59" width="70" height="6" rx="3" fill="#94A3B8"/>
      <rect x="10" y="70" width="80" height="12" rx="4" fill="#F59E0B" fill-opacity="0.8"/>
    </svg>`,
    recommendedStyle: 'friendly',
    sectionKeys: [
      'story_intro',
      'story_opportunity',
      'job_work',
      'requirements',
      'timeline',
      'cta_contact',
    ],
  },
  {
    id: 'concise_shareable',
    name: 'Mẫu 5: Ngắn gọn, dễ chia sẻ',
    shortName: 'Ngắn gọn, dễ chia sẻ',
    badge: 'Tối ưu Mobile & Share',
    purpose: 'Phù hợp chia sẻ vào hội nhóm, Facebook cá nhân kèm Poster tuyển dụng.',
    description: 'Ngắn gọn, dễ quét mắt nhanh, không lặp lại thông tin đã có trên poster, ưu tiên CTA rõ ràng.',
    wireframeSvg: `<svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" class="wireframe-svg">
      <rect width="120" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <rect x="10" y="10" width="100" height="10" rx="3" fill="#8B5CF6"/>
      <rect x="10" y="25" width="80" height="6" rx="2" fill="#64748B"/>
      <rect x="10" y="35" width="65" height="7" rx="2" fill="#10B981"/>
      <rect x="10" y="46" width="90" height="6" rx="2" fill="#64748B"/>
      <rect x="10" y="56" width="60" height="6" rx="2" fill="#64748B"/>
      <rect x="10" y="68" width="100" height="12" rx="4" fill="#8B5CF6" fill-opacity="0.85"/>
    </svg>`,
    recommendedStyle: 'concise',
    sectionKeys: [
      'headline',
      'company_location',
      'salary_benefits',
      'requirements',
      'timeline',
      'cta_contact',
    ],
  },
];

export const POST_WRITING_STYLES: readonly PostWritingStyleMeta[] = [
  {
    id: 'concise',
    name: 'Ngắn gọn',
    shortDesc: 'Súc tích, đi thẳng vào số liệu chính',
    badge: 'Nhanh gọn',
    icon: 'fas fa-bolt',
    tone: 'Trực diện, dứt khoát, dùng các gạch đầu dòng ngắn, lược bỏ từ nối rườm rà.',
  },
  {
    id: 'professional',
    name: 'Chuyên nghiệp',
    shortDesc: 'Chuẩn mực, ngôn phong xí nghiệp tiếp nhận',
    badge: 'Trang trọng',
    icon: 'fas fa-briefcase',
    tone: 'Lịch sự, chuẩn mực tuyển dụng lao động Nhật Bản, minh bạch số liệu hợp pháp.',
  },
  {
    id: 'friendly',
    name: 'Thân thiện',
    shortDesc: 'Ấm áp, gần gũi như người anh/chị tư vấn',
    badge: 'Gần gũi',
    icon: 'fas fa-heart',
    tone: 'Cởi mở, xưng hô gần gũi, thấu hiểu lo lắng của người lao động và gia đình.',
  },
  {
    id: 'engaging',
    name: 'Thu hút',
    shortDesc: 'Truyền cảm hứng, tạo động lực thay đổi tương lai',
    badge: 'Tương tác cao',
    icon: 'fas fa-fire',
    tone: 'Năng động, khơi dậy ước mơ học tập và lập nghiệp tại Nhật Bản với thu nhập vững chắc.',
  },
  {
    id: 'detailed',
    name: 'Chi tiết',
    shortDesc: 'Đầy đủ mọi khoản mục, minh bạch từng tiêu chí',
    badge: 'Đầy đủ 100%',
    icon: 'fas fa-list-check',
    tone: 'Tường minh từng dòng: lương, khấu trừ, điều hòa, ký túc xá, tăng ca, bảo hiểm.',
  },
];

