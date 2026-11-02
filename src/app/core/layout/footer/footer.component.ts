import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  APP_COMPANY_INFO,
  APP_CONTACT_INFO,
  APP_FOOTER_CONFIG,
  APP_QUICK_LINKS,
  APP_PROGRAM_LINKS,
  APP_SUPPORT_LINKS,
  APP_SOCIAL_MEDIA,
  APP_ORDER_LIST,
  FooterLinkItem,
} from '../../config/app.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnDestroy {
  @ViewChild('registrationPinField') registrationPinInputRef?: ElementRef<HTMLInputElement>;

  // Năm hiện tại tự động
  readonly currentYear = new Date().getFullYear();

  // Thông tin cấu hình chung
  readonly companyInfo = APP_COMPANY_INFO;
  readonly contactInfo = APP_CONTACT_INFO;
  readonly footerConfig = APP_FOOTER_CONFIG;
  readonly socialMedia = APP_SOCIAL_MEDIA;

  // Accordion Mobile State (null = all collapsed, or group key = expanded)
  expandedAccordion: string | null = null;

  // Định dạng số điện thoại tự nhiên (0966 966 284)
  formatPhone(phone: string): string {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
    }
    return phone;
  }

  // Tự động đồng bộ các nhóm liên kết hợp lệ
  get exploreLinks(): FooterLinkItem[] {
    return this.footerConfig.groups.explore.links
      .filter((l) => l.isPublic !== false && l.showInFooter !== false)
      .sort((a, b) => a.order - b.order);
  }

  get programAndToolLinks(): FooterLinkItem[] {
    return this.footerConfig.groups.programsAndTools.links
      .filter((l) => l.isPublic !== false && l.showInFooter !== false)
      .sort((a, b) => a.order - b.order);
  }

  get legalLinks(): FooterLinkItem[] {
    return this.footerConfig.groups.supportAndLegal.links
      .filter((l) => l.isPublic !== false && l.showInFooter !== false)
      .sort((a, b) => a.order - b.order);
  }

  // Danh sách mạng xã hội có URL hợp lệ
  get validSocialMediaList(): { key: string; url: string; icon: string; label: string }[] {
    const list: { key: string; url: string; icon: string; label: string }[] = [];
    if (this.contactInfo.facebook) {
      list.push({ key: 'facebook', url: this.contactInfo.facebook, icon: 'fab fa-facebook-f', label: 'Facebook' });
    }
    if (this.contactInfo.tiktok) {
      list.push({ key: 'tiktok', url: this.contactInfo.tiktok, icon: 'fab fa-tiktok', label: 'TikTok' });
    }
    if (this.contactInfo.youtube) {
      list.push({ key: 'youtube', url: this.contactInfo.youtube, icon: 'fab fa-youtube', label: 'YouTube' });
    }
    if (this.contactInfo.zaloUrl) {
      list.push({ key: 'zalo', url: this.contactInfo.zaloUrl, icon: 'fas fa-comment-dots', label: 'Zalo Chat' });
    }
    return list;
  }

  toggleAccordion(key: string): void {
    this.expandedAccordion = this.expandedAccordion === key ? null : key;
  }

  isAccordionOpen(key: string): boolean {
    return this.expandedAccordion === key;
  }

  // Backwards compatibility
  quickLinks = APP_QUICK_LINKS;
  programLinks = APP_PROGRAM_LINKS;
  supportLinks = APP_SUPPORT_LINKS;

  isQuickAccessOpen = false;
  isOrderListOpen = false;
  isOrderListFrameLoaded = false;
  isRegistrationGateOpen = false;
  registrationPinInput = '';
  registrationPinMessage = '';
  showBackToTop = false;

  private readonly orderListSheetId = APP_ORDER_LIST.sheetId;
  readonly orderListUrl = `https://docs.google.com/spreadsheets/d/${this.orderListSheetId}/edit?usp=drivesdk`;
  readonly orderListEmbedUrl: SafeResourceUrl;
  private readonly registrationPin = '2025';
  private readonly registrationUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSeMVFx5N6YBGfgdNvDV0kRxeb768yTDlke_QVUbcAqLekfPpw/viewform';

  constructor(
    private sanitizer: DomSanitizer,
    private readonly router: Router,
  ) {
    this.orderListEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://docs.google.com/spreadsheets/d/${this.orderListSheetId}/preview?rm=minimal`,
    );
  }

  quickAccessLinks = [
    {
      label: 'Danh sách đơn hàng',
      url: '/don-hang',
      icon: 'fas fa-list-check',
      kind: 'orders',
      requiresPin: false,
    },
    {
      label: 'Khai form học viên',
      url: '/form-hoc-vien',
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
      this.closeQuickAccess();
      void this.router.navigate(['/don-hang']);
      return;
    }

    if (link.kind === 'registration') {
      this.closeQuickAccess();
      void this.router.navigate(['/form-hoc-vien']);
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
