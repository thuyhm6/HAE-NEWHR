import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface MonthDetailRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  dob?: string;
  dutyName?: string;
  dateStarted?: string;
  endProbationDate?: string;
  hcDayOt?: number;
  hcNightOt?: number;
  hcNightOt210?: number;
  restDayOt?: number;
  restNightOt?: number;
  holDayOt?: number;
  holNightOt?: number;
  adminShiftDays?: number;
  nightShiftDays?: number;
  standardWorkDays?: number;
}

export interface MonthDetailFilter {
  keyword?: string;
  quickFilter?: string;
  deptNos?: string;
  empTypeCode?: string;
  month?: string;
  year?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

const LIST_URL = '/ess/tempEmp/api/monthDetailList/list';
const EXPORT_URL = '/ess/tempEmp/api/monthDetailList/export';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewMonthDetailList (không đổi
 * backend) - port lại từ ess/tempEmp/viewMonthDetailList.html (Thymeleaf +
 * DataTables server-side, đã xoá) sang Angular + NG-ZORRO. Xuất báo cáo vẫn
 * dùng href/redirect tới endpoint export sẵn có (backend sinh file báo cáo
 * theo mẫu riêng cho từng reportType) - không dựng lại bằng SheetJS.
 */
@Injectable({ providedIn: 'root' })
export class MonthDetailListService {
  private readonly http = inject(HttpClient);

  getPageList(
    filter: MonthDetailFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<MonthDetailRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<MonthDetailRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  buildExportUrl(filter: MonthDetailFilter, reportType: string, reportYear?: string): string {
    const params = this.toHttpParams({ ...filter, reportType, reportYear });
    const query = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    return query ? `${EXPORT_URL}?${query}` : EXPORT_URL;
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
