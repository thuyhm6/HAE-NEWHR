import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfTokenService } from '../services/csrf-token.service';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Gắn header X-CSRF-TOKEN cho các request thay đổi dữ liệu (khớp
 * CsrfUtil.validateCsrfToken phía backend đọc header này trước).
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfTokenService = inject(CsrfTokenService);
  const token = csrfTokenService.token();

  if (!UNSAFE_METHODS.has(req.method) || !token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { 'X-CSRF-TOKEN': token },
    }),
  );
};
