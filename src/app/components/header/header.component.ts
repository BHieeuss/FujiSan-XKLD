import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { APP_CONTACT_INFO, APP_MAIN_MENU, APP_PROGRAM_MENU } from '../../models/app.config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isProgramMenuOpen = false;
  isScrolled = false;
  isHomePage = false;

  mainMenuItems = APP_MAIN_MENU.map((item) => ({ ...item }));
  programSubmenu = APP_PROGRAM_MENU;
  contactInfo = APP_CONTACT_INFO;
  menuSectionMap: Record<string, string> = {
    'Trang chủ': 'trang-chu',
    'Giới thiệu': 'gioi-thieu',
    'Chương trình': 'chuong-trinh',
    'Quyền lợi': 'chinh-sach',
    'Hoạt động': 'hoat-dong',
    'Liên hệ': 'lien-he',
  };

  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.url === '/' || event.url === '';
        this.closeMobileMenu();
      }
    });

    this.isHomePage = this.router.url === '/' || this.router.url === '';
    this.onWindowScroll();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.setPageScrollLocked(false);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollTop > 40;
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    if (window.innerWidth >= 992 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape', [])
  onEscape(): void {
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.setPageScrollLocked(this.isMobileMenuOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.isProgramMenuOpen = false;
    this.setPageScrollLocked(false);
  }

  toggleProgramMenu(event: Event): void {
    event.preventDefault();
    this.isProgramMenuOpen = !this.isProgramMenuOpen;
  }

  onMenuClick(event: Event, item: any): void {
    event.preventDefault();
    this.mainMenuItems.forEach((menu) => (menu.active = false));
    item.active = true;
    const sectionId = this.menuSectionMap[item.label];
    this.closeMobileMenu();
    this.scrollToSection(sectionId);
  }

  onProgramMenuClick(event: Event): void {
    event.preventDefault();
    this.closeMobileMenu();
    this.scrollToSection('chuong-trinh');
  }

  onRegisterConsultation(): void {
    this.closeMobileMenu();
    window.open(this.contactInfo.consultationUrl, '_blank', 'noopener,noreferrer');
  }

  onCallHotline(): void {
    window.open(`tel:${this.contactInfo.hotline}`, '_self');
  }

  private setPageScrollLocked(isLocked: boolean): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isLocked ? 'hidden' : '';
    }
  }

  private scrollToSection(sectionId?: string): void {
    requestAnimationFrame(() => {
      document.getElementById(sectionId ?? 'trang-chu')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
}
