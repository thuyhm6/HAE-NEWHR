import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DataTablesResponse } from '../card-record-for-self/card-record-for-self.service';

export interface CardRecordDayRow {
  empId?: string;
  localName?: string;
  deptTeam?: string;
  deptName?: string;
  postGradeNoName?: string;
  arDateStr?: string;
  inDay?: string;
  inTime?: string;
  outDay?: string;
  outTime?: string;
  leaveContent?: string;
  shiftName?: string;
  shiftTime?: string;
  changeShiftPerson?: string;
  eatTimes?: string;
}

export interface CardRecordDayFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  shiftNoFilter?: string;
  missingCard?: string;
}

export interface ShiftOption {
  shiftNo?: string;
  nameVi?: string;
}

const LIST_URL = '/ar/attendanceMintenance/api/cardRecordDay/list';
const SHIFT_URL = '/ar/attendanceSettings/api/shift';

/**
 * Tra cứu tổng hợp quẹt thẻ theo ca làm (giờ vào/ra, thiếu thẻ, đổi ca) -
 * port lại từ ar/attendanceMintenance/viewArCardRecordDay.html (đã xoá).
 * Không có endpoint exportExcel riêng ở backend (bản gốc dùng DataTables
 * Buttons "excel" ở chế độ serverSide, chỉ xuất được dữ liệu trang hiện tại)
 * - giữ nguyên hạn chế này, xuất Excel phía client bằng SheetJS từ dữ liệu
 * trang đang xem, không cố tải toàn bộ (không có endpoint hỗ trợ).
 */
@Injectable({ providedIn: 'root' })
export class CardRecordDayService {
  private readonly http = inject(HttpClient);

  getPageList(filter: CardRecordDayFilter, draw: number, start: number, length: number): Promise<DataTablesResponse<CardRecordDayRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<CardRecordDayRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: String(draw), start: String(start), length: String(length) }),
      }),
    );
  }

  getShiftOptions(): Promise<ShiftOption[]> {
    return firstValueFrom(this.http.get<ShiftOption[]>(SHIFT_URL));
  }

  private toHttpParams(filter: Record<string, string | undefined>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (value !== undefined && value !== null) {
        params[key] = value;
      }
    });
    return params;
  }
}
