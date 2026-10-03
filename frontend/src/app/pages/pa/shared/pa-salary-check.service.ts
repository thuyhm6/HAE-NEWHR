import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

import { PaPayScheduleRow } from '../pa-pay-schedule/pa-pay-schedule.service';

/** Điều kiện tra cứu - khớp PaSalaryCheckQueryDto phía backend */
export interface PaSalaryCheckQuery {
  salaryDistinNo?: string | null;
  /** DD-MM-YYYY */
  payDate?: string | null;
  payDatePro?: string | null;
  payScheduleNo?: string | null;
  personId?: string | null;
  key?: string | null;
  deptNo?: string | null;
  changeFlag?: 'add' | 'delete';
  changeType?: string;
  itemType?: string;
  itemId?: string | null;
  pageType?: string;
  monthDif?: string | null;
  selectType?: string | null;
  arStartDate?: string | null;
  arEndDate?: string | null;
}

export interface PaMonthPersonCountRow {
  salaryDistinNo?: string;
  salaryDistinName?: string;
  preCount?: number;
  nowCount?: number;
}

export interface PaMonthPersonChangeRow {
  /** HIRE / RESIGN / OTHER */
  changeType?: string;
  numb?: number;
}

export interface PaMonthPersonCountResponse {
  countList: PaMonthPersonCountRow[];
  increaseList: PaMonthPersonChangeRow[];
  decreaseList: PaMonthPersonChangeRow[];
}

/** 1 dòng nhân viên (kèm hạng mục lương nếu có) */
export interface PaSalaryCheckEmpRow {
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  teamName?: string;
  postFamilyName?: string;
  postGradeName?: string;
  positionName?: string;
  mainBusiness?: string;
  empTypeName?: string;
  empOfficeName?: string;
  dateStarted?: string;
  dateLeft?: string;
  endProbationDate?: string;
  realWages?: number;
  transDate?: string;
  transCodeName?: string;
  itemNo?: string;
  itemName?: string;
  payNumber?: number;
  formularValue?: string;
  remark?: string;
  monthPro?: number;
  monthNow?: number;
  calValue?: number;
  arStartDate?: string;
  arEndDate?: string;
}

export interface PaSalaryCheckAmountRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  postFamilyName?: string;
  postGradeName?: string;
  positionName?: string;
  incomeBeforeTax?: number;
  attDeductTotal?: number;
  personalInsTotal?: number;
  taxDeductStd?: number;
  taxFamilyDeductStd?: number;
  taxFamilyDeductCount?: number;
  taxableIncome?: number;
  ptTaxRate?: number;
  quickDeductionTax?: number;
  personalTax?: number;
  realWages?: number;
  socialInsPersonal?: number;
  medicalInsPersonal?: number;
  unemploymentInsPersonal?: number;
}

/** Hạng mục chi tiết lương kèm công thức (itemType: '1' chi trả, '2' khấu trừ, '3' bảo hiểm công ty) */
export interface PaSalaryDetailInfoRow {
  itemType?: string;
  itemNo?: string;
  itemName?: string;
  itemValue?: number;
  itemFormular?: string;
}

export interface PaPayItemOption {
  itemId?: string;
  itemName?: string;
  itemType?: string;
}

export interface PaMonthChainRow {
  itemId?: string;
  itemName?: string;
  pageType?: string;
  itemType?: string;
  personNum?: number;
  personNumPro?: number;
  personNumDif?: number;
  countNum?: number;
  countNumPro?: number;
  countNumDif?: number;
  personNumAvg?: number;
  personNumAvgPro?: number;
  personNumAvgDif?: number;
  countUp?: number;
  countLow?: number;
  personUp?: number;
  personLow?: number;
}

export interface PaItemDifSummaryRow {
  itemId?: string;
  itemNo?: string;
  itemName?: string;
  itemType?: string;
  monthDif?: string;
  personNum?: number;
  monthPro?: number;
  monthNow?: number;
}

