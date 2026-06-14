import { TestBed } from '@angular/core/testing';
import { AdminApiError, AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAuthService);
    fetchSpy = spyOn(globalThis, 'fetch');
  });

  it('should store an authenticated server session', async () => {
    fetchSpy.and.resolveTo(
      new Response(
        JSON.stringify({
          authenticated: true,
          username: 'admin',
          csrfToken: 'csrf-token',
        }),
        { status: 200 },
      ),
    );

    await service.login('admin', 'password');

    expect(service.session()?.username).toBe('admin');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/admin-api/login.php',
      jasmine.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
      }),
    );
  });

  it('should surface login throttling details', async () => {
    fetchSpy.and.resolveTo(
      new Response(
        JSON.stringify({
          message: 'Đăng nhập tạm khóa.',
          retryAfter: 900,
        }),
        { status: 429 },
      ),
    );

    let capturedError: unknown;
    try {
      await service.login('admin', 'wrong-password');
    } catch (error) {
      capturedError = error;
    }

    expect(capturedError instanceof AdminApiError).toBeTrue();
    expect((capturedError as AdminApiError).retryAfter).toBe(900);
  });

  it('should clear the local session after logout', async () => {
    fetchSpy.and.resolveTo(
      new Response(
        JSON.stringify({
          authenticated: true,
          username: 'admin',
          csrfToken: 'csrf-token',
        }),
        { status: 200 },
      ),
    );
    await service.login('admin', 'password');

    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ authenticated: false }), { status: 200 }),
    );
    await service.logout();

    expect(service.session()).toBeNull();
    const logoutCall = fetchSpy.calls.mostRecent().args;
    expect(logoutCall[0]).toBe('/admin-api/logout.php');
    expect(logoutCall[1]).toEqual(
      jasmine.objectContaining({
        headers: jasmine.objectContaining({ 'X-CSRF-Token': 'csrf-token' }),
      }),
    );
  });
});
