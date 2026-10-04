import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApproverSaveItem } from '../../../shared/approver-chain/approver-chain.service';
import { EssApplyResponse } from '../../../shared/ess-apply-response';

export interface HrDeptManager {
  PERSON_ID?: string;
  LOCAL_NAME?: string;
  EMP_ID?: string;
  DEPT_NAME?: string;
  POSITION_NAME?: string;
}

/** getOtShiftTime (EssSstApplyDto) */
export interface SstOtShiftTime {
  dateType?: string;
  shiftName?: string;
  /** HH:mm */
  shiftStartTime?: string;
  /** HH:mm */
  shiftEndTime?: string;
  /** YYYY/MM/DD HH:mm */
  arShiftEndTime?: string;
  indoorTime?: string;
  outdoorTime?: string;
  otTotailMonth?: string;
  otTotail?: string;
}

/** getOtLength (EssSstApplyDto) */
export interface SstOtLength {
  otLength?: string;
  otLimitMonth?: string;
  otLimitYear?: string;
}

export interface EmployeeSearchResult {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  position?: string;
  positionName?: string;
}

export interface SstOtSavePayload {
  /** YYYY-MM-DD - ngày chấm công */
  applyOtDate: string;
  /** YYYY-MM-DD HH:mm */
  otFromTime: string;
  /** YYYY-MM-DD HH:mm */
  otToTime: string;
  otTypeCode: string;
  otApplyHour: string;
  applyOtRemark: string;
  offsetYn: string;
  deductYn: string;
  usecarYn: string;
  carAddress: string;
  carAddressDetail: string;
  localName: string;
  empId: string;
  approvers: ApproverSaveItem[];
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

const HR_DEPT_MANAGER_URL = '/ess/infoApply/api/hrDeptManager';
const SHIFT_TIME_URL = '/ess/infoApply/api/sstOt/shiftTime';
const OT_LENGTH_URL = '/ess/infoApply/api/sstOt/length';
const OT_CLASH_URL = '/ess/infoApply/api/sstOt/clash';
const SAVE_URL = '/ess/infoApply/api/sstOt/save';
const EMPLOYEE_SEARCH_URL = '/hrm/empinfo/api/employee/search';
const CODE_LIST_URL = '/sys/api/getCode/list';

export const CAR_ADDRESS_PARENT_CODE = '90000578';
export const OT_TYPE_PARENT_CODE = '31';

/** Giá trị AFFIRM_TYPE bên backend (SY_AFFIRM_EMAIL): '1' = Phê duyệt, '3' = Thông báo */
export const APPROV_TYPE_APPROVAL = '1';
export const APPROV_TYPE_NOTICE = '3';

/**
 * API cho form xin tăng ca của chính nhân viên đăng nhập - dùng chung cho
 * /ess/infoApply/viewSSTOtApplyInfo (tăng ca thường) và viewSSTOtApplyInfoTx
 * (tăng ca vượt, `over = true`), port đúng getOtShiftTime / getOtLength /
 * AR_GET_OT_CLASH / addSSTOvertimeApply / addOtOverApply của Hanwha_HAE.
 * `searchEmployees` + `EmployeeSearchResult` còn được nhiều màn hình khác dùng chung.
 */
@Injectable({ providedIn: 'root' })
export class SstOtApplyService {
  private readonly http = inject(HttpClient);

  getHrDeptManager(): Promise<HrDeptManager> {
    return firstValueFrom(this.http.get<HrDeptManager>(HR_DEPT_MANAGER_URL));
  }

  /** applyDate: YYYY-MM-DD */
  getShiftTime(applyDate: string): Promise<SstOtShiftTime> {
    return firstValueFrom(this.http.get<SstOtShiftTime>(SHIFT_TIME_URL, { params: { applyDate } }));
  }

  /** applyDate: YYYY-MM-DD, otFromTime/otToTime: YYYY-MM-DD HH:mm */
  getOtLength(applyDate: string, otTypeCode: string, otFromTime: string, otToTime: string, deductYn: string): Promise<SstOtLength> {
    return firstValueFrom(
      this.http.get<SstOtLength>(OT_LENGTH_URL, { params: { applyDate, otTypeCode, otFromTime, otToTime, deductYn } }),
    );
  }

  checkClash(otFromTime: string, otToTime: string, offsetYn: string, over: boolean): Promise<{ flag: number }> {
    return firstValueFrom(
      this.http.get<{ flag: number }>(OT_CLASH_URL, { params: { otFromTime, otToTime, offsetYn, over: String(over) } }),
    );
  }

  save(payload: SstOtSavePayload, over: boolean): Promise<EssApplyResponse> {
    return firstValueFrom(this.http.post<EssApplyResponse>(SAVE_URL, payload, { params: { over: String(over) } }));
  }

  searchEmployees(keyword: string): Promise<EmployeeSearchResult[]> {
    return firstValueFrom(this.http.get<EmployeeSearchResult[]>(EMPLOYEE_SEARCH_URL, { params: { keyword } }));
  }

  getCodeOptions(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  getCarAddressOptions(): Promise<SyCodeOption[]> {
    return this.getCodeOptions(CAR_ADDRESS_PARENT_CODE);
  }

  getCarAddressDetailOptions(parentCodeNo: string): Promise<SyCodeOption[]> {
    return this.getCodeOptions(parentCodeNo);
  }
}
