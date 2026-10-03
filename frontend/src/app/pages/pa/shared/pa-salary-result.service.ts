import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** 1 dòng lương của nhân viên - danh sách bên trái của lương tháng / năm chi tiết */
export interface PaSalaryEmpRow {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  teamName?: string;
  postFamilyName?: string;
  postGradeName?: string;
  positionName?: string;
  payScheduleNo?: string;
  /** DD-MM-YYYY - tham số gọi chi tiết lương năm */
  payDate?: string;
  /** DD/MM/YYYY - hiển thị */
  payDateFormat?: string;
  incomeBeforeTax?: number;
  withholdTotal?: number;
  realWages?: number;
}

/** 1 hạng mục chi tiết lương (itemType: '1' chi trả, '2' khấu trừ, '3' khác) */
export interface PaSalaryDetailItem {
  itemType?: string;
  itemNo?: string;
  itemName?: string;
  itemValue?: number;
  itemYearValue?: number;
}

/** Bảng tổng hợp lương: key = tên cột PA_SUMMARY_HAE (xem pa-result-columns.ts) */
export type PaResultRow = Record<string, string | number | null | undefined>;

export interface PaResultResponse {
  list: PaResultRow[];
  sum: PaResultRow | null;
}

const BASE_URL = '/pa/workManagement/api/salaryResult';
/** SQL Master xuất Excel bản HAE của bản gốc (/disc/autoExcel/exportLOtImportExcel?SQL_SEQMEAN=...) */
const PERSON_RESULT_EXPORT_SQL_SEQ = '270';
const DEPT_RESULT_EXPORT_SQL_SEQ = '271';

/**
 * Kết quả lương - port từ viewPaParamCtroller (Hanwha_HAE): lương tháng / năm chi tiết
 * (detailmonthCountInfoLeft / detailYearCountInfoLeft + detailYearCountInfoRight) và tổng hợp
 * lương cá nhân / phòng ban (viewPaResultList / viewDeptPaResultList). Backend: PaSalaryResultController.
 */
@Injectable({ providedIn: 'root' })
export class PaSalaryResultService {
  private readonly http = inject(HttpClient);

  getMonthEmpList(payScheduleNo: string, key: string, deptNo: string | null): Promise<PaSalaryEmpRow[]> {
    return firstValueFrom(
      this.http.get<PaSalaryEmpRow[]>(`${BASE_URL}/monthEmpList`, {
        params: { payScheduleNo, key, deptNo: deptNo ?? '' },
      }),
    );
  }

  getYearEmpList(personId: string, startMonth: string, endMonth: string): Promise<PaSalaryEmpRow[]> {
    return firstValueFrom(
      this.http.get<PaSalaryEmpRow[]>(`${BASE_URL}/yearEmpList`, { params: { personId, startMonth, endMonth } }),
    );
  }

  getMonthDetail(payScheduleNo: string, personId: string): Promise<PaSalaryDetailItem[]> {
    return firstValueFrom(this.http.post<PaSalaryDetailItem[]>(`${BASE_URL}/monthDetail`, { payScheduleNo, personId }));
  }

  getYearDetail(payDate: string, personId: string, startMonth: string, endMonth: string): Promise<PaSalaryDetailItem[]> {
    return firstValueFrom(
      this.http.post<PaSalaryDetailItem[]>(`${BASE_URL}/yearDetail`, { payDate, personId, startMonth, endMonth }),
    );
  }

  getPersonResult(payScheduleNo: string, key: string, deptNos: string[]): Promise<PaResultResponse> {
    return firstValueFrom(
      this.http.get<PaResultResponse>(`${BASE_URL}/personResult`, {
        params: { payScheduleNo, key, deptNos: deptNos.join(',') },
      }),
    );
  }

  getDeptResult(payScheduleNo: string, deptNos: string[]): Promise<PaResultResponse> {
    return firstValueFrom(
      this.http.get<PaResultResponse>(`${BASE_URL}/deptResult`, {
        params: { payScheduleNo, deptNos: deptNos.join(',') },
      }),
    );
  }

  /**
   * Bản gốc submit form tìm kiếm sang SQL Master 270 (tham số SQL lấy theo tên field form) - truyền
   * lại đúng các tên field đó qua paramsJson (giống PaArSummaryManageService#buildExceptionExportUrl).
   */
  buildPersonResultExportUrl(payScheduleNo: string, key: string, deptNos: string[], salaryDistin: string): string {
    return this.buildSqlMasterExportUrl(PERSON_RESULT_EXPORT_SQL_SEQ, payScheduleNo, key, deptNos, salaryDistin);
  }

  buildDeptResultExportUrl(payScheduleNo: string, deptNos: string[], salaryDistin: string): string {
    return this.buildSqlMasterExportUrl(DEPT_RESULT_EXPORT_SQL_SEQ, payScheduleNo, '', deptNos, salaryDistin);
  }

  private buildSqlMasterExportUrl(sqlSeq: string, payScheduleNo: string, key: string, deptNos: string[], salaryDistin: string): string {
    const deptMulti = deptNos.join(',');
    const paramsJson = JSON.stringify({
      PAY_SCHEDULE_NO: payScheduleNo,
      seach_KEY: key,
      seach_DEPTNO: deptMulti,
      seach_DEPTNO_Multi: deptMulti,
      seach_SALARY_DISTIN: salaryDistin,
    });
    const qs = new URLSearchParams({ sqlSeq, paramsJson });
    return `/disc/api/sqlMaster/export?${qs.toString()}`;
  }
}
