import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AttendanceSearchFilter, AttendanceSearchRow } from '../attendance-search/attendance-search.service';

const LIST_URL = '/ar/attendanceMintenance/api/attendanceSearch/otList';

/**
 * Tra cứu đơn tăng ca theo phòng ban được phân quyền - port lại từ
 * ar/attendanceMintenance/viewSearchApplyOtInfoList.html (đã xoá). Cùng bảng
 * AR_DETAIL_HAE và cùng bộ lọc với `AttendanceSearchService` (trang
 * viewAttendanceManagentForSerchInfoList), chỉ khác điều kiện lọc ITEM_NO
 * (chỉ các mã tăng ca) - tái sử dụng type `AttendanceSearchRow`/`Filter`.
 */
@Injectable({ providedIn: 'root' })
export class AttendanceOtSearchService {
  private readonly http = inject(HttpClient);

  getList(filter: AttendanceSearchFilter): Promise<AttendanceSearchRow[]> {
    return firstValueFrom(this.http.get<AttendanceSearchRow[]>(LIST_URL, { params: this.toHttpParams(filter) }));
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
