import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EmpMonthlyStatsDto {
  monthNum: number;
  empCount: number;
  newJoinerCount: number;
  leaverCount: number;
}

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của module HRM (không đổi backend, trừ
 * 1 endpoint mới /api/hrm/expiring-contracts-count) để hiển thị dashboard
 * HRM Angular - port lại từ login/hrm.html (Thymeleaf, đã xoá).
 */
@Injectable({ providedIn: 'root' })
export class HrmWidgetsService {
  private readonly http = inject(HttpClient);

  getExpiringContractsCount(): Promise<number> {
    return firstValueFrom(this.http.get<number>('/api/hrm/expiring-contracts-count'));
  }

  getEmpMonthlyStats(year: number): Promise<EmpMonthlyStatsDto[]> {
    return firstValueFrom(
      this.http.get<EmpMonthlyStatsDto[]>('/hrm/api/empMonthlyStats', { params: { year } }),
    );
  }
}
