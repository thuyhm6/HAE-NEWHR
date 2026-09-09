import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ApprovalEmailRow {
  applyNo?: string;
  applyType?: string;
  applyTypeCode?: string;
  applyFlag?: string;
  affirmLevel?: string | number;
  affirmPersonId?: string;
  affirmFlag?: string;
  title?: string;
  applyPersonInfo?: string;
  updateDate?: string;
  applyAffirmFlag?: string;
  affirmUrl?: string;
}

export interface SyncEagleOfficeResponse {
  success: boolean;
  message?: string;
}

const LIST_URL = '/ess/infoApply/api/approvalEmail/list';
const SYNC_URL = '/ess/infoApply/api/approvalEmail/syncEagleOffice';

/**
 * Hàng đợi đơn chờ duyệt (tăng ca/nghỉ phép/nghỉ bất thường) - port lại từ
 * ess/infoApply/viewApprovalEmail.html (đã xoá). Duyệt/từ chối hàng loạt gọi
 * chung endpoint `execute` với ApplyDetailModalService (đã có sẵn từ Batch A,
 * dùng cho cả duyệt 1 dòng trong modal chi tiết lẫn duyệt hàng loạt ở đây)
 * thay vì tạo lại logic gọi API riêng.
 */
@Injectable({ providedIn: 'root' })
export class ApprovalEmailListService {
  private readonly http = inject(HttpClient);

  getList(): Promise<ApprovalEmailRow[]> {
    return firstValueFrom(this.http.get<ApprovalEmailRow[]>(LIST_URL));
  }

  syncEagleOffice(): Promise<SyncEagleOfficeResponse> {
    return firstValueFrom(this.http.post<SyncEagleOfficeResponse>(SYNC_URL, {}));
  }
}