export interface PaResultConfirmSummary {
  payDatePro?: string;
  payDateCur?: string;
  personNumPro?: number;
  salaryTotalPro?: number;
  withholdTotalPro?: number;
  netPayPro?: number;
  personNumCur?: number;
  salaryTotalCur?: number;
  withholdTotalCur?: number;
  netPayCur?: number;
  personNumDif?: number;
  salaryTotalDif?: number;
  withholdTotalDif?: number;
  netPayDif?: number;
}

export interface PaArDetailRow {
  empId?: string;
  localName?: string;
  arDateStr?: string;
  fromTime?: string;
  toTime?: string;
  shiftName?: string;
  itemName?: string;
  quantity?: number;
}

/** Loại hạng mục (ITEM_TYPE) - nhãn lấy theo key bản gốc */
export const PA_ITEM_TYPE_OPTIONS = [
  { value: '1', labelKey: 'pa.detailPersonCountInfo.JIYUXIANGMU.b', fallback: 'Chi trả' },
  { value: '2', labelKey: 'pa.detailPersonCountInfo.KOUCHUXIANGMU.b', fallback: 'Khấu trừ' },
  { value: '3', labelKey: 'pa.detailItemCountInfo.BAOXIANXIANGMU.b', fallback: 'BH' },
];

const BASE_URL = '/pa/workManagement/api/salaryCheck';

/**
 * Đối chiếu lương - port từ viewPaParamCtroller / PaMonthChainCtroller (Hanwha_HAE).
 * Backend: PaSalaryCheckController.
 */
@Injectable({ providedIn: 'root' })
export class PaSalaryCheckService {
  private readonly http = inject(HttpClient);

  getMonthPersonCount(q: PaSalaryCheckQuery): Promise<PaMonthPersonCountResponse> {
    return firstValueFrom(this.http.get<PaMonthPersonCountResponse>(`${BASE_URL}/monthPersonCount`, { params: toParams(q) }));
  }

  getMonthPersonChangeEmpList(q: PaSalaryCheckQuery): Promise<PaSalaryCheckEmpRow[]> {
    return firstValueFrom(this.http.get<PaSalaryCheckEmpRow[]>(`${BASE_URL}/monthPersonChangeEmpList`, { params: toParams(q) }));
  }

  getMonthChainList(q: PaSalaryCheckQuery): Promise<PaMonthChainRow[]> {
    return firstValueFrom(this.http.post<PaMonthChainRow[]>(`${BASE_URL}/monthChain`, q));
  }

  getVerificationList(q: PaSalaryCheckQuery): Promise<PaSalaryCheckEmpRow[]> {
    return firstValueFrom(this.http.get<PaSalaryCheckEmpRow[]>(`${BASE_URL}/verificationList`, { params: toParams(q) }));
  }

  getDetailEmpInfo(payScheduleNo: string, personId: string): Promise<PaSalaryCheckEmpRow | null> {
    return firstValueFrom(
      this.http.get<PaSalaryCheckEmpRow | null>(`${BASE_URL}/detailEmpInfo`, { params: { payScheduleNo, personId } }),
    );
  }

  getDetailItemList(payScheduleNo: string, personId: string): Promise<PaSalaryDetailInfoRow[]> {
    return firstValueFrom(this.http.post<PaSalaryDetailInfoRow[]>(`${BASE_URL}/detailItemList`, { payScheduleNo, personId }));
  }

  getPayItemOptions(): Promise<PaPayItemOption[]> {
    return firstValueFrom(this.http.get<PaPayItemOption[]>(`${BASE_URL}/payItemOptions`));
  }

  getItemCountList(payScheduleNo: string, itemId: string): Promise<PaSalaryCheckEmpRow[]> {
    return firstValueFrom(this.http.get<PaSalaryCheckEmpRow[]>(`${BASE_URL}/itemCountList`, { params: { payScheduleNo, itemId } }));
  }

