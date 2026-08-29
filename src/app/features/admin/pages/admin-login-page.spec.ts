import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginPage } from './admin-login-page';

describe('AdminLoginPage', () => {
  it('should render the protected admin login form', async () => {
    const auth = {
      checkSession: jasmine.createSpy().and.resolveTo(false),
      login: jasmine.createSpy(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminLoginPage],
      providers: [
        provideRouter([]),
        { provide: AdminAuthService, useValue: auth },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminLoginPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Đăng nhập quản trị');
    expect(compiled.querySelector('input[autocomplete="current-password"]')).toBeTruthy();
    expect(compiled.querySelector('.security-note')?.textContent).toContain('30 phút');
  });
});
