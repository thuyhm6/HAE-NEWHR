import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart', 'click'] as const;

/**
 * Theo dõi thao tác người dùng (mouse/keyboard/touch) trên toàn trang, tự động
 * khoá màn hình sau 30 phút không thao tác. Khi khoá, gọi POST /api/auth/lock
 * để huỷ session ngay phía server - nếu người dùng F5 lại trình duyệt trong
 * lúc đang khoá, authGuard (gọi GET /api/auth/me) sẽ nhận 401 và tự chuyển về
 * /login thay vì cho vào thẳng dashboard.
 */
@Injectable({ providedIn: 'root' })
export class IdleLockService {
  private readonly http = inject(HttpClient);

  readonly locked = signal(false);

  private timer?: ReturnType<typeof setTimeout>;
  private started = false;
  private readonly onActivity = () => this.resetTimer();

  start(): void {
    if (this.started) return;
    this.started = true;
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, this.onActivity, { passive: true });
    }
    this.resetTimer();
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    for (const evt of ACTIVITY_EVENTS) {
      window.removeEventListener(evt, this.onActivity);
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private resetTimer(): void {
    if (this.locked()) return;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.lock(), IDLE_TIMEOUT_MS);
  }

  private async lock(): Promise<void> {
    this.locked.set(true);
    try {
      await firstValueFrom(this.http.post('/api/auth/lock', {}));
    } catch {
      // Bo qua loi mang - man hinh van hien overlay khoa phia client du goi API that bai.
    }
  }

  /** Gọi sau khi nhập đúng mật khẩu và đăng nhập lại thành công để mở khoá tại chỗ. */
  unlock(): void {
    this.locked.set(false);
    this.resetTimer();
  }
}
