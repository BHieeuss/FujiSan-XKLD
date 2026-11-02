/**
 * Định nghĩa kiến trúc Template Engine cho Poster tuyển dụng.
 * Tuân thủ mục XVI và XVII trong yêu cầu hệ thống.
 */

import { JobCategory } from './ai-order-extraction.model';

export type TemplateId =
  // 3 Template chính thức của hệ thống VieJap Poster Engine
  | 'japan_signature'   // Mẫu Tiêu Chuẩn: Chuẩn mực thương hiệu Nhật Bản, uy tín, thanh lịch
  | 'editorial_hiring'  // Mẫu 1: Editorial Hiring — VieJap (cụm 3 ảnh bo lượn bất đối xứng)
  | 'industrial_pro'    // Alias cho Mẫu 1
  | 'japan_engineering' // Mẫu 2: Corporate Premium (dải lương cọ sơn, cụm ảnh bo sóng)
  // Legacy Aliases tương thích ngược
  | 'default_v1'
  | 'automotive_v1'
  | 'clean_trust'
  | 'japan_nature'
  | 'editorial_premium'
  | 'food_v1'
  | 'manufacturing_v1'
  | 'agriculture_v1';

export type TemplateLayoutStyle =
  | 'signature'
  | 'industrial'
  | 'engineering'
  | 'editorial';

export interface PosterThemeColors {
  primaryBrand: string;
  secondaryBrand: string;
  accent: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  cardBackground: string;
  textHeading: string;
  textBody: string;
  badgeBackground: string;
  badgeText: string;
}

export interface PosterTemplateDefinition {
  id: TemplateId;
  name: string;
  category: JobCategory | 'all';
  description: string;
  badge: string;
  layoutStyle: TemplateLayoutStyle;
  icon: string;
  colors: PosterThemeColors;
  recommendedPhotoCount: number;
}

