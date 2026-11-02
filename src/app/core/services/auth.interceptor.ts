import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UserAuthService } from './user-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(UserAuthService);
  const token = authService.token();

  // Bỏ qua đính kèm token cho endpoint đăng nhập Google
  if (req.url.includes('/api/auth/google-login')) {
    return next(req);
  }

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Tự động đăng xuất khi token hết hạn
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
