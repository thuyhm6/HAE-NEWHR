import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ManageCountItem {
  code?: string;
  label?: string;
  count?: number;
}

export interface ManageCountInfoSummary {
  totalCount: number;
  byGender: ManageCountItem[];
  byEmpType: ManageCountItem[];
  byDept: ManageCountItem[];
  byPostFamily: ManageCountItem[];
  byPostGrade: ManageCountItem[];
  byAge: ManageCountItem[];
}

export interface ManageCountInfoEmpRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  postFamilyName?: string;
  postGradeNo?: string;
  empTypeName?: string;
  dob?: string;
  sexName?: string;
  dateStarted?: string;
  empOfficeName?: string;
}

export interface ManageCountInfoFilter {
  keyword?: string;
  deptNos?: string;
  postFamily?: string;
  empTypeCode?: string;
  empOffice?: string;
  asOfDate?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
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

const SUMMARY_URL = '/ess/viewDept/api/manageCountInfo/summary';
const LIST_URL = '/ess/viewDept/api/manageCountInfo/list';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang ManageCountInfoList (không đổi
 * backend) - port lại từ ess/viewDept/ManageCountInfoList.html (Thymeleaf,
 * đã xoá) sang Angular + NG-ZORRO. Trang này là trang đầu tiên dùng phân
 * trang server-side (endpoint /list vẫn trả về DataTablesResponse - hợp đồng
 * draw/start/length kiểu jQuery DataTables cũ).
 */
@Injectable({ providedIn: 'root' })
export class ManageCountInfoListService {
  private readonly http = inject(HttpClient);

  getSummary(filter: ManageCountInfoFilter): Promise<ManageCountInfoSummary> {
    return firstValueFrom(
      this.http.get<ManageCountInfoSummary>(SUMMARY_URL, { params: this.toHttpParams({ ...filter }) }),
    );
  }

  getPageList(
    filter: ManageCountInfoFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<ManageCountInfoEmpRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<ManageCountInfoEmpRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
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
