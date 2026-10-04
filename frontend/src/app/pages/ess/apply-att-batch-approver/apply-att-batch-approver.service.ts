import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AttBatchApproverRow {
  applyNo?: string;
  applyTime?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  shiftNoName?: string;
  dutyNo?: string;
  /** DD/MM/YYYY */
  fromDate?: string;
  /** HH24:MI */
  fromTime?: string;
  /** DD/MM/YYYY */
  toDate?: string;
  /** HH24:MI */
  toTime?: string;
  dayHours?: string;
  leaveReason?: string;
  leaveTypeCode?: string;
  leaveTypeCodeName?: string;
  applyLength?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  confirmFlag?: string;
  createdBy?: string;
  totVacCnt?: string;
  shengyuVacCnt?: string;
  sexCode?: string;
}

export interface AttBatchApproverFilter {
  keyword?: string;
  deptNo?: string;
  shiftNo?: string;
  leaveTypeCode?: string;
  affirmFlag?: string;
  confirmFlag?: string;
  /** YYYY-MM-DD */
  startDate?: string;
  /** YYYY-MM-DD */
  endDate?: string;
}

export interface AttBatchAffirmor {
  applyNo?: string;
  affirmType?: string;
  affirmLevel?: string;
  affirmPersonId?: string;
  affirmorId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  positionName?: string;
}

export interface AttBatchApproverSaveItem {
  applyNo: string;
  personId: string;
  empId: string;
  localName: string;
  leaveTypeCode: string;
  /** YYYY-MM-DD HH:mm */
  leaveFromTime: string;
  /** YYYY-MM-DD HH:mm */
  leaveToTime: string;
  applyLength: string;
  leaveReason: string;
  approvers: { personId: string; empId: string; localName: string; approvType: string }[];
}

export interface AttBatchApproverResponse {
  success: boolean;
  messageKey?: string;
  suffix?: string;
  message?: string;
}

const BASE_URL = '/ess/infoApplyAttendance/api/applyAttBatch';

/**
 * Xin nghỉ phép hàng loạt (chọn người duyệt tùy ý) -
 * /ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList.
 * Gọi các endpoint của EssInfoApplyAttendanceController (/api/applyAttBatch/*),
 * port lại từ ApplyAttendanceCtroller của dự án Hanwha_HAE.
 */
@Injectable({ providedIn: 'root' })
export class ApplyAttBatchApproverService {
  private readonly http = inject(HttpClient);

  getList(filter: AttBatchApproverFilter): Promise<AttBatchApproverRow[]> {
    return firstValueFrom(this.http.get<AttBatchApproverRow[]>(`${BASE_URL}/list`, { params: this.toHttpParams({ ...filter }) }));
  }

  getAffirmors(applyNos: string[]): Promise<Record<string, AttBatchAffirmor[]>> {
    return firstValueFrom(this.http.post<Record<string, AttBatchAffirmor[]>>(`${BASE_URL}/affirmors`, applyNos));
  }

  getDefaultAffirmors(personId: string, leaveTypeCode: string, applyLength: string): Promise<AttBatchAffirmor[]> {
    return firstValueFrom(
      this.http.get<AttBatchAffirmor[]>(`${BASE_URL}/defaultAffirmors`, {
        params: this.toHttpParams({ personId, leaveTypeCode, applyLength }),
      }),
    );
  }

  /** applyDate: YYYY-MM-DD */
  getEmpInfo(personId: string, applyDate: string): Promise<AttBatchApproverRow> {
    return firstValueFrom(this.http.get<AttBatchApproverRow>(`${BASE_URL}/empInfo`, { params: { personId, applyDate } }));
  }

  /** fromTime/toTime: YYYY-MM-DD HH:mm */
  getLeaveLength(personId: string, fromTime: string, toTime: string, leaveTypeCode: string): Promise<AttBatchApproverRow> {
    return firstValueFrom(
      this.http.get<AttBatchApproverRow>(`${BASE_URL}/leaveLength`, {
        params: this.toHttpParams({ personId, fromTime, toTime, leaveTypeCode }),
      }),
    );
  }

  checkLeaveSex(personId: string, leaveTypeCode: string): Promise<{ valid: boolean; messageKey?: string }> {
    return firstValueFrom(
      this.http.get<{ valid: boolean; messageKey?: string }>(`${BASE_URL}/checkLeaveSex`, { params: { personId, leaveTypeCode } }),
    );
  }

  save(items: AttBatchApproverSaveItem[]): Promise<AttBatchApproverResponse> {
    return firstValueFrom(this.http.post<AttBatchApproverResponse>(`${BASE_URL}/save`, { items }));
  }

  delete(applyNos: string[]): Promise<AttBatchApproverResponse> {
    return firstValueFrom(this.http.post<AttBatchApproverResponse>(`${BASE_URL}/delete`, applyNos));
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
