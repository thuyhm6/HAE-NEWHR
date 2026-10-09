import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OverTimeLimitRow {
  otLimitNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  arMonthStr?: string;
  otLimitMonth?: string;
  otLimitYear?: string;
  otTotail?: string;
  otTotailMonth?: string;
  weekdayOtTotail?: string;
  saturdayOtTotail?: string;
  weekendOtTotail?: string;
  hoildayOtTotail?: string;
  updatedById?: string;
  updateLocalName?: string;
  updateDate?: string;
}

export interface OverTimeLimitFilter {
  keyword?: string;
  deptNos?: string;
  /** yyyyMM */
  startMonth?: string;
  /** yyyyMM */
  endMonth?: string;
  postFamily?: string;
  otLimitMonth?: string;
  otLimitYear?: string;
  minOtHours?: string;
}

export interface OverTimeLimitSaveItem {
  otLimitNo: string;
  otLimitMonth: string;
  otLimitYear: string;
}

export interface OverTimeLimitResponse {
  success: boolean;
  messageKey?: string;
  message?: string;
  errors?: string[];
}

const LIST_URL = '/ar/attendanceMintenance/api/overTimeLimit/list';
const SAVE_URL = '/ar/attendanceMintenance/api/overTimeLimit/save';
const IMPORT_URL = '/ar/attendanceMintenance/api/overTimeLimit/import';
export const OTL_DOWNLOAD_TEMPLATE_URL = '/ar/attendanceMintenance/api/overTimeLimit/downloadTemplate';

/**
 * Giới hạn tăng ca theo tháng (AR_OVERTIME_LIMIT) - port lại từ
 * ar/attendanceMintenance/viewOverTimeLimit.jsp dự án cũ. Backend:
 * ArOverTimeLimitController.
 */
@Injectable({ providedIn: 'root' })
export class OverTimeLimitService {
  private readonly http = inject(HttpClient);

  getList(filter: OverTimeLimitFilter): Promise<OverTimeLimitRow[]> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = String(value);
      }
    });
    return firstValueFrom(this.http.get<OverTimeLimitRow[]>(LIST_URL, { params }));
  }

  save(items: OverTimeLimitSaveItem[]): Promise<OverTimeLimitResponse> {
    return firstValueFrom(this.http.post<OverTimeLimitResponse>(SAVE_URL, { items }));
  }

  importExcel(file: File): Promise<OverTimeLimitResponse> {
    const form = new FormData();
    form.append('file', file);
    return firstValueFrom(this.http.post<OverTimeLimitResponse>(IMPORT_URL, form));
  }
}
