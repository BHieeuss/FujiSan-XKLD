/**
 * ============================================================
 * ỨNG DỤNG CONFIG TẬP TRUNG
 * ============================================================
 * File này chứa tất cả các thông tin cấu hình chung của ứng dụng
 * Khi sửa file này, tất cả các trang sẽ tự động cập nhật
 *
 * Các thành phần:
 * - Thông tin công ty
 * - Thông tin liên hệ
 * - Social media links
 * - Menu items
 * - Links liên kết
 */

export type AppDropdownKey = 'programs' | 'learning';

export interface AppMainMenuItem {
  label: string;
  link: string;
  active?: boolean;
  hasDropdown?: boolean;
  dropdownKey?: AppDropdownKey;
}

export interface AppSubmenuItem {
  id?: string;
  label: string;
  link: string;
  icon?: string;
  jpBadge?: string;
  children?: AppSubmenuItem[];
}

// Thông tin công ty
export const APP_COMPANY_INFO = {
  name: 'CÔNG TY TNHH VIEJAP',
  shortName: 'VieJap',
  slogan: 'Đưa ước mơ bay xa - Đón tương lai về gần',
  taxCode: 'MST/MSDN: 2100717764',
  license: 'ĐKKD lần đầu ngày 07/07/2026',
  address: '111/30 Đường Nguyễn Thị Minh Khai, Phường Nguyệt Hóa, Tỉnh Vĩnh Long',
  description: `Công ty TNHH VieJap được thành lập với sứ mệnh kết nối nguồn nhân lực Việt Nam với các cơ hội học tập, làm việc và trải nghiệm quốc tế, đặc biệt là Nhật Bản. VieJap ưu tiên tư vấn rõ ràng, đồng hành theo từng hồ sơ và khuyến khích người học chủ động đối chiếu thông tin trước khi quyết định.`,
  commitment: `VieJap tin rằng mỗi người cần được tiếp cận thông tin minh bạch, có căn cứ và phù hợp với hoàn cảnh của mình. Chúng tôi sẵn sàng đồng hành, hỗ trợ kiểm tra điều kiện và hướng dẫn chuẩn bị hồ sơ theo đúng quy định liên quan.`,
};

// Thông tin liên hệ chính
export const APP_CONTACT_INFO = {
  hotline: '0966966284',
  email: 'viejaptravinh@gmail.com',
  zalo: '0966966284',
  zaloUrl: 'https://zalo.me/0966966284',
  consultationUrl: 'https://zalo.me/0966966284',
  facebook: 'https://facebook.com/tranbanhana',
  tiktok: 'https://tiktok.com/@fujisan.vn',
  youtube: 'https://youtube.com/@fujisanvietnam',
};

export const APP_ORDER_LIST = {
  sheetId: '1GA69_XZgSGQ3n5ZZoPOdA1H43DGYDHkOO47ZI2oBg-8',
  updatedLabel: 'Cập nhật trực tiếp từ Google Sheet',
};

// Menu chính
export const APP_MAIN_MENU: AppMainMenuItem[] = [
  { label: 'Trang chủ', link: '/', active: true },
  { label: 'Đơn hàng', link: '/don-hang' },
  {
    label: 'Chương trình',
    link: '/chuong-trinh',
    hasDropdown: true,
    dropdownKey: 'programs',
  },
  {
    label: 'Bài học',
    link: '/hoc-hiragana',
    hasDropdown: true,
    dropdownKey: 'learning',
  },
  { label: 'Góc hoạt động', link: '/hoat-dong' },
  { label: 'Liên hệ', link: '/lien-he' },
];

// Submenu Chương trình
export const APP_PROGRAM_MENU: AppSubmenuItem[] = [
  { label: 'XKLĐ Thực tập sinh', link: '/chuong-trinh/thuc-tap-sinh' },
  { label: 'Kỹ sư', link: '/chuong-trinh/ky-su' },
  { label: 'Du học sinh', link: '/chuong-trinh/du-hoc-sinh' },
  { label: 'So sánh chương trình', link: '/chuong-trinh/so-sanh' },
];

