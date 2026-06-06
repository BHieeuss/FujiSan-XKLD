import { Component } from '@angular/core';
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
