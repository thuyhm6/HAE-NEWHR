import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ArEmpCalenderRow {
  arDateStr?: string;
  ddateStr?: string;
  iyear?: number;
  imonth?: number;
  iday?: number;
  workdayflag?: number;
  statutoryFlag?: number;
  overtypeid?: string;
  typeidDefault?: string;
  remark?: string;
  shiftNo?: string;
  typeid?: string;
  shiftName?: string;
  typeidName?: string;
  personId?: string;
  empId?: string;
  localName?: string;
}

const MONTH_URL = '/ar/attendanceSettings/api/calender/emp/month';

/**
 * Lịch cá nhân (Emp Calendar) - port lại từ
 * ar/attendanceSettings/viewEmpCalendar.html (đã xoá). CHỈ XEM (read-only):
 * bản gốc có modal "Cập nhật lịch cá nhân" khi click vào 1 ngày, nhưng toàn
 * bộ vùng lịch bị JS tự khoá click (`pointer-events:none`) khi biến toàn cục
 * `sysMode` khác `'hrm'` - biến này KHÔNG BAO GIỜ được gán ở bất kỳ đâu
 * trong dự án HAE-VHR (đã grep xác nhận), nên trong thực tế luôn rơi vào
 * nhánh mặc định `'ess'` và tính năng click-để-sửa KHÔNG BAO GIỜ hoạt động
 * trên bản HAE-VHR hiện tại. Vì vậy bản Angular chỉ port đúng phần đang thực
 * sự chạy: xem lịch cá nhân + chọn xem lịch của nhân viên khác (nếu có
 * quyền, do backend `resolvePersonIdForRequest` tự quyết định - người dùng
 * thường luôn chỉ thấy lịch của chính mình bất kể chọn gì).
 */
@Injectable({ providedIn: 'root' })
export class EmpCalendarService {
  private readonly http = inject(HttpClient);

  getMonth(year: number, month: number, personId?: string): Promise<ArEmpCalenderRow[]> {
    const params: Record<string, string> = { year: String(year), month: String(month) };
    if (personId) params['personId'] = personId;
    return firstValueFrom(this.http.get<ArEmpCalenderRow[]>(MONTH_URL, { params }));
  }
}
