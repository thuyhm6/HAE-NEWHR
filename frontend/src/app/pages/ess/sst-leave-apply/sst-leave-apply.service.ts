import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApproverSaveItem } from '../../../shared/approver-chain/approver-chain.service';
import { EssApplyResponse } from '../../../shared/ess-apply-response';

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

/** getEmpVacInfoSST */
export interface VacationInfo {
  TOT_VAC_CNT?: string | number;
  YEAR_VAC_CNT?: string | number;
  LAST_YEAR_VAC?: string | number;
  ADD_VAC?: string | number;
  USE_VAC?: string | number;
  VAC_YN?: string | number;
  REMAIN_VAC?: string | number;
}

/** GET_AR_LEAVE_LENGTH + AR_GET_DAY_HOURS */
export interface LeaveLengthResult {
  applyLength?: string;
  dayHours?: string;
}

export interface SstLeaveSavePayload {
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
  approvers: ApproverSaveItem[];
}


const CODE_LIST_URL = '/sys/api/getCode/list';
const VACATION_INFO_URL = '/ess/infoApplyAttendance/api/vacationInfo';
const LEAVE_LENGTH_URL = '/ess/infoApplyAttendance/api/applyAttBatch/leaveLength';
const CHECK_LEAVE_SEX_URL = '/ess/infoApplyAttendance/api/applyAttBatch/checkLeaveSex';
const SAVE_URL = '/ess/infoApplyAttendance/api/sstLeave/save';

export const LEAVE_TYPE_PARENT_CODE = '21';

/**
 * API cho form xin nghỉ phép của chính nhân viên đăng nhập
 * (/ess/infoApplyAttendance/viewSSTApplyAttendance - port JSP Hanwha_HAE).
 * Tái sử dụng endpoint tính thời lượng / kiểm tra giới tính của màn hình
 * viewApplyAttBatchByAnyApproverList (cùng hàm GET_AR_LEAVE_LENGTH, getLeaveDateSST
 * ở bản cũ); lưu qua /api/sstLeave/save (addLeaveApplySST).
 */
@Injectable({ providedIn: 'root' })
export class SstLeaveApplyService {
  private readonly http = inject(HttpClient);

  getLeaveTypeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: LEAVE_TYPE_PARENT_CODE } }));
  }

  getVacationInfo(): Promise<VacationInfo> {
    return firstValueFrom(this.http.get<VacationInfo>(VACATION_INFO_URL));
  }

  /** fromTime/toTime: YYYY-MM-DD HH:mm */
  getLeaveLength(personId: string, fromTime: string, toTime: string, leaveTypeCode: string): Promise<LeaveLengthResult> {
    return firstValueFrom(
      this.http.get<LeaveLengthResult>(LEAVE_LENGTH_URL, { params: { personId, fromTime, toTime, leaveTypeCode } }),
    );
  }

  checkLeaveSex(personId: string, leaveTypeCode: string): Promise<{ valid: boolean; messageKey?: string }> {
    return firstValueFrom(
      this.http.get<{ valid: boolean; messageKey?: string }>(CHECK_LEAVE_SEX_URL, { params: { personId, leaveTypeCode } }),
    );
  }

  save(payload: SstLeaveSavePayload): Promise<EssApplyResponse> {
    return firstValueFrom(this.http.post<EssApplyResponse>(SAVE_URL, payload));
  }
}
