import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface LeaveConfirmRow {
  applyNo?: string;
  applyTime?: string;
  personId?: string;
  dayHours?: string;
  leaveFromTime?: string;
  leaveToTime?: string;
  leaveReason?: string;
  leaveTypeCode?: string;
  leaveTypeCodeName?: string;
  hrComment?: string;
  applyLength?: string;
  createdName?: string;
  localName?: string;
  empId?: string;
  deptName?: string;
  postGradeName?: string;
  confirmBy?: string;
}

export interface LeaveConfirmFilter {
  searchEmpId?: string;
  fromDate?: string;
  toDate?: string;
  searchLeaveTypeCode?: string;
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

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

const LIST_URL = '/ess/arConfirm/api/leaveConfirm/list';
const CONFIRM_URL = '/ess/arConfirm/api/leaveConfirm/confirm';
const CONFIRM_BATCH_URL = '/ess/arConfirm/api/leaveConfirm/confirmBatch';
const DETAIL_URL = '/ar/attendanceMintenance/api/leaveApply/detail';
const CODE_LIST_URL = '/sys/api/getCode/list';
const LEAVE_TYPE_PARENT_CODE = '21';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewLeaveConfirmList (không
 * đổi backend) - port lại từ ess/arConfirm/viewLeaveConfirmList.html
 * (Thymeleaf + DataTables server-side, đã xoá) sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class LeaveConfirmService {
  private readonly http = inject(HttpClient);

  getPageList(
    filter: LeaveConfirmFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<LeaveConfirmRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<LeaveConfirmRow>>(LIST_URL, {
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

  getLeaveTypeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: LEAVE_TYPE_PARENT_CODE } }));
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
