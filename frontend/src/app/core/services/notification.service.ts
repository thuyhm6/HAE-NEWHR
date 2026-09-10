import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PendingCounts {
  total: number;
  leave: number;
  ot: number;
  anomaly: number;
}

export interface HrmPendingCounts {
  total: number;
  leave: number;
  anomalous: number;
  overtime: number;
  personalChange: number;
}

/**
 * Tái dùng nguyên vẹn API đếm số đơn chờ duyệt đã có sẵn
 * (/sy/syAffirm/api/pending-counts, /sy/syAffirm/api/hrm-pending-counts) -
 * port lại từ topbar.html cũ.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  getPendingCounts(): Promise<PendingCounts> {
    return firstValueFrom(this.http.get<PendingCounts>('/sy/syAffirm/api/pending-counts'));
  }

  getHrmPendingCounts(): Promise<HrmPendingCounts> {
    return firstValueFrom(this.http.get<HrmPendingCounts>('/sy/syAffirm/api/hrm-pending-counts'));
  }
}
