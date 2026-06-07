import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  APP_COMPANY_INFO,
  APP_CONTACT_INFO,
  APP_QUICK_LINKS,
  APP_PROGRAM_LINKS,
  APP_SUPPORT_LINKS,
  APP_SOCIAL_MEDIA,
} from '../../models/app.config';

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

  // Thông tin công ty - từ config
  companyInfo = APP_COMPANY_INFO;

  // Thông tin liên hệ - từ config
  contactInfo = APP_CONTACT_INFO;

  // Menu liên kết nhanh - từ config
  quickLinks = APP_QUICK_LINKS;

  // Chương trình - từ config
  programLinks = APP_PROGRAM_LINKS;

  // Hỗ trợ - từ config
  supportLinks = APP_SUPPORT_LINKS;

  // Social media - từ config
  socialMedia = APP_SOCIAL_MEDIA;

  isQuickAccessOpen = false;
  showBackToTop = false;

  quickAccessLinks = [
    {
      label: 'Danh sách đơn hàng',
      url: 'https://docs.google.com/spreadsheets/d/1GA69_XZgSGQ3n5ZZoPOdA1H43DGYDHkOO47ZI2oBg-8/edit?usp=drivesdk',
      icon: 'fas fa-list-check',
    },
    {
      label: 'Đăng ký thông tin',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSeMVFx5N6YBGfgdNvDV0kRxeb768yTDlke_QVUbcAqLekfPpw/viewform',
      icon: 'fas fa-file-signature',
    },
  ];

  quickLinkTargets: Record<string, string> = {
    'Trang chủ': '#trang-chu',
    'Giới thiệu': '#gioi-thieu',
    'Chương trình': '#chuong-trinh',
    'Quyền lợi': '#chinh-sach',
    'Hoạt động': '#hoat-dong',
    'Liên hệ': '#lien-he',
  };

  toggleQuickAccess(): void {
    this.isQuickAccessOpen = !this.isQuickAccessOpen;
  }

  closeQuickAccess(): void {
    this.isQuickAccessOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 520;
  }

  @HostListener('document:keydown.escape', [])
  onEscape(): void {
    this.closeQuickAccess();
  }

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
    window.open(this.contactInfo.zaloUrl, '_blank', 'noopener,noreferrer');
  }

  // Xử lý click mạng xã hội
  onOpenSocialMedia(platform: string): void {
    const social = this.socialMedia[platform as keyof typeof this.socialMedia];

    if (social) {
      window.open(social.url, '_blank', 'noopener,noreferrer');
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