// Bài học - thêm bài mới vào danh sách này khi cần mở rộng
export const APP_LEARNING_MENU: AppSubmenuItem[] = [
  {
    id: 'co-ban',
    label: 'Cơ bản',
    link: '/hoc-hiragana',
    jpBadge: 'あ',
    children: [
      {
        label: 'Hiragana (Chữ mềm)',
        link: '/hoc-hiragana',
        jpBadge: 'あ',
      },
      {
        label: 'Katakana (Chữ cứng)',
        link: '/hoc-katakana',
        jpBadge: 'ア',
      },
      {
        label: 'Số đếm',
        link: '/hoc-so-dem',
        jpBadge: '123',
      },
    ],
  },
  {
    id: 'kanji',
    label: 'Kanji ( Hán Tự )',
    link: '/hoc-kanji',
    jpBadge: '漢',
  },
  {
    id: 'minna-n5',
    label: 'Minna no Nihongo N5',
    link: '/hoc-minna-bai-1',
    icon: 'fas fa-graduation-cap',
    children: [
      {
        label: 'Bài 1 · はじめまして',
        link: '/hoc-minna-bai-1',
        icon: 'fas fa-star',
      },
    ],
  },
  {
    id: 'luyen-tap',
    label: 'Luyện chia thể',
    link: '/luyen-tap',
    jpBadge: '活',
  },
];

// ============================================================
// FOOTER DYNAMIC SYNC CONFIGURATION
// ============================================================
export interface FooterLinkItem {
  label: string;
  path: string;
  fragment?: string;
  externalUrl?: string;
  icon?: string;
  badge?: string;
  badgeClass?: string;
  isExternal?: boolean;
  isPublic?: boolean;
  showInFooter?: boolean;
  order: number;
}

export interface FooterLinkGroup {
  key: string;
  title: string;
  icon: string;
  description?: string;
  links: FooterLinkItem[];
}

