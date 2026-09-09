import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface MyLeaveApplyRow {
  applyNo?: string;
  leaveTypeCode?: string;
  leaveTypeName?: string;
  applyDate?: string;
  leaveFromDate?: string;
  leaveFromTimeOnly?: string;
  leaveToDate?: string;
  leaveToTimeOnly?: string;
  applyLength?: string;
  dayHours?: string;
  leaveReason?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  hrComment?: string;
  confirmFlagName?: string;
  createdBy?: string;
  createdIp?: string;
}

export interface MyLeaveApplyFilter {
  leaveTypeCode?: string;
  affirmFlag?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface CancelResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ess/infoApplyAttendance/api/myLeaveApply/list';
const CANCEL_URL = '/ess/infoApplyAttendance/api/myLeaveApply/cancel';
const CODE_LIST_URL = '/sys/api/getCode/list';

export const LEAVE_TYPE_PARENT_CODE = '21';
export const AFFIRM_FLAG_PARENT_CODE = '14014304';
export const CANCELABLE_AFFIRM_FLAGS = ['14014306', '14014307', '14014308'];

/**
 * Danh sách đơn xin nghỉ phép của chính nhân viên đang đăng nhập, hủy đơn,
 * xem chi tiết duyệt - port lại từ
 * ess/infoApplyAttendance/viewApplyAttendanceInfoList.html (Thymeleaf, đã
 * xoá) sang Angular + NG-ZORRO. Modal chi tiết tái sử dụng
 * ApplyDetailModalComponent (variant="leave", đã port ở Batch A) thay vì
 * viết lại modal riêng gần như trùng lặp. Gọi lại nguyên vẹn API JSON sẵn
 * có.
 */
@Injectable({ providedIn: 'root' })
export class MyLeaveApplyListService {
  private readonly http = inject(HttpClient);

  getList(filter: MyLeaveApplyFilter): Promise<MyLeaveApplyRow[]> {
    return firstValueFrom(this.http.get<MyLeaveApplyRow[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }));
  }

  cancel(applyNos: string[]): Promise<CancelResponse> {
    return firstValueFrom(this.http.post<CancelResponse>(CANCEL_URL, applyNos));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
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