  getItemDifList(q: PaSalaryCheckQuery): Promise<PaSalaryCheckEmpRow[]> {
    return firstValueFrom(this.http.post<PaSalaryCheckEmpRow[]>(`${BASE_URL}/itemDifList`, q));
  }

  getItemDifSummary(q: PaSalaryCheckQuery): Promise<PaItemDifSummaryRow[]> {
    return firstValueFrom(this.http.post<PaItemDifSummaryRow[]>(`${BASE_URL}/itemDifSummary`, q));
  }

  getItemDifEmpList(q: PaSalaryCheckQuery): Promise<PaSalaryCheckEmpRow[]> {
    return firstValueFrom(this.http.post<PaSalaryCheckEmpRow[]>(`${BASE_URL}/itemDifEmpList`, q));
  }

  getResultSummary(q: PaSalaryCheckQuery): Promise<PaResultConfirmSummary | null> {
    return firstValueFrom(this.http.get<PaResultConfirmSummary | null>(`${BASE_URL}/resultSummary`, { params: toParams(q) }));
  }

  getOvertimeList(q: PaSalaryCheckQuery): Promise<PaSalaryCheckEmpRow[]> {
    return firstValueFrom(this.http.get<PaSalaryCheckEmpRow[]>(`${BASE_URL}/overtimeList`, { params: toParams(q) }));
  }

  getArDetailList(personId: string, arStartDate: string, arEndDate: string): Promise<PaArDetailRow[]> {
    return firstValueFrom(
      this.http.get<PaArDetailRow[]>(`${BASE_URL}/arDetailList`, { params: { personId, arStartDate, arEndDate } }),
    );
  }

  getInsuranceList(q: PaSalaryCheckQuery): Promise<PaSalaryCheckAmountRow[]> {
    return firstValueFrom(this.http.get<PaSalaryCheckAmountRow[]>(`${BASE_URL}/insuranceList`, { params: toParams(q) }));
  }

  getTaxList(q: PaSalaryCheckQuery): Promise<PaSalaryCheckAmountRow[]> {
    return firstValueFrom(this.http.get<PaSalaryCheckAmountRow[]>(`${BASE_URL}/taxList`, { params: toParams(q) }));
  }
}

function toParams(q: PaSalaryCheckQuery): Record<string, string> {
  const params: Record<string, string> = {};
  Object.entries(q).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') params[k] = String(v);
  });
  return params;
}

// ── Helper dùng chung cho các component Đối chiếu lương ─────────────────────

/** Số tiền dạng #,##0 giống fmt:formatNumber bản gốc */
export function paFormatNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  return isNaN(num) ? String(val) : Math.round(num).toLocaleString('en-US');
}

/** Ngày trả lương backend trả DD-MM-YYYY -> hiển thị DD/MM/YYYY */
export function paDisplayDate(val: string | null | undefined): string {
  return (val ?? '').replace(/-/g, '/');
}

/** Nhãn kế hoạch trả lương: ngày trả + phân loại lương */
export function paScheduleLabel(opt: PaPayScheduleRow): string {
  return paDisplayDate(opt.payDate) + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
}

/** Ngày trả lương (không trùng) của 1 phân loại lương - thay cho pa10xx_Linkage() bản gốc */
export function paPayDatesOf(schedules: PaPayScheduleRow[], salaryDistinNo: string | null): PaPayScheduleRow[] {
  if (!salaryDistinNo) return [];
  const seen = new Set<string>();
  return schedules.filter((s) => {
    if (String(s.salaryDistinNo ?? '') !== String(salaryDistinNo) || !s.payDate || seen.has(s.payDate)) return false;
    seen.add(s.payDate);
    return true;
  });
}

/** Xuất .xlsx từ dữ liệu đang hiển thị (header + các dòng) */
export function paExportXlsx(fileName: string, header: string[], rows: (string | number | null | undefined)[][]): void {
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows.map((r) => r.map((c) => c ?? ''))]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}
