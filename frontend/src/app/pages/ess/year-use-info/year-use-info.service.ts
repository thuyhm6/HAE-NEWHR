import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface YearUseVacationRow {
  strtDate?: string;
  endDate?: string;
  totVacCnt?: string;
  addVac?: string;
  lastYearVac?: string;
  total?: string;
  useVac?: string;
  affirmUseVac?: string;
  remainVac?: string;
}

export interface YearUseLeaveUsageRow {
  applyNo?: string;
  leaveFromDate?: string;
  leaveFromTime?: string;
  leaveToDate?: string;
  leaveToTime?: string;
  applyLength?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  confirmFlag?: string;
  confirmFlagName?: string;
}

const VACATION_ROWS_URL = '/ess/viewDept/api/yearUseInfo/vacationRows';
const LEAVE_USAGE_URL = '/ess/viewDept/api/yearUseInfo/leaveUsage';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang yearUseInfo (không đổi
 * backend) - port lại từ ess/viewDept/yearUseInfo.html (Thymeleaf, đã xoá)
 * sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class YearUseInfoService {
  private readonly http = inject(HttpClient);

  getVacationRows(year?: string): Promise<YearUseVacationRow[]> {
    return firstValueFrom(
      this.http.get<YearUseVacationRow[]>(VACATION_ROWS_URL, { params: year ? { year } : {} }),
    );
  }

  getLeaveUsage(year?: string): Promise<YearUseLeaveUsageRow[]> {
    return firstValueFrom(
      this.http.get<YearUseLeaveUsageRow[]>(LEAVE_USAGE_URL, { params: year ? { year } : {} }),
    );
  }
}
