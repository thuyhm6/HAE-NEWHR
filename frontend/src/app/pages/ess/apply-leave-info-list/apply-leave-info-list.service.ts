import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CardApplyRow {
  applyNo?: string;
  personId?: string;
  arDateStr?: string;
  itemNo?: string;
  itemName?: string;
  indoorTime?: string;
  outdoorTime?: string;
  fromTime?: string;
  toTime?: string;
  shiftName?: string;
  workTime?: string;
  applyReason?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  hrComment?: string;
}

export interface ApplyDetailPerson {
  localName?: string;
  empId?: string;
  deptName?: string;
  postGradeName?: string;
}

export interface ApplyDetailLeaveInfo extends ApplyDetailPerson {
  leaveTypeName?: string;
  leaveFromTime?: string;
  leaveToTime?: string;
  applyLength?: string;
  leaveReason?: string;
}

export interface ApplyDetailApprovalRow {
  affirmLevel?: string;
  affirmTypeName?: string;
  affirmFlagName?: string;
  affirmName?: string;
  affirmContent?: string;
  updateDate?: string;
  deptName?: string;
}

export interface ApplyDetailResponse {
  leaveInfo?: ApplyDetailLeaveInfo;
  employeeInfo?: ApplyDetailPerson;
  approvalList?: ApplyDetailApprovalRow[];
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

/** Các trạng thái cho phép huỷ bỏ đơn - giữ nguyên như bản Thymeleaf cũ. */
export const CANCELLABLE_AFFIRM_FLAGS = ['14014306', '14014307', '14014308'];

const MY_LIST_URL = '/ess/infoApplyLeave/api/myCardApply/list';
const CANCEL_URL = '/ess/infoApplyLeave/api/myCardApply/cancel';
const DETAIL_URL = '/ess/infoApplyAttendance/api/checkAttendanceEx/detail';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AFFIRM_FLAG_PARENT_CODE = '14014304';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewApplyLeaveInfoList (không
 * đổi backend) - port lại từ ess/infoApplyLeave/viewApplyLeaveInfoList.html
 * (Thymeleaf, đã xoá) sang Angular + NG-ZORRO. Đây là trang tự xem đơn xin
 * nghỉ/xin phép của chính người đang đăng nhập.
 */
@Injectable({ providedIn: 'root' })
export class ApplyLeaveInfoListService {
  private readonly http = inject(HttpClient);

  getMyList(affirmFlag?: string, startDate?: string, endDate?: string): Promise<CardApplyRow[]> {
    return firstValueFrom(
      this.http.get<CardApplyRow[]>(MY_LIST_URL, { params: this.toHttpParams({ affirmFlag, startDate, endDate }) }),
    );
  }

  cancel(applyNos: string[]): Promise<{ success: boolean; message?: string; error?: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; message?: string; error?: string }>(CANCEL_URL, applyNos),
    );
  }

  getDetail(applyNo: string, applyType?: string): Promise<ApplyDetailResponse> {
    return firstValueFrom(
      this.http.get<ApplyDetailResponse>(DETAIL_URL, { params: this.toHttpParams({ applyNo, applyType }) }),
    );
  }

  getAffirmFlagOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: AFFIRM_FLAG_PARENT_CODE } }));
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
