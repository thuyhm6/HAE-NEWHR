import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ManageEvsResultEmpDto {
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  orderNo?: string;
  dateStarted?: string;
  postFamily?: string;
  empTypeCode?: string;
  empOffice?: string;
  evsYear?: string;
  evsMonth1?: string;
  evsMonth2?: string;
  evsMonth3?: string;
  evsMonth4?: string;
  evsMonth5?: string;
  evsMonth6?: string;
  evsMonth7?: string;
  evsMonth8?: string;
  evsMonth9?: string;
  evsMonth10?: string;
  evsMonth11?: string;
  evsMonth12?: string;
  evsMonth13?: string;
}

export interface ManageEvsResultEmpFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  year?: string;
  postFamily?: string;
  empTypeCode?: string;
  empOffice?: string;
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

const LIST_URL = '/ess/viewDept/api/manageEvsResultEmp/list';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewManageEvsResultEmpList
 * (không đổi backend) - port lại từ
 * ess/viewDept/viewManageEvsResultEmpList.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class ManageEvsResultEmpListService {
  private readonly http = inject(HttpClient);

  getList(filter: ManageEvsResultEmpFilter): Promise<ManageEvsResultEmpDto[]> {
    return firstValueFrom(
      this.http.get<ManageEvsResultEmpDto[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }),
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
