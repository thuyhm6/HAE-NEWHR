import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CoordApplyAttendanceRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  shiftName?: string;
  itemName?: string;
  quantity?: string;
  unit?: string;
  arDateStr?: string;
  fromDate?: string;
  toTime?: string;
}

export interface CoordApplyAttendanceFilter {
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
  data: T[];
}

export interface AttendanceItemOption {
  itemNo: string;
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

const LIST_URL = '/ess/infoApplyAttendance/api/coordApply/list';
const ITEMS_URL = '/ess/infoApplyAttendance/api/attendancePersonal/items';
const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

const POST_FAMILY_PARENT_CODE = '14015812';

/**
 * Coordinator tra cứu chấm công nhân viên theo phòng ban - port lại từ
 * ess/infoApplyAttendance/viewCoordApplyAttendanceInfoList.html (Thymeleaf +
 * DataTables server-side, đã xoá) sang Angular + NG-ZORRO. Đây là trang duy
 * nhất trong nhóm infoApplyAttendance dùng phân trang server-side thật
 * (draw/start/length) - gọi lại nguyên vẹn API JSON sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class CoordApplyAttendanceListService {
  private readonly http = inject(HttpClient);

  getPageList(
    filter: CoordApplyAttendanceFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<CoordApplyAttendanceRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<CoordApplyAttendanceRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  getItemOptions(): Promise<AttendanceItemOption[]> {
    return firstValueFrom(this.http.get<AttendanceItemOption[]>(ITEMS_URL));
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
