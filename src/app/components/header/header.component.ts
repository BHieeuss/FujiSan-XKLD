import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import {
  APP_CONTACT_INFO,
  APP_LEARNING_MENU,
  APP_MAIN_MENU,
  APP_PROGRAM_MENU,
} from '../../models/app.config';
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
  openDropdownKey?: string;
  isScrolled = false;
  isHomePage = false;

  mainMenuItems = APP_MAIN_MENU.map((item) => ({ ...item }));
  dropdownMenus = {
    programs: APP_PROGRAM_MENU,
    learning: APP_LEARNING_MENU,
  };
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
        this.updateRouteState(event.urlAfterRedirects);
        this.closeMobileMenu();
      }
    });

    this.updateRouteState(this.router.url);
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
    this.openDropdownKey = undefined;
    this.setPageScrollLocked(false);
  }

  toggleDropdown(event: Event, dropdownKey?: string): void {
    event.preventDefault();
    if (!dropdownKey) {
      return;
    }
    this.openDropdownKey =
      this.openDropdownKey === dropdownKey ? undefined : dropdownKey;
  }

  onMenuClick(event: Event, item: any): void {
    event.preventDefault();
    this.closeMobileMenu();

    if (item.link.startsWith('/hoc-')) {
      void this.router.navigate([item.link]);
      return;
    }

    const sectionId = this.menuSectionMap[item.label] ?? 'trang-chu';
    void this.router.navigate(['/'], { fragment: sectionId }).then(() => {
      this.scrollToSection(sectionId);
    });
  }

  onSubmenuClick(event: Event, link: string): void {
    event.preventDefault();
    this.closeMobileMenu();

    if (link.startsWith('/hoc-')) {
      void this.router.navigate([link]);
      return;
    }

    void this.router.navigate(['/'], { fragment: 'chuong-trinh' }).then(() => {
      this.scrollToSection('chuong-trinh');
    });
  }

  isDropdownOpen(dropdownKey?: string): boolean {
    return !!dropdownKey && this.openDropdownKey === dropdownKey;
  }

  submenuFor(dropdownKey?: string) {
    if (!dropdownKey) {
      return [];
    }
    return this.dropdownMenus[dropdownKey as keyof typeof this.dropdownMenus] ?? [];
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

  private updateRouteState(url: string): void {
    const path = url.split('#')[0].split('?')[0];
    this.isHomePage = path === '/' || path === '';

    this.mainMenuItems.forEach((item) => {
      item.active =
        item.dropdownKey === 'learning'
          ? path.startsWith('/hoc-')
          : false;
    });

    if (this.isHomePage) {
      const fragment = url.includes('#') ? url.split('#')[1] : 'trang-chu';
      const activeLabel =
        Object.entries(this.menuSectionMap).find(([, section]) => section === fragment)?.[0] ??
        'Trang chủ';
      const activeItem = this.mainMenuItems.find((item) => item.label === activeLabel);
      if (activeItem) {
        activeItem.active = true;
      }
    }
  }
}
