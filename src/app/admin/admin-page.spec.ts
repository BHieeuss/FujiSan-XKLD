import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminAuthService, AdminSession } from './admin-auth.service';
import { AdminPage } from './admin-page';

describe('AdminPage', () => {
  it('should render the poster tool as the default admin section', async () => {
    const session = signal<AdminSession | null>({
      authenticated: true,
      username: 'admin',
      csrfToken: 'csrf-token',
    });
    const auth = {
      session,
      logout: jasmine.createSpy().and.resolveTo(undefined),
      changePassword: jasmine.createSpy().and.resolveTo(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [
        provideRouter([]),
        { provide: AdminAuthService, useValue: auth },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-poster-maker-page')).toBeTruthy();
    expect(compiled.querySelector('.signed-in-user')?.textContent).toContain('admin');
  });
});
