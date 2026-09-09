import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AttendanceRow {
  arDateStr: string;
  itemNo: string;
  itemName: string;
  workHour: number | string;
}

/**
 * Gọi lại nguyên vẹn các API JSON sẵn có của module ESS (không đổi backend)
 * để hiển thị bảng thống kê + biểu đồ chấm công/tăng ca trên dashboard
 * Angular, giống hệt dữ liệu mà login/dashboard.html (Thymeleaf) cũ dùng.
 */
@Injectable({ providedIn: 'root' })
export class DashboardWidgetsService {
  private readonly http = inject(HttpClient);

  getMyLeaveApplyCount(fromYmd: string, toYmd: string): Promise<unknown[]> {
    return firstValueFrom(
      this.http.get<unknown[]>('/ess/infoApplyAttendance/api/myLeaveApply/list', {
        params: { fromDate: fromYmd, toDate: toYmd },
      }),
    );
  }

  getMyOtApplyCount(fromYmd: string, toYmd: string): Promise<unknown[]> {
    return firstValueFrom(
      this.http.get<unknown[]>('/ess/infoApply/api/myOtApply/list', {
        params: { fromDate: fromYmd, toDate: toYmd },
      }),
    );
  }

  getMyCwaAbnormalCount(fromDmy: string, toDmy: string): Promise<unknown[]> {
    return firstValueFrom(
      this.http.get<unknown[]>('/ess/infoApply/api/myCwaAbnormal/list', {
        params: { startDate: fromDmy, endDate: toDmy },
      }),
    );
  }

  getAttendancePersonal(fromDmy: string, toDmy: string): Promise<AttendanceRow[]> {
    return firstValueFrom(
      this.http.get<AttendanceRow[]>('/ess/infoApplyAttendance/api/attendancePersonal/list', {
        params: { startDate: fromDmy, endDate: toDmy },
      }),
    );
  }

  getPersonOt(fromDmy: string, toDmy: string): Promise<AttendanceRow[]> {
    return firstValueFrom(
      this.http.get<AttendanceRow[]>('/ess/infoApply/api/personOt/list', {
        params: { startDate: fromDmy, endDate: toDmy },
      }),
    );
  }
}
