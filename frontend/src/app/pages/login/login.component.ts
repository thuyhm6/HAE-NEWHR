import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../auth/auth.service';
import { I18nService } from '../../i18n/i18n.service';

const REMEMBERED_USERNAME_KEY = 'hr_remembered_username';
const REMEMBERED_PASSWORD_KEY = 'hr_remembered_password';
const REMEMBER_ME_KEY = 'hr_remember_me';

interface LanguageOption {
  code: string;
  flag: string;
  label: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzAlertModule,
    NzIconModule,
    NzDropdownModule,
    NzMenuModule,
    NzModalModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly languages: LanguageOption[] = [
    { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'ko', flag: '🇰🇷', label: '한국어' },
    { code: 'zh', flag: '🇨🇳', label: '中文' },
  ];

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly remainingAttempts = signal<number | null>(null);

  protected readonly feedbackVisible = signal(false);
  protected readonly feedbackTitle = signal('');
  protected readonly feedbackContent = signal('');
  protected readonly feedbackSubmitting = signal(false);

  async ngOnInit(): Promise<void> {
    this.restoreSavedCredentials();
    await Promise.all([this.i18n.load(), this.authService.prepareLogin()]);
  }

  protected currentLanguage(): LanguageOption {
    return this.languages.find((lang) => lang.code === this.i18n.lang()) ?? this.languages[0];
  }

  protected getRemainingAttemptsText(): string {
    const attempts = this.remainingAttempts();
    if (attempts === null) {
      return '';
    }
    if (attempts === 0) {
      return this.i18n.t('login.attempts.locked', 'Tài khoản đã bị khóa. Vui lòng thử lại sau.');
    }

    const template = this.i18n.t('login.attempts.remaining', 'Còn {0} lần đăng nhập');
    return template.replace('{0}', String(attempts));
  }

  async changeLanguage(lang: string): Promise<void> {
    await this.i18n.load(lang);
  }

  onRememberMeChange(checked: boolean): void {
    this.rememberMe.set(checked);
    if (!checked) {
      this.clearSavedCredentials();
      this.message.info(this.i18n.t('login.rememberMe.disabled', 'Đã tắt chức năng nhớ thông tin đăng nhập'));
    }
  }

  async submit(): Promise<void> {
    if (!this.username().trim() || !this.password().trim()) {
      this.errorMessage.set(
        !this.username().trim()
          ? this.i18n.t('login.validate.username', 'Vui lòng nhập tên đăng nhập')
          : this.i18n.t('login.validate.password', 'Vui lòng nhập mật khẩu'),
      );
      return;
    }

    if (this.rememberMe()) {
      this.saveCredentials(this.username().trim(), this.password());
    } else {
      this.clearSavedCredentials();
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const result = await this.authService.login(this.username().trim(), this.password(), this.i18n.lang());
      if (result.success && result.redirectUrl) {
        // Hard redirect (không dùng Router.navigate) vì baseHref của bundle
        // Angular là /ng/, còn /login và /dashboard do server điều hướng.
        window.location.href = result.redirectUrl;
        return;
      }
      this.errorMessage.set(result.message ?? 'Đăng nhập thất bại.');
      this.remainingAttempts.set(result.remainingAttempts ?? null);
    } finally {
      this.loading.set(false);
    }
  }

  private restoreSavedCredentials(): void {
    try {
      const savedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY);
      const savedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY);
      const remember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
      if (savedUsername && remember) {
        this.username.set(savedUsername);
        this.password.set(savedPassword ?? '');
        this.rememberMe.set(true);
        this.message.success(this.i18n.t('login.credentials.restored', 'Đã khôi phục thông tin đăng nhập đã lưu'));
      }
    } catch {
      // im lặng bỏ qua - trình duyệt chặn localStorage (chế độ riêng tư)
    }
  }

  private saveCredentials(username: string, password: string): void {
    try {
      localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
      localStorage.setItem(REMEMBERED_PASSWORD_KEY, password);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } catch {
      // im lặng bỏ qua
    }
  }

  private clearSavedCredentials(): void {
    try {
      localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    } catch {
      // im lặng bỏ qua
    }
  }

  openFeedbackModal(): void {
    this.feedbackTitle.set('');
    this.feedbackContent.set('');
    this.feedbackVisible.set(true);
  }

  async submitFeedback(): Promise<void> {
    const content = this.feedbackContent().trim();
    if (!content) {
      this.message.error(this.i18n.t('login.feedback.validateContent', 'Vui lòng nhập nội dung góp ý!'));
      return;
    }

    this.feedbackSubmitting.set(true);
    try {
      await firstValueFrom(
        this.http.post('/sys/feedback/submit', {
          feedbackTitle: this.feedbackTitle().trim(),
          feedbackContent: content,
        }),
      );
      this.message.success(this.i18n.t('login.feedback.submitSuccess', 'Gửi góp ý thành công. Cảm ơn bạn đã đóng góp ý kiến!'));
      this.feedbackVisible.set(false);
    } catch (err: any) {
      this.message.error(err?.error?.message ?? this.i18n.t('login.feedback.submitError', 'Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại!'));
    } finally {
      this.feedbackSubmitting.set(false);
    }
  }
}
