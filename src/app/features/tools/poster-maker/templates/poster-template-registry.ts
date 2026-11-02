import { JobCategory } from '../models/ai-order-extraction.model';
import { PosterTemplateDefinition, TemplateId } from '../models/poster-template.model';

export const POSTER_TEMPLATES: PosterTemplateDefinition[] = [
  // ─── TEMPLATE 01: MẪU TIÊU CHUẨN ──────────────────────────────────────
  {
    id: 'japan_signature',
    name: 'Mẫu Tiêu Chuẩn',
    category: 'all',
    description: 'Phong cách tiêu chuẩn thương hiệu VieJap, bố cục trang nhã, thanh lịch.',
    badge: 'Tiêu chuẩn Nhật',
    layoutStyle: 'signature',
    icon: 'fa-solid fa-torii-gate',
    recommendedPhotoCount: 2,
    colors: {
      primaryBrand: '#103B63',
      secondaryBrand: '#082B49',
      accent: '#0B5F9E',
      backgroundGradientStart: '#FBFDFF',
      backgroundGradientEnd: '#EAF3FA',
      cardBackground: 'rgba(255, 255, 255, 0.94)',
      textHeading: '#103B63',
      textBody: '#12283E',
      badgeBackground: '#EAF3FA',
      badgeText: '#0B5F9E',
    },
  },

  // ─── TEMPLATE 02: EDITORIAL HIRING — VIEJAP (CỤM 3 ẢNH BO LƯỢN NGHỆ THUẬT) ───
  {
    id: 'industrial_pro',
    name: 'Mẫu 1',
    category: 'manufacturing',
    description: 'Phong cách Editorial Hiring — VieJap, cụm 3 ảnh nghệ thuật bo lượn, bố cục báo chí hiện đại.',
    badge: 'Cơ khí & Điện tử',
    layoutStyle: 'editorial',
    icon: 'fa-solid fa-newspaper',
    recommendedPhotoCount: 3,
    colors: {
      primaryBrand: '#103B63',
      secondaryBrand: '#082B49',
      accent: '#0B5F9E',
      backgroundGradientStart: '#FBFDFF',
      backgroundGradientEnd: '#EAF3FA',
      cardBackground: 'rgba(255, 255, 255, 0.94)',
      textHeading: '#103B63',
      textBody: '#12283E',
      badgeBackground: '#EAF3FA',
      badgeText: '#0B5F9E',
    },
  },

  // ─── TEMPLATE 03: MẪU 2 (CORPORATE PREMIUM) ───────────────────────────
  {
    id: 'japan_engineering',
    name: 'Mẫu 2',
    category: 'all',
    description: 'Phong cách Corporate Premium — VieJap, tiêu đề lớn tia sáng, ảnh chính & môi trường, dải lương cọ sơn xanh navy.',
    badge: 'Corporate Premium',
    layoutStyle: 'engineering',
    icon: 'fa-solid fa-building',
    recommendedPhotoCount: 2,
    colors: {
      primaryBrand: '#103B63',
      secondaryBrand: '#082B49',
      accent: '#0B5F9E',
      backgroundGradientStart: '#FBFDFF',
      backgroundGradientEnd: '#EAF3FA',
      cardBackground: 'rgba(255, 255, 255, 0.94)',
      textHeading: '#103B63',
      textBody: '#12283E',
      badgeBackground: '#EAF3FA',
      badgeText: '#0B5F9E',
    },
  },
];

/**
 * Tự động chọn template tối ưu dựa trên phân loại ngành nghề
 */
export function selectOptimalTemplate(
  category: JobCategory,
  jobTitle?: string,
): PosterTemplateDefinition {
  const titleLower = (jobTitle || '').toLowerCase();

  // 1. Điện tử và cơ khí, ô tô, chế tạo máy -> Mẫu 1 (industrial_pro)
  if (
    category === 'automotive' ||
    category === 'manufacturing' ||
    category === 'electronics' ||
    titleLower.includes('ô tô') ||
    titleLower.includes('auto') ||
    titleLower.includes('điện tử') ||
    titleLower.includes('cơ khí') ||
    titleLower.includes('cnc') ||
    titleLower.includes('lắp ráp') ||
    titleLower.includes('hàn')
  ) {
    return POSTER_TEMPLATES.find((t) => t.id === 'industrial_pro') || POSTER_TEMPLATES[1];
  }

  // 2. Xây dựng & Kỹ sư -> Mẫu 2 (japan_engineering)
  if (
    category === 'construction' ||
    titleLower.includes('xây dựng') ||
    titleLower.includes('cốp pha') ||
    titleLower.includes('giàn giáo') ||
    titleLower.includes('kỹ sư') ||
    titleLower.includes('công trình') ||
    titleLower.includes('bảo trì') ||
    titleLower.includes('lắp đặt')
  ) {
    return POSTER_TEMPLATES.find((t) => t.id === 'japan_engineering') || POSTER_TEMPLATES[2];
  }

  // 3. Mặc định trả về Mẫu Tiêu Chuẩn (japan_signature)
  return POSTER_TEMPLATES[0];
}

/**
 * Lấy template theo ID, hỗ trợ cả 3 ID chính thức lẫn các mã alias tương thích ngược
 */
export function getTemplateById(id: TemplateId | string): PosterTemplateDefinition {
  // Mapping tương thích ngược các alias cũ và các mẫu đã xóa
  if (id === 'default_v1') id = 'japan_signature';
  if (id === 'editorial_hiring' || id === 'automotive_v1' || id === 'manufacturing_v1') id = 'industrial_pro';
  if (
    id === 'clean_trust' ||
    id === 'japan_nature' ||
    id === 'editorial_premium' ||
    id === 'food_v1' ||
    id === 'agriculture_v1'
  ) {
    id = 'japan_signature';
  }

  return POSTER_TEMPLATES.find((t) => t.id === id) || POSTER_TEMPLATES[0];
}

