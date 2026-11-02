import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAuthService } from '../../services/user-auth.service';

type AuthTab = 'login' | 'register';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
})
export class AuthModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  readonly auth = inject(UserAuthService);

  activeTab = signal<AuthTab>('login');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  // Login Form
  loginIdentifier = '';
  loginPassword = '';
  showLoginPassword = false;

  // Register Form
  regFullName = '';
  regUsername = '';
  regEmail = '';
  regPassword = '';
  regConfirmPassword = '';
  regCode = '';
  showRegPassword = false;

  setTab(tab: AuthTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onClose(): void {
    this.close.emit();
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async handleLogin(): Promise<void> {
    if (!this.loginIdentifier.trim()) {
      this.errorMessage.set('Vui lòng nhập Tên đăng nhập hoặc Email.');
      return;
    }
    if (!this.loginPassword) {
      this.errorMessage.set('Vui lòng nhập Mật khẩu.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      await this.auth.login({
        usernameOrEmail: this.loginIdentifier.trim(),
        password: this.loginPassword,
      });

      this.onClose();
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Đăng nhập không thành công.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async handleRegister(): Promise<void> {
    if (!this.regFullName.trim()) {
      this.errorMessage.set('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!this.regUsername.trim() || this.regUsername.trim().length < 3) {
      this.errorMessage.set('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }
    if (!this.regEmail.trim() || !this.regEmail.includes('@')) {
      this.errorMessage.set('Email không hợp lệ.');
      return;
    }
    if (!this.regPassword || this.regPassword.length < 6) {
      this.errorMessage.set('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (this.regPassword !== this.regConfirmPassword) {
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!this.regCode.trim()) {
      this.errorMessage.set('Vui lòng nhập Mã code đăng ký do Trung tâm/Admin cấp.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      await this.auth.register({
        fullName: this.regFullName.trim(),
        username: this.regUsername.trim(),
        email: this.regEmail.trim(),
        password: this.regPassword,
        registrationCode: this.regCode.trim().toUpperCase(),
      });

      this.onClose();
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Đăng ký không thành công.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
