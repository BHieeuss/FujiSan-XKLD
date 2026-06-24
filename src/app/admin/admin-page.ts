import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PosterMakerPage } from '../pages/poster-maker/poster-maker-page';
import { JobOrdersAdmin } from './job-orders-admin';
import { AdminApiError, AdminAuthService } from './admin-auth.service';

type AdminSection = 'poster' | 'orders' | 'security';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [FormsModule, PosterMakerPage, JobOrdersAdmin],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage {
  activeSection: AdminSection = 'poster';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showPasswords = false;
  changingPassword = false;
  loggingOut = false;
  securityError = '';
  securityMessage = '';

  constructor(
    readonly auth: AdminAuthService,
    private readonly router: Router,
  ) {}

  selectSection(section: AdminSection): void {
    this.activeSection = section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async logout(): Promise<void> {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    await this.auth.logout();
    await this.router.navigate(['/dang-nhap-quan-tri']);
  }

  async changePassword(): Promise<void> {
    this.securityError = '';
    this.securityMessage = '';

    if (this.newPassword !== this.confirmPassword) {
      this.securityError = 'Mật khẩu nhập lại chưa khớp.';
      return;
    }

    this.changingPassword = true;
    try {
      await this.auth.changePassword(this.currentPassword, this.newPassword);
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.securityMessage = 'Đã đổi mật khẩu và làm mới phiên đăng nhập.';
    } catch (error) {
      this.securityError =
        error instanceof AdminApiError
          ? error.message
          : 'Không thể đổi mật khẩu. Vui lòng thử lại.';
    } finally {
      this.changingPassword = false;
    }
  }
}
