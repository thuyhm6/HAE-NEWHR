import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AttBatchRow {
  applyNo?: string | number;
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  annualLeaveCount?: string;
  shiftName?: string;
  leaveTypeCode?: string;
  leaveFromTime?: string;
  leaveToTime?: string;
  applyLength?: string;
  dayHours?: string;
  leaveReason?: string;
  affirmFlag?: string;
  affirmStr?: string;
  sexCode?: string;
  createdBy?: string;
  createDate?: string;
  updatedBy?: string;
  updateDate?: string;
}

export interface AttBatchFilter {
  empId?: string;
  localName?: string;
  fromDate?: string;
  toDate?: string;
  affirmFlag?: string;
  confirmFlag?: string;
  leaveTypeCode?: string;
}

export interface EmpDefaultInfo {
  START_TIME?: string;
  END_TIME?: string;
  VAC_COUNT?: string;
  SHIFT_NAME?: string;
  DEPT_NAME?: string;
  SEXCODE?: string;
}

export interface LeaveLengthResult {
  LEAVE_LENGTH?: string | number;
}

export interface ApproverInput {
  personId: string;
  localName: string;
  empId: string;
}

export interface AttBatchSavePayload {
  applyNo?: string | number;
  personId: string;
  localName: string;
  leaveTypeCode: string;
  leaveFromTime: string;
  leaveToTime: string;
  applyLength: string;
  leaveReason: string;
  approvers?: ApproverInput[];
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ImportResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

const LIST_URL = '/ar/attendanceMintenance/api/leaveApply/list';
const CALC_LENGTH_URL = '/ar/attendanceMintenance/api/leaveApply/calcLeaveLength';
const EMP_DEFAULT_INFO_URL = '/ar/attendanceMintenance/api/leaveApply/empDefaultInfo';
const SAVE_URL = '/ar/attendanceMintenance/api/leaveApply/save';
const RESUBMIT_URL = '/ar/attendanceMintenance/api/leaveApply/resubmit';
const CANCEL_URL = '/ar/attendanceMintenance/api/leaveApply/cancel';
const IMPORT_URL = '/sy/excel/api/importTemplate';
export const IMPORT_TEMPLATE_NAME = 'AttendanceApply_add_Template';
export const DOWNLOAD_TEMPLATE_URL = `/sy/excel/api/downloadTemplate?templateName=${IMPORT_TEMPLATE_NAME}`;

/**
 * HR/quản lý xem+xin nghỉ phép hàng loạt thay bất kỳ nhân viên nào - port lại
 * từ ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList.html (đã xoá).
 * Gọi lại nguyên vẹn các endpoint REST sẵn có của EssLeaveApplyController
 * (dùng chung với trang tương đương ở module `ar`, chưa migrate). Khác với
 * Batch K (OT): backend `saveLeaveApply` ưu tiên dùng approvers do người
 * dùng tự thêm nếu có (không rơi vào nhánh auto-lookup GET_AFFIRMOR_LIST_IMPROVE
 * đang lỗi) - vì trang này luôn bắt buộc chọn người phê duyệt trước khi lưu
 * dòng mới nên "Lưu" sẽ không gặp lỗi thiếu hàm PL/SQL đó; chỉ "Lưu lại đơn
 * đã duyệt" (resubmit, không gửi approvers) mới rơi vào nhánh auto-lookup.
 */
@Injectable({ providedIn: 'root' })
export class ApplyAttBatchService {
  private readonly http = inject(HttpClient);

  getList(filter: AttBatchFilter): Promise<AttBatchRow[]> {
    return firstValueFrom(this.http.get<AttBatchRow[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }));
  }

  calcLeaveLength(personId: string, fromTime: string, toTime: string, leaveTypeCode: string): Promise<LeaveLengthResult> {
    return firstValueFrom(
      this.http.get<LeaveLengthResult>(CALC_LENGTH_URL, { params: { personId, fromTime, toTime, leaveTypeCode } }),
    );
  }

  getEmpDefaultInfo(personId: string): Promise<EmpDefaultInfo> {
    return firstValueFrom(this.http.get<EmpDefaultInfo>(EMP_DEFAULT_INFO_URL, { params: { personId } }));
  }

  save(payload: AttBatchSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  resubmit(payload: AttBatchSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(RESUBMIT_URL, payload));
  }

  cancel(applyNo: string | number): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(CANCEL_URL, { applyNo }));
  }

  importTemplate(file: File): Promise<ImportResponse> {
    const form = new FormData();
    form.append('templateName', IMPORT_TEMPLATE_NAME);
    form.append('file', file);
    return firstValueFrom(this.http.post<ImportResponse>(IMPORT_URL, form));
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
