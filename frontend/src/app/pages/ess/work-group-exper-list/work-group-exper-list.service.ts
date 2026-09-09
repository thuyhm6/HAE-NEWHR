import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface WorkGroupRow {
  startDate?: string;
  shiftNo?: string;
  remark?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  description?: string;
}

const MY_LIST_URL = '/ess/workgroup/api/workGroup/myList';
const CODE_LIST_URL = '/sys/api/getCode/list';
const SHIFT_PARENT_CODE = '400223';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewWorkGroupExperList (không
 * đổi backend) - port lại từ ess/workgroup/viewWorkGroupExperList.html
 * (Thymeleaf, đã xoá) sang Angular + NG-ZORRO. Đây là trang xem lịch sử thay
 * đổi ca làm của chính người đang đăng nhập (personId lấy từ session ở
 * backend).
 */
@Injectable({ providedIn: 'root' })
export class WorkGroupExperListService {
  private readonly http = inject(HttpClient);

  getMyList(shiftNo?: string, fromDate?: string, toDate?: string): Promise<WorkGroupRow[]> {
    return firstValueFrom(
      this.http.get<WorkGroupRow[]>(MY_LIST_URL, { params: this.toHttpParams({ shiftNo, fromDate, toDate }) }),
    );
  }

  getShiftOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: SHIFT_PARENT_CODE } }));
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
