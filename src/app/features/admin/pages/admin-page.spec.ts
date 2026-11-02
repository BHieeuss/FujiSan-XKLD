import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminAuthService, AdminSession } from '../services/admin-auth.service';
import { AdminPage } from './admin-page';

describe('AdminPage', () => {
  it('should render the admin page and switch to poster maker section', async () => {
    const session = signal<AdminSession | null>({
      authenticated: true,
      username: 'admin',
      csrfToken: 'csrf-token',
    });
    const auth = {
      session,
      logout: jasmine.createSpy().and.resolveTo(undefined),
      changePassword: jasmine.createSpy().and.resolveTo(undefined),
      isSuperAdminUser: jasmine.createSpy().and.returnValue(true),
      hasPermission: jasmine.createSpy().and.returnValue(true),
      hasAnyPermission: jasmine.createSpy().and.returnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AdminAuthService, useValue: auth },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(fixture.nativeElement.querySelector('.signed-in-user')?.textContent).toContain('admin');

    // Switch to poster section
    component.selectSection('poster');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-poster-maker-page')).toBeTruthy();
  });
});
