import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface MyInfo {
  personId?: string;
  localName?: string;
  sexCode?: string;
  empId?: string;
  deptName?: string;
  headDepartment?: string;
  postFamilyName?: string;
  dutyName?: string;
  positionNoName?: string;
  dateStarted?: string;
}

export interface VacationInfo {
  TOT_VAC_CNT?: string | number;
  YEAR_VAC_CNT?: string | number;
  LAST_YEAR_VAC?: string | number;
  ADD_VAC?: string | number;
  USE_VAC?: string | number;
  REMAIN_VAC?: string | number;
}

export interface LeaveLengthResult {
  LEAVE_LENGTH?: string | number;
  DAY_HOUR?: string | number;
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

export interface ApproverInput {
  personId: string;
  localName: string;
  empId: string;
  /** AFFIRM_TYPE bên backend: '1' = Phê duyệt, '3' = Thông báo */
  approvType: string;
}

export interface LeaveApplySavePayload {
  applyNo: string;
  personId: string;
  localName: string;
  leaveTypeCode: string;
  leaveFromTime: string;
  leaveToTime: string;
  applyLength: null;
  leaveReason: string;
  approvers: ApproverInput[];
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const CODE_LIST_URL = '/sys/api/getCode/list';
const MY_INFO_URL = '/ess/empinfo/api/personalInfo/myInfo';
const VACATION_INFO_URL = '/ess/infoApplyAttendance/api/vacationInfo';
const LEAVE_LENGTH_URL = '/ess/infoApplyAttendance/api/leaveLength';
const EMPLOYEE_SEARCH_URL = '/hrm/empinfo/api/employee/search';
const SAVE_URL = '/ar/attendanceMintenance/api/leaveApply/save';

export const LEAVE_TYPE_PARENT_CODE = '21';

/** Giá trị AFFIRM_TYPE bên backend (SY_AFFIRM_EMAIL): '1' = Phê duyệt, '3' = Thông báo */
export const APPROV_TYPE_APPROVAL = '1';
export const APPROV_TYPE_NOTICE = '3';

/**
 * Form tạo đơn xin nghỉ phép mới cho bản thân - port lại từ
 * ess/infoApplyAttendance/viewSSTApplyAttendance.html (Thymeleaf, đã xoá)
 * sang Angular + NG-ZORRO. Thay EmployeeSearchModal (jQuery, chưa có bản
 * Angular) bằng nz-select tìm kiếm server-side chọn người phê duyệt, tái
 * dụng API tìm nhân viên sẵn có (giống ChangeUserComponent). Gọi lại nguyên
 * vẹn API JSON sẵn có. Bản gốc có biến JS giữ danh sách file đính kèm nhưng
 * không có UI đính kèm file thật (dead code, không gọi upload) nên không
 * port phần đó.
 */
@Injectable({ providedIn: 'root' })
export class SstLeaveApplyService {
  private readonly http = inject(HttpClient);

  getLeaveTypeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: LEAVE_TYPE_PARENT_CODE } }));
  }

  getMyInfo(): Promise<MyInfo> {
    return firstValueFrom(this.http.get<MyInfo>(MY_INFO_URL));
  }

  getVacationInfo(): Promise<VacationInfo> {
    return firstValueFrom(this.http.get<VacationInfo>(VACATION_INFO_URL));
  }

  getLeaveLength(fromDateTime: string, toDateTime: string, leaveTypeCode: string): Promise<LeaveLengthResult> {
    return firstValueFrom(
      this.http.get<LeaveLengthResult>(LEAVE_LENGTH_URL, { params: { fromDateTime, toDateTime, leaveTypeCode } }),
    );
  }

  searchEmployees(keyword: string): Promise<EmployeeSearchResult[]> {
    return firstValueFrom(this.http.get<EmployeeSearchResult[]>(EMPLOYEE_SEARCH_URL, { params: { keyword } }));
  }

  save(payload: LeaveApplySavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }
}
