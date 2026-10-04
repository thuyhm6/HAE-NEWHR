import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Một ngày trong lịch tháng (AR_CALENDER) - header các cột chi tiết theo ngày. */
export interface MonthDetailDate {
  ddateStr: string;
  iweek: number;
  /** 1440 = ngày làm việc, khác 1440 = ngày nghỉ/lễ (tô xám) */
  typeId: string;
  iday: number;
  dateKey: string;
  dayOtKey: string;
  nightOtKey: string;
  weekTitle: string;
}

/** Một dòng nhân viên - key là tên cột SQL (EMPID, LOCAL_NAME, DATE_1, DAY_OT_1...). */
export type MonthDetailRow = Record<string, string | number | null | undefined>;

export interface MonthDetailResult {
  dates: MonthDetailDate[];
  rows: MonthDetailRow[];
}

export interface MonthDetailFilter {
  keyword?: string;
  deptNos?: string;
  /** MM */
  month?: string;
  /** YYYY */
  year?: string;
  /** YYYY/MM/DD */
  startDate?: string;
  /** YYYY/MM/DD */
  endDate?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

const LIST_URL = '/ess/tempEmp/api/monthDetailList/list';
const EXPORT_URL = '/ess/tempEmp/api/monthDetailList/export';
const SQL_MASTER_EXPORT_URL = '/disc/api/sqlMaster/export';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * API của màn hình ess/tempEmp/viewMonthDetailList - port từ viewMonthDetailList.jsp (Hanwha_HAE).
 * - Báo cáo có file mẫu riêng (306, 314) dùng endpoint export sẵn có của EssTempEmpController.
 * - Báo cáo tự động theo SQL Master (367 - Excel Days) dùng API xuất Excel của SQL Master
 *   (thay cho /disc/autoExcel/exportLOtImportExcel?SQL_SEQMEAN=... của bản gốc).
 */
@Injectable({ providedIn: 'root' })
export class MonthDetailListService {
  private readonly http = inject(HttpClient);

  getMonthDetail(filter: MonthDetailFilter): Promise<MonthDetailResult> {
    return firstValueFrom(this.http.get<MonthDetailResult>(LIST_URL, { params: this.compact({ ...filter }) }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  /** URL xuất báo cáo theo file mẫu (306 / 314). */
  buildExportUrl(filter: MonthDetailFilter, reportType: string): string {
    const qs = new URLSearchParams(this.compact({ ...filter, reportType }));
    return `${EXPORT_URL}?${qs.toString()}`;
  }

  /**
   * URL xuất Excel theo SQL Master. Bản gốc submit cả form tìm kiếm nên truyền lại đúng tên field
   * form cũ (seach_*) qua paramsJson để khớp tham số khai báo trong SQL Master.
   */
  buildSqlMasterExportUrl(filter: MonthDetailFilter, sqlSeq: string): string {
    const arMonth = filter.month && filter.year ? `${filter.month}${filter.year}` : '';
    const paramsJson = JSON.stringify({
      AR_MONTH: arMonth,
      seach_AR_MONTH: arMonth,
      seach_KEY: filter.keyword ?? '',
      seach_DEPTNO: filter.deptNos ?? '',
      seach_DEPTNO_Multi: filter.deptNos ?? '',
      seach_START_DATE: filter.startDate ?? '',
      seach_END_DATE: filter.endDate ?? '',
    });
    const qs = new URLSearchParams({ sqlSeq, paramsJson });
    return `${SQL_MASTER_EXPORT_URL}?${qs.toString()}`;
  }

  private compact(source: Record<string, string | undefined>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params;
  }
}
