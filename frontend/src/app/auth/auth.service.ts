import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CsrfTokenService } from '../core/services/csrf-token.service';
import { CurrentUser, LoginResult } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly csrfTokenService = inject(CsrfTokenService);

  readonly currentUser = signal<CurrentUser | null>(null);

  async prepareLogin() {
    return this.csrfTokenService.fetchToken();
  }

  async login(username: string, password: string, lang?: string): Promise<LoginResult> {
    try {
      return await firstValueFrom(
        this.http.post<LoginResult>('/api/auth/login', { username, password, lang }),
      );
    } catch (err: any) {
      const body = err?.error as LoginResult | undefined;
      if (body) {
        return body;
      }
      return { success: false, message: 'Không thể kết nối máy chủ. Vui lòng thử lại.' };
    }
  }

  async loadCurrentUser(): Promise<CurrentUser | null> {
    try {
      const user = await firstValueFrom(this.http.get<CurrentUser>('/api/auth/me'));
      this.currentUser.set(user);
      return user;
    } catch {
      this.currentUser.set(null);
      return null;
    }
  }

  logout(): void {
    window.location.href = '/logout';
  }
}
