import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OtAttendanceReportRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  shiftName?: string;
  itemName?: string;
  arDateStr?: string;
  indoorTime?: string;
  outdoorTime?: string;
  fromDate?: string;
  toTime?: string;
  quantity?: string;
  unit?: string;
  remark?: string;
  statusName?: string;
}

export interface OtAttendanceReportFilter {
  keyword?: string;
  deptNos?: string;
  startDate?: string;
  endDate?: string;
  shiftNo?: string;
  itemNoSearch?: string;
  postFamily?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[] | null;
  error?: string | null;
}

export interface OtItemOption {
  itemNoCode: string;
  itemName?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface ShiftOption {
  shiftNo?: string;
  shiftName?: string;
  nameVi?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

const POST_FAMILY_PARENT_CODE = '14015812';

/**
 * Báo cáo tăng ca theo phòng ban (server-side DataTables) - dùng chung cho 2
 * trang gần như trùng lặp 100% ở tầng backend (cùng field DTO, cùng cấu trúc
 * cột): ess/infoApply/viewCoordApplyOtInfoList.html (điều phối viên tra cứu
 * tăng ca thường) và ess/infoApply/viewApplyOTBatchInfoHAEList.html (báo cáo
 * chi tiết tăng ca vượt), cả 2 đã xoá. `apiBase` do route truyền vào qua
 * route data để chọn đúng bộ API (`/coordOt` hoặc `/otBatchHAE`), tránh viết
 * lại cùng 1 component 2 lần.
 */
@Injectable({ providedIn: 'root' })
export class OtAttendanceReportListService {
  private readonly http = inject(HttpClient);

  getPageList(
    apiBase: string,
    filter: OtAttendanceReportFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<OtAttendanceReportRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<OtAttendanceReportRow>>(`${apiBase}/list`, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  getItemOptions(apiBase: string): Promise<OtItemOption[]> {
    return firstValueFrom(this.http.get<OtItemOption[]>(`${apiBase}/items`));
  }

  getShiftOptions(): Promise<ShiftOption[]> {
    return firstValueFrom(this.http.get<ShiftOption[]>(SHIFT_URL));
  }

  getPostFamilyOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: POST_FAMILY_PARENT_CODE } }));
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
