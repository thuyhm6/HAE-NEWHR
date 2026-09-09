import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SaveResponse } from '../statutory-holidays/statutory-holidays.service';
import { ShiftOption, SyCodeOption } from '../company-calendar/company-calendar.service';

export interface ArCalenderGroupRow {
  arDateStr?: string;
  iyear?: number;
  imonth?: number;
  iday?: number;
  workdayflag?: number;
  shiftNo?: number;
  shiftName?: string;
  typeid?: number;
  typeidName?: string;
  overtypeid?: number;
  typeidDefault?: number;
  groupId?: string;
  groupName?: string;
  operationId?: string;
  orderno?: number;
  activity?: number;
}

export interface ArCalenderGroupSavePayload {
  arDateStr: string;
  groupId: string | null;
  workdayflag: number;
  shiftNo: string | null;
  typeid: string | null;
  overtypeid: string | null;
  typeidDefault: string | null;
  operationId: string | null;
  orderno: number;
  activity: number;
}

/** Mã cha (parent code) của danh mục Nhóm ca dùng ở bộ lọc + modal thêm mới
 * hàng loạt, giữ nguyên theo `data-parent-code="400223"` ở bản gốc. */
export const CLASS_CALENDAR_GROUP_PARENT_CODE = '400223';
/** Nhóm ca mặc định khi chưa chọn ở bộ lọc, giữ nguyên `|| '400224'` bản gốc. */
export const CLASS_CALENDAR_DEFAULT_GROUP_ID = '400224';

const MONTH_URL = '/ar/attendanceSettings/api/calender/group/month';
const DETAIL_URL = '/ar/attendanceSettings/api/calender/group/detail';
const BATCH_SAVE_URL = '/ar/attendanceSettings/api/calender/group/batch_save';
const SAVE_URL = '/ar/attendanceSettings/api/calender/group/save';
const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const CODE_LIST_URL = '/sys/api/getCode/list';

/**
 * Lịch Nhóm Ca (Class Calendar) dạng calendar-grid theo tháng, lọc theo 1
 * Nhóm ca - port lại từ ar/attendanceSettings/viewClassCalendar.html (đã
 * xoá). Có 2 chế độ ghi: thêm hàng loạt theo khoảng ngày (gọi thủ tục
 * AR_ADD_CALENDER_DATE_BANCI_P, tham số startDate/endDate bắt buộc định
 * dạng DD-MM-YYYY) và sửa từng ngày đơn lẻ.
 */
@Injectable({ providedIn: 'root' })
export class ClassCalendarService {
  private readonly http = inject(HttpClient);

  getMonth(year: number, month: number, groupId: string): Promise<ArCalenderGroupRow[]> {
    return firstValueFrom(this.http.get<ArCalenderGroupRow[]>(MONTH_URL, { params: { year, month, groupId } }));
  }

  getDetail(arDateStr: string, groupId: string): Promise<ArCalenderGroupRow> {
    return firstValueFrom(this.http.get<ArCalenderGroupRow>(DETAIL_URL, { params: { arDateStr, groupId } }));
  }

  /** startDate/endDate PHẢI ở định dạng DD-MM-YYYY (khớp TO_DATE trong thủ tục AR_ADD_CALENDER_DATE_BANCI_P). */
  saveBatch(startDate: string, endDate: string, groupId: string, workShift: string, restShift: string): Promise<SaveResponse> {
    return firstValueFrom(
      this.http.post<SaveResponse>(BATCH_SAVE_URL, null, { params: { startDate, endDate, groupId, workShift, restShift } }),
    );
  }

  save(payload: ArCalenderGroupSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_URL, payload));
  }

  getShiftList(): Promise<ShiftOption[]> {
    return firstValueFrom(this.http.get<ShiftOption[]>(SHIFT_URL));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }
}
