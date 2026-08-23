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
  { label: 'Liên hệ', link: '/lien-he' },
];

// Submenu Chương trình
export const APP_PROGRAM_MENU: AppSubmenuItem[] = [
  { label: 'Khai form học viên', link: '/form-hoc-vien', icon: 'fas fa-file-signature' },
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
    label: 'Luyện tập',
    link: '/luyen-the-te',
    icon: 'fas fa-dumbbell',
    children: [
      {
        label: 'Chia động từ — Thể て',
        link: '/luyen-the-te',
        jpBadge: 'て',
      },
    ],
  },
];

// Menu liên kết nhanh (Footer)
export const APP_QUICK_LINKS = [
  { label: 'Trang chủ', link: '/' },
  { label: 'Đơn hàng', link: '/don-hang' },
  { label: 'Giới thiệu', link: '/gioi-thieu' },
  { label: 'Chương trình', link: '/chuong-trinh' },
  { label: 'Quyền lợi', link: '/quyen-loi' },
  { label: 'Hoạt động', link: '/hoat-dong' },
  { label: 'Liên hệ', link: '/lien-he' },
];

// Links chương trình (Footer)
export const APP_PROGRAM_LINKS = [
  { label: 'Khai form học viên', link: '/form-hoc-vien' },
  { label: 'XKLĐ Thực tập sinh', link: '/chuong-trinh/thuc-tap-sinh' },
  { label: 'Kỹ sư', link: '/chuong-trinh/ky-su' },
  { label: 'Du học sinh', link: '/chuong-trinh/du-hoc-sinh' },
  { label: 'So sánh chương trình', link: '/chuong-trinh/so-sanh' },
];

// Links hỗ trợ (Footer)
export const APP_SUPPORT_LINKS = [
  { label: 'Câu hỏi thường gặp', link: '/faq' },
  { label: 'Chính sách bảo mật', link: '/chinh-sach-bao-mat' },
  { label: 'Điều khoản sử dụng', link: '/dieu-khoan' },
  { label: 'Hướng dẫn đăng ký', link: '/huong-dan' },
];

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
    icon: 'fab fa-comment',
    label: 'Zalo',
  },
};
