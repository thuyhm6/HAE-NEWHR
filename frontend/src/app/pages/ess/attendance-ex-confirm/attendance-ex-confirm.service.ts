import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AttendanceExConfirmRow {
  applyNo?: string;
  personId?: string;
  applyReason?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  shiftName?: string;
  itemNo?: string;
  itemName?: string;
  arDateStr?: string;
  inTime?: string;
  outTime?: string;
  fromTime?: string;
  toTime?: string;
  indoorTime?: string;
  outdoorTime?: string;
  hrComment?: string;
  localName?: string;
  empId?: string;
  deptName?: string;
  postGradeName?: string;
  confirmBy?: string;
}

export interface AttendanceExConfirmFilter {
  searchEmpId?: string;
  fromDate?: string;
  toDate?: string;
  confirmFlag?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
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
  dayHours?: string;
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

const LIST_URL = '/ess/arConfirm/api/attendanceExConfirm/list';
const CONFIRM_URL = '/ess/arConfirm/api/attendanceExConfirm/confirm';
const CONFIRM_BATCH_URL = '/ess/arConfirm/api/attendanceExConfirm/confirmBatch';
const DETAIL_URL = '/ess/infoApplyAttendance/api/checkAttendanceEx/detail';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewAttendanceExConfirm (không
 * đổi backend) - port lại từ ess/arConfirm/viewAttendanceExConfirm.html
 * (Thymeleaf + DataTables server-side, đã xoá) sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class AttendanceExConfirmService {
  private readonly http = inject(HttpClient);

  getPageList(
    filter: AttendanceExConfirmFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<AttendanceExConfirmRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<AttendanceExConfirmRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  confirmLine(applyNo: string, flag: string, hrComment: string): Promise<{ success: boolean; error?: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; error?: string }>(CONFIRM_URL, { applyNo, flag, hrComment }),
    );
  }

  confirmBatch(applyNos: string[], flag: string, hrComment: string): Promise<{ success: boolean; error?: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; error?: string }>(CONFIRM_BATCH_URL, { applyNos, flag, hrComment }),
    );
  }

  getDetail(applyNo: string, applyType?: string): Promise<ApplyDetailResponse> {
    return firstValueFrom(
      this.http.get<ApplyDetailResponse>(DETAIL_URL, { params: this.toHttpParams({ applyNo, applyType }) }),
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
