import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CsrfInfo {
  csrfToken: string;
  remainingAttempts: number;
  timeUntilReset: number;
}

/**
 * Giữ CSRF token hiện tại trong bộ nhớ để csrf.interceptor gắn vào header
 * X-CSRF-TOKEN cho các request POST/PUT/DELETE, khớp cơ chế synchronizer
 * token pattern phía backend (CsrfUtil.validateCsrfToken).
 */
@Injectable({ providedIn: 'root' })
export class CsrfTokenService {
  private readonly http = inject(HttpClient);

  private readonly tokenSignal = signal<string | null>(null);

  readonly token = this.tokenSignal.asReadonly();

  async fetchToken(): Promise<CsrfInfo> {
    const info = await firstValueFrom(this.http.get<CsrfInfo>('/api/csrf-token'));
    this.tokenSignal.set(info.csrfToken);
    return info;
  }
}
