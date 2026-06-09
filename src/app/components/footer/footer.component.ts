import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class FooterComponent implements OnDestroy {
  @ViewChild('registrationPinField') registrationPinInputRef?: ElementRef<HTMLInputElement>;

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
  isOrderListOpen = false;
  isOrderListFrameLoaded = false;
  isRegistrationGateOpen = false;
  registrationPinInput = '';
  registrationPinMessage = '';
  showBackToTop = false;

  private readonly orderListSheetId = '1GA69_XZgSGQ3n5ZZoPOdA1H43DGYDHkOO47ZI2oBg-8';
  readonly orderListUrl = `https://docs.google.com/spreadsheets/d/${this.orderListSheetId}/edit?usp=drivesdk`;
  readonly orderListEmbedUrl: SafeResourceUrl;
  private readonly registrationPin = '2025';
  private readonly registrationUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSeMVFx5N6YBGfgdNvDV0kRxeb768yTDlke_QVUbcAqLekfPpw/viewform';

  constructor(private sanitizer: DomSanitizer) {
    this.orderListEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://docs.google.com/spreadsheets/d/${this.orderListSheetId}/preview?rm=minimal`,
    );
  }

  quickAccessLinks = [
    {
      label: 'Danh sách đơn hàng',
      url: this.orderListUrl,
      icon: 'fas fa-list-check',
      kind: 'orders',
      requiresPin: false,
    },
    {
      label: 'Đăng ký thông tin',
      url: this.registrationUrl,
      icon: 'fas fa-file-signature',
      kind: 'registration',
      requiresPin: true,
    },
  ];

  get isRegistrationPinValid(): boolean {
    return this.registrationPinInput === this.registrationPin;
  }

  ngOnDestroy(): void {
    this.setPageScrollLocked(false);
  }

  quickLinkTargets: Record<string, string> = {
    'Trang chủ': 'trang-chu',
    'Giới thiệu': 'gioi-thieu',
    'Chương trình': 'chuong-trinh',
    'Quyền lợi': 'chinh-sach',
    'Hoạt động': 'hoat-dong',
    'Liên hệ': 'lien-he',
  };

  toggleQuickAccess(): void {
    this.isQuickAccessOpen = !this.isQuickAccessOpen;
  }

  closeQuickAccess(): void {
    this.isQuickAccessOpen = false;
  }

  openQuickAccessLink(link: (typeof this.quickAccessLinks)[number]): void {
    if (link.kind === 'orders') {
      this.openOrderListViewer();
      return;
    }

    if (link.requiresPin) {
      this.openRegistrationGate();
      return;
    }

    window.open(link.url, '_blank', 'noopener,noreferrer');
    this.closeQuickAccess();
  }

  openOrderListViewer(): void {
    this.closeQuickAccess();
    this.isOrderListFrameLoaded = false;
    this.isOrderListOpen = true;
    this.setPageScrollLocked(true);
  }

  closeOrderListViewer(): void {
    this.isOrderListOpen = false;
    this.isOrderListFrameLoaded = false;
    this.setPageScrollLocked(false);
  }

  onOrderListFrameLoad(): void {
    this.isOrderListFrameLoaded = true;
  }

  openOrderListInGoogle(): void {
    window.open(this.orderListUrl, '_blank', 'noopener,noreferrer');
  }

  openRegistrationGate(): void {
    this.closeQuickAccess();
    this.registrationPinInput = '';
    this.registrationPinMessage = '';
    this.isRegistrationGateOpen = true;
    this.setPageScrollLocked(true);

    setTimeout(() => this.registrationPinInputRef?.nativeElement.focus());
  }

  closeRegistrationGate(): void {
    this.isRegistrationGateOpen = false;
    this.registrationPinInput = '';
    this.registrationPinMessage = '';
    this.setPageScrollLocked(false);
  }

  onRegistrationPinInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.registrationPinInput = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = this.registrationPinInput;

    if (this.registrationPinInput.length < 4) {
      this.registrationPinMessage = '';
    } else if (this.isRegistrationPinValid) {
      this.registrationPinMessage = 'Mã đúng rồi, bạn có thể tiếp tục.';
    } else {
      this.registrationPinMessage = 'Mã chưa đúng, bạn kiểm tra lại nhé.';
    }
  }

  continueToRegistration(): void {
    if (!this.isRegistrationPinValid) {
      return;
    }

    window.open(this.registrationUrl, '_blank', 'noopener,noreferrer');
    this.closeRegistrationGate();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 520;
  }

  @HostListener('document:keydown.escape', [])
  onEscape(): void {
    if (this.isOrderListOpen) {
      this.closeOrderListViewer();
      return;
    }

    if (this.isRegistrationGateOpen) {
      this.closeRegistrationGate();
      return;
    }

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

  private setPageScrollLocked(isLocked: boolean): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isLocked ? 'hidden' : '';
    }
  }
}
