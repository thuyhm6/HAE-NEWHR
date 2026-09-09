import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArCalenderRow, SaveResponse } from '../statutory-holidays/statutory-holidays.service';

export interface ShiftOption {
  shiftNo?: string;
  nameVi?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

/** Mã cha (parent code) của nhóm TypeID/OvertypeID/TypeID mặc định trong
 * modal Lịch công ty, giữ nguyên theo `data-parent-code="1439"` ở bản gốc. */
export const COMPANY_CALENDAR_TYPE_PARENT_CODE = '1439';

const MONTH_URL = '/ar/attendanceSettings/api/calender/month';
const HOLIDAY_DETAIL_URL = '/ar/attendanceSettings/api/calender/holidays/detail';
const HOLIDAY_SAVE_URL = '/ar/attendanceSettings/api/calender/holidays/save';
const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const CODE_LIST_URL = '/sys/api/getCode/list';

/**
 * Lịch công ty (dạng calendar-grid, không phải bảng) - port lại từ
 * ar/attendanceSettings/viewCompanyCalendar.html (đã xoá). Dùng chung API
 * `.../api/calender/holidays/{detail,save}` với StatutoryHolidaysService vì
 * bản gốc tái sử dụng đúng 2 endpoint đó cho cả 2 trang (tên endpoint
 * "holidays" nhưng thực chất lưu MỌI ngày trong AR_CALENDER, không riêng
 * ngày lễ).
 */
@Injectable({ providedIn: 'root' })
export class CompanyCalendarService {
  private readonly http = inject(HttpClient);

  getMonth(year: number, month: number): Promise<ArCalenderRow[]> {
    return firstValueFrom(this.http.get<ArCalenderRow[]>(MONTH_URL, { params: { year, month } }));
  }

  getByPk(ddateStr: string): Promise<ArCalenderRow> {
    return firstValueFrom(this.http.get<ArCalenderRow>(HOLIDAY_DETAIL_URL, { params: { ddateStr } }));
  }

  save(payload: ArCalenderRow): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(HOLIDAY_SAVE_URL, payload));
  }

  getShiftList(): Promise<ShiftOption[]> {
    return firstValueFrom(this.http.get<ShiftOption[]>(SHIFT_URL));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }
}