export const APP_FOOTER_CONFIG: {
  workingHours: string;
  tagline: string;
  commitment: string;
  groups: {
    explore: FooterLinkGroup;
    programsAndTools: FooterLinkGroup;
    supportAndLegal: FooterLinkGroup;
  };
} = {
  workingHours: 'Thứ 2 - Thứ 7: 08:00 - 17:30',
  tagline: 'Kết nối nguồn nhân lực Việt Nam với cơ hội việc làm & đào tạo chuẩn Nhật Bản.',
  commitment: 'Tư vấn minh bạch · Đào tạo tận tâm · Đồng hành dài lâu',
  groups: {
    explore: {
      key: 'explore',
      title: 'Khám phá website',
      icon: 'fas fa-compass',
      links: [
        { label: 'Trang chủ', path: '/', icon: 'fas fa-house', order: 1, isPublic: true, showInFooter: true },
        { label: 'Đơn hàng Nhật Bản', path: '/don-hang', icon: 'fas fa-briefcase', badge: 'MỚI', badgeClass: 'badge-amber', order: 2, isPublic: true, showInFooter: true },
        { label: 'Giới thiệu VieJap', path: '/', fragment: 'gioi-thieu', icon: 'fas fa-award', order: 3, isPublic: true, showInFooter: true },
        { label: 'Chương trình tuyển dụng', path: '/', fragment: 'chuong-trinh', icon: 'fas fa-layer-group', order: 4, isPublic: true, showInFooter: true },
        { label: 'Chính sách & Quyền lợi', path: '/', fragment: 'chinh-sach', icon: 'fas fa-shield-heart', order: 5, isPublic: true, showInFooter: true },
        { label: 'Hoạt động & Sự kiện', path: '/hoat-dong', icon: 'fas fa-newspaper', order: 6, isPublic: true, showInFooter: true },
        { label: 'Liên hệ tư vấn', path: '/', fragment: 'lien-he', icon: 'fas fa-headset', order: 7, isPublic: true, showInFooter: true },
      ],
    },
    programsAndTools: {
      key: 'programs_tools',
      title: 'Tiện ích & Học tiếng Nhật',
      icon: 'fas fa-graduation-cap',
      links: [
        { label: 'Đăng ký thông tin', path: '/form-hoc-vien', icon: 'fas fa-file-signature', badge: 'MÃ KHÓA', badgeClass: 'badge-amber', order: 1, isPublic: true, showInFooter: true },
        { label: 'Luyện chia 12 thể động từ', path: '/luyen-tap', icon: 'fas fa-bolt', badge: 'TOKYO TTS', badgeClass: 'badge-rose', order: 2, isPublic: true, showInFooter: true },
        { label: 'Bảng chữ cái Hiragana', path: '/hoc-hiragana', icon: 'fas fa-font', order: 3, isPublic: true, showInFooter: true },
        { label: 'Bảng chữ cái Katakana', path: '/hoc-katakana', icon: 'fas fa-spell-check', order: 4, isPublic: true, showInFooter: true },
        { label: 'Bài học Số đếm tiếng Nhật', path: '/hoc-so-dem', icon: 'fas fa-arrow-down-1-9', order: 5, isPublic: true, showInFooter: true },
        { label: 'Tra cứu Kanji & Hán tự N5', path: '/hoc-kanji', icon: 'fas fa-square-pen', order: 6, isPublic: true, showInFooter: true },
        { label: 'Minna no Nihongo Bài 1', path: '/hoc-minna-bai-1', icon: 'fas fa-book-open', order: 7, isPublic: true, showInFooter: true },
      ],
    },
    supportAndLegal: {
      key: 'support_legal',
      title: 'Hỗ trợ & Pháp lý',
      icon: 'fas fa-scale-balanced',
      links: [
        { label: 'Câu hỏi thường gặp (FAQ)', path: '/faq', icon: 'fas fa-circle-question', order: 1, isPublic: true, showInFooter: true },
        { label: 'Chính sách bảo mật', path: '/chinh-sach-bao-mat', icon: 'fas fa-lock', order: 2, isPublic: true, showInFooter: true },
        { label: 'Điều khoản sử dụng', path: '/dieu-khoan', icon: 'fas fa-file-contract', order: 3, isPublic: true, showInFooter: true },
        { label: 'Hướng dẫn quy trình đăng ký', path: '/huong-dan', icon: 'fas fa-clipboard-check', order: 4, isPublic: true, showInFooter: true },
      ],
    },
  },
};

// Menu liên kết nhanh (Footer - backwards compatibility)
export const APP_QUICK_LINKS = APP_FOOTER_CONFIG.groups.explore.links.map((l: FooterLinkItem) => ({
  label: l.label,
  link: l.path,
  fragment: l.fragment,
}));

// Links chương trình (Footer - backwards compatibility)
export const APP_PROGRAM_LINKS = APP_FOOTER_CONFIG.groups.programsAndTools.links.map((l: FooterLinkItem) => ({
  label: l.label,
  link: l.path,
  fragment: l.fragment,
}));

// Links hỗ trợ (Footer - backwards compatibility)
export const APP_SUPPORT_LINKS = APP_FOOTER_CONFIG.groups.supportAndLegal.links.map((l: FooterLinkItem) => ({
  label: l.label,
  link: l.path,
}));

// Social media URLs
export const APP_SOCIAL_MEDIA = {
  facebook: {
    url: APP_CONTACT_INFO.facebook,
    icon: 'fab fa-facebook-f',
    label: 'Facebook',
  },
  tiktok: {
    url: APP_CONTACT_INFO.tiktok,
    icon: 'fab fa-tiktok',
    label: 'TikTok',
  },
  youtube: {
    url: APP_CONTACT_INFO.youtube,
    icon: 'fab fa-youtube',
    label: 'YouTube',
  },
  zalo: {
    url: APP_CONTACT_INFO.zaloUrl,
    icon: 'fas fa-comment-dots',
    label: 'Zalo',
  },
};
