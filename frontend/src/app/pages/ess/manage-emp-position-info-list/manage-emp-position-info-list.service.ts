import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ManageEmpPositionInfoDto {
  empId?: string;
  localName?: string;
  personId?: string;
  personSupplierCompany?: string;
  nationalityCode?: string;
  nationalityName?: string;
  postFamily?: string;
  postFamilyName?: string;
  empTypeCode?: string;
  empTypeName?: string;
  dutyNo?: string;
  dutyName?: string;
  position?: string;
  positionName?: string;
  positionNoName?: string;
  employeeOwned?: string;
  deptName?: string;
  deptNo?: string;
  orgNameLocal?: string;
  managerEmpName?: string;
  postGradeNo?: string;
  mainBusiness?: string;
  dateStarted?: string;
  managerName?: string;
  empOffice?: string;
  empOfficeName?: string;
  photoPath?: string;
}

export interface ManageEmpPositionInsideDto {
  personId?: string;
  startDate?: string;
  deptName?: string;
  mainBusiness?: string;
  postGrade?: string;
  transCode?: string;
}

export interface ManageEmpPositionFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  postFamily?: string;
  empTypeCode?: string;
  empOffice?: string;
  nationalityCode?: string;
  asOfDate?: string;
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

const LIST_URL = '/ess/viewDept/api/manageEmpPositionInfo/list';
const INSIDE_EXPERIENCE_URL = '/ess/viewDept/api/manageEmpPositionInfo/insideExperience';
const EXPORT_URL = '/ess/viewDept/api/manageEmpPositionInfo/export';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang ManageEmpPositionInfoList
 * (không đổi backend, trừ 1 endpoint mới /export để xuất Excel .xlsx) - port
 * lại từ ess/viewDept/ManageEmpPositionInfoList.html (Thymeleaf + DataTables)
 * sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class ManageEmpPositionInfoService {
  private readonly http = inject(HttpClient);

  getList(filter: ManageEmpPositionFilter): Promise<ManageEmpPositionInfoDto[]> {
    return firstValueFrom(
      this.http.get<ManageEmpPositionInfoDto[]>(LIST_URL, { params: this.toHttpParams(filter) }),
    );
  }

  getInsideExperienceList(personId: string): Promise<ManageEmpPositionInsideDto[]> {
    return firstValueFrom(
      this.http.get<ManageEmpPositionInsideDto[]>(INSIDE_EXPERIENCE_URL, { params: { personId } }),
    );
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(
      this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }),
    );
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  buildExportUrl(filter: ManageEmpPositionFilter): string {
    const params = this.toHttpParams(filter);
    const query = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    return query ? `${EXPORT_URL}?${query}` : EXPORT_URL;
  }

  private toHttpParams(filter: ManageEmpPositionFilter): Record<string, string> {
    const params: Record<string, string> = {};
    (Object.keys(filter) as (keyof ManageEmpPositionFilter)[]).forEach((key) => {
      const value = filter[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params;
  }
}
