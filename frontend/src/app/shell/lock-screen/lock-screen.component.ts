import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AuthService } from '../../auth/auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { IdleLockService } from '../../core/services/idle-lock.service';

/**
 * Overlay toàn màn hình hiển thị khi IdleLockService.locked() = true (sau 30
 * phút không thao tác). Không điều hướng đi đâu - chỉ che nội dung trang hiện
 * tại, giữ nguyên trạng thái Angular. Nhập đúng mật khẩu để mở khoá tại chỗ
 * (dùng lại chính API đăng nhập, vì lúc khoá server đã huỷ session).
 */
@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzIconModule],
  templateUrl: './lock-screen.component.html',
  styleUrl: './lock-screen.component.scss',
})
export class LockScreenComponent {
  protected readonly authService = inject(AuthService);
  protected readonly idleLock = inject(IdleLockService);
  protected readonly i18n = inject(I18nService);

  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    const username = this.authService.currentUser()?.username;
    if (!username) {
      // Session da mat het thong tin user (vd session het han that su) - chi con cach dang nhap lai.
      window.location.href = '/login';
      return;
    }
    if (!this.password()) {
      this.error.set(this.i18n.t('lock.validate.password', 'Vui lòng nhập mật khẩu!'));
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.prepareLogin();
      const result = await this.authService.login(username, this.password());
      if (result.success) {
        this.password.set('');
        this.idleLock.unlock();
      } else {
        this.error.set(result.message ?? this.i18n.t('lock.wrongPassword', 'Mật khẩu không đúng.'));
      }
    } finally {
      this.loading.set(false);
    }
  }
}
