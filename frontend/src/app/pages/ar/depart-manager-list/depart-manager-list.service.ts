import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type LockFlagKey =
  | 'lockAttenAnnualFlag'
  | 'lockAttenAnnualNightFlag'
  | 'lockAttenFlag'
  | 'lockAttenNightFlag'
  | 'lockOtFlag'
  | 'lockOtNightFlag'
  | 'lockAttenExFlag'
  | 'lockAttenExNightFlag';

export interface DepartmentManageRow {
  manageNo?: number;
  cpnyId?: string;
  deptNo: string;
  deptName?: string;
  parentDeptNo?: string;
  lockDate?: string;
  lockAttenFlag?: string;
  lockAttenNightFlag?: string;
  lockOtFlag?: string;
  lockOtLimitFlag?: string;
  lockOtNightFlag?: string;
  lockAttenExFlag?: string;
  lockAttenExNightFlag?: string;
  lockAttenAnnualFlag?: string;
  lockAttenAnnualNightFlag?: string;
  updatedBy?: string;
  updateDate?: string;
  dispDeptName?: string;
  deptLevel?: number;
}

export interface DepartmentManageSavePayload {
  deptNo: string;
  lockDate: string;
  lockAttenAnnualFlag: string;
  lockAttenAnnualNightFlag: string;
  lockAttenFlag: string;
  lockAttenNightFlag: string;
  lockOtFlag: string;
  lockOtNightFlag: string;
  lockAttenExFlag: string;
  lockAttenExNightFlag: string;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/departmentManage/list';
const SAVE_URL = '/ar/attendanceSettings/api/departmentManage/save';

/**
 * Quản lý chốt công phòng ban theo ngày (cây phòng ban với 8 cột khóa/mở
 * xin phép: Nghỉ phép năm/Nghỉ phép/Tăng ca/Bất thường x Ca ngày/Ca đêm) -
 * port lại từ ar/attendanceSettings/viewDepartManagerList.html (đã xoá).
 * `lockDate` giữ nguyên định dạng 'yyyy-MM-dd' (comment trong
 * ArDepartmentManageServiceImpl xác nhận "Keep YYYY-MM-DD format as
 * requested"). Chỉ gửi lên các dòng đã thay đổi (isModified) để tiết kiệm
 * băng thông, khớp hành vi bản gốc.
 */
@Injectable({ providedIn: 'root' })
export class DepartManagerListService {
  private readonly http = inject(HttpClient);

  getList(lockDate: string, deptNo?: string): Promise<DepartmentManageRow[]> {
    const params: Record<string, string> = { lockDate };
    if (deptNo) params['deptNo'] = deptNo;
    return firstValueFrom(this.http.get<DepartmentManageRow[]>(LIST_URL, { params }));
  }

  save(payloads: DepartmentManageSavePayload[]): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payloads));
  }
}
