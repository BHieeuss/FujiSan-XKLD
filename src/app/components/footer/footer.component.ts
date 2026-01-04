import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  // Năm hiện tại
  currentYear = new Date().getFullYear();

  // Thông tin công ty
  companyInfo = {
    name: 'CÔNG TY HỢP TÁC QUỐC TẾ FUJISAN',
    shortName: 'FujiSan',
    taxCode: 'MST: 0123456789',
    license: 'Giấy phép XKLĐ số: XX/SLĐTBXH-GP',
    address: 'Địa chỉ văn phòng chính, Hà Nội, Việt Nam',
  };

  // Thông tin liên hệ
  contactInfo = {
    hotline: '1900-xxxx',
    email: 'info@fujisan.com.vn',
    zalo: '09xx.xxx.xxx',
    facebook: 'facebook.com/fujisan.vn',
    tiktok: '@fujisan.vn',
    youtube: 'Fujisan Vietnam',
  };

  // Menu liên kết nhanh
  quickLinks = [
    { label: 'Trang chủ', link: '/' },
    { label: 'Giới thiệu', link: '/gioi-thieu' },
    { label: 'Chương trình', link: '/chuong-trinh' },
    { label: 'Quyền lợi', link: '/quyen-loi' },
    { label: 'Liên hệ', link: '/lien-he' },
  ];

  // Chương trình
  programLinks = [
    { label: 'XKLĐ Thực tập sinh', link: '/chuong-trinh/thuc-tap-sinh' },
    { label: 'Kỹ sư', link: '/chuong-trinh/ky-su' },
    { label: 'Du học sinh', link: '/chuong-trinh/du-hoc-sinh' },
    { label: 'So sánh chương trình', link: '/chuong-trinh/so-sanh' },
  ];

  // Hỗ trợ
  supportLinks = [
    { label: 'Câu hỏi thường gặp', link: '/faq' },
    { label: 'Chính sách bảo mật', link: '/chinh-sach-bao-mat' },
    { label: 'Điều khoản sử dụng', link: '/dieu-khoan' },
    { label: 'Hướng dẫn đăng ký', link: '/huong-dan' },
  ];

  // Xử lý click hotline
  onCallHotline(): void {
    window.open(`tel:${this.contactInfo.hotline}`, '_self');
  }

  // Xử lý click email
  onSendEmail(): void {
    window.open(`mailto:${this.contactInfo.email}`, '_self');
  }

  // Xử lý click Zalo
  onOpenZalo(): void {
    window.open(`https://zalo.me/${this.contactInfo.zalo.replace(/\D/g, '')}`, '_blank');
  }

  // Xử lý click mạng xã hội
  onOpenSocialMedia(platform: string): void {
    const urls: { [key: string]: string } = {
      facebook: `https://${this.contactInfo.facebook}`,
      tiktok: `https://tiktok.com/${this.contactInfo.tiktok}`,
      youtube: `https://youtube.com/@fujisanvietnam`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  }

  // Cuộn lên đầu trang
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
