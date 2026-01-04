import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';

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

  // Danh sách menu chính
  mainMenuItems = [
    { label: 'Trang chủ', link: '/', active: true },
    { label: 'Giới thiệu', link: '/gioi-thieu' },
    { label: 'Chương trình', link: '/chuong-trinh', hasDropdown: true },
    { label: 'Quyền lợi', link: '/quyen-loi' },
    { label: 'Liên hệ', link: '/lien-he' },
  ];

  // Danh sách submenu cho Chương trình
  programSubmenu = [
    { label: 'XKLĐ Thực tập sinh', link: '/chuong-trinh/thuc-tap-sinh' },
    { label: 'Kỹ sư', link: '/chuong-trinh/ky-su' },
    { label: 'Du học sinh', link: '/chuong-trinh/du-hoc-sinh' },
    { label: 'So sánh chương trình', link: '/chuong-trinh/so-sanh' },
  ];

  // Thông tin liên hệ nhanh
  contactInfo = {
    hotline: '1900-xxxx',
    email: 'info@fujisan.com.vn',
    zalo: '09xx.xxx.xxx',
  };

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
