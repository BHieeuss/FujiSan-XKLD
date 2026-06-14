import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApiError, AdminAuthService } from './admin-auth.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login-page.html',
  styleUrl: './admin-login-page.scss',
})
export class AdminLoginPage implements OnInit {
  username = '';
  password = '';
  showPassword = false;
  submitting = false;
  checkingSession = true;
  errorMessage = '';

  constructor(
    private readonly auth: AdminAuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    if (await this.auth.checkSession()) {
      await this.router.navigateByUrl(this.safeReturnUrl());
      return;
    }
    this.checkingSession = false;
  }

  async submit(): Promise<void> {
    if (this.submitting) {
      return;
    }

    this.errorMessage = '';
    this.submitting = true;
    try {
      await this.auth.login(this.username.trim(), this.password);
      this.password = '';
      await this.router.navigateByUrl(this.safeReturnUrl());
    } catch (error) {
      if (error instanceof AdminApiError && error.retryAfter > 0) {
        const minutes = Math.max(1, Math.ceil(error.retryAfter / 60));
        this.errorMessage = `${error.message} Vui lòng thử lại sau khoảng ${minutes} phút.`;
      } else {
        this.errorMessage =
          error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.';
      }
    } finally {
      this.submitting = false;
    }
  }

  private safeReturnUrl(): string {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
    return requested.startsWith('/quan-tri-viejap') ? requested : '/quan-tri-viejap';
  }
}
