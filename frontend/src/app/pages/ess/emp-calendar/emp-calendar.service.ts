import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EssPersonalInfoDto {
  personId?: string;
  empId?: string;
  localName?: string;
}

export interface ArEmpCalenderDto {
  arDateStr?: string;
  ddateStr?: string;
  ddateFormatted?: string;
  workdayflag?: number;
  statutoryFlag?: number;
  shiftNo?: string;
  shiftName?: string;
  typeidName?: string;
  remark?: string;
  personId?: string;
  empId?: string;
  localName?: string;
}

const MY_INFO_URL = '/ess/empinfo/api/personalInfo/myInfo';
const CALENDAR_MONTH_URL = '/ar/attendanceSettings/api/calender/emp/month';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewEmpCalendar (không đổi
 * backend) - port lại từ ess/viewDept/viewEmpCalendar.html (Thymeleaf, đã
 * xoá) sang Angular. Tái sử dụng đúng 2 API mà bản Thymeleaf cũ dùng (lấy
 * personId của người đang đăng nhập rồi lấy lịch theo tháng) - đây là lịch cá
 * nhân, chỉ xem, không cho sửa (khác bản HRM ở ar/attendanceSettings có thể
 * click từng ngày để sửa).
 */
@Injectable({ providedIn: 'root' })
export class EmpCalendarService {
  private readonly http = inject(HttpClient);

  getMyInfo(): Promise<EssPersonalInfoDto> {
    return firstValueFrom(this.http.get<EssPersonalInfoDto>(MY_INFO_URL));
  }

  getMonth(year: number, month: number, personId: string): Promise<ArEmpCalenderDto[]> {
    return firstValueFrom(
      this.http.get<ArEmpCalenderDto[]>(CALENDAR_MONTH_URL, { params: { year, month, personId } }),
    );
  }
}
