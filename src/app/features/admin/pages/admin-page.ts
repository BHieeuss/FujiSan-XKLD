import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PosterMakerPage } from '../../tools/poster-maker/poster-maker-page';
import { JobOrdersAdmin } from '../components/job-orders-admin';
import { UsersAdminComponent } from '../components/users-admin/users-admin';
import { RegistrationCodesAdminComponent } from '../components/registration-codes-admin/registration-codes-admin';
import { StudentProfilesAdminComponent } from '../components/student-profiles-admin/student-profiles-admin.component';
import { OperationsCenterComponent } from '../components/operations-center/operations-center.component';
import { OperationsCenterService } from '../components/operations-center/operations-center.service';
import { ActivitiesAdminComponent } from '../components/activities-admin/activities-admin.component';
import { EventsAdminComponent } from '../components/events-admin/events-admin.component';
import { AdminApiError, AdminAuthService } from '../services/admin-auth.service';
import { AdminToastService } from '../services/admin-toast.service';
import { ScrollNavigationService } from '../../../core/services/scroll-navigation.service';

type AdminSection = 'operations' | 'students' | 'users' | 'codes' | 'orders' | 'poster' | 'activities' | 'events' | 'security';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PosterMakerPage,
    JobOrdersAdmin,
    UsersAdminComponent,
    RegistrationCodesAdminComponent,
    StudentProfilesAdminComponent,
    OperationsCenterComponent,
    ActivitiesAdminComponent,
    EventsAdminComponent,
  ],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage implements OnInit, OnDestroy {
  readonly auth = inject(AdminAuthService);
  readonly toastService = inject(AdminToastService);
  private readonly opsService = inject(OperationsCenterService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly scrollNav = inject(ScrollNavigationService);

  activeSection: AdminSection = 'operations';
  unreadCount = signal<number>(0);
  studioOrderId?: string;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showPasswords = false;
  changingPassword = false;
  loggingOut = false;
  securityError = '';
  securityMessage = '';

  private querySub?: Subscription;
  private pollBadgeTimer?: number;

  ngOnInit(): void {
    this.querySub = this.route.queryParams.subscribe((params) => {
      const section = params['section'] || params['tab'];
      if (
        section &&
        ['operations', 'students', 'users', 'codes', 'orders', 'poster', 'activities', 'events', 'security'].includes(section)
      ) {
        this.activeSection = section as AdminSection;
      }
      this.studioOrderId = params['id'] || params['orderId'] || undefined;
    });

    // If current section is not accessible, auto-switch to first available section
    if (!this.hasAccessToSection(this.activeSection)) {
      const allSections: AdminSection[] = ['operations', 'students', 'users', 'orders', 'codes', 'poster', 'activities', 'events', 'security'];
      const firstAllowed = allSections.find(s => this.hasAccessToSection(s));
      if (firstAllowed) {
        this.activeSection = firstAllowed;
      }
    }

    void this.refreshBadgeCount();
    this.pollBadgeTimer = window.setInterval(() => {
      void this.refreshBadgeCount();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
    if (this.pollBadgeTimer) {
      clearInterval(this.pollBadgeTimer);
    }
  }

  hasAccessToSection(section: AdminSection): boolean {
    if (this.auth.isSuperAdminUser()) return true;

    switch (section) {
      case 'operations':
        return this.auth.hasPermission('notifications.view');
      case 'students':
        return this.auth.hasAnyPermission(['students.view', 'profiles.view']);
      case 'users':
        return this.auth.hasAnyPermission(['users.view', 'roles.manage', 'permissions.override']);
      case 'codes':
        return this.auth.hasAnyPermission([
          'student_registration_codes.view',
          'student_registration_codes.manage',
        ]);
      case 'orders':
        return this.auth.hasPermission('orders.view');
      case 'poster':
        return this.auth.hasPermission('poster.create');
      case 'activities':
        return this.auth.hasPermission('activities.view');
      case 'events':
        return this.auth.hasPermission('events.view');
      case 'security':
        return true;
      default:
        return false;
    }
  }

  async refreshBadgeCount(): Promise<void> {
    try {
      const res = await this.opsService.checkUnread();
      this.unreadCount.set(res.unreadCount);
    } catch {
      // Ignore background errors
    }
  }

  selectSection(section: AdminSection, id?: string): void {
    this.activeSection = section;
    const queryParams: Record<string, string> = { section };
    if (id) {
      queryParams['id'] = id;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
    this.scrollNav.scrollToTop('auto');
  }

  onOperationsNavigate(event: { section: string; id?: string }): void {
    if (
      ['operations', 'students', 'users', 'codes', 'orders', 'poster', 'activities', 'events', 'security'].includes(
        event.section
      )
    ) {
      this.selectSection(event.section as AdminSection, event.id);
    }
  }

  async logout(): Promise<void> {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    await this.auth.logout();
    this.loggingOut = false;
    this.router.navigate(['/dang-nhap-quan-tri']);
  }

  async submitChangePassword(): Promise<void> {
    this.securityError = '';
    this.securityMessage = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.securityError = 'Vui lòng điền đầy đủ các trường mật khẩu.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.securityError = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.securityError = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    this.changingPassword = true;
    try {
      await this.auth.changePassword(this.currentPassword, this.newPassword);
      this.securityMessage = 'Đổi mật khẩu thành công. Hãy ghi nhớ mật khẩu mới của bạn.';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (error) {
      if (error instanceof AdminApiError) {
        this.securityError = error.message;
      } else {
        this.securityError = 'Không thể đổi mật khẩu lúc này. Vui lòng thử lại sau.';
      }
    } finally {
      this.changingPassword = false;
    }
  }
}
