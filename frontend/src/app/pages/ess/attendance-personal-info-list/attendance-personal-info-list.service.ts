import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AttendancePersonalRow {
  pkNo?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  itemNo?: string;
  itemName?: string;
  arDateStr?: string;
  indoorTime?: string;
  outdoorTime?: string;
  workHour?: string;
}

export interface AttendancePersonalFilter {
  startDate?: string;
  endDate?: string;
  itemNoSearch?: string;
}

export interface AttendanceItemOption {
  itemNo: string;
  itemName?: string;
}

const LIST_URL = '/ess/infoApplyAttendance/api/attendancePersonal/list';
const ITEMS_URL = '/ess/infoApplyAttendance/api/attendancePersonal/items';

/**
 * NV tự tra cứu lịch sử chấm công cá nhân (đi trễ/về sớm/quên quẹt thẻ...) -
 * port lại từ ess/infoApplyAttendance/viewAttendancePersonalInfoList.html
 * (Thymeleaf, đã xoá) sang Angular + NG-ZORRO. Gọi lại nguyên vẹn API JSON
 * sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class AttendancePersonalInfoListService {
  private readonly http = inject(HttpClient);

  getList(filter: AttendancePersonalFilter): Promise<AttendancePersonalRow[]> {
    return firstValueFrom(this.http.get<AttendancePersonalRow[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }));
  }

  getItemOptions(): Promise<AttendanceItemOption[]> {
    return firstValueFrom(this.http.get<AttendanceItemOption[]>(ITEMS_URL));
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
