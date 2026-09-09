import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OrgResumeOption {
  no: string;
  resumeName?: string;
  activity?: string;
}

export interface OrgInfoRow {
  resumeNo?: string | null;
  deptNo: string;
  parentDeptNo?: string | null;
  orgNameEng?: string | null;
  orgNameLocal?: string | null;
  deptType?: string | null;
  deptLevel?: number | null;
  managerEmpId?: string | null;
  dateCreated?: string | null;
  isPartTime?: string | null;
  costCenter?: string | null;
  activity?: number | null;
}

export interface OrgEmployeeRow {
  empId: string;
  deptNo?: string | null;
  localName?: string | null;
  dutyNo?: string | null;
  postNo?: string | null;
  empTypeCode?: string | null;
  statusCode?: string | null;
}

export interface OrgCostCenterOption {
  codeNo: string;
  codeName?: string | null;
}

export interface TransferEmployeesPayload {
  resumeNo: string;
  targetDeptNo: string;
  empIds: string[];
}

const BASE_URL = '/org/api';

/**
 * Quản lý cơ cấu tổ chức theo phiên bản thay đổi (viewComposeOrg) - gọi lại nguyên API JSON đã có sẵn ở
 * OrgComposeController (cấu trúc/nhân viên/lưu/xóa/điều chuyển), OrgResumeInfoController (dropdown phiên
 * bản thay đổi) và OrgCostCenterController (dropdown mã chi phí) - không đổi backend.
 */
@Injectable({ providedIn: 'root' })
export class OrgComposeService {
  private readonly http = inject(HttpClient);

  getResumeDropdown(): Promise<OrgResumeOption[]> {
    return firstValueFrom(this.http.get<OrgResumeOption[]>(`${BASE_URL}/resume/dropdown`));
  }

  getOrgStructure(resumeNo: string): Promise<OrgInfoRow[]> {
    return firstValueFrom(this.http.get<OrgInfoRow[]>(`${BASE_URL}/compose/structure`, { params: { resumeNo } }));
  }

  getEmployees(resumeNo: string, deptNo: string): Promise<OrgEmployeeRow[]> {
    return firstValueFrom(
      this.http.get<OrgEmployeeRow[]>(`${BASE_URL}/compose/employees`, { params: { resumeNo, deptNo } }),
    );
  }

  saveOrgInfo(info: OrgInfoRow, isNew: boolean): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${BASE_URL}/compose/save`, info, { params: { isNew: String(isNew) } }),
    );
  }

  deleteOrgInfo(resumeNo: string, deptNo: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${BASE_URL}/compose/delete`, null, { params: { resumeNo, deptNo } }),
    );
  }

  transferEmployees(payload: TransferEmployeesPayload): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${BASE_URL}/compose/transfer`, payload));
  }

  getCostCenters(): Promise<{ data: OrgCostCenterOption[] }> {
    return firstValueFrom(this.http.post<{ data: OrgCostCenterOption[] }>('/org/api/costCenter/list', {}));
  }
}
