import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface NoticeedEmailRow {
  applyNo?: string;
  applyType?: string;
  applyTypeCode?: string;
  title?: string;
  applyPersonInfo?: string;
  updateDate?: string;
  applyAffirmFlag?: string;
  affirmFlag?: string;
  affirmUrl?: string;
}

/**
 * Danh sách đơn theo trạng thái email/EagleOffice, chỉ xem - dùng chung cho 2
 * trang gần như trùng lặp 100%: ess/infoApply/viewNoticeedEmail.html (đã
 * thông báo) và ess/infoApply/viewApprovaledEmail.html (đã duyệt), cả 2 đã
 * xoá, chỉ khác URL API (`/noticeedEmail` hoặc `/approvaledEmail`, truyền qua
 * route data `apiBase`). Gọi lại nguyên vẹn API JSON sẵn có; modal chi tiết
 * tái sử dụng ApplyDetailModalComponent (đã port ở Batch A) thay vì viết lại
 * 3 fragment gốc.
 */
@Injectable({ providedIn: 'root' })
export class NoticeedEmailListService {
  private readonly http = inject(HttpClient);

  getList(apiBase: string): Promise<NoticeedEmailRow[]> {
    return firstValueFrom(this.http.get<NoticeedEmailRow[]>(`${apiBase}/list`));
  }
}
