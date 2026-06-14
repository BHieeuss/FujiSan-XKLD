import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

async function authorizeAdmin(returnUrl: string): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  const authenticated = await auth.checkSession();

  return authenticated
    ? true
    : router.createUrlTree(['/dang-nhap-quan-tri'], {
        queryParams: { returnUrl },
      });
}

export const adminAuthGuard: CanActivateFn = (_route, state) => authorizeAdmin(state.url);

export const adminMatchGuard: CanMatchFn = (_route, segments) =>
  authorizeAdmin(`/${segments.map((segment) => segment.path).join('/')}`);
