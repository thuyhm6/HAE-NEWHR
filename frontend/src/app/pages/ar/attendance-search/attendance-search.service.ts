import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AttendanceSearchRow {
  arDateStr?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  postFamilyName?: string;
  shiftName?: string;
  itemName?: string;
  fromTime?: string;
  toTime?: string;
  quantity?: string;
  unit?: string;
  statusName?: string;
  remark?: string;
  updatedBy?: string;
  updateDate?: string;
}

export interface AttendanceSearchFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  postFamily?: string;
  shiftNo?: string;
  itemNo?: string;
}

export interface ItemOption {
  itemNo?: string;
  itemName?: string;
}

export interface SyncCleverseTestPayload {
  enterCd: string;
  sabun: string;
  gntCd: string;
  sYmd: string;
  eYmd: string;
  orgCd: string;
  instanceId: string;
  cancelYn: string;
  ifId: string;
  status: string;
  reason: string;
}

export interface SyncCleverseTestResponse {
  success: boolean;
  result?: string;
  message?: string;
}

const LIST_URL = '/ar/attendanceMintenance/api/attendanceSearch/list';
const ITEM_OPTIONS_URL = '/ar/attendanceSettings/api/arItemParam/options';
const SYNC_TEST_URL = '/ar/attendanceMintenance/api/syncCleverse/test';

/**
 * Tra cứu chi tiết công (nghỉ phép/chấm công bất thường) theo phòng ban được
 * phân quyền - port lại từ
 * ar/attendanceMintenance/viewAttendanceManagentForSerchInfoList.html (đã
 * xoá). Backend trả mảng phẳng (không phân trang server-side, dùng chung
 * bảng AR_DETAIL_HAE với trang tra cứu OT ở `attendance-ot-search`, chỉ khác
 * điều kiện lọc ITEM_NO). Có thêm modal test gửi dữ liệu chấm công lên
 * Cleverse (DEV) - chỉ để test nội bộ, không liên quan tra cứu.
 */
@Injectable({ providedIn: 'root' })
export class AttendanceSearchService {
  private readonly http = inject(HttpClient);

  getList(filter: AttendanceSearchFilter): Promise<AttendanceSearchRow[]> {
    return firstValueFrom(this.http.get<AttendanceSearchRow[]>(LIST_URL, { params: this.toHttpParams(filter) }));
  }

  getItemOptions(type: 'attendance' | 'overtime'): Promise<ItemOption[]> {
    return firstValueFrom(this.http.get<ItemOption[]>(ITEM_OPTIONS_URL, { params: { type } }));
  }

  syncCleverseTest(payload: SyncCleverseTestPayload): Promise<SyncCleverseTestResponse> {
    return firstValueFrom(this.http.post<SyncCleverseTestResponse>(SYNC_TEST_URL, payload));
  }

  private toHttpParams(filter: object): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value);
      }
    });
    return params;
  }
}
