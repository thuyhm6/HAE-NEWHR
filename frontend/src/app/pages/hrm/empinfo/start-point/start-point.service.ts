import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  error?: string;
}

export interface EmployeeSearchResultVsp {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
}

export interface DecisionRow {
  seq?: number;
  personId?: string;
  transCode?: string;
  transCodeName?: string;
  startDate?: string;
  deptno?: string;
  deptName?: string;
  empTypeCode?: string;
  employeeBelong?: string;
  empOffice?: string;
  endProbationDate?: string;
  postGradeNo?: string;
  postFamily?: string;
  jobType?: string;
  dutyNo?: string;
  workHourType?: string;
  wageType?: string;
  remark?: string;
  positionNo?: string;
  mainBusiness?: string;
  transResource?: string;
  costCenter?: string;
  payStepNo?: string;
  position?: string;
  empId?: string;
  localName?: string;
}

export interface DecisionSavePayload {
  seq?: number | null;
  personId: string;
  transCode: string;
  startDate: string;
  deptno?: string;
  empTypeCode?: string;
  postFamily?: string;
  postGradeNo?: string;
  positionNo?: string;
  employeeBelong?: string;
  empOffice?: string;
  endProbationDate?: string;
  jobType?: string;
  dutyNo?: string;
  workHourType?: string;
  wageType?: string;
  mainBusiness?: string;
  transResource?: string;
  costCenter?: string;
  payStepNo?: string;
  position?: string;
  remark?: string;
}

export interface SaveResult {
  success?: boolean;
  message?: string;
  seq?: number;
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

const BASE_URL = '/hrm/empinfo/api/startpoint';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Quyết định nhân sự (viewStartPoint) - port lại từ
 * hrm/empinfo/viewStartPoint.html (đã xoá). Master-detail: tìm 1 nhân viên
 * (API trả về đúng 1 kết quả, không phải danh sách) + danh sách quyết định
 * phân trang (POST body phẳng {draw,start,length,personId}, không lồng
 * searchParams) + form chi tiết với nhiều select phụ thuộc lẫn nhau (dùng
 * lại /sys/api/getCode/list?parentCodeNo= đã có sẵn ở dự án).
 */
@Injectable({ providedIn: 'root' })
export class StartPointService {
  private readonly http = inject(HttpClient);

  searchEmployee(keyword: string): Promise<EmployeeSearchResultVsp> {
    return firstValueFrom(this.http.get<EmployeeSearchResultVsp>(`${BASE_URL}/employee/search`, { params: { keyword } }));
  }

  getDecisionList(personId: string, draw: number, start: number, length: number): Promise<DataTablesResponse<DecisionRow>> {
    return firstValueFrom(
      this.http.post<DataTablesResponse<DecisionRow>>(`${BASE_URL}/decisions/list`, { draw, start, length, personId }),
    );
  }

  getDecisionDetail(seq: number): Promise<DecisionRow> {
    return firstValueFrom(this.http.get<DecisionRow>(`${BASE_URL}/decisions/detail`, { params: { seq } }));
  }

  saveDecision(payload: DecisionSavePayload): Promise<SaveResult> {
    return firstValueFrom(this.http.post<SaveResult>(`${BASE_URL}/decisions/save`, payload));
  }

  deleteDecision(seq: number): Promise<SaveResult> {
    return firstValueFrom(this.http.post<SaveResult>(`${BASE_URL}/decisions/delete`, null, { params: { seq } }));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    if (!parentCodeNo) return Promise.resolve([]);
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  buildExportUrl(personId: string, localName: string): string {
    return `${BASE_URL}/decisions/export?personId=${encodeURIComponent(personId)}&localName=${encodeURIComponent(localName)}`;
  }
}
