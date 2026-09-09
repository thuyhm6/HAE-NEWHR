import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PersonShiftRow {
  ddateStr?: string;
  overTypeIdName?: string;
  shiftName?: string;
  dateType?: string;
  dateName?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  indoorTime?: string;
  outdoorTime?: string;
  workHours?: string;
}

const MY_LIST_URL = '/ess/workgroup/api/personShift/myList';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewPersonShiftList (không đổi
 * backend) - port lại từ ess/workgroup/viewPersonShiftList.html (Thymeleaf,
 * đã xoá) sang Angular + NG-ZORRO. Đây là trang xem lịch sử ca làm của chính
 * người đang đăng nhập (personId lấy từ session ở backend) nên không cần
 * truyền personId từ client.
 */
@Injectable({ providedIn: 'root' })
export class PersonShiftListService {
  private readonly http = inject(HttpClient);

  getMyList(startDate?: string, endDate?: string): Promise<PersonShiftRow[]> {
    return firstValueFrom(
      this.http.get<PersonShiftRow[]>(MY_LIST_URL, { params: this.toHttpParams({ startDate, endDate }) }),
    );
  }

  private toHttpParams(filter: Record<string, string | undefined>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params;
  }
}
