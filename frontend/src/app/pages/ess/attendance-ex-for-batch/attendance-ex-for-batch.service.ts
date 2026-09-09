import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AttendanceExRow {
  applyNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  postGradeName?: string;
  postFamily?: string;
  postFamilyName?: string;
  arDateStr?: string;
  itemNo?: string;
  itemNoName?: string;
  inDoorTime?: string;
  outDoorTime?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  shiftNo?: string;
  shiftName?: string;
  workHour?: string;
  remark?: string;
}

export interface AttendanceExFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  postFamily?: string;
  shiftNo?: string;
  itemNo?: string;
}

export interface ShiftOption {
  shiftNo?: string;
  nameVi?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

export interface EmployeeSearchResult {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
}

export interface ApproverInput {
  personId: string;
  localName: string;
  empId: string;
}

export interface AttendanceExApplyItem {
  applyNo: string;
  personId: string;
  empId: string;
  localName: string;
  itemNo: string;
  arDateStr: string;
  fromDateTime: string;
  toDateTime: string;
  workHour: string;
  remark: string;
  approvers: ApproverInput[];
}

export interface ApplyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ess/infoApplyAttendance/api/attendanceEx/list';
const APPLY_URL = '/ess/infoApplyAttendance/api/attendanceEx/apply';
const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';
const EMPLOYEE_SEARCH_URL = '/hrm/empinfo/api/employee/search';

export const POST_FAMILY_PARENT_CODE = '14015812';

/**
 * HR/quản lý tra cứu chấm công bất thường của nhân viên thuộc phòng ban được
 * phân quyền và xin phép hàng loạt thay họ - port lại từ
 * ess/infoApplyAttendance/viewAttendanceExForBatchInfoList.html (đã xoá).
 * Dùng chung endpoint `apply` với CwaAbnormalApplyComponent (Batch I, cùng
 * `EssAttendanceExForBatchServiceImpl.applyAttendanceExForBatch`) - LƯU Ý:
 * khác với Batch I, mapper `selectAttendanceExForBatchList` trả `arDateStr`
 * ở dạng gốc `yyyy/MM/dd` (không TO_CHAR đổi sang hiển thị), nên khi submit
 * phải giữ nguyên chuỗi này, KHÔNG được áp dụng lại phép convert ngược của
 * Batch I (sẽ làm sai ngày). Endpoint dept-tree/employee-search tái sử dụng
 * nguyên vẹn từ ArPersonalListService/SstOtApplyService.
 */
@Injectable({ providedIn: 'root' })
export class AttendanceExForBatchService {
  private readonly http = inject(HttpClient);

  getList(filter: AttendanceExFilter): Promise<AttendanceExRow[]> {
    return firstValueFrom(this.http.get<AttendanceExRow[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }));
  }

  getShiftOptions(): Promise<ShiftOption[]> {
    return firstValueFrom(this.http.get<ShiftOption[]>(SHIFT_URL));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  searchEmployees(keyword: string): Promise<EmployeeSearchResult[]> {
    return firstValueFrom(this.http.get<EmployeeSearchResult[]>(EMPLOYEE_SEARCH_URL, { params: { keyword } }));
  }

  apply(items: AttendanceExApplyItem[]): Promise<ApplyResponse> {
    return firstValueFrom(this.http.post<ApplyResponse>(APPLY_URL, items));
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
