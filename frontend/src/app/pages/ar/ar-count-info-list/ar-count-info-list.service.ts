import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/**
 * Tổng hợp tăng ca theo tháng của 1 nhân viên (tab "Tăng ca"). Mỗi tháng có 5
 * field: `otM{thang}Total` (tổng) + NormalWork/Saturday/WeeklyHoliday/PublicHoliday.
 * Khớp với ArCountInfoListOtDto (backend).
 */
export interface ArCountInfoListOtRow {
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  teamName?: string;
  postGradeNo?: string;
  empTypeName?: string;
  shiftName?: string;
  year?: string;
  otTotal?: string;

  otM1Total?: string;
  otM1NormalWork?: string;
  otM1Saturday?: string;
  otM1WeeklyHoliday?: string;
  otM1PublicHoliday?: string;
  otM2Total?: string;
  otM2NormalWork?: string;
  otM2Saturday?: string;
  otM2WeeklyHoliday?: string;
  otM2PublicHoliday?: string;
  otM3Total?: string;
  otM3NormalWork?: string;
  otM3Saturday?: string;
  otM3WeeklyHoliday?: string;
  otM3PublicHoliday?: string;
  otM4Total?: string;
  otM4NormalWork?: string;
  otM4Saturday?: string;
  otM4WeeklyHoliday?: string;
  otM4PublicHoliday?: string;
  otM5Total?: string;
  otM5NormalWork?: string;
  otM5Saturday?: string;
  otM5WeeklyHoliday?: string;
  otM5PublicHoliday?: string;
  otM6Total?: string;
  otM6NormalWork?: string;
  otM6Saturday?: string;
  otM6WeeklyHoliday?: string;
  otM6PublicHoliday?: string;
  otM7Total?: string;
  otM7NormalWork?: string;
  otM7Saturday?: string;
  otM7WeeklyHoliday?: string;
  otM7PublicHoliday?: string;
  otM8Total?: string;
  otM8NormalWork?: string;
  otM8Saturday?: string;
  otM8WeeklyHoliday?: string;
  otM8PublicHoliday?: string;
  otM9Total?: string;
  otM9NormalWork?: string;
  otM9Saturday?: string;
  otM9WeeklyHoliday?: string;
  otM9PublicHoliday?: string;
  otM10Total?: string;
  otM10NormalWork?: string;
  otM10Saturday?: string;
  otM10WeeklyHoliday?: string;
  otM10PublicHoliday?: string;
  otM11Total?: string;
  otM11NormalWork?: string;
  otM11Saturday?: string;
  otM11WeeklyHoliday?: string;
  otM11PublicHoliday?: string;
  otM12Total?: string;
  otM12NormalWork?: string;
  otM12Saturday?: string;
  otM12WeeklyHoliday?: string;
  otM12PublicHoliday?: string;
}

export interface ArCountInfoListOtFilter {
  keyword?: string;
  deptNos?: string;
  empTypeCode?: string;
  startTime?: string;
}

const OT_SUMMARY_URL = '/ar/countAttendance/api/otSummary';

/** API tổng hợp tăng ca theo tháng cho /ar/countAttendance/arCountInfoList (tab "Tăng ca"). */
@Injectable({ providedIn: 'root' })
export class ArCountInfoListService {
  private readonly http = inject(HttpClient);

  getOtSummary(filter: ArCountInfoListOtFilter): Promise<ArCountInfoListOtRow[]> {
    return firstValueFrom(this.http.get<ArCountInfoListOtRow[]>(OT_SUMMARY_URL, { params: this.toHttpParams({ ...filter }) }));
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
