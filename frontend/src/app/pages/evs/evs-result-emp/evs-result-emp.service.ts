import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResultEmpRow {
  evsYear?: string;
  firstHalfYear?: string;
  secondHalfYear?: string;
  evsPerformance?: string;
  evsAbility?: string;
}

/**
 * Kết quả đánh giá nhân viên (viewEvsResultEmp) - self-service, lịch sử kết
 * quả đánh giá thành tích/năng lực theo năm của nhân viên đang đăng nhập.
 */
@Injectable({ providedIn: 'root' })
export class EvsResultEmpService {
  private readonly http = inject(HttpClient);

  getList(): Promise<EvsResultEmpRow[]> {
    return firstValueFrom(this.http.get<EvsResultEmpRow[]>('/evs/manage/api/evsResultEmp/list'));
  }
}
