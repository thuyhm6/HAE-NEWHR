import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/**
 * Tải nội dung đa ngôn ngữ từ messages*.properties có sẵn phía backend
 * (GET /api/i18n/messages) để không hardcode text trong Angular, đúng quy
 * ước của dự án. Mặc định tiếng Việt (vi).
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);

  private readonly messagesSignal = signal<Record<string, string>>({});
  private readonly langSignal = signal<string>('vi');

  readonly lang = this.langSignal.asReadonly();

  async load(lang?: string): Promise<void> {
    const targetLang = lang ?? (await this.resolveCurrentLanguage());
    const messages = await firstValueFrom(
      this.http.get<Record<string, string>>('/api/i18n/messages', { params: { lang: targetLang } }),
    );
    this.messagesSignal.set(messages);
    this.langSignal.set(targetLang);
  }

  /** Không truyền lang -> lấy đúng ngôn ngữ session hiện tại (đã đổi qua changeLanguage()) thay vì mặc định 'vi'. */
  private async resolveCurrentLanguage(): Promise<string> {
    try {
      const result = await firstValueFrom(
        this.http.get<{ languageCode: string }>('/api/current-language'),
      );
      return result.languageCode || 'vi';
    } catch {
      return 'vi';
    }
  }

  t(key: string, fallback?: string): string {
    return this.messagesSignal()[key] ?? fallback ?? key;
  }
}
