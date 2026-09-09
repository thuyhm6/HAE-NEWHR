import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Guard phía client cho trải nghiệm SPA (điều hướng nội bộ). Việc bắt buộc
 * đăng nhập thực sự đã được HomeController.dashboard() kiểm tra session ở
 * server trước khi trả index.html - guard này chỉ xử lý trường hợp session
 * hết hạn giữa lúc đang dùng Angular (gọi API trả 401).
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const user = await authService.loadCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return false;
  }
  return true;
};
