import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/** Dùng trong template: {{ 'key.name' | translate:'Text mặc định' }}. impure vì I18nService
 *  có thể nạp lại messages (đổi ngôn ngữ) sau khi pipe đã render lần đầu. */
@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, fallback?: string): string {
    return this.i18n.t(key, fallback);
  }
}
