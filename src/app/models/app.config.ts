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

// Thông tin công ty
export const APP_COMPANY_INFO = {
  name: 'CÔNG TY HỢP TÁC QUỐC TẾ VieJap',
  shortName: 'VieJap',
  slogan: 'Đưa ước mơ bay xa - Đón tương lai về gần',
  taxCode: 'MST: ...',
  license: 'đang cập nhật',
  address: ' 111/30 Đường Nguyễn Thị Minh Khai , Phường Nguyệt Hóa, Tỉnh Vĩnh Long',
  description: `Công ty Hợp tác quốc tế VieJap được thành lập với sứ mệnh kết nối nguồn nhân lực Việt Nam với thị trường lao động quốc tế, đặc biệt là Nhật Bản, Hàn Quốc và các quốc gia phát triển khác. Chúng tôi tự hào đã và đang đồng hành cùng hàng nghìn lao động Việt trên con đường lập nghiệp, góp phần nâng cao đời sống và mang đến cơ hội phát triển bền vững cho cộng đồng.`,
  commitment: `Chúng tôi tin rằng nguồn nhân lực Việt Nam hoàn toàn có thể vươn ra thế giới, khẳng định giá trị và vị thế trên trường quốc tế. Công ty hợp tác Quốc Tế Fujisan luôn sẵn sàng đồng hành, hỗ trợ tối đa để người lao động hiện thực hóa ước mơ, xây dựng tương lai vững chắc cho bản thân và gia đình.`,
};

// Thông tin liên hệ chính
export const APP_CONTACT_INFO = {
  hotline: '0966966284',
  email: 'viejap@gmail.com',
  zalo: '0966966284',
  facebook: 'http://facebook.com/tranbanhana',
  tiktok: '@fujisan.vn',
  youtube: 'Fujisan Vietnam',
};

// Menu chính
export const APP_MAIN_MENU = [
  { label: 'Trang chủ', link: '/', active: true },
  { label: 'Giới thiệu', link: '/gioi-thieu' },
  { label: 'Chương trình', link: '/chuong-trinh', hasDropdown: true },
  { label: 'Quyền lợi', link: '/quyen-loi' },
  { label: 'Liên hệ', link: '/lien-he' },
];

// Submenu Chương trình
export const APP_PROGRAM_MENU = [
  { label: 'XKLĐ Thực tập sinh', link: '/chuong-trinh/thuc-tap-sinh' },
  { label: 'Kỹ sư', link: '/chuong-trinh/ky-su' },
  { label: 'Du học sinh', link: '/chuong-trinh/du-hoc-sinh' },
  { label: 'So sánh chương trình', link: '/chuong-trinh/so-sanh' },
];

// Menu liên kết nhanh (Footer)
export const APP_QUICK_LINKS = [
  { label: 'Trang chủ', link: '/' },
  { label: 'Giới thiệu', link: '/gioi-thieu' },
  { label: 'Chương trình', link: '/chuong-trinh' },
  { label: 'Quyền lợi', link: '/quyen-loi' },
  { label: 'Liên hệ', link: '/lien-he' },
];

// Links chương trình (Footer)
export const APP_PROGRAM_LINKS = [
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
    url: 'https://facebook.com/fujisan.vn',
    icon: 'fab fa-facebook-f',
    label: 'Facebook',
  },
  tiktok: {
    url: 'https://tiktok.com/@fujisan.vn',
    icon: 'fab fa-tiktok',
    label: 'TikTok',
  },
  youtube: {
    url: 'https://youtube.com/@fujisanvietnam',
    icon: 'fab fa-youtube',
    label: 'YouTube',
  },
  zalo: {
    url: 'https://zalo.me/09xxxxxxxx',
    icon: 'fab fa-comment',
    label: 'Zalo',
  },
};
