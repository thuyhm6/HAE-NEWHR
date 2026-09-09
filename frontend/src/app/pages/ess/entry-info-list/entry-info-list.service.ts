import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EntryInfoRow {
  localName?: string;
  empId?: string;
  deptName?: string;
  deptTeam?: string;
  postGradeNoName?: string;
  arDateStr?: string;
  inDay?: string;
  inTime?: string;
  outDay?: string;
  outTime?: string;
  leaveContent?: string;
  shiftNo?: string;
  shiftName?: string;
  shiftTime?: string;
  changeShiftPerson?: string;
  eatTimes?: string;
}

export interface EntryInfoFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  shiftNoFilter?: string;
  missingCard?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
}

export interface ShiftOption {
  shiftNo?: string;
  nameVi?: string;
  shiftName?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

const LIST_URL = '/ess/viewDept/api/entryInfoList/list';
const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewEntryInfoList (không đổi
 * backend) - port lại từ ess/viewDept/viewEntryInfoList.html (Thymeleaf +
 * DataTables server-side, đã xoá) sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class EntryInfoListService {
  private readonly http = inject(HttpClient);

  getPageList(
    filter: EntryInfoFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<EntryInfoRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<EntryInfoRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  getShiftOptions(): Promise<ShiftOption[]> {
    return firstValueFrom(this.http.get<ShiftOption[]>(SHIFT_URL));
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
