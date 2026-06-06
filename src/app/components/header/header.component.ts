import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { APP_CONTACT_INFO, APP_MAIN_MENU, APP_PROGRAM_MENU } from '../../models/app.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  // Trạng thái menu mobile
  isMobileMenuOpen = false;

  // Trạng thái cuộn trang
  isScrolled = false;

  // Trạng thái có phải trang chủ (có hero section)
  isHomePage = false;

  // Danh sách menu chính - từ config
  mainMenuItems = APP_MAIN_MENU;

  // Danh sách submenu cho Chương trình - từ config
  programSubmenu = APP_PROGRAM_MENU;

  // Thông tin liên hệ nhanh - từ config
  contactInfo = APP_CONTACT_INFO;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Theo dõi thay đổi route để xác định trang hiện tại
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.url === '/' || event.url === '';
      }
    });

    // Khởi tạo trạng thái ban đầu
    this.isHomePage = this.router.url === '/' || this.router.url === '';
  }

  // Theo dõi sự kiện cuộn trang
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollTop > 50; // Thay đổi trạng thái khi cuộn quá 50px
  }

  // Chuyển đổi trạng thái menu mobile
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Đóng menu mobile
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Xử lý click vào menu item
  onMenuClick(item: any): void {
    // Đánh dấu menu active
    this.mainMenuItems.forEach((menu) => (menu.active = false));
    item.active = true;

    // Đóng mobile menu
    this.closeMobileMenu();
  }

  // Xử lý click nút đăng ký tư vấn
  onRegisterConsultation(): void {
    // TODO: Implement đăng ký tư vấn
    console.log('Đăng ký tư vấn được click');
  }

  // Xử lý click hotline
  onCallHotline(): void {
    window.open(`tel:${this.contactInfo.hotline}`, '_self');
  }
}
