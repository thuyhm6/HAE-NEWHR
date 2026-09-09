import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ArCalenderRow {
  ddate?: string;
  ddateStr?: string;
  ddateFormatted?: string;
  iyear?: number;
  imonth?: number;
  iday?: number;
  cpnyId?: string;
  companyName?: string;
  shiftNo?: string;
  shiftName?: string;
  typeid?: string;
  typeidName?: string;
  overtypeid?: string;
  typeidDefault?: string;
  operationId?: string;
  workdayflag?: number;
  statutoryFlag?: number;
  remark?: string;
  orderno?: number;
  activity?: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const HOLIDAYS_URL = '/ar/attendanceSettings/api/calender/holidays';
const HOLIDAY_DETAIL_URL = '/ar/attendanceSettings/api/calender/holidays/detail';
const HOLIDAY_SAVE_URL = '/ar/attendanceSettings/api/calender/holidays/save';
const HOLIDAY_DELETE_URL = '/ar/attendanceSettings/api/calender/holidays/delete';

/** Ca làm việc mặc định gán cứng cho mọi ngày lễ pháp định, giữ nguyên như
 * bản gốc viewStatutoryHolidays.html (shiftNo cố định '14015838'). */
export const STATUTORY_DEFAULT_SHIFT_NO = '14015838';

/**
 * CRUD phẳng "Ngày lễ pháp định" - port lại từ
 * ar/attendanceSettings/viewStatutoryHolidays.html (đã xoá). Danh sách nhỏ
 * (cấu hình hệ thống theo năm) nên dùng nz-table phân trang phía client.
 */
@Injectable({ providedIn: 'root' })
export class StatutoryHolidaysService {
  private readonly http = inject(HttpClient);

  getList(iyear?: string, imonth?: string, keyword?: string): Promise<ArCalenderRow[]> {
    const params: Record<string, string> = {};
    if (iyear) params['iyear'] = iyear;
    if (imonth) params['imonth'] = imonth;
    if (keyword) params['keyword'] = keyword;
    return firstValueFrom(this.http.get<ArCalenderRow[]>(HOLIDAYS_URL, { params }));
  }

  getByPk(ddateStr: string): Promise<ArCalenderRow> {
    return firstValueFrom(this.http.get<ArCalenderRow>(HOLIDAY_DETAIL_URL, { params: { ddateStr } }));
  }

  save(payload: ArCalenderRow): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(HOLIDAY_SAVE_URL, payload));
  }

  delete(ddateStr: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(HOLIDAY_DELETE_URL, { params: { ddateStr } }));
  }
}
